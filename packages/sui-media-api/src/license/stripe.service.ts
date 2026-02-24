import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ProductDocument } from '@stoked-ui/common-api';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured — Stripe operations will fail');
    }
    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2024-12-18.acacia' as any,
    });
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
  }

  async createCheckoutSession(
    dto: CreateCheckoutDto,
    product: ProductDocument,
  ): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: product.stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: dto.email,
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: {
          productId: dto.productId,
        },
      });

      if (!session.url) {
        throw new BadRequestException('Stripe did not return a checkout URL');
      }

      this.logger.log(`Checkout session created for product ${dto.productId}: ${session.id}`);
      return session.url;
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Stripe checkout error: ${error.message}`);
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (error: any) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async getCustomerEmail(customerId: string): Promise<string> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      throw new BadRequestException('Customer has been deleted');
    }
    return (customer as Stripe.Customer).email || '';
  }
}
