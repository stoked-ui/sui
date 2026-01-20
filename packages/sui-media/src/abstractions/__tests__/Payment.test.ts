import { describe, it, expect, vi } from 'vitest';
import { NoOpPayment, noOpPayment, createMockPayment } from '../Payment';
import type { IPayment, PaymentRequestOptions } from '../Payment';

describe('Payment Abstraction', () => {
  describe('NoOpPayment', () => {
    it('should create a new instance', () => {
      const payment = new NoOpPayment();
      expect(payment).toBeInstanceOf(NoOpPayment);
    });

    it('should implement IPayment interface', () => {
      const payment: IPayment = new NoOpPayment();
      expect(payment).toHaveProperty('requestPayment');
      expect(payment).toHaveProperty('verifyPayment');
      expect(payment).toHaveProperty('onPaymentComplete');
      expect(payment).toHaveProperty('cancelPayment');
      expect(payment).toHaveProperty('getPaymentHistory');
    });

    it('should return dummy payment request', async () => {
      const payment = new NoOpPayment();
      const options: PaymentRequestOptions = {
        amount: 1000,
        currency: 'BTC',
        description: 'Test payment',
      };

      const result = await payment.requestPayment(options);
      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('paymentRequest');
      expect(result).toHaveProperty('expiresAt');
      expect(result.paymentId).toBe('noop-payment');
    });

    it('should return false for payment verification', async () => {
      const payment = new NoOpPayment();
      const verified = await payment.verifyPayment('payment-123');
      expect(verified).toBe(false);
    });

    it('should do nothing on payment complete callback', () => {
      const payment = new NoOpPayment();
      const callback = vi.fn();
      expect(() => payment.onPaymentComplete(callback)).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
    });

    it('should do nothing on cancel payment', async () => {
      const payment = new NoOpPayment();
      await expect(payment.cancelPayment?.('payment-123')).resolves.toBeUndefined();
    });

    it('should return empty payment history', async () => {
      const payment = new NoOpPayment();
      const history = await payment.getPaymentHistory?.();
      expect(history).toEqual([]);
    });
  });

  describe('noOpPayment singleton', () => {
    it('should provide a singleton instance', () => {
      expect(noOpPayment).toBeInstanceOf(NoOpPayment);
    });

    it('should be the same instance on multiple accesses', () => {
      const ref1 = noOpPayment;
      const ref2 = noOpPayment;
      expect(ref1).toBe(ref2);
    });
  });

  describe('createMockPayment', () => {
    it('should create a mock payment adapter', () => {
      const payment = createMockPayment();
      expect(payment).toHaveProperty('requestPayment');
      expect(payment).toHaveProperty('verifyPayment');
      expect(payment).toHaveProperty('onPaymentComplete');
    });

    it('should generate unique payment IDs', async () => {
      const payment = createMockPayment();
      const payment1 = await payment.requestPayment({ amount: 100 });
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const payment2 = await payment.requestPayment({ amount: 200 });

      expect(payment1.paymentId).not.toBe(payment2.paymentId);
    });

    it('should not auto-verify by default', async () => {
      const payment = createMockPayment();
      const request = await payment.requestPayment({ amount: 100 });
      const verified = await payment.verifyPayment(request.paymentId);

      expect(verified).toBe(false);
    });

    it('should auto-verify when enabled', async () => {
      const payment = createMockPayment({ autoVerify: true });
      const request = await payment.requestPayment({ amount: 100 });
      const verified = await payment.verifyPayment(request.paymentId);

      expect(verified).toBe(true);
    });

    it('should trigger payment complete callback', (done) => {
      const payment = createMockPayment({ autoVerify: true, verifyDelay: 10 });

      payment.onPaymentComplete((paymentData) => {
        expect(paymentData).toHaveProperty('paymentId');
        expect(paymentData).toHaveProperty('amount');
        expect(paymentData.amount).toBe(500);
        expect(paymentData.resourceId).toBe('media-123');
        done();
      });

      payment.requestPayment({
        amount: 500,
        resourceId: 'media-123',
      });
    });

    it('should support callback cleanup', () => {
      const payment = createMockPayment({ autoVerify: true });
      const callback = vi.fn();

      const cleanup = payment.onPaymentComplete(callback);
      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();
      // After cleanup, callback should not be called
    });

    it('should store payment requests', async () => {
      const payment = createMockPayment();

      await payment.requestPayment({ amount: 100, resourceId: 'media-1' });
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      await payment.requestPayment({ amount: 200, resourceId: 'media-2' });

      const history = await payment.getPaymentHistory?.();
      expect(history).toHaveLength(2);
      expect(history?.[0].metadata).toBeUndefined();
    });

    it('should support payment cancellation', async () => {
      const payment = createMockPayment();

      const request = await payment.requestPayment({ amount: 100 });
      await payment.cancelPayment?.(request.paymentId);

      const history = await payment.getPaymentHistory?.();
      expect(history).toHaveLength(0);
    });

    it('should include metadata in payment request', async () => {
      const payment = createMockPayment();
      const metadata = { customField: 'value', userId: '123' };

      const request = await payment.requestPayment({
        amount: 100,
        metadata,
      });

      expect(request.metadata).toEqual(metadata);
    });
  });

  describe('Payment interface contract', () => {
    it('should accept custom payment implementations', async () => {
      const customPayment: IPayment = {
        requestPayment: async (options) => ({
          paymentId: `custom-${options.amount}`,
          paymentRequest: 'custom-payment-request',
          expiresAt: new Date(Date.now() + 3600000),
        }),
        verifyPayment: async (paymentId) => ({
          verified: paymentId.startsWith('custom-'),
          status: 'completed',
          details: { custom: true },
        }),
        onPaymentComplete: (callback) => {
          // Custom implementation
          return () => {};
        },
      };

      const request = await customPayment.requestPayment({ amount: 1000 });
      expect(request.paymentId).toBe('custom-1000');

      const verification = await customPayment.verifyPayment(request.paymentId);
      if (typeof verification === 'object') {
        expect(verification.verified).toBe(true);
        expect(verification.status).toBe('completed');
      }
    });

    it('should support various payment statuses', async () => {
      const customPayment: IPayment = {
        requestPayment: async (options) => ({
          paymentId: 'test-id',
          paymentRequest: 'test',
        }),
        verifyPayment: async (paymentId) => ({
          verified: false,
          status: 'pending',
        }),
        onPaymentComplete: () => {},
      };

      const verification = await customPayment.verifyPayment('test-id');
      if (typeof verification === 'object') {
        expect(verification.status).toBe('pending');
      }
    });

    it('should support boolean verification result', async () => {
      const customPayment: IPayment = {
        requestPayment: async (options) => ({
          paymentId: 'test-id',
          paymentRequest: 'test',
        }),
        verifyPayment: async (paymentId) => true,
        onPaymentComplete: () => {},
      };

      const verified = await customPayment.verifyPayment('test-id');
      expect(verified).toBe(true);
    });

    it('should support multiple callbacks', async () => {
      const callbacks: Array<(data: any) => void> = [];

      const customPayment: IPayment = {
        requestPayment: async (options) => ({
          paymentId: 'test-id',
          paymentRequest: 'test',
        }),
        verifyPayment: async () => true,
        onPaymentComplete: (callback) => {
          callbacks.push(callback);
        },
      };

      let callCount = 0;
      const testCallback = () => {
        callCount++;
      };

      customPayment.onPaymentComplete(testCallback);
      customPayment.onPaymentComplete(testCallback);

      callbacks.forEach(cb => cb({
        paymentId: 'test-id',
        amount: 100,
        timestamp: new Date(),
      }));

      expect(callCount).toBe(2);
    });
  });

  describe('PaymentRequestOptions', () => {
    it('should support minimal options', async () => {
      const payment = createMockPayment();
      const request = await payment.requestPayment({
        amount: 100,
      });

      expect(request).toHaveProperty('paymentId');
      expect(request).toHaveProperty('paymentRequest');
    });

    it('should support full options', async () => {
      const payment = createMockPayment();
      const request = await payment.requestPayment({
        amount: 1000,
        currency: 'BTC',
        description: 'Premium media access',
        resourceId: 'media-456',
        metadata: {
          userId: 'user-123',
          tier: 'premium',
        },
      });

      expect(request).toHaveProperty('paymentId');
      expect(request.metadata).toHaveProperty('userId');
    });
  });
});
