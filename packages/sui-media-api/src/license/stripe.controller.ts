import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { StripeService } from './stripe.service';
import { LicenseService } from './license.service';

@Controller('webhooks')
@ApiTags('Webhooks')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);
  private readonly sesClient: SESClient;
  private readonly sesFromEmail: string;

  constructor(
    private readonly stripeService: StripeService,
    private readonly licenseService: LicenseService,
    private readonly configService: ConfigService,
  ) {
    this.sesClient = new SESClient({ region: 'us-east-1' });
    this.sesFromEmail = this.configService?.get?.<string>('SES_FROM_EMAIL') || process.env.SES_FROM_EMAIL || 'noreply@stoked-ui.com';
  }

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      signature,
    );

    this.logger.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const email = session.customer_email || '';
    const productId = session.metadata?.productId || '';

    if (!productId) {
      this.logger.warn('Checkout session missing productId in metadata');
      return;
    }

    // Idempotency check: don't create duplicate licenses
    const existing = await this.licenseService.findBySubscriptionId(subscriptionId);
    if (existing) {
      this.logger.log(`License already exists for subscription ${subscriptionId}, skipping`);
      return;
    }

    const license = await this.licenseService.createLicense(
      email,
      productId,
      customerId,
      subscriptionId,
    );

    // Send license key via email
    await this.sendLicenseEmail(email, license.key, productId);

    this.logger.log(`License ${license.key} created and emailed to ${email}`);
  }

  private async handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    // Only process renewal payments, not the initial checkout payment
    if (invoice.billing_reason !== 'subscription_cycle') {
      this.logger.log(`Skipping non-renewal payment (reason: ${invoice.billing_reason})`);
      return;
    }

    await this.licenseService.renewLicense(subscriptionId);
    this.logger.log(`License renewed for subscription ${subscriptionId}`);
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    // Do NOT immediately expire — let the license expire naturally at expiresAt
    const license = await this.licenseService.findBySubscriptionId(subscriptionId);
    if (license) {
      this.logger.log(
        `Subscription ${subscriptionId} cancelled. License ${license.key} will expire at ${license.expiresAt?.toISOString()}`,
      );
    } else {
      this.logger.warn(`No license found for cancelled subscription ${subscriptionId}`);
    }
  }

  private async sendLicenseEmail(
    toEmail: string,
    licenseKey: string,
    productId: string,
  ): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: this.sesFromEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Data: `Your ${productId} License Key`,
          },
          Body: {
            Text: {
              Data: [
                `Thank you for your purchase!`,
                ``,
                `Your license key: ${licenseKey}`,
                ``,
                `To activate, enter this key in the ${productId} application settings.`,
                ``,
                `This key is valid for one device at a time. You can transfer it by deactivating from your current device first.`,
                ``,
                `If you have any questions, contact support@stoked-ui.com`,
              ].join('\n'),
            },
          },
        },
      });

      await this.sesClient.send(command);
      this.logger.log(`License key email sent to ${toEmail}`);
    } catch (error: any) {
      // Log but don't throw — the license was still created successfully
      this.logger.error(`Failed to send license email to ${toEmail}: ${error.message}`);
    }
  }
}
