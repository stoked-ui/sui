/**
 * Payment abstraction for sui-media components
 *
 * This abstraction provides a framework-agnostic interface for payment operations,
 * allowing media components to integrate with various payment systems (Lightning Network,
 * cryptocurrency, traditional payment processors, etc.).
 *
 * @example
 * ```typescript
 * // Implementation with Lightning Network
 * import { requestInvoice, payInvoice } from '@/lib/lightning';
 *
 * const LightningPaymentAdapter: IPayment = {
 *   requestPayment: async (options) => {
 *     const invoice = await requestInvoice({
 *       amount: options.amount,
 *       description: options.description,
 *     });
 *     return {
 *       paymentId: invoice.id,
 *       paymentRequest: invoice.bolt11,
 *       expiresAt: invoice.expiresAt,
 *     };
 *   },
 *   verifyPayment: async (paymentId) => {
 *     const status = await checkInvoiceStatus(paymentId);
 *     return status === 'paid';
 *   },
 *   onPaymentComplete: (callback) => {
 *     // Subscribe to payment events
 *     lightningClient.on('payment.complete', callback);
 *   },
 * };
 *
 * // Pass to media components
 * <MediaCard payment={LightningPaymentAdapter} />
 * ```
 */

/**
 * Payment request options
 */
export interface PaymentRequestOptions {
  /**
   * Amount to charge (in the smallest unit, e.g., satoshis for Bitcoin)
   */
  amount: number;

  /**
   * Currency code (e.g., 'BTC', 'USD', 'EUR')
   */
  currency?: string;

  /**
   * Description of the payment
   */
  description?: string;

  /**
   * Resource being purchased (e.g., media file ID)
   */
  resourceId?: string;

  /**
   * Additional metadata for the payment
   */
  metadata?: Record<string, any>;
}

/**
 * Payment request result
 */
export interface PaymentRequest {
  /**
   * Unique payment identifier
   */
  paymentId: string;

  /**
   * Payment request string (e.g., Lightning invoice, payment URL)
   */
  paymentRequest: string;

  /**
   * When the payment request expires
   */
  expiresAt?: Date;

  /**
   * Additional payment data (e.g., QR code, payment address)
   */
  metadata?: Record<string, any>;
}

/**
 * Payment completion callback
 */
export type PaymentCompleteCallback = (payment: {
  paymentId: string;
  resourceId?: string;
  amount: number;
  currency?: string;
  timestamp: Date;
}) => void | Promise<void>;

/**
 * Payment verification result
 */
export interface PaymentVerification {
  /**
   * Whether the payment is verified
   */
  verified: boolean;

  /**
   * Payment status (pending, completed, failed, expired)
   */
  status: 'pending' | 'completed' | 'failed' | 'expired';

  /**
   * Additional verification details
   */
  details?: Record<string, any>;
}

/**
 * Payment interface for processing payments and purchases
 */
export interface IPayment {
  /**
   * Request a payment for a resource
   * @param options - Payment request options
   * @returns Payment request details
   */
  requestPayment: (options: PaymentRequestOptions) => Promise<PaymentRequest>;

  /**
   * Verify that a payment has been completed
   * @param paymentId - The payment identifier to verify
   * @returns True if payment is verified, false otherwise
   */
  verifyPayment: (paymentId: string) => Promise<boolean | PaymentVerification>;

  /**
   * Register a callback for when payments complete
   * @param callback - Function to call when a payment completes
   * @returns Cleanup function to unregister the callback
   */
  onPaymentComplete: (callback: PaymentCompleteCallback) => (() => void) | void;

  /**
   * Cancel a pending payment request
   * @param paymentId - The payment identifier to cancel
   */
  cancelPayment?: (paymentId: string) => Promise<void>;

  /**
   * Get payment history for a user or resource
   * @param userId - User ID to get payment history for
   * @param resourceId - Resource ID to get payment history for
   */
  getPaymentHistory?: (userId?: string, resourceId?: string) => Promise<PaymentRequest[]>;
}

/**
 * No-op payment implementation that simulates no payment system
 *
 * Use this as a default payment provider for applications that don't need payments,
 * or as a placeholder during development/testing.
 *
 * @example
 * ```typescript
 * import { NoOpPayment } from '@stoked-ui/sui-media';
 *
 * // Use as default when payments are optional
 * function MediaCard({ payment = NoOpPayment }) {
 *   // Component will work but payment requests will fail silently
 * }
 * ```
 */
export class NoOpPayment implements IPayment {
  async requestPayment(options: PaymentRequestOptions): Promise<PaymentRequest> {
    // Return a dummy payment request
    return {
      paymentId: 'noop-payment',
      paymentRequest: '',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }

  async verifyPayment(paymentId: string): Promise<boolean> {
    return false;
  }

  onPaymentComplete(callback: PaymentCompleteCallback): void {
    // No-op: does nothing
  }

  async cancelPayment(paymentId: string): Promise<void> {
    // No-op: does nothing
  }

  async getPaymentHistory(userId?: string, resourceId?: string): Promise<PaymentRequest[]> {
    return [];
  }
}

/**
 * Singleton instance of NoOpPayment for convenience
 */
export const noOpPayment = new NoOpPayment();

/**
 * Mock payment adapter for testing
 *
 * @example
 * ```typescript
 * import { createMockPayment } from '@stoked-ui/sui-media';
 *
 * const mockPayment = createMockPayment({
 *   autoVerify: true, // All payments automatically verify
 * });
 *
 * // Use in tests or Storybook stories
 * <MediaCard payment={mockPayment} />
 * ```
 */
export function createMockPayment(options?: {
  autoVerify?: boolean;
  verifyDelay?: number;
}): IPayment {
  const callbacks: PaymentCompleteCallback[] = [];
  const payments = new Map<string, PaymentRequest>();

  return {
    requestPayment: async (opts) => {
      const payment: PaymentRequest = {
        paymentId: `mock-${Date.now()}`,
        paymentRequest: `mock-payment-request-${opts.resourceId}`,
        expiresAt: new Date(Date.now() + 3600000),
        metadata: opts.metadata,
      };
      payments.set(payment.paymentId, payment);

      if (options?.autoVerify) {
        setTimeout(() => {
          callbacks.forEach(cb => cb({
            paymentId: payment.paymentId,
            resourceId: opts.resourceId,
            amount: opts.amount,
            currency: opts.currency,
            timestamp: new Date(),
          }));
        }, options.verifyDelay ?? 0);
      }

      return payment;
    },
    verifyPayment: async (paymentId) => {
      return options?.autoVerify ?? false;
    },
    onPaymentComplete: (callback) => {
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      };
    },
    cancelPayment: async (paymentId) => {
      payments.delete(paymentId);
    },
    getPaymentHistory: async () => Array.from(payments.values()),
  };
}
