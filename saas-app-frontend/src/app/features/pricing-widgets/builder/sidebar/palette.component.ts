import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetStoreService } from '../../state/widget-store.service';
import { WidgetBlockType } from '../../../../core/models/pricing.models';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PaletteComponent {
  private widgetStore = inject(WidgetStoreService);

  readonly blockTypes: { type: WidgetBlockType; label: string; description: string; icon: string }[] = [
    {
      type: 'price-card',
      label: 'Price Card',
      description: 'Display pricing and CTA',
      icon: '💰'
    },
    {
      type: 'feature-list',
      label: 'Feature List',
      description: 'List of features',
      icon: '✅'
    },
    {
      type: 'headline',
      label: 'Headline',
      description: 'Main heading text',
      icon: '📝'
    },
    {
      type: 'subtext',
      label: 'Subtext',
      description: 'Supporting text',
      icon: '📄'
    },
    {
      type: 'badge',
      label: 'Badge',
      description: 'Highlight badge',
      icon: '🏷️'
    },
    {
      type: 'divider',
      label: 'Divider',
      description: 'Visual separator',
      icon: '➖'
    }
  ];

  onBlockClick(blockType: WidgetBlockType): void {
    console.log('Block clicked:', blockType);
    const selectedWidget = this.widgetStore.selectedWidget();
    if (!selectedWidget) {
      console.log('No widget selected');
      alert('Please select a widget first');
      return;
    }

    // Add block to the first column by default
    if (selectedWidget.columns.length > 0) {
      const firstColumnId = selectedWidget.columns[0].id;
      console.log('Adding block to column:', firstColumnId);
      this.widgetStore.addBlockToColumn(selectedWidget.id, firstColumnId, blockType);
      
      // Provide visual feedback
      const blockElement = document.querySelector(`[data-block-type="${blockType}"]`);
      if (blockElement) {
        blockElement.classList.add('block-added-feedback');
        setTimeout(() => {
          blockElement.classList.remove('block-added-feedback');
        }, 1000);
      }
    } else {
      console.log('No columns available');
      alert('Please add a column first before adding blocks');
    }
  }
}