import { Controller, Post, Body, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WidgetPreviewPaymentService } from '@Services/widget/widget-preview-payment.service';
import { WidgetService } from '@Services/widget/widget.service';
import { Public } from '@app/common/decorators/public.decorator';

@Controller('api/widgets/preview-payment')
export class WidgetPreviewPaymentController {
  private readonly logger = new Logger(WidgetPreviewPaymentController.name);

  constructor(
    private readonly widgetPreviewPaymentService: WidgetPreviewPaymentService,
    private readonly widgetService: WidgetService,
  ) {}

  /**
   * Create a Stripe checkout session for widget preview
   */
  @Public()
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: {
      widgetId: string;
      successUrl: string;
      cancelUrl: string;
    },
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const { widgetId, successUrl, cancelUrl } = body;

      // Validate widget exists
      const widget = await this.widgetService.getWidget(widgetId as any);
      if (!widget) {
        throw new HttpException('Widget not found', HttpStatus.NOT_FOUND);
      }

      // For demo purposes, we'll use a fixed amount of $5.00
      // In a real implementation, this would be configurable per widget
      const amount = 500; // $5.00 in cents
      const currency = 'usd';

      // Create Stripe checkout session
      const session = await this.widgetPreviewPaymentService.createWidgetPreviewCheckoutSession(
        widgetId,
        widget.name,
        amount,
        currency,
        successUrl,
        cancelUrl,
      );

      return session;
    } catch (error) {
      this.logger.error('Failed to create checkout session', error);
      throw new HttpException(
        error.message || 'Failed to create payment session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify if a payment was successful for a widget preview
   */
  @Public()
  @Get('verify-payment')
  async verifyPayment(@Query('sessionId') sessionId: string): Promise<{ success: boolean }> {
    try {
      if (!sessionId) {
        throw new HttpException('Session ID is required', HttpStatus.BAD_REQUEST);
      }

      const isPaid = await this.widgetPreviewPaymentService.verifyWidgetPreviewPayment(sessionId);
      return { success: isPaid };
    } catch (error) {
      this.logger.error('Failed to verify payment', error);
      throw new HttpException(
        error.message || 'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}