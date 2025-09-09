import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { WidgetStoreService } from '../../state/widget-store.service';
import { WidgetBlockType, WidgetBlock } from '../../../../core/models/pricing.models';
import { PriceCardComponent } from './price-card.component';
import { FeatureListComponent } from './feature-list.component';

type ColumnBlocks = WidgetBlock[];

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css'],
  imports: [CommonModule, CdkDropList, CdkDrag, PriceCardComponent, FeatureListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class CanvasComponent implements OnInit {
  private widgetStore = inject(WidgetStoreService);

  selectedWidget = this.widgetStore.selectedWidget;
  selectedBlockId = this.widgetStore.selectedBlockId;
  liveRegionMessage = signal<string>('');

  ngOnInit(): void {
    console.log('Canvas component initialized');
  }

  onDrop(event: CdkDragDrop<ColumnBlocks>): void {
    console.log('=== DROP EVENT TRIGGERED ===');
    console.log('Drop event object:', event);
    console.log('Previous container ID:', event.previousContainer.id);
    console.log('Current container ID:', event.container.id);
    console.log('Is same container:', event.previousContainer === event.container);
    console.log('Item data:', event.item.data);
    console.log('Previous index:', event.previousIndex);
    console.log('Current index:', event.currentIndex);
    
    const widget = this.selectedWidget();
    if (!widget) {
      console.log('No widget selected');
      return;
    }

    console.log('Widget ID:', widget.id);
    console.log('Widget columns:', widget.columns.map(col => ({ id: col.id, order: col.order })));

    if (event.previousContainer === event.container) {
      // Reordering within the same column
      console.log('Reordering within same column');
      const column = widget.columns.find(col => col.id === event.container.id);
      if (column) {
        const blocks = [...column.blocks];
        const block = blocks[event.previousIndex];
        moveItemInArray(blocks, event.previousIndex, event.currentIndex);
        this.widgetStore.reorderBlocks(widget.id, column.id, blocks);
        this.announceToScreenReader(`Moved ${block.type} block to position ${event.currentIndex + 1} in column ${column.order + 1}`);
      }
    } else {
      // Moving between columns or from palette
      const fromColumnId = event.previousContainer.id;
      const toColumnId = event.container.id;
      
      console.log('Moving between containers:', fromColumnId, '->', toColumnId);
      
      // Debug: Check if we can find the target column
      const toColumn = widget.columns.find(col => col.id === toColumnId);
      console.log('Target column found:', toColumn);
      
      if (fromColumnId === 'palette') {
        // Adding new block from palette
        console.log('Adding new block from palette');
        const blockType = event.item.data as WidgetBlockType;
        console.log('Block type:', blockType);
        if (blockType) {
          console.log('Calling addBlockToColumn with:', widget.id, toColumnId, blockType);
          this.widgetStore.addBlockToColumn(widget.id, toColumnId, blockType);
          this.announceToScreenReader(`Added ${blockType} block to column ${toColumn ? toColumn.order + 1 : 'unknown'}`);
        } else {
          console.error('Block type is undefined');
        }
      } else {
        // Moving existing block between columns
        console.log('Moving existing block between columns');
        const fromColumn = widget.columns.find(col => col.id === fromColumnId);
        if (fromColumn) {
          const block = fromColumn.blocks[event.previousIndex];
          this.widgetStore.moveBlockAcrossColumns(
            widget.id, 
            fromColumnId, 
            toColumnId, 
            block.id, 
            event.currentIndex
          );
          this.announceToScreenReader(`Moved ${block.type} block from column ${fromColumn.order + 1} to column ${toColumn ? toColumn.order + 1 : 'unknown'}`);
        }
      }
    }
  }

  selectBlock(blockId: string): void {
    this.widgetStore.selectBlock(blockId);
  }

  deleteBlock(blockId: string): void {
    const widget = this.selectedWidget();
    if (widget) {
      this.widgetStore.deleteBlock(widget.id, blockId);
    }
  }

  getBlockStyle(block: WidgetBlock): Record<string, string> {
    const style: Record<string, string> = {};
    
    if (block.style?.width) style['width'] = `${block.style.width}px`;
    if (block.style?.textAlign) style['textAlign'] = block.style.textAlign;
    if (block.style?.radius) style['borderRadius'] = `${block.style.radius}px`;
    if (block.style?.padding) style['padding'] = `${block.style.padding}px`;
    if (block.style?.elevation) {
      const elevation = block.style.elevation;
      style['boxShadow'] = `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)`;
    }
    
    return style;
  }

  getColumnStyle(column: { widthFraction: number }): Record<string, string> {
    const style: Record<string, string> = {};
    
    if (column.widthFraction) {
      const fraction = column.widthFraction / 12;
      style['flex'] = `${fraction} 1 0`;
    }
    
    return style;
  }

  getWidgetStyle(): Record<string, string> {
    const widget = this.selectedWidget();
    if (!widget) return {};
    
    const style: Record<string, string> = {};
    
    if (widget.style?.background) style['background'] = widget.style.background;
    if (widget.style?.maxWidth) style['maxWidth'] = `${widget.style.maxWidth}px`;
    if (widget.style?.gap) style['gap'] = `${widget.style.gap}px`;
    
    return style;
  }

  addColumn(): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    try {
      this.widgetStore.addColumn(widget.id);
    } catch (error) {
      console.error('Failed to add column:', error);
    }
  }

  setColumnWidth(columnId: string, widthFraction: string): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    this.widgetStore.setColumnWidth(widget.id, columnId, parseInt(widthFraction) as 1 | 2 | 3 | 4 | 6 | 12);
  }

  deleteColumn(columnId: string): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    // Don't allow deleting the last column
    if (widget.columns.length <= 1) {
      alert('Cannot delete the last column. A widget must have at least one column.');
      return;
    }

    try {
      this.widgetStore.deleteColumn(widget.id, columnId);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  }

  openProperties(): void {
    // This method is called when Enter is pressed on a block
    // The properties panel should automatically show when a block is selected
    // This is handled by the parent component's selectedBlockId signal
  }

  onDragStarted(): void {
    // Add visual feedback when drag starts
    document.body.classList.add('dragging-active');
  }

  onDragEnded(): void {
    // Remove visual feedback when drag ends
    document.body.classList.remove('dragging-active');
  }

  getAttachedPlan() {
    return this.widgetStore.attachedPlan();
  }

  trackByBlockId(index: number, block: WidgetBlock): string {
    return block.id;
  }

  onColumnWidthChange(columnId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setColumnWidth(columnId, target.value);
  }

  private announceToScreenReader(message: string): void {
    this.liveRegionMessage.set(message);
    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      this.liveRegionMessage.set('');
    }, 1000);
  }

  getConnectedDropLists(): string[] {
    const widget = this.selectedWidget();
    if (!widget) {
      console.log('No widget selected, returning palette for connected drop lists');
      // Even when no widget is selected, we still need to return the palette
      // to maintain the connection for when a widget is selected
      return ['palette'];
    }
    
    // Return all column IDs plus the palette ID
    const connectedLists = [...widget.columns.map(col => col.id), 'palette'];
    console.log('Connected drop lists:', connectedLists);
    return connectedLists;
  }
}