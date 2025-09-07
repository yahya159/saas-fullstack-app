import { Injectable, inject, signal } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetInstance, WidgetColumn, WidgetBlock, WidgetBlockType } from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetBlocksService {
  private mockApi = inject(MockApiService);
  readonly selectedBlockId = signal<string | null>(null);

  addBlockToColumn(widgetId: string, columnId: string, blockType: WidgetBlockType): WidgetBlock {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) throw new Error('Widget not found');

    const column = widget.columns.find(col => col.id === columnId);
    if (!column) throw new Error('Column not found');

    const newBlock: WidgetBlock = {
      id: this.generateId(),
      type: blockType,
      text: this.getDefaultText(blockType),
      order: column.blocks.length,
      style: this.getDefaultStyle(blockType)
    };

    const updatedBlocks = [...column.blocks, newBlock];
    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, blocks: updatedBlocks } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    this.selectedBlockId.set(newBlock.id);
    return newBlock;
  }

  reorderBlocks(widgetId: string, columnId: string, newOrder: WidgetBlock[]): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, blocks: newOrder } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  moveBlockAcrossColumns(
    widgetId: string, 
    fromColumnId: string, 
    toColumnId: string, 
    blockId: string, 
    toIndex: number
  ): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const fromColumn = widget.columns.find(col => col.id === fromColumnId);
    const toColumn = widget.columns.find(col => col.id === toColumnId);
    
    if (!fromColumn || !toColumn) return;

    const block = fromColumn.blocks.find(b => b.id === blockId);
    if (!block) return;

    // Remove from source column
    const updatedFromBlocks = fromColumn.blocks.filter(b => b.id !== blockId);
    
    // Add to target column
    const updatedToBlocks = [...toColumn.blocks];
    updatedToBlocks.splice(toIndex, 0, { ...block, order: toIndex });

    // Update order for all blocks in target column
    const reorderedToBlocks = updatedToBlocks.map((b, index) => ({ ...b, order: index }));

    const updatedColumns = widget.columns.map(col => {
      if (col.id === fromColumnId) {
        return { ...col, blocks: updatedFromBlocks.map((b, index) => ({ ...b, order: index })) };
      }
      if (col.id === toColumnId) {
        return { ...col, blocks: reorderedToBlocks };
      }
      return col;
    });

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  updateBlockStyle(widgetId: string, blockId: string, partialStyle: Partial<WidgetBlock['style']>): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.map(block =>
        block.id === blockId 
          ? { ...block, style: { ...block.style, ...partialStyle } }
          : block
      )
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  updateBlockText(widgetId: string, blockId: string, text: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.map(block =>
        block.id === blockId ? { ...block, text } : block
      )
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  deleteBlock(widgetId: string, blockId: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.filter(block => block.id !== blockId)
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    
    if (this.selectedBlockId() === blockId) {
      this.selectedBlockId.set(null);
    }
  }

  selectBlock(blockId: string | null): void {
    this.selectedBlockId.set(blockId);
  }

  private getDefaultText(blockType: WidgetBlockType): string {
    const defaults: Record<WidgetBlockType, string> = {
      'price-card': 'Price Card',
      'feature-list': 'Features',
      'headline': 'Your Headline',
      'subtext': 'Your subtext here',
      'badge': 'Popular',
      'divider': ''
    };
    return defaults[blockType];
  }

  private getDefaultStyle(blockType: WidgetBlockType): WidgetBlock['style'] {
    const defaults: Record<WidgetBlockType, WidgetBlock['style']> = {
      'price-card': { padding: 20, radius: 8, elevation: 1, textAlign: 'center' },
      'feature-list': { padding: 16, textAlign: 'left' },
      'headline': { textAlign: 'center', padding: 8 },
      'subtext': { textAlign: 'center', padding: 8 },
      'badge': { padding: 4, radius: 4, textAlign: 'center' },
      'divider': { padding: 8 }
    };
    return defaults[blockType];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
