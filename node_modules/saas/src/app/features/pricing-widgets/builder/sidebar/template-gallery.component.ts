import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetStoreService } from '../../state/widget-store.service';
import { TemplateThumbnailComponent } from './template-thumbnail.component';

@Component({
  selector: 'app-template-gallery',
  templateUrl: './template-gallery.component.html',
  styleUrls: ['./template-gallery.component.css'],
  imports: [CommonModule, TemplateThumbnailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TemplateGalleryComponent {
  private widgetStore = inject(WidgetStoreService);

  templates = this.widgetStore.templates;

  createFromTemplate(templateId: string): void {
    this.widgetStore.createWidgetFromTemplate(templateId);
  }

  createBlankWidget(): void {
    this.widgetStore.createBlankWidget();
  }

  getBlockPreviewText(blockType: string): string {
    const previews: Record<string, string> = {
      'price-card': '$99',
      'feature-list': 'Features',
      'headline': 'Title',
      'subtext': 'Text',
      'badge': 'Badge',
      'divider': '—'
    };
    return previews[blockType] || 'Block';
  }

  getTemplateDescription(template: { columns: { blocks: unknown[] }[] }): string {
    const columnCount = template.columns.length;
    const blockCount = template.columns.reduce((total: number, col) => total + col.blocks.length, 0);
    return `${columnCount} columns, ${blockCount} blocks`;
  }

  getTemplateType(templateName: string): string {
    const typeMap: Record<string, string> = {
      '3-column classic': '3-column-classic',
      '2-column spotlight': '2-column-spotlight',
      'Comparison matrix': 'comparison-matrix'
    };

    const type = typeMap[templateName] || 'default';
    console.log('Template name:', templateName, 'Mapped to type:', type);
    return type;
  }

  getTemplateImage(templateName: string): string {
    const imageMap: Record<string, string> = {
      '3-column classic': 'assets/templates/3-column-classic.svg',
      '2-column spotlight': 'assets/templates/2-column-spotlight.svg',
      'Comparison matrix': 'assets/templates/comparison-matrix.svg'
    };

    const image = imageMap[templateName] || 'assets/templates/3-column-classic.svg';
    console.log('Template name:', templateName, 'Mapped to image:', image);
    return image;
  }
}
