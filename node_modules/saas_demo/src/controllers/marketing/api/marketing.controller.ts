import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  MarketingService,
  CreateCampaignDto,
  UpdateCampaignDto,
  TrackEventDto,
} from '@Services/marketing/marketing.service';
import { ParseObjectIdPipe } from '@app/common/pipes/parse-object-id.pipe';
import * as mongoose from 'mongoose';
import {
  CampaignType,
  CampaignStatus,
} from '@Data/models/saasMarketingCampaign/saasMarketingCampaign.pojo.model';
import { EventType } from '@Data/models/saasAnalyticsEvent/saasAnalyticsEvent.pojo.model';

// API paths constants
export const MARKETING_API_PATHS = {
  // Campaign Management
  CREATE_CAMPAIGN: '/create',
  GET_CAMPAIGNS_BY_APP: '/application/:applicationId',
  GET_CAMPAIGN: '/:campaignId',
  UPDATE_CAMPAIGN: '/:campaignId',
  DELETE_CAMPAIGN: '/:campaignId',
  START_CAMPAIGN: '/:campaignId/start',
  PAUSE_CAMPAIGN: '/:campaignId/pause',
  COMPLETE_CAMPAIGN: '/:campaignId/complete',

  // Analytics
  TRACK_EVENT: '/track',
  GET_CAMPAIGN_ANALYTICS: '/:campaignId/analytics',
  GET_AB_TEST_RESULTS: '/:campaignId/ab-results',

  // Public Analytics (for external tracking)
  PUBLIC_TRACK_EVENT: '/public/track',
} as const;

@Controller('/marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // Campaign Management Endpoints

  @Post(MARKETING_API_PATHS.CREATE_CAMPAIGN)
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    try {
      const campaign = await this.marketingService.createCampaign(createCampaignDto);
      return {
        success: true,
        data: campaign,
        message: 'Campaign created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Campaign Creation Failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(MARKETING_API_PATHS.GET_CAMPAIGNS_BY_APP)
  async getCampaignsByApplication(
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    try {
      const campaigns = await this.marketingService.getCampaignsByApplication(applicationId);
      return {
        success: true,
        data: campaigns,
        count: campaigns.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve campaigns',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(MARKETING_API_PATHS.GET_CAMPAIGN)
  async getCampaignById(
    @Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId,
  ) {
    try {
      const campaign = await this.marketingService.getCampaignById(campaignId);
      return {
        success: true,
        data: campaign,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Campaign not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(MARKETING_API_PATHS.UPDATE_CAMPAIGN)
  async updateCampaign(
    @Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId,
    @Body() updateData: UpdateCampaignDto,
  ) {
    try {
      const campaign = await this.marketingService.updateCampaign(campaignId, updateData);
      return {
        success: true,
        data: campaign,
        message: 'Campaign updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Campaign update failed',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(MARKETING_API_PATHS.DELETE_CAMPAIGN)
  async deleteCampaign(
    @Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId,
  ) {
    try {
      await this.marketingService.deleteCampaign(campaignId);
      return {
        success: true,
        message: 'Campaign deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Campaign deletion failed',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(MARKETING_API_PATHS.START_CAMPAIGN)
  async startCampaign(@Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId) {
    try {
      const campaign = await this.marketingService.startCampaign(campaignId);
      return {
        success: true,
        data: campaign,
        message: 'Campaign started successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to start campaign',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(MARKETING_API_PATHS.PAUSE_CAMPAIGN)
  async pauseCampaign(@Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId) {
    try {
      const campaign = await this.marketingService.pauseCampaign(campaignId);
      return {
        success: true,
        data: campaign,
        message: 'Campaign paused successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to pause campaign',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(MARKETING_API_PATHS.COMPLETE_CAMPAIGN)
  async completeCampaign(
    @Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId,
  ) {
    try {
      const campaign = await this.marketingService.completeCampaign(campaignId);
      return {
        success: true,
        data: campaign,
        message: 'Campaign completed successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to complete campaign',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Analytics and Tracking Endpoints

  @Post(MARKETING_API_PATHS.TRACK_EVENT)
  async trackEvent(@Body() eventDto: TrackEventDto) {
    try {
      const event = await this.marketingService.trackEvent(eventDto);
      return {
        success: true,
        data: event,
        message: 'Event tracked successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Event tracking failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(MARKETING_API_PATHS.GET_CAMPAIGN_ANALYTICS)
  async getCampaignAnalytics(
    @Param('campaignId', ParseObjectIdPipe) campaignId: mongoose.Types.ObjectId,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const analytics = await this.marketingService.getCampaignAnalytics(campaignId, start, end);
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve analytics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
