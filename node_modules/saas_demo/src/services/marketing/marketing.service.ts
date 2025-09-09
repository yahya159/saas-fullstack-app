import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import {
  SaasMarketingCampaign,
  SaasMarketingCampaignPOJO,
  SaasMarketingCampaignDocument,
  CampaignStatus,
  CampaignType,
} from '@Data/models/saasMarketingCampaign/saasMarketingCampaign.pojo.model';
import {
  SaasAnalyticsEvent,
  SaasAnalyticsEventPOJO,
  SaasAnalyticsEventDocument,
  EventType,
} from '@Data/models/saasAnalyticsEvent/saasAnalyticsEvent.pojo.model';

export interface CreateCampaignDto {
  applicationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: CampaignType;
  configuration?: Record<string, any>;
  targetAudience?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  variants?: Record<string, any>;
}

export interface UpdateCampaignDto {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  configuration?: Record<string, any>;
  targetAudience?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  variants?: Record<string, any>;
}

export interface TrackEventDto {
  applicationId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  eventType: EventType;
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  visitorId?: string;
  variantId?: string;
  userAgent?: Record<string, any>;
  location?: Record<string, any>;
  referrer?: string;
  utm?: Record<string, any>;
  revenue?: number;
}

@Injectable()
export class MarketingService {
  constructor(
    @InjectModel(SaasMarketingCampaignPOJO.name)
    private campaignModel: Model<SaasMarketingCampaignDocument>,
    @InjectModel(SaasAnalyticsEventPOJO.name)
    private eventModel: Model<SaasAnalyticsEventDocument>,
  ) {}

