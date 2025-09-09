import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { WidgetStoreService } from '../../state/widget-store.service';
import { WidgetBlockType } from '../../../../core/models/pricing.models';

@Component({
  selector: 'app-palette',
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.css'],
  imports: [CommonModule, CdkDrag, CdkDropList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PaletteComponent implements OnInit {
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

  ngOnInit(): void {
    console.log('Palette component initialized');
  }

  onDragStarted(event: any): void {
    console.log('Palette drag started:', event);
    document.body.classList.add('dragging-from-palette');
  }

  onDragEnded(event: any): void {
    console.log('Palette drag ended:', event);
    document.body.classList.remove('dragging-from-palette');
  }

  getConnectedDropLists(): string[] {
    // Get the selected widget from the store
    const widget = this.widgetStore.selectedWidget();
    if (!widget) {
      return [];
    }
    
    // Return all column IDs to connect to
    return widget.columns.map(col => col.id);
  }
}