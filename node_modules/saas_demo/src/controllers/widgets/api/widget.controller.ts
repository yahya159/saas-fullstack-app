import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { ParseObjectIdPipe } from '@app/common/pipes/parse-object-id.pipe';
import { WidgetService } from '@Services/widget/widget.service';
import { CreateWidgetDTO, UpdateWidgetDTO } from '@Services/dto/widget/widget.dto';
import { SaasWidgetPOJO } from '@Data/models/saasWidget/saasWidget.pojo.model';
import { WIDGET_API_PATHS } from '../api-paths/widget-api-paths';

@Controller(WIDGET_API_PATHS.ROOT_PATH)
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Post(WIDGET_API_PATHS.CREATE_PATH)
  @HttpCode(HttpStatus.CREATED)
  async createWidget(@Body() createDto: CreateWidgetDTO): Promise<SaasWidgetPOJO> {
    return this.widgetService.createWidget(createDto);
  }

  @Get(WIDGET_API_PATHS.GET_ALL_PATH)
  async getAllWidgets(): Promise<SaasWidgetPOJO[]> {
    return this.widgetService.getAllWidgets();
  }

  @Get(WIDGET_API_PATHS.SEARCH_PATH)
  async searchWidgets(@Query('q') query: string): Promise<SaasWidgetPOJO[]> {
    return this.widgetService.searchWidgets(query || '');
  }

  @Get(WIDGET_API_PATHS.BY_APPLICATION_PATH)
  async getWidgetsByApplication(
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO[]> {
    return this.widgetService.getWidgetsByApplication(applicationId);
  }

  @Get(WIDGET_API_PATHS.GET_BY_ID_PATH)
  async getWidget(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO> {
    return this.widgetService.getWidget(widgetId);
  }

  @Put(WIDGET_API_PATHS.UPDATE_PATH)
  async updateWidget(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
    @Body() updateDto: UpdateWidgetDTO,
  ): Promise<SaasWidgetPOJO> {
    return this.widgetService.updateWidget(widgetId, updateDto);
  }

  @Put(WIDGET_API_PATHS.TOGGLE_PUBLIC_PATH)
  async togglePublic(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO> {
    return this.widgetService.togglePublic(widgetId);
  }

  @Put(WIDGET_API_PATHS.TOGGLE_ACTIVE_PATH)
  async toggleActive(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO> {
    return this.widgetService.toggleActive(widgetId);
  }

  @Delete(WIDGET_API_PATHS.DELETE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWidget(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<void> {
    return this.widgetService.deleteWidget(widgetId);
  }
}
