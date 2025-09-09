import { Controller, Get, Param, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ParseObjectIdPipe } from '@app/common/pipes/parse-object-id.pipe';
import { WidgetService } from '@Services/widget/widget.service';
import { SaasWidgetPOJO } from '@Data/models/saasWidget/saasWidget.pojo.model';
import { PUBLIC_WIDGET_API_PATHS } from '../api-paths/widget-api-paths';

@Controller(PUBLIC_WIDGET_API_PATHS.ROOT_PATH)
export class PublicWidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get(PUBLIC_WIDGET_API_PATHS.GET_WIDGET_PATH)
  async getPublicWidget(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO> {
    return this.widgetService.getPublicWidget(widgetId);
  }

  @Get(PUBLIC_WIDGET_API_PATHS.GET_EMBED_PATH)
  @Header('Content-Type', 'text/html')
  @Header('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
  async getWidgetEmbed(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const html = await this.widgetService.generateWidgetHtml(widgetId);
      res.send(html);
    } catch (error) {
      res.status(404).send('<p>Widget not found or not available</p>');
    }
  }

  @Get(PUBLIC_WIDGET_API_PATHS.GET_CONFIG_PATH)
  @Header('Cache-Control', 'public, max-age=1800') // Cache for 30 minutes
  async getWidgetConfig(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
  ): Promise<{ configuration: any }> {
    const widget = await this.widgetService.getPublicWidget(widgetId);
    return { configuration: widget.configuration };
  }

  @Get(PUBLIC_WIDGET_API_PATHS.GET_EMBED_CODE_PATH)
  @Header('Content-Type', 'text/plain')
  async getWidgetEmbedCode(
    @Param('widgetId', ParseObjectIdPipe) widgetId: mongoose.Types.ObjectId,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const embedCode = await this.widgetService.generateEmbedCode(widgetId);
      res.send(embedCode);
    } catch (error) {
      res.status(404).send('Widget not found or not available');
    }
  }
}
