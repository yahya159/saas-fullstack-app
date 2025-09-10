import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments';

export interface CreateCheckoutSessionRequest {
  widgetId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WidgetPreviewPaymentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/widgets/preview-payment`;

  /**
   * Create a Stripe checkout session for widget preview
   */
  createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<CreateCheckoutSessionResponse> {
    return this.http.post<CreateCheckoutSessionResponse>(
      `${this.baseUrl}/create-checkout-session`,
      request
    );
  }

  /**
   * Verify if a payment was successful for a widget preview
   */
  verifyPayment(sessionId: string): Observable<VerifyPaymentResponse> {
    return this.http.get<VerifyPaymentResponse>(
      `${this.baseUrl}/verify-payment`,
      { params: { sessionId } }
    );
  }
}