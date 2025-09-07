import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MarketingCampaign {
  _id: string;
  application: string;
  name: string;
  description?: string;
  type: 'AB_TEST' | 'PRICING_TEST' | 'LANDING_PAGE' | 'EMAIL_CAMPAIGN' | 'CONVERSION_OPTIMIZATION';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  configuration: Record<string, any>;
  targetAudience: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  variants: {
    control: Record<string, any>;
    variations: Record<string, any>[];
  };
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    conversionRate?: number;
    revenue?: number;
    cost?: number;
    roi?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEvent {
  _id: string;
  application: string;
  campaign?: string;
  eventType: 'PAGE_VIEW' | 'WIDGET_VIEW' | 'BUTTON_CLICK' | 'FORM_SUBMIT' | 'SIGNUP' | 'CONVERSION' | 'PURCHASE' | 'TRIAL_START' | 'SUBSCRIPTION' | 'CUSTOM';
  eventName: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  variantId?: string;
  userAgent: Record<string, any>;
  location: Record<string, any>;
  referrer?: string;
  utm?: Record<string, any>;
  revenue?: number;
  timestamp: Date;
}

export interface CreateCampaignDto {
  applicationId: string;
  name: string;
  description?: string;
  type: 'AB_TEST' | 'PRICING_TEST' | 'LANDING_PAGE' | 'EMAIL_CAMPAIGN' | 'CONVERSION_OPTIMIZATION';
  configuration?: Record<string, any>;
  targetAudience?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  variants?: Record<string, any>;
}

export interface TrackEventDto {
  applicationId: string;
  campaignId?: string;
  eventType: 'PAGE_VIEW' | 'WIDGET_VIEW' | 'BUTTON_CLICK' | 'FORM_SUBMIT' | 'SIGNUP' | 'CONVERSION' | 'PURCHASE' | 'TRIAL_START' | 'SUBSCRIPTION' | 'CUSTOM';
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  variantId?: string;
  utm?: Record<string, any>;
  revenue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  // Campaign Management
  createCampaign(campaign: CreateCampaignDto): Observable<{ success: boolean; data: MarketingCampaign; message: string }> {
    return this.http.post<{ success: boolean; data: MarketingCampaign; message: string }>(
      `${this.baseUrl}/marketing/create`,
      campaign
    );
  }

  getCampaignsByApplication(applicationId: string): Observable<{ success: boolean; data: MarketingCampaign[]; count: number }> {
    return this.http.get<{ success: boolean; data: MarketingCampaign[]; count: number }>(
      `${this.baseUrl}/marketing/application/${applicationId}`
    );
  }

  getCampaignById(campaignId: string): Observable<{ success: boolean; data: MarketingCampaign }> {
    return this.http.get<{ success: boolean; data: MarketingCampaign }>(
      `${this.baseUrl}/marketing/${campaignId}`
    );
  }

  updateCampaign(campaignId: string, updateData: Partial<MarketingCampaign>): Observable<{ success: boolean; data: MarketingCampaign; message: string }> {
    return this.http.put<{ success: boolean; data: MarketingCampaign; message: string }>(
      `${this.baseUrl}/marketing/${campaignId}`,
      updateData
    );
  }

  deleteCampaign(campaignId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/marketing/${campaignId}`
    );
  }

  startCampaign(campaignId: string): Observable<{ success: boolean; data: MarketingCampaign; message: string }> {
    return this.http.put<{ success: boolean; data: MarketingCampaign; message: string }>(
      `${this.baseUrl}/marketing/${campaignId}/start`,
      {}
    );
  }

  pauseCampaign(campaignId: string): Observable<{ success: boolean; data: MarketingCampaign; message: string }> {
    return this.http.put<{ success: boolean; data: MarketingCampaign; message: string }>(
      `${this.baseUrl}/marketing/${campaignId}/pause`,
      {}
    );
  }

  completeCampaign(campaignId: string): Observable<{ success: boolean; data: MarketingCampaign; message: string }> {
    return this.http.put<{ success: boolean; data: MarketingCampaign; message: string }>(
      `${this.baseUrl}/marketing/${campaignId}/complete`,
      {}
    );
  }

  // Analytics
  trackEvent(event: TrackEventDto): Observable<{ success: boolean; data: AnalyticsEvent; message: string }> {
    return this.http.post<{ success: boolean; data: AnalyticsEvent; message: string }>(
      `${this.baseUrl}/marketing/track`,
      event
    );
  }

  getCampaignAnalytics(
    campaignId: string,
    startDate?: Date,
    endDate?: Date
  ): Observable<{ success: boolean; data: any }> {
    let url = `${this.baseUrl}/marketing/${campaignId}/analytics`;

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.http.get<{ success: boolean; data: any }>(url);
  }

  // Public tracking for external websites
  trackPublicEvent(event: TrackEventDto): Observable<{ success: boolean; eventId: string; timestamp: Date }> {
    return this.http.post<{ success: boolean; eventId: string; timestamp: Date }>(
      `${this.baseUrl}/public/analytics/track`,
      event
    );
  }

  // Utility methods for generating tracking code
  generateTrackingScript(applicationId: string, campaignId?: string): string {
    return `
<!-- SaaS Marketing Analytics -->
<script>
(function() {
  const SAAS_CONFIG = {
    applicationId: '${applicationId}',
    campaignId: ${campaignId ? `'${campaignId}'` : 'null'},
    apiUrl: '${this.baseUrl}/public/analytics'
  };

  // Generate visitor ID
  let visitorId = localStorage.getItem('saas_visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('saas_visitor_id', visitorId);
  }

  // Generate session ID
  let sessionId = sessionStorage.getItem('saas_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('saas_session_id', sessionId);
  }

  // Extract UTM parameters
  function getUtmParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source'),
      medium: urlParams.get('utm_medium'),
      campaign: urlParams.get('utm_campaign'),
      term: urlParams.get('utm_term'),
      content: urlParams.get('utm_content')
    };
  }

  // Track event function
  window.saasTrack = function(eventType, eventName, properties, revenue) {
    const eventData = {
      applicationId: SAAS_CONFIG.applicationId,
      campaignId: SAAS_CONFIG.campaignId,
      eventType: eventType || 'CUSTOM',
      eventName: eventName,
      properties: properties || {},
      visitorId: visitorId,
      sessionId: sessionId,
      utm: getUtmParameters(),
      revenue: revenue || 0
    };

    fetch(SAAS_CONFIG.apiUrl + '/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    }).catch(function(error) {
      console.warn('SaaS Analytics: Failed to track event', error);
    });
  };

  // Auto-track page view
  window.saasTrack('PAGE_VIEW', 'page_view', {
    page: window.location.pathname,
    title: document.title,
    referrer: document.referrer
  });

  // Track clicks on buttons with data-saas-track attribute
  document.addEventListener('click', function(event) {
    const element = event.target;
    if (element.hasAttribute('data-saas-track')) {
      const eventName = element.getAttribute('data-saas-track') || 'button_click';
      const properties = {
        element: element.tagName,
        text: element.textContent || element.value,
        id: element.id,
        className: element.className
      };
      window.saasTrack('BUTTON_CLICK', eventName, properties);
    }
  });
})();
</script>`;
  }

  generateTrackingPixel(applicationId: string, campaignId?: string): string {
    const params = new URLSearchParams({
      applicationId,
      ...(campaignId && { campaignId })
    });

    return `<img src="${this.baseUrl}/public/analytics/pixel.gif?${params.toString()}" width="1" height="1" style="display:none;" alt="">`;
  }
}
