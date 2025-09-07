import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { SaasWidgetRepository } from '@Data/saasWidget/repository/saasWidget.repository';
import { CreateWidgetDTO, UpdateWidgetDTO } from '@Services/dto/widget/widget.dto';
import { SaasWidgetPOJO } from '@Data/models/saasWidget/saasWidget.pojo.model';

@Injectable()
export class WidgetService {
  constructor(private readonly widgetRepository: SaasWidgetRepository) {}

  async createWidget(createDto: CreateWidgetDTO): Promise<SaasWidgetPOJO> {
    return this.widgetRepository.create(createDto);
  }

  async getWidget(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO> {
    const widget = await this.widgetRepository.findById(id);
    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return widget;
  }

  async getPublicWidget(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO> {
    const widget = await this.widgetRepository.findByIdPublic(id);
    if (!widget) {
      throw new NotFoundException(`Public widget with ID ${id} not found or not accessible`);
    }
    return widget;
  }

  async getAllWidgets(): Promise<SaasWidgetPOJO[]> {
    return this.widgetRepository.findAll();
  }

  async getWidgetsByApplication(applicationId: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO[]> {
    return this.widgetRepository.findByApplication(applicationId);
  }

  async getPublicWidgetsByApplication(
    applicationId: mongoose.Types.ObjectId,
  ): Promise<SaasWidgetPOJO[]> {
    return this.widgetRepository.findPublicByApplication(applicationId);
  }

  async updateWidget(
    id: mongoose.Types.ObjectId,
    updateDto: UpdateWidgetDTO,
  ): Promise<SaasWidgetPOJO> {
    const updatedWidget = await this.widgetRepository.update(id, updateDto);
    if (!updatedWidget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return updatedWidget;
  }

  async deleteWidget(id: mongoose.Types.ObjectId): Promise<void> {
    const deleted = await this.widgetRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
  }

  async togglePublic(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO> {
    const toggledWidget = await this.widgetRepository.togglePublic(id);
    if (!toggledWidget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return toggledWidget;
  }

  async toggleActive(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO> {
    const toggledWidget = await this.widgetRepository.toggleActive(id);
    if (!toggledWidget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return toggledWidget;
  }

  async searchWidgets(query: string): Promise<SaasWidgetPOJO[]> {
    return this.widgetRepository.search(query);
  }

  async generateWidgetHtml(id: mongoose.Types.ObjectId): Promise<string> {
    const widget = await this.getPublicWidget(id);
    return this.generateHtmlFromWidget(widget);
  }

  private generateHtmlFromWidget(widget: SaasWidgetPOJO): string {
    const { configuration } = widget;
    const { columns, style } = configuration;

    let html = `<!-- Pricing Widget: ${widget.name} -->\n`;
    html += `<section class="pricing-widget" role="region" aria-label="Pricing">\n`;

    if (style?.background) {
      html += `  <div style="background: ${style.background}; padding: 20px;">\n`;
    }

    // Main container with responsive max-width
    html += `    <div class="pricing-container" style="max-width: ${
      style?.maxWidth || 1200
    }px; margin: 0 auto; padding: 0 16px;">\n`;

    // Grid layout for columns
    html += `      <div class="pricing-columns" style="display: grid; grid-template-columns: repeat(${
      columns.length
    }, 1fr); gap: ${style?.gap || 24}px; align-items: start;">\n`;

    for (const column of columns.sort((a, b) => a.order - b.order)) {
      html += `        <div class="pricing-column" role="listitem" aria-label="Pricing column">\n`;

      for (const block of column.blocks.sort((a, b) => a.order - b.order)) {
        html += this.renderBlockHtml(block);
      }

      html += `        </div>\n`;
    }

    html += `      </div>\n`;
    html += `    </div>\n`;

    if (style?.background) {
      html += `  </div>\n`;
    }

    html += `</section>\n`;
    html += `<!-- End Pricing Widget -->`;

    return html;
  }

  private renderBlockHtml(block: any): string {
    const style = this.buildStyleString(block.style || {});

    switch (block.type) {
      case 'headline':
        return `          <h3 class="pricing-headline" style="${style}">${block.text || ''}</h3>\n`;

      case 'subtext':
        return `          <p class="pricing-subtext" style="${style}">${block.text || ''}</p>\n`;

      case 'price-card':
        // Simplified price card - in a real implementation, you'd fetch plan data
        return `          <div class="pricing-card" style="${style}">
            <div class="pricing-amount">$99</div>
            <div class="pricing-period">/month</div>
          </div>\n`;

      case 'feature-list':
        return `          <ul class="pricing-features" style="${style}">
            <li>Feature 1</li>
            <li>Feature 2</li>
            <li>Feature 3</li>
          </ul>\n`;

      case 'badge':
        return `          <span class="pricing-badge" style="${style}">${
          block.text || 'Badge'
        }</span>\n`;

      case 'button':
        return `          <button class="pricing-button" style="${style}">${
          block.text || 'Get Started'
        }</button>\n`;

      default:
        return `          <div class="pricing-block" style="${style}">${block.text || ''}</div>\n`;
    }
  }

  private buildStyleString(style: Record<string, any>): string {
    const styleArray = [];

    if (style.padding) styleArray.push(`padding: ${style.padding}px`);
    if (style.margin) styleArray.push(`margin: ${style.margin}px`);
    if (style.textAlign) styleArray.push(`text-align: ${style.textAlign}`);
    if (style.color) styleArray.push(`color: ${style.color}`);
    if (style.backgroundColor) styleArray.push(`background-color: ${style.backgroundColor}`);
    if (style.fontSize) styleArray.push(`font-size: ${style.fontSize}px`);
    if (style.fontWeight) styleArray.push(`font-weight: ${style.fontWeight}`);
    if (style.borderRadius) styleArray.push(`border-radius: ${style.borderRadius}px`);

    return styleArray.join('; ');
  }

  async generateEmbedCode(id: mongoose.Types.ObjectId): Promise<string> {
    const widget = await this.getPublicWidget(id);

    // Generate embed script
    const embedCode = `
<!-- SaaS Widget Embed Code -->
<div id="saas-widget-${id}" data-widget-id="${id}"></div>
<script>
  (function() {
    const widgetContainer = document.getElementById('saas-widget-${id}');
    if (widgetContainer) {
      fetch('/api/public/widgets/${id}/embed')
        .then(response => response.text())
        .then(html => {
          widgetContainer.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading widget:', error);
          widgetContainer.innerHTML = '<p>Error loading pricing widget</p>';
        });
    }
  })();
</script>
<!-- End SaaS Widget Embed Code -->
    `.trim();

    return embedCode;
  }
}
