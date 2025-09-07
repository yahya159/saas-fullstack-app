import { Injectable, inject, signal, computed } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetInstance } from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetCrudService {
  private mockApi = inject(MockApiService);
  
  readonly widgets = computed(() => this.mockApi.widgets());
  readonly selectedWidgetId = signal<string | null>(null);

  readonly selectedWidget = computed(() => {
    const widgetId = this.selectedWidgetId();
    if (!widgetId) return null;
    return this.widgets().find(widget => widget.id === widgetId) || null;
  });

  createBlankWidget(): WidgetInstance {
    const newWidget: Omit<WidgetInstance, 'id'> = {
      name: 'New Widget',
      templateId: '',
      columns: [
        {
          id: this.generateId(),
          order: 0,
          blocks: [],
          widthFraction: 12 // Full width by default
        }
      ],
      style: {
        gap: 16,
        background: '#ffffff',
        maxWidth: 1200
      }
    };

    const widget = this.mockApi.addWidget(newWidget);
    this.selectedWidgetId.set(widget.id);
    return widget;
  }

  createWidgetFromTemplate(templateId: string): WidgetInstance {
    const template = this.mockApi.templates().find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newWidget: Omit<WidgetInstance, 'id'> = {
      name: `Widget from ${template.name}`,
      templateId: template.id,
      columns: template.columns.map(col => ({
        ...col,
        id: this.generateId(),
        blocks: col.blocks.map(block => ({
          ...block,
          id: this.generateId()
        }))
      })),
      style: { ...template.style }
    };

    const widget = this.mockApi.addWidget(newWidget);
    this.selectedWidgetId.set(widget.id);
    return widget;
  }

  selectWidget(widgetId: string | null): void {
    this.selectedWidgetId.set(widgetId);
  }

  deleteWidget(widgetId: string): boolean {
    const success = this.mockApi.deleteWidget(widgetId);
    if (success && this.selectedWidgetId() === widgetId) {
      this.selectedWidgetId.set(null);
    }
    return success;
  }

  updateWidgetName(widgetId: string, name: string): void {
    this.mockApi.updateWidget(widgetId, { name });
  }

  updateWidgetHtml(widgetId: string, htmlContent: string): void {
    this.mockApi.updateWidget(widgetId, { htmlContent });
  }

  updateWidget(widgetId: string, updates: Partial<WidgetInstance>): WidgetInstance | undefined {
    return this.mockApi.updateWidget(widgetId, updates);
  }

  getWidget(widgetId: string): WidgetInstance | undefined {
    return this.mockApi.getWidget(widgetId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
