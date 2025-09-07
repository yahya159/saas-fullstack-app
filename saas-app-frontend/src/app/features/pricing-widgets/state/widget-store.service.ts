import { Injectable, signal, computed, inject } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetCrudService } from '../services/widget-crud.service';
import { WidgetBlocksService } from '../services/widget-blocks.service';
import { WidgetExportService } from '../services/widget-export.service';
import { 
  WidgetInstance, 
  WidgetColumn, 
  WidgetBlock, 
  WidgetBlockType, 
  Plan
} from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetStoreService {
  private mockApi = inject(MockApiService);
  private widgetCrud = inject(WidgetCrudService);
  private widgetBlocks = inject(WidgetBlocksService);
  private widgetExport = inject(WidgetExportService);
  
  // Signals - delegate to focused services
  readonly widgets = this.widgetCrud.widgets;
  readonly templates = computed(() => this.mockApi.templates());
  readonly plans = this.widgetExport.plans;
  readonly features = this.widgetExport.features;
  
  readonly selectedWidget = this.widgetCrud.selectedWidget;
  readonly selectedBlockId = this.widgetBlocks.selectedBlockId;

  readonly selectedBlock = computed(() => {
    const widget = this.selectedWidget();
    const blockId = this.selectedBlockId();
    if (!widget || !blockId) return null;

    for (const column of widget.columns) {
      const block = column.blocks.find(b => b.id === blockId);
      if (block) return { block, column };
    }
    return null;
  });

  readonly attachedPlan = computed(() => {
    const widget = this.selectedWidget();
    if (!widget || !widget.attachedPlanId) return null;
    return this.plans().find(plan => plan.id === widget.attachedPlanId) || null;
  });

  // Actions - delegate to focused services
  createWidgetFromTemplate(templateId: string): WidgetInstance {
    return this.widgetCrud.createWidgetFromTemplate(templateId);
  }

  createBlankWidget(): WidgetInstance {
    return this.widgetCrud.createBlankWidget();
  }

  attachPlan(widgetId: string, planId: string): void {
    this.mockApi.updateWidget(widgetId, { attachedPlanId: planId });
  }

  addBlockToColumn(widgetId: string, columnId: string, blockType: WidgetBlockType): WidgetBlock {
    return this.widgetBlocks.addBlockToColumn(widgetId, columnId, blockType);
  }

  reorderBlocks(widgetId: string, columnId: string, newOrder: WidgetBlock[]): void {
    this.widgetBlocks.reorderBlocks(widgetId, columnId, newOrder);
  }

  moveBlockAcrossColumns(
    widgetId: string, 
    fromColumnId: string, 
    toColumnId: string, 
    blockId: string, 
    toIndex: number
  ): void {
    this.widgetBlocks.moveBlockAcrossColumns(widgetId, fromColumnId, toColumnId, blockId, toIndex);
  }

  updateBlockStyle(widgetId: string, blockId: string, partialStyle: Partial<WidgetBlock['style']>): void {
    this.widgetBlocks.updateBlockStyle(widgetId, blockId, partialStyle);
  }

  updateBlockText(widgetId: string, blockId: string, text: string): void {
    this.widgetBlocks.updateBlockText(widgetId, blockId, text);
  }

  setColumnWidth(widgetId: string, columnId: string, widthFraction: WidgetColumn['widthFraction']): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, widthFraction } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  addColumn(widgetId: string): WidgetColumn {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) throw new Error('Widget not found');

    const newColumn: WidgetColumn = {
      id: this.generateId(),
      order: widget.columns.length,
      blocks: [],
      widthFraction: 4 // Default to 4/12 (1/3 width)
    };

    const updatedColumns = [...widget.columns, newColumn];
    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    
    return newColumn;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  deleteColumn(widgetId: string, columnId: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns
      .filter(col => col.id !== columnId)
      .map((col, index) => ({ ...col, order: index })); // Reorder remaining columns

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  selectWidget(widgetId: string | null): void {
    this.widgetCrud.selectWidget(widgetId);
    this.widgetBlocks.selectBlock(null);
  }

  deleteWidget(widgetId: string): boolean {
    return this.widgetCrud.deleteWidget(widgetId);
  }

  updateWidgetName(widgetId: string, name: string): void {
    this.widgetCrud.updateWidgetName(widgetId, name);
  }

  updateWidgetHtml(widgetId: string, htmlContent: string): void {
    this.widgetCrud.updateWidgetHtml(widgetId, htmlContent);
  }

  selectBlock(blockId: string | null): void {
    this.widgetBlocks.selectBlock(blockId);
  }

  deleteBlock(widgetId: string, blockId: string): void {
    this.widgetBlocks.deleteBlock(widgetId, blockId);
  }

  exportHtml(widgetId: string): string {
    return this.widgetExport.exportHtml(widgetId);
  }

  exportJson(widgetId: string): WidgetInstance | null {
    return this.widgetExport.exportJson(widgetId);
  }

  exportCss(widgetId: string): string {
    return this.widgetExport.exportCss(widgetId);
  }

  updateWidget(widgetId: string, updates: Partial<WidgetInstance>): WidgetInstance | undefined {
    return this.widgetCrud.updateWidget(widgetId, updates);
  }

}
