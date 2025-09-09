import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WidgetApiService } from '../../../core/services/widget-api.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetStoreService } from '../../pricing-widgets/state/widget-store.service';
import { WidgetExport } from '../../../core/models/widget-export.models';
import { WidgetInstance } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-widgets-export',
  templateUrl: './widgets-export.component.html',
  styleUrls: ['./widgets-export.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WidgetsExportComponent implements OnInit {
  private readonly widgetApi = inject(WidgetApiService);
  private readonly mockApi = inject(MockApiService);
  private readonly widgetStore = inject(WidgetStoreService);

  // State
  exportableWidgets = signal<WidgetExport[]>([]);
  availableWidgets = signal<WidgetInstance[]>([]);
  loading = signal(false);
  selectedWidget = signal<WidgetExport | null>(null);
  showExportDialog = signal(false);
  showEmbedCodeDialog = signal(false);
  embedCode = signal('');
  selectedWidgetForExport = signal<WidgetInstance | null>(null);

  // Filters
  searchQuery = signal('');
  showOnlyPublic = signal(false);
  showOnlyActive = signal(true);

  ngOnInit() {
    this.loadExportableWidgets();
    this.loadAvailableWidgets();
  }

  private loadExportableWidgets() {
    this.loading.set(true);

    // Mock data pour la démonstration
    const mockExportWidgets: WidgetExport[] = [
      {
        id: 'widget-1',
        name: 'Starter Plan Pricing',
        description: 'Basic pricing widget for starter plans',
        isPublic: true,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        embedCode: `<div id="saas-widget-widget-1" data-widget-id="widget-1"></div>
<script>
  (function() {
    const widgetContainer = document.getElementById('saas-widget-widget-1');
    if (widgetContainer) {
      fetch('/api/public/widgets/widget-1/embed')
        .then(response => response.text())
        .then(html => {
          widgetContainer.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading widget:', error);
        });
    }
  })();
</script>`,
        previewUrl: '/api/public/widgets/widget-1/embed',
        configUrl: '/api/public/widgets/widget-1/config'
      },
      {
        id: 'widget-2',
        name: 'Enterprise Pricing Grid',
        description: 'Complex pricing grid for enterprise offerings',
        isPublic: false,
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10'),
        embedCode: `<div id="saas-widget-widget-2" data-widget-id="widget-2"></div>
<script>/* Widget script */</script>`,
        previewUrl: '/api/public/widgets/widget-2/embed',
        configUrl: '/api/public/widgets/widget-2/config'
      }
    ];

    this.exportableWidgets.set(mockExportWidgets);
    this.loading.set(false);
  }

  private loadAvailableWidgets() {
    this.availableWidgets.set(this.widgetStore.widgets());
  }

  getFilteredWidgets(): WidgetExport[] {
    let filtered = this.exportableWidgets();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(query) ||
        (widget.description && widget.description.toLowerCase().includes(query))
      );
    }

    if (this.showOnlyPublic()) {
      filtered = filtered.filter(widget => widget.isPublic);
    }

    if (this.showOnlyActive()) {
      filtered = filtered.filter(widget => widget.isActive);
    }

    return filtered;
  }

  getAvailableWidgetsForExport(): WidgetInstance[] {
    const exportedWidgetIds = this.exportableWidgets().map(w => w.id);
    return this.availableWidgets().filter(w => !exportedWidgetIds.includes(w.id));
  }

  openExportDialog() {
    this.selectedWidgetForExport.set(null);
    this.showExportDialog.set(true);
  }

  closeExportDialog() {
    this.showExportDialog.set(false);
    this.selectedWidgetForExport.set(null);
  }

  exportWidget() {
    const widget = this.selectedWidgetForExport();
    if (!widget) return;

    // Mock implementation
    const newExportWidget: WidgetExport = {
      id: widget.id,
      name: widget.name,
      description: `Exported widget: ${widget.name}`,
      isPublic: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      embedCode: this.generateEmbedCode(widget.id),
      previewUrl: `/api/public/widgets/${widget.id}/embed`,
      configUrl: `/api/public/widgets/${widget.id}/config`
    };

    this.exportableWidgets.update(widgets => [...widgets, newExportWidget]);
    this.closeExportDialog();
  }

  private generateEmbedCode(widgetId: string): string {
    return `<!-- SaaS Widget Embed Code -->
<div id="saas-widget-${widgetId}" data-widget-id="${widgetId}"></div>
<script>
  (function() {
    const widgetContainer = document.getElementById('saas-widget-${widgetId}');
    if (widgetContainer) {
      fetch('/api/public/widgets/${widgetId}/embed')
        .then(response => response.text())
        .then(html => {
          widgetContainer.innerHTML = html;
        })
        .catch(error => {
          console.error('Error loading widget:', error);
          widgetContainer.innerHTML = '<p>Error loading pricing widget</p>';
        });
    }
  })();
</script>
<!-- End SaaS Widget Embed Code -->`;
  }

  showEmbedCode(widget: WidgetExport) {
    this.selectedWidget.set(widget);
    this.embedCode.set(widget.embedCode);
    this.showEmbedCodeDialog.set(true);
  }

  closeEmbedCodeDialog() {
    this.showEmbedCodeDialog.set(false);
    this.selectedWidget.set(null);
    this.embedCode.set('');
  }

  copyEmbedCode() {
    navigator.clipboard.writeText(this.embedCode()).then(() => {
      // Show success message (could use a toast service)
      alert('Embed code copied to clipboard!');
    }).catch(error => {
      console.error('Error copying to clipboard:', error);
      alert('Error copying to clipboard');
    });
  }

  toggleWidgetPublic(widget: WidgetExport) {
    // Mock implementation
    this.exportableWidgets.update(widgets =>
      widgets.map(w =>
        w.id === widget.id
          ? { ...w, isPublic: !w.isPublic, updatedAt: new Date() }
          : w
      )
    );
  }

  toggleWidgetActive(widget: WidgetExport) {
    // Mock implementation
    this.exportableWidgets.update(widgets =>
      widgets.map(w =>
        w.id === widget.id
          ? { ...w, isActive: !w.isActive, updatedAt: new Date() }
          : w
      )
    );
  }

  deleteExportedWidget(widget: WidgetExport) {
    if (!confirm(`Are you sure you want to remove "${widget.name}" from exports?`)) {
      return;
    }

    // Mock implementation
    this.exportableWidgets.update(widgets =>
      widgets.filter(w => w.id !== widget.id)
    );
  }

  previewWidget(widget: WidgetExport) {
    // Open preview in new tab/window
    window.open(widget.previewUrl, '_blank');
  }

  editWidget(widget: WidgetExport) {
    // Navigate to widget builder with this widget
    // For now, just show an alert
    alert(`Edit widget functionality would navigate to builder for widget: ${widget.name}`);
  }

  getStatusBadgeClass(widget: WidgetExport): string {
    if (!widget.isActive) return 'status-inactive';
    if (widget.isPublic) return 'status-public';
    return 'status-private';
  }

  getStatusText(widget: WidgetExport): string {
    if (!widget.isActive) return 'Inactive';
    if (widget.isPublic) return 'Public';
    return 'Private';
  }

  refreshWidgets() {
    this.loadExportableWidgets();
    this.loadAvailableWidgets();
  }
}