  // Campaign Management
  async createCampaign(createCampaignDto: CreateCampaignDto): Promise<SaasMarketingCampaign> {
    try {
      const campaign = new this.campaignModel({
        application: createCampaignDto.applicationId,
        name: createCampaignDto.name,
        description: createCampaignDto.description,
        type: createCampaignDto.type,
        configuration: createCampaignDto.configuration || {},
        targetAudience: createCampaignDto.targetAudience || {},
        startDate: createCampaignDto.startDate,
        endDate: createCampaignDto.endDate,
        variants: createCampaignDto.variants || { control: {}, variations: [] },
        status: CampaignStatus.DRAFT,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0,
          cost: 0,
          roi: 0,
        },
      });

      return await campaign.save();
    } catch (error) {
      throw new BadRequestException(`Failed to create campaign: ${error.message}`);
    }
  }

  async getCampaignsByApplication(
    applicationId: mongoose.Types.ObjectId,
  ): Promise<SaasMarketingCampaign[]> {
    return await this.campaignModel
      .find({ application: applicationId })
      .populate('application')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getCampaignById(campaignId: mongoose.Types.ObjectId): Promise<SaasMarketingCampaign> {
    const campaign = await this.campaignModel.findById(campaignId).populate('application').exec();

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return campaign;
  }

  async updateCampaign(
    campaignId: mongoose.Types.ObjectId,
    updateData: UpdateCampaignDto,
  ): Promise<SaasMarketingCampaign> {
    const campaign = await this.campaignModel
      .findByIdAndUpdate(campaignId, { ...updateData, updatedAt: new Date() }, { new: true })
      .populate('application')
      .exec();

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return campaign;
  }

  async deleteCampaign(campaignId: mongoose.Types.ObjectId): Promise<void> {
    const result = await this.campaignModel.findByIdAndDelete(campaignId).exec();

    if (!result) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    // Also delete associated events
    await this.eventModel.deleteMany({ campaign: campaignId }).exec();
  }

  async startCampaign(campaignId: mongoose.Types.ObjectId): Promise<SaasMarketingCampaign> {
    return await this.updateCampaign(campaignId, {
      status: CampaignStatus.ACTIVE,
      startDate: new Date(),
    });
  }

  async pauseCampaign(campaignId: mongoose.Types.ObjectId): Promise<SaasMarketingCampaign> {
    return await this.updateCampaign(campaignId, { status: CampaignStatus.PAUSED });
  }

  async completeCampaign(campaignId: mongoose.Types.ObjectId): Promise<SaasMarketingCampaign> {
    return await this.updateCampaign(campaignId, {
      status: CampaignStatus.COMPLETED,
      endDate: new Date(),
    });
  }

  // Analytics and Event Tracking
  async trackEvent(eventDto: TrackEventDto): Promise<SaasAnalyticsEvent> {
    try {
      const event = new this.eventModel({
        application: eventDto.applicationId,
        campaign: eventDto.campaignId,
        eventType: eventDto.eventType,
        eventName: eventDto.eventName,
        properties: eventDto.properties || {},
        userId: eventDto.userId,
        sessionId: eventDto.sessionId,
        visitorId: eventDto.visitorId,
        variantId: eventDto.variantId,
        userAgent: eventDto.userAgent || {},
        location: eventDto.location || {},
        referrer: eventDto.referrer,
        utm: eventDto.utm,
        revenue: eventDto.revenue || 0,
      });

      const savedEvent = await event.save();

      // Update campaign metrics if campaign is associated
      if (eventDto.campaignId) {
        await this.updateCampaignMetrics(eventDto.campaignId, eventDto.eventType, eventDto.revenue);
      }

      return savedEvent;
    } catch (error) {
      throw new BadRequestException(`Failed to track event: ${error.message}`);
    }
  }

  private async updateCampaignMetrics(
    campaignId: mongoose.Types.ObjectId,
    eventType: EventType,
    revenue?: number,
  ): Promise<void> {
    const campaign = await this.campaignModel.findById(campaignId);
    if (!campaign) return;

    const metrics = campaign.metrics || {};

    switch (eventType) {
      case EventType.PAGE_VIEW:
      case EventType.WIDGET_VIEW:
        metrics.impressions = (metrics.impressions || 0) + 1;
        break;
      case EventType.BUTTON_CLICK:
        metrics.clicks = (metrics.clicks || 0) + 1;
        break;
      case EventType.CONVERSION:
      case EventType.SIGNUP:
      case EventType.PURCHASE:
      case EventType.SUBSCRIPTION:
        metrics.conversions = (metrics.conversions || 0) + 1;
        if (revenue) {
          metrics.revenue = (metrics.revenue || 0) + revenue;
        }
        break;
    }

    // Calculate conversion rate
    if (metrics.impressions && metrics.conversions) {
      metrics.conversionRate = (metrics.conversions / metrics.impressions) * 100;
    }

    // Calculate ROI if cost is available
    if (metrics.cost && metrics.revenue) {
      metrics.roi = ((metrics.revenue - metrics.cost) / metrics.cost) * 100;
    }

    await this.campaignModel.findByIdAndUpdate(campaignId, { metrics });
  }

  // Analytics Reports
  async getCampaignAnalytics(
    campaignId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const pipeline: any[] = [
      {
        $match: {
          campaign: campaignId,
          ...(startDate &&
            endDate && {
              timestamp: { $gte: startDate, $lte: endDate },
            }),
        },
      },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ];

    const events = await this.eventModel.aggregate(pipeline);

    // Get conversion funnel data
    const funnelData = await this.getConversionFunnel(campaignId, startDate, endDate);

    // Get A/B test results if applicable
    const abTestResults = await this.getABTestResults(campaignId, startDate, endDate);

    return {
      events,
      funnelData,
      abTestResults,
      summary: await this.getCampaignSummary(campaignId, startDate, endDate),
    };
  }

  private async getConversionFunnel(
    campaignId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const matchStage = {
      campaign: campaignId,
      ...(startDate &&
        endDate && {
          timestamp: { $gte: startDate, $lte: endDate },
        }),
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ];

    return await this.eventModel.aggregate(pipeline);
  }

  private async getABTestResults(
    campaignId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const matchStage = {
      campaign: campaignId,
      variantId: { $exists: true, $ne: null },
      ...(startDate &&
        endDate && {
          timestamp: { $gte: startDate, $lte: endDate },
        }),
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            variantId: '$variantId',
            eventType: '$eventType',
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$revenue' },
        },
      },
      {
        $group: {
          _id: '$_id.variantId',
          events: {
            $push: {
              eventType: '$_id.eventType',
              count: '$count',
              totalRevenue: '$totalRevenue',
            },
          },
        },
      },
    ];

    return await this.eventModel.aggregate(pipeline);
  }

  private async getCampaignSummary(
    campaignId: mongoose.Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const campaign = await this.getCampaignById(campaignId);

    const matchStage = {
      campaign: campaignId,
      ...(startDate &&
        endDate && {
          timestamp: { $gte: startDate, $lte: endDate },
        }),
    };

    const totalEvents = await this.eventModel.countDocuments(matchStage);
    const totalRevenue = await this.eventModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]);

    return {
      campaignName: campaign.name,
      status: campaign.status,
      totalEvents,
      totalRevenue: totalRevenue[0]?.total || 0,
      dateRange: { startDate, endDate },
    };
  }
}
