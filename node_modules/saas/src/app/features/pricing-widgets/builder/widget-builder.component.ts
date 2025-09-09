import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { WidgetStoreService } from '../state/widget-store.service';
import { TemplateThumbnailComponent } from './sidebar/template-thumbnail.component';
import { ExportModalComponent } from '../export/export-modal.component';
import { WidgetMenuComponent } from '../widget-menu.component';
import { CanvasComponent } from './canvas/canvas.component';
import { PaletteComponent } from './sidebar/palette.component';
import { PropertiesPanelComponent } from './sidebar/properties-panel.component';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher.component';
import { WidgetInstance } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-widget-builder',
  templateUrl: './widget-builder.component.html',
  styleUrls: ['./widget-builder.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    TemplateThumbnailComponent,
    ExportModalComponent,
    WidgetMenuComponent,
    CanvasComponent,
    PaletteComponent,
    PropertiesPanelComponent,
    ThemeSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WidgetBuilderComponent {
  private widgetStore = inject(WidgetStoreService);
  private router = inject(Router);

  widgets = this.widgetStore.widgets;
  templates = this.widgetStore.templates;
  selectedWidget = this.widgetStore.selectedWidget;
  showExportModal = signal(false);

  // Computed properties for better organization
  hasWidgets = computed(() => this.widgets().length > 0);
  hasTemplates = computed(() => this.templates().length > 0);
  isEditing = computed(() => !!this.selectedWidget());

  // Helper method to calculate total blocks in a widget
  getColumnBlockCount(widget: WidgetInstance): number {
    return widget.columns.reduce((total, column) => total + column.blocks.length, 0);
  }

  createNewWidget(): void {
    const newWidget = this.widgetStore.createBlankWidget();
    this.widgetStore.selectWidget(newWidget.id);
  }

  selectWidget(widgetId: string): void {
    this.widgetStore.selectWidget(widgetId);
  }

  viewWidget(widgetId: string): void {
    this.widgetStore.selectWidget(widgetId);
  }

  deleteWidgetById(widgetId: string): void {
    const widget = this.widgets().find(w => w.id === widgetId);
    if (!widget) return;

    if (confirm(`Are you sure you want to delete "${widget.name}"? This action cannot be undone.`)) {
      const success = this.widgetStore.deleteWidget(widgetId);
      if (success) {
        console.log('Widget deleted successfully');
        // If we were editing this widget, clear the selection
        if (this.selectedWidget()?.id === widgetId) {
          this.widgetStore.selectWidget(null);
        }
      } else {
        alert('Failed to delete widget');
      }
    }
  }

  openExportModal(): void {
    this.showExportModal.set(true);
  }

  closeExportModal(): void {
    this.showExportModal.set(false);
  }

  createFromTemplate(templateId: string): void {
    const newWidget = this.widgetStore.createWidgetFromTemplate(templateId);
    this.widgetStore.selectWidget(newWidget.id);
  }

  exitEditMode(): void {
    this.widgetStore.selectWidget(null);
  }

  getTemplateDescription(template: { columns: { blocks: unknown[] }[] }): string {
    const columnCount = template.columns.length;
    const blockCount = template.columns.reduce((total: number, col) => total + col.blocks.length, 0);
    return `${columnCount} columns, ${blockCount} blocks`;
  }

  getTemplateType(templateName: string): string {
    // Log the template name to see what we're working with
    console.log('Processing template name for type:', `"${templateName}"`);

    const typeMap: Record<string, string> = {
      '3-column classic': '3-column-classic',
      '2-column spotlight': '2-column-spotlight',
      'Comparison matrix': 'comparison-matrix'
    };

    // Check for exact match first
    if (typeMap[templateName]) {
      const type = typeMap[templateName];
      console.log('Exact match found for type, type:', type);
      return type;
    }

    // Check for trimmed match
    const trimmedName = templateName.trim();
    if (typeMap[trimmedName]) {
      const type = typeMap[trimmedName];
      console.log('Trimmed match found for type, type:', type);
      return type;
    }

    // Log all available keys for debugging
    console.log('Available template names in type map:', Object.keys(typeMap));

    const type = templateName; // Return the original name as fallback
    console.log('No match found for type, using original name:', type);
    return type;
  }

  getTemplateImage(templateName: string): string {
    // Log the template name to see what we're working with
    console.log('Getting image for template name:', `"${templateName}"`);

    const imageMap: Record<string, string> = {
      '3-column classic': 'assets/templates/3-column-classic.svg',
      '2-column spotlight': 'assets/templates/2-column-spotlight.svg',
      'Comparison matrix': 'assets/templates/comparison-matrix.svg'
    };

    // Check for exact match first
    if (imageMap[templateName]) {
      const image = imageMap[templateName];
      console.log('Exact match found for image, image:', image);
      return image;
    }

    // Check for trimmed match
    const trimmedName = templateName.trim();
    if (imageMap[trimmedName]) {
      const image = imageMap[trimmedName];
      console.log('Trimmed match found for image, image:', image);
      return image;
    }

    // Log all available keys for debugging
    console.log('Available template names in image map:', Object.keys(imageMap));

    const image = 'assets/templates/3-column-classic.svg';
    console.log('No match found for image, using default image:', image);
    return image;
  }

  // Helper method to get block preview text for widget cards
  getBlockPreview(blockType: string): string {
    const previews: Record<string, string> = {
      'price-card': '$99',
      'feature-list': '✓ Features',
      'headline': 'Title',
      'subtext': 'Text',
      'badge': 'Badge',
      'divider': '—'
    };
    return previews[blockType] || 'Block';
  }
}
