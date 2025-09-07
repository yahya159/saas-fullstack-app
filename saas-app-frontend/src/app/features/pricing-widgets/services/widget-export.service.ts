import { Injectable, inject, computed } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetInstance, WidgetBlock, Plan } from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetExportService {
  private mockApi = inject(MockApiService);
  
  readonly plans = computed(() => this.mockApi.plans());
  readonly features = computed(() => this.mockApi.features());

  exportHtml(widgetId: string): string {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return '';

    const plan = widget.attachedPlanId ? this.plans().find(p => p.id === widget.attachedPlanId) : null;
    
    // Framework-agnostic, semantic HTML structure
    let html = `<!-- Pricing Widget - Framework Agnostic HTML Export -->\n`;
    html += `<section class="pricing-widget" role="region" aria-label="Pricing">\n`;
    
    // Optional background wrapper
    if (widget.style?.background) {
      html += `  <div style="background: ${widget.style.background}; padding: 20px;">\n`;
    }
    
    // Main container with responsive max-width
    html += `    <div class="pricing-container" style="max-width: ${widget.style?.maxWidth || 1200}px; margin: 0 auto; padding: 0 16px;">\n`;
    
    // Grid layout for columns
    html += `      <div class="pricing-columns" style="display: grid; grid-template-columns: repeat(${widget.columns.length}, 1fr); gap: ${widget.style?.gap || 24}px; align-items: start;">\n`;

    for (const column of widget.columns) {
      html += `        <div class="pricing-column" role="listitem" aria-label="Pricing column">\n`;
      
      for (const block of column.blocks.sort((a, b) => a.order - b.order)) {
        html += this.renderBlockHtml(block, plan || null);
      }
      
      html += `        </div>\n`;
    }
    
    html += `      </div>\n`;
    html += `    </div>\n`;
    
    if (widget.style?.background) {
      html += `  </div>\n`;
    }
    
    html += `</section>\n`;
    html += `<!-- End Pricing Widget -->`;
    
    return html;
  }

  exportJson(widgetId: string): WidgetInstance | null {
    return this.mockApi.getWidget(widgetId) || null;
  }

  exportCss(widgetId: string): string {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return '';

    let css = `/* Pricing Widget Styles */\n`;
    css += `.pricing-widget {\n`;
    css += `  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n`;
    css += `  line-height: 1.6;\n`;
    css += `  color: #333;\n`;
    css += `}\n\n`;

    css += `.pricing-container {\n`;
    css += `  max-width: ${widget.style?.maxWidth || 1200}px;\n`;
    css += `  margin: 0 auto;\n`;
    css += `  padding: 0 16px;\n`;
    css += `}\n\n`;

    css += `.pricing-columns {\n`;
    css += `  display: grid;\n`;
    css += `  grid-template-columns: repeat(${widget.columns.length}, 1fr);\n`;
    css += `  gap: ${widget.style?.gap || 24}px;\n`;
    css += `  align-items: start;\n`;
    css += `}\n\n`;

    css += `.pricing-card {\n`;
    css += `  background: white;\n`;
    css += `  border-radius: 8px;\n`;
    css += `  padding: 24px;\n`;
    css += `  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n`;
    css += `  border: 1px solid #e2e8f0;\n`;
    css += `  transition: transform 0.2s ease, box-shadow 0.2s ease;\n`;
    css += `}\n\n`;

    css += `.pricing-card:hover {\n`;
    css += `  transform: translateY(-2px);\n`;
    css += `  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);\n`;
    css += `}\n\n`;

    css += `.pricing-card--highlighted {\n`;
    css += `  border-color: #3b82f6;\n`;
    css += `  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);\n`;
    css += `}\n\n`;

    css += `.pricing-card__title {\n`;
    css += `  font-size: 1.5rem;\n`;
    css += `  font-weight: 700;\n`;
    css += `  margin: 0 0 16px 0;\n`;
    css += `  color: #1a202c;\n`;
    css += `}\n\n`;

    css += `.pricing-card__price {\n`;
    css += `  margin: 0 0 24px 0;\n`;
    css += `}\n\n`;

    css += `.pricing-card__amount {\n`;
    css += `  font-size: 3rem;\n`;
    css += `  font-weight: 800;\n`;
    css += `  color: #1a202c;\n`;
    css += `}\n\n`;

    css += `.pricing-card__period {\n`;
    css += `  font-size: 1rem;\n`;
    css += `  color: #6b7280;\n`;
    css += `}\n\n`;

    css += `.pricing-features {\n`;
    css += `  list-style: none;\n`;
    css += `  padding: 0;\n`;
    css += `  margin: 0 0 24px 0;\n`;
    css += `}\n\n`;

    css += `.pricing-feature {\n`;
    css += `  padding: 8px 0;\n`;
    css += `  border-bottom: 1px solid #f1f5f9;\n`;
    css += `  color: #4a5568;\n`;
    css += `}\n\n`;

    css += `.pricing-feature:last-child {\n`;
    css += `  border-bottom: none;\n`;
    css += `}\n\n`;

    css += `.pricing-button {\n`;
    css += `  width: 100%;\n`;
    css += `  padding: 12px 24px;\n`;
    css += `  border: none;\n`;
    css += `  border-radius: 6px;\n`;
    css += `  font-weight: 600;\n`;
    css += `  cursor: pointer;\n`;
    css += `  transition: all 0.2s ease;\n`;
    css += `}\n\n`;

    css += `.pricing-button--primary {\n`;
    css += `  background-color: #3b82f6;\n`;
    css += `  color: white;\n`;
    css += `}\n\n`;

    css += `.pricing-button--primary:hover {\n`;
    css += `  background-color: #2563eb;\n`;
    css += `}\n\n`;

    css += `/* Responsive Design */\n`;
    css += `@media (max-width: 768px) {\n`;
    css += `  .pricing-columns {\n`;
    css += `    grid-template-columns: 1fr;\n`;
    css += `  }\n`;
    css += `}\n`;

    return css;
  }

  private renderBlockHtml(block: WidgetBlock, plan: Plan | null): string {
    const style = this.buildInlineStyle(block.style);
    
    switch (block.type) {
      case 'price-card':
        return this.renderPriceCardHtml(block, plan, style);
      case 'feature-list':
        return this.renderFeatureListHtml(block, plan, style);
      case 'headline':
        return `          <h2 class="pricing-headline" style="${style}">${block.text || 'Your Headline'}</h2>\n`;
      case 'subtext':
        return `          <p class="pricing-subtext" style="${style}">${block.text || 'Your subtext here'}</p>\n`;
      case 'badge':
        return `          <span class="pricing-badge" style="${style}">${block.text || 'Badge'}</span>\n`;
      case 'divider':
        return `          <hr class="pricing-divider" style="${style}">\n`;
      default:
        return `          <div class="pricing-block" style="${style}">${block.text || ''}</div>\n`;
    }
  }

  private renderPriceCardHtml(block: WidgetBlock, plan: Plan | null, style: string): string {
    if (!plan || !block.planTierId) {
      return `          <article class="pricing-card" style="${style}">
            <p>No plan attached</p>
          </article>\n`;
    }

    const tier = plan.tiers.find(t => t.id === block.planTierId);
    if (!tier) {
      return `          <article class="pricing-card" style="${style}">
            <p>Tier not found</p>
          </article>\n`;
    }

    const highlightClass = tier.highlight ? 'pricing-card--highlighted' : '';
    const price = tier.monthlyPrice;
    const currency = tier.currency;
    const currencySymbol = currency === 'USD' ? '$' : currency;

    return `          <article class="pricing-card ${highlightClass}" style="${style}">
            <header class="pricing-card__header">
              <h3 class="pricing-card__title">${tier.name}</h3>
              ${tier.highlight ? '<span class="pricing-badge">Popular</span>' : ''}
            </header>
            <div class="pricing-card__price">
              <span class="pricing-card__amount">${currencySymbol}${price}</span>
              <span class="pricing-card__period">/month</span>
            </div>
            <div class="pricing-card__features">
              <ul class="pricing-features">
                ${tier.features.map(featureKey => {
                  const feature = this.features().find(f => f.key === featureKey);
                  return `<li class="pricing-feature">${feature ? feature.name : featureKey}</li>`;
                }).join('\n                ')}
              </ul>
            </div>
            <footer class="pricing-card__footer">
              <button class="pricing-button pricing-button--primary" type="button">
                ${tier.ctaLabel || 'Get Started'}
              </button>
            </footer>
          </article>\n`;
  }

  private renderFeatureListHtml(block: WidgetBlock, plan: Plan | null, style: string): string {
    if (!plan || !block.planTierId) {
      return `          <div class="pricing-feature-list" style="${style}">
            <p>No plan attached</p>
          </div>\n`;
    }

    const tier = plan.tiers.find(t => t.id === block.planTierId);
    if (!tier) {
      return `          <div class="pricing-feature-list" style="${style}">
            <p>Tier not found</p>
          </div>\n`;
    }

    const features = tier.features.map(featureKey => {
      const feature = this.features().find(f => f.key === featureKey);
      return feature ? feature.name : featureKey;
    });

    const featureList = features.map(feature => `              <li class="pricing-feature">${feature}</li>`).join('\n');
    
    return `          <div class="pricing-feature-list" style="${style}">
            <h4 class="pricing-feature-list__title">Features</h4>
            <ul class="pricing-features">
${featureList}
            </ul>
          </div>\n`;
  }

  private buildInlineStyle(style?: WidgetBlock['style']): string {
    if (!style) return '';
    
    const styles: string[] = [];
    
    if (style.width) styles.push(`width: ${style.width}px`);
    if (style.textAlign) styles.push(`text-align: ${style.textAlign}`);
    if (style.radius) styles.push(`border-radius: ${style.radius}px`);
    if (style.padding) styles.push(`padding: ${style.padding}px`);
    if (style.elevation) styles.push(`box-shadow: 0 ${style.elevation * 2}px ${style.elevation * 4}px rgba(0,0,0,0.1)`);
    
    return styles.join('; ');
  }
}
