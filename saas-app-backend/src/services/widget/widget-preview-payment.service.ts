import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WidgetPreviewPaymentService {
  private readonly logger = new Logger(WidgetPreviewPaymentService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not configured in environment variables');
      throw new Error('STRIPE_SECRET_KEY is required for widget preview payments');
    }
    
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  /**
   * Create a Stripe checkout session for widget preview
   * @param widgetId The ID of the widget being previewed
   * @param widgetName The name of the widget
   * @param amount The amount to charge in cents
   * @param currency The currency code (e.g., 'usd')
   * @param successUrl The URL to redirect to after successful payment
   * @param cancelUrl The URL to redirect to if payment is cancelled
   * @returns The Stripe checkout session URL
   */
  async createWidgetPreviewCheckoutSession(
    widgetId: string,
    widgetName: string,
    amount: number,
    currency: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Preview Access: ${widgetName}`,
                description: `One-time access to preview widget ${widgetName}`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          widgetId: widgetId,
          widgetName: widgetName,
          paymentType: 'widget_preview',
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      this.logger.error('Failed to create Stripe checkout session', error);
      throw new Error(`Failed to create payment session: ${error.message}`);
    }
  }

  /**
   * Verify if a payment was successful for a widget preview
   * @param sessionId The Stripe checkout session ID
   * @returns True if payment was successful, false otherwise
   */
  async verifyWidgetPreviewPayment(sessionId: string): Promise<boolean> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status === 'paid';
    } catch (error) {
      this.logger.error('Failed to verify Stripe payment', error);
      return false;
    }
  }
}