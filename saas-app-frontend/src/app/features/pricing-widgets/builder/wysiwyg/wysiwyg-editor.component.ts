import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetStoreService } from '../../state/widget-store.service';
import { NotificationService } from '../../../../@core/services/notification.service';

interface EditorTool {
  id: string;
  name: string;
  icon: string;
  action: () => void;
  active?: boolean;
}

@Component({
  selector: 'app-wysiwyg-editor',
  templateUrl: './wysiwyg-editor.component.html',
  styleUrls: ['./wysiwyg-editor.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WysiwygEditorComponent implements AfterViewInit {
  private widgetStore = inject(WidgetStoreService);
  private notificationService = inject(NotificationService);

  @ViewChild('editorCanvas') editorCanvas!: ElementRef<HTMLDivElement>;

  readonly selectedWidget = this.widgetStore.selectedWidget;
  readonly selectedElement = signal<HTMLElement | null>(null);
  readonly editorContent = signal('');

  // Tool definitions
  readonly textTools: EditorTool[] = [
    { id: 'bold', name: 'Bold', icon: 'B', action: () => this.execCommand('bold') },
    { id: 'italic', name: 'Italic', icon: 'I', action: () => this.execCommand('italic') },
    { id: 'underline', name: 'Underline', icon: 'U', action: () => this.execCommand('underline') },
    { id: 'h1', name: 'Heading 1', icon: 'H1', action: () => this.execCommand('formatBlock', 'h1') },
    { id: 'h2', name: 'Heading 2', icon: 'H2', action: () => this.execCommand('formatBlock', 'h2') },
    { id: 'h3', name: 'Heading 3', icon: 'H3', action: () => this.execCommand('formatBlock', 'h3') },
    { id: 'p', name: 'Paragraph', icon: 'P', action: () => this.execCommand('formatBlock', 'p') }
  ];

  readonly layoutTools: EditorTool[] = [
    { id: 'align-left', name: 'Align Left', icon: '⬅', action: () => this.execCommand('justifyLeft') },
    { id: 'align-center', name: 'Align Center', icon: '↔', action: () => this.execCommand('justifyCenter') },
    { id: 'align-right', name: 'Align Right', icon: '➡', action: () => this.execCommand('justifyRight') },
    { id: 'list-ul', name: 'Bullet List', icon: '•', action: () => this.execCommand('insertUnorderedList') },
    { id: 'list-ol', name: 'Numbered List', icon: '1.', action: () => this.execCommand('insertOrderedList') }
  ];

  readonly elementTools: EditorTool[] = [
    { id: 'link', name: 'Insert Link', icon: '🔗', action: () => this.insertLink() },
    { id: 'image', name: 'Insert Image', icon: '🖼', action: () => this.insertImage() },
    { id: 'divider', name: 'Divider', icon: '➖', action: () => this.insertDivider() },
    { id: 'button', name: 'Button', icon: '🔘', action: () => this.insertButton() }
  ];

  readonly pricingTools: EditorTool[] = [
    { id: 'price', name: 'Price Block', icon: '💰', action: () => this.insertPriceBlock() },
    { id: 'feature', name: 'Feature List', icon: '✅', action: () => this.insertFeatureList() },
    { id: 'plan', name: 'Plan Card', icon: '📋', action: () => this.insertPlanCard() },
    { id: 'cta', name: 'Call to Action', icon: '🚀', action: () => this.insertCTA() }
  ];

  ngAfterViewInit(): void {
    this.loadWidgetContent();
  }

  private loadWidgetContent(): void {
    const widget = this.selectedWidget();
    if (widget) {
      // Load existing widget content or create default
      const content = widget.htmlContent || this.getDefaultContent();
      this.editorContent.set(content);
    }
  }

  private getDefaultContent(): string {
    return `
      <div class="pricing-widget">
        <h2>Choose Your Plan</h2>
        <p>Select the perfect plan for your needs</p>
        <div class="pricing-grid">
          <div class="plan-card">
            <h3>Basic Plan</h3>
            <div class="price">$9<span>/month</span></div>
            <ul class="features">
              <li>✅ Feature 1</li>
              <li>✅ Feature 2</li>
              <li>✅ Feature 3</li>
            </ul>
            <button class="cta-button">Get Started</button>
          </div>
        </div>
      </div>
    `;
  }

  onContentChange(): void {
    if (this.editorCanvas) {
      const content = this.editorCanvas.nativeElement.innerHTML;
      this.editorContent.set(content);
      this.saveWidgetContent(content);
    }
  }

  onEditorClick(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer.parentElement;
      this.selectedElement.set(element as HTMLElement);
    }
  }

  private execCommand(command: string, value?: string): void {
    document.execCommand(command, false, value);
    this.onContentChange();
  }

  private insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  private insertImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      const img = `<img src="${url}" alt="Image" style="max-width: 100%; height: auto;">`;
      this.execCommand('insertHTML', img);
    }
  }

  private insertDivider(): void {
    const divider = '<hr style="border: 1px solid #dee2e6; margin: 2rem 0;">';
    this.execCommand('insertHTML', divider);
  }

  private insertButton(): void {
    const button = '<button class="btn btn-primary" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Click Me</button>';
    this.execCommand('insertHTML', button);
  }

  private insertPriceBlock(): void {
    const priceBlock = `
      <div class="price-block" style="text-align: center; padding: 1rem; border: 1px solid #dee2e6; border-radius: 8px; margin: 1rem 0;">
        <div class="price" style="font-size: 2rem; font-weight: bold; color: #007bff;">$29</div>
        <div class="period" style="color: #6c757d;">per month</div>
      </div>
    `;
    this.execCommand('insertHTML', priceBlock);
  }

  private insertFeatureList(): void {
    const featureList = `
      <ul class="feature-list" style="list-style: none; padding: 0;">
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #f1f3f4;">✅ Feature 1</li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #f1f3f4;">✅ Feature 2</li>
        <li style="padding: 0.5rem 0; border-bottom: 1px solid #f1f3f4;">✅ Feature 3</li>
      </ul>
    `;
    this.execCommand('insertHTML', featureList);
  }

  private insertPlanCard(): void {
    const planCard = `
      <div class="plan-card" style="border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; text-align: center;">
        <h3 style="margin: 0 0 1rem 0;">Pro Plan</h3>
        <div class="price" style="font-size: 2rem; font-weight: bold; color: #007bff; margin-bottom: 1rem;">$49</div>
        <ul class="features" style="list-style: none; padding: 0; margin: 1rem 0;">
          <li style="padding: 0.25rem 0;">✅ All Basic Features</li>
          <li style="padding: 0.25rem 0;">✅ Advanced Analytics</li>
          <li style="padding: 0.25rem 0;">✅ Priority Support</li>
        </ul>
        <button class="cta-button" style="width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Choose Plan</button>
      </div>
    `;
    this.execCommand('insertHTML', planCard);
  }

  private insertCTA(): void {
    const cta = `
      <div class="cta-section" style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; margin: 1rem 0;">
        <h3 style="margin: 0 0 1rem 0;">Ready to Get Started?</h3>
        <p style="margin: 0 0 1.5rem 0; color: #6c757d;">Join thousands of satisfied customers</p>
        <button class="cta-button" style="padding: 1rem 2rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1.1rem;">Start Free Trial</button>
      </div>
    `;
    this.execCommand('insertHTML', cta);
  }

  private saveWidgetContent(content: string): void {
    const widget = this.selectedWidget();
    if (widget) {
      this.widgetStore.updateWidgetHtml(widget.id, content);
    }
  }

  getElementProperty(property: string): string | null {
    const element = this.selectedElement();
    if (element) {
      return window.getComputedStyle(element).getPropertyValue(property);
    }
    return null;
  }

  setElementProperty(property: string, value: string): void {
    const element = this.selectedElement();
    if (element) {
      element.style.setProperty(property, value);
      this.onContentChange();
    }
  }

  onColorChange(event: Event, property: string): void {
    const target = event.target as HTMLInputElement;
    this.setElementProperty(property, target.value);
  }

  onRangeChange(event: Event, property: string): void {
    const target = event.target as HTMLInputElement;
    this.setElementProperty(property, target.value + 'px');
  }
}
