import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Header,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MarketingService, TrackEventDto } from '@Services/marketing/marketing.service';
import { EventType } from '@Data/models/saasAnalyticsEvent/saasAnalyticsEvent.pojo.model';

export const PUBLIC_ANALYTICS_API_PATHS = {
  TRACK_EVENT: '/track',
  TRACK_PIXEL: '/pixel.gif',
} as const;

interface PublicTrackEventDto {
  applicationId: string;
  campaignId?: string;
  eventType: EventType;
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  variantId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  revenue?: number;
}

@Controller('/public/analytics')
export class PublicAnalyticsController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post(PUBLIC_ANALYTICS_API_PATHS.TRACK_EVENT)
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'POST, OPTIONS')
  @Header('Access-Control-Allow-Headers', 'Content-Type')
  async trackEvent(@Body() publicEventDto: PublicTrackEventDto, @Req() req: Request) {
    try {
      // Extract user agent and location information
      const userAgent = req.get('User-Agent') || '';
      const ip = req.ip || req.connection.remoteAddress || '';
      const referrer = req.get('Referer') || '';

      // Parse user agent (simplified)
      const userAgentData = this.parseUserAgent(userAgent);

      // Extract location data (in a real app, you'd use a GeoIP service)
      const locationData = this.extractLocationData(ip);

      const trackEventDto: TrackEventDto = {
        applicationId: new mongoose.Types.ObjectId(publicEventDto.applicationId),
        campaignId: publicEventDto.campaignId
          ? new mongoose.Types.ObjectId(publicEventDto.campaignId)
          : undefined,
        eventType: publicEventDto.eventType,
        eventName: publicEventDto.eventName,
        properties: publicEventDto.properties || {},
        userId: publicEventDto.userId,
        sessionId: publicEventDto.sessionId,
        visitorId: publicEventDto.visitorId,
        variantId: publicEventDto.variantId,
        userAgent: userAgentData,
        location: locationData,
        referrer,
        utm: publicEventDto.utm,
        revenue: publicEventDto.revenue || 0,
      };

      const event = await this.marketingService.trackEvent(trackEventDto);

      return {
        success: true,
        eventId: event._id,
        timestamp: event.timestamp,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Public event tracking failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(PUBLIC_ANALYTICS_API_PATHS.TRACK_PIXEL)
  @Header('Content-Type', 'image/gif')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async trackPixel(@Body() trackingData: any, @Req() req: Request, @Res() res: Response) {
    try {
      // Track the pixel event
      if (trackingData && trackingData.applicationId) {
        const userAgent = req.get('User-Agent') || '';
        const ip = req.ip || req.connection.remoteAddress || '';
        const referrer = req.get('Referer') || '';

        const userAgentData = this.parseUserAgent(userAgent);
        const locationData = this.extractLocationData(ip);

        const trackEventDto: TrackEventDto = {
          applicationId: new mongoose.Types.ObjectId(trackingData.applicationId),
          campaignId: trackingData.campaignId
            ? new mongoose.Types.ObjectId(trackingData.campaignId)
            : undefined,
          eventType: EventType.PAGE_VIEW,
          eventName: 'pixel_track',
          properties: trackingData.properties || {},
          userAgent: userAgentData,
          location: locationData,
          referrer,
          utm: trackingData.utm,
        };

        await this.marketingService.trackEvent(trackEventDto);
      }

      // Return a 1x1 transparent pixel
      const pixelBuffer = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64',
      );

      res.set('Content-Type', 'image/gif');
      res.set('Content-Length', pixelBuffer.length.toString());
      res.send(pixelBuffer);
    } catch (error) {
      // Even if tracking fails, still return the pixel
      const pixelBuffer = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64',
      );

      res.set('Content-Type', 'image/gif');
      res.send(pixelBuffer);
    }
  }

  private parseUserAgent(userAgent: string): Record<string, any> {
    // Simplified user agent parsing
    // In production, use a library like ua-parser-js
    const result: any = {};

    if (userAgent.includes('Chrome')) {
      result.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      result.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      result.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      result.browser = 'Edge';
    }

    if (userAgent.includes('Windows')) {
      result.os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      result.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      result.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      result.os = 'Android';
    } else if (userAgent.includes('iPhone')) {
      result.os = 'iOS';
    }

    if (userAgent.includes('Mobile')) {
      result.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      result.device = 'Tablet';
    } else {
      result.device = 'Desktop';
    }

    return result;
  }

  private extractLocationData(ip: string): Record<string, any> {
    // Simplified location extraction
    // In production, use a GeoIP service like MaxMind
    return {
      ip,
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
    };
  }
}
