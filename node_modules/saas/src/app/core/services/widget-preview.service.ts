import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, switchMap, catchError, of } from 'rxjs';
import { WidgetInstance, Plan } from '../models/pricing.models';

export interface DeviceSize {
  name: string;
  width: number;
  height: number;
  icon: string;
  description: string;
}

export interface PreviewState {
  widgetId: string | null;
  deviceSize: DeviceSize;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
  widget: WidgetInstance | null;
  availableTemplates: WidgetInstance[];
}

@Injectable({
  providedIn: 'root'
})
export class WidgetPreviewService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/widgets';

  // Device sizes for responsive preview
  readonly deviceSizes: DeviceSize[] = [
    {
      name: 'Desktop',
      width: 1280,
      height: 800,
      icon: '🖥️',
      description: 'Desktop View (1280px)'
    },
    {
      name: 'Tablet',
      width: 768,
      height: 1024,
      icon: '📱',
      description: 'Tablet View (768px)'
    },
    {
      name: 'Mobile',
      width: 375,
      height: 667,
      icon: '📱',
      description: 'Mobile View (375px)'
    }
  ];

  // Default device size
  private defaultDeviceSize = this.deviceSizes[0]; // Desktop

  // State management
  private stateSubject = new BehaviorSubject<PreviewState>({
    widgetId: null,
    deviceSize: this.defaultDeviceSize,
    isFullscreen: false,
    isLoading: false,
    error: null,
    widget: null,
    availableTemplates: []
  });

  readonly state$ = this.stateSubject.asObservable();

  // Selectors
  readonly currentWidget$ = this.state$.pipe(map(state => state.widget));
  readonly currentDeviceSize$ = this.state$.pipe(map(state => state.deviceSize));
  readonly isLoading$ = this.state$.pipe(map(state => state.isLoading));
  readonly error$ = this.state$.pipe(map(state => state.error));
  readonly isFullscreen$ = this.state$.pipe(map(state => state.isFullscreen));
  readonly availableTemplates$ = this.state$.pipe(map(state => state.availableTemplates));

  // Actions
  loadWidget(widgetId: string): void {
    this.updateState({ widgetId, isLoading: true, error: null });
    
    this.http.get<WidgetInstance>(`${this.baseUrl}/${widgetId}`)
      .pipe(
        catchError(error => {
          this.updateState({ 
            isLoading: false, 
            error: `Failed to load widget: ${error.message}` 
          });
          return of(null);
        })
      )
      .subscribe(widget => {
        if (widget) {
          this.updateState({ 
            widget, 
            isLoading: false, 
            error: null 
          });
        }
      });
  }

  loadAvailableTemplates(): void {
    this.http.get<WidgetInstance[]>(`${this.baseUrl}/templates`)
      .pipe(
        catchError(error => {
          console.error('Failed to load templates:', error);
          return of([]);
        })
      )
      .subscribe(templates => {
        this.updateState({ availableTemplates: templates });
      });
  }

  switchToTemplate(templateId: string): void {
    const template = this.stateSubject.value.availableTemplates.find(t => t.id === templateId);
    if (template) {
      this.updateState({ widget: template });
    }
  }

  setDeviceSize(deviceSize: DeviceSize): void {
    this.updateState({ deviceSize });
  }

  toggleFullscreen(): void {
    const currentState = this.stateSubject.value;
    this.updateState({ isFullscreen: !currentState.isFullscreen });
  }

  // Widget HTML generation for preview
  generateWidgetHtml(widget: WidgetInstance): string {
    if (!widget) return '';

    const style = this.generateWidgetStyles(widget);
    const columnsHtml = this.generateColumnsHtml(widget);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${widget.name}</title>
        <style>
          ${this.generatePreviewStyles()}
          ${style}
        </style>
      </head>
      <body>
        <div class="widget-preview-container">
          ${columnsHtml}
        </div>
      </body>
      </html>
    `;
  }

  // Generate responsive styles for the widget
  generateWidgetStyles(widget: WidgetInstance): string {
    const gap = widget.style?.gap || 16;
    const columns = widget.columns.length;
    
    return `
      .widget-preview-container {
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        gap: ${gap}px;
        padding: 20px;
        max-width: 100%;
        margin: 0 auto;
      }
      
      .widget-column {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .widget-block {
        padding: 16px;
        border-radius: 8px;
        background: #fff;
        border: 1px solid #e1e5e9;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .price-card {
        text-align: center;
        padding: 24px;
      }
      
      .price-card.highlighted {
        border: 2px solid #007bff;
        transform: scale(1.05);
      }
      
      .tier-name {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: #333;
      }
      
      .price-amount {
        font-size: 2.5rem;
        font-weight: 700;
        color: #007bff;
        margin: 0 0 16px 0;
      }
      
      .cta-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .cta-button:hover {
        background: #0056b3;
      }
      
      .feature-list {
        text-align: left;
      }
      
      .feature-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .feature-item:last-child {
        border-bottom: none;
      }
      
      @media (max-width: 768px) {
        .widget-preview-container {
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 16px;
        }
        
        .price-card {
          padding: 16px;
        }
        
        .tier-name {
          font-size: 1.25rem;
        }
        
        .price-amount {
          font-size: 2rem;
        }
      }
    `;
  }

  // Generate columns HTML
  generateColumnsHtml(widget: WidgetInstance): string {
    return widget.columns.map(column => `
      <div class="widget-column" style="flex: ${column.widthFraction}">
        ${column.blocks.map(block => this.generateBlockHtml(block)).join('')}
      </div>
    `).join('');
  }

  // Generate individual block HTML
  generateBlockHtml(block: any): string {
    switch (block.type) {
      case 'price-card':
        return this.generatePriceCardHtml(block);
      case 'feature-list':
        return this.generateFeatureListHtml(block);
      case 'headline':
        return `<h2 class="widget-block">${block.text || 'Headline'}</h2>`;
      case 'subtext':
        return `<p class="widget-block">${block.text || 'Subtext'}</p>`;
      case 'badge':
        return `<span class="widget-block badge">${block.text || 'Badge'}</span>`;
      case 'divider':
        return `<hr class="widget-block divider">`;
      default:
        return `<div class="widget-block">${block.text || ''}</div>`;
    }
  }

  // Generate price card HTML
  generatePriceCardHtml(block: any): string {
    const tier = block.tier || { name: 'Tier Name', monthlyPrice: 0, currency: 'USD', ctaLabel: 'Get Started' };
    
    return `
      <div class="widget-block price-card ${tier.highlight ? 'highlighted' : ''}">
        <h3 class="tier-name">${tier.name}</h3>
        <div class="price-amount">${tier.currency}${tier.monthlyPrice}/month</div>
        <button class="cta-button">${tier.ctaLabel}</button>
      </div>
    `;
  }

  // Generate feature list HTML
  generateFeatureListHtml(block: any): string {
    const features = block.features || ['Feature 1', 'Feature 2', 'Feature 3'];
    
    return `
      <div class="widget-block feature-list">
        <ul>
          ${features.map((feature: string) => `
            <li class="feature-item">
              <span>✅</span>
              <span>${feature}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Generate base preview styles
  generatePreviewStyles(): string {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f8f9fa;
      }
      
      .widget-preview-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
  }

  // Get current state
  getCurrentState(): PreviewState {
    return this.stateSubject.value;
  }

  // Update state helper
  private updateState(updates: Partial<PreviewState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }
}
