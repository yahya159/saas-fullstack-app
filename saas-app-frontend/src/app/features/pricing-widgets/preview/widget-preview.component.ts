import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subject, takeUntil, combineLatest } from 'rxjs';
import { WidgetPreviewService, DeviceSize } from '../../../core/services/widget-preview.service';
import { WidgetStoreService } from '../state/widget-store.service';
import { WidgetInstance } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-widget-preview',
  templateUrl: './widget-preview.component.html',
  styleUrls: ['./widget-preview.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WidgetPreviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  private widgetPreviewService = inject(WidgetPreviewService);
  private widgetStore = inject(WidgetStoreService);
  
  private destroy$ = new Subject<void>();
  
  // Component state
  readonly isFullscreen = signal(false);
  readonly showDeviceToggle = signal(true);
  readonly showTemplateSwitcher = signal(true);
  readonly currentWidgetId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  
  // Service observables
  readonly currentWidget$ = this.widgetPreviewService.currentWidget$;
  readonly currentDeviceSize$ = this.widgetPreviewService.currentDeviceSize$;
  readonly isLoading$ = this.widgetPreviewService.isLoading$;
  readonly error$ = this.widgetPreviewService.error$;
  readonly availableTemplates$ = this.widgetPreviewService.availableTemplates$;
  
  // Computed properties
  readonly deviceSizes = computed(() => this.widgetPreviewService.deviceSizes);
  readonly currentWidget = computed(() => {
    const widgetId = this.currentWidgetId();
    if (!widgetId) return null;
    return this.widgetStore.widgets().find(w => w.id === widgetId) || null;
  });
  
  readonly previewHtml = computed(() => {
    const widget = this.currentWidget();
    if (!widget) return '';
    
    const html = this.widgetPreviewService.generateWidgetHtml(widget);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
  
  readonly previewFrameStyle = computed(() => {
    const deviceSize = this.getCurrentDeviceSize();
    return {
      width: `${deviceSize.width}px`,
      height: `${deviceSize.height}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      border: '1px solid #e1e5e9',
      borderRadius: '8px',
      overflow: 'auto',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };
  });
  
  readonly containerClass = computed(() => {
    const isFullscreen = this.isFullscreen();
    return {
      'preview-container': true,
      'preview-container--fullscreen': isFullscreen,
      'preview-container--device-mode': !isFullscreen
    };
  });

  ngOnInit(): void {
    // Load widget data from route parameter
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const widgetId = params['id'];
        if (widgetId) {
          this.loadWidget(widgetId);
        }
      });
    
    // Load available templates
    this.widgetPreviewService.loadAvailableTemplates();
    
    // Handle fullscreen changes
    this.handleFullscreenChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Actions
  loadWidget(widgetId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      // Set the current widget ID to load from widget store
      this.currentWidgetId.set(widgetId);
      
      // Also load in the preview service for device size management
      this.widgetPreviewService.loadWidget(widgetId);
      
      this.isLoading.set(false);
    } catch (err) {
      this.error.set('Failed to load widget');
      this.isLoading.set(false);
      console.error('Error loading widget:', err);
    }
  }

  switchToTemplate(templateId: string): void {
    this.widgetPreviewService.switchToTemplate(templateId);
  }

  setDeviceSize(deviceSize: DeviceSize): void {
    this.widgetPreviewService.setDeviceSize(deviceSize);
  }

  toggleFullscreen(): void {
    this.isFullscreen.update(current => !current);
    this.widgetPreviewService.toggleFullscreen();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  refreshPreview(): void {
    const currentState = this.widgetPreviewService.getCurrentState();
    if (currentState.widgetId) {
      this.loadWidget(currentState.widgetId);
    }
  }

  // Helper methods
  private getCurrentWidget(): WidgetInstance | null {
    let widget: WidgetInstance | null = null;
    this.currentWidget$.pipe(takeUntil(this.destroy$)).subscribe(w => widget = w);
    return widget;
  }

  getCurrentDeviceSize(): DeviceSize {
    let deviceSize: DeviceSize = this.widgetPreviewService.deviceSizes[0];
    this.currentDeviceSize$.pipe(takeUntil(this.destroy$)).subscribe(ds => deviceSize = ds);
    return deviceSize;
  }

  private handleFullscreenChanges(): void {
    // Listen for fullscreen changes and update UI accordingly
    effect(() => {
      const isFullscreen = this.isFullscreen();
      if (isFullscreen) {
        document.body.classList.add('preview-fullscreen');
        this.showDeviceToggle.set(false);
        this.showTemplateSwitcher.set(false);
      } else {
        document.body.classList.remove('preview-fullscreen');
        this.showDeviceToggle.set(true);
        this.showTemplateSwitcher.set(true);
      }
    });
  }

  // Template helpers
  getDeviceIcon(deviceSize: DeviceSize): string {
    return deviceSize.icon;
  }

  getDeviceDescription(deviceSize: DeviceSize): string {
    return deviceSize.description;
  }

  isCurrentDeviceSize(deviceSize: DeviceSize): boolean {
    const current = this.getCurrentDeviceSize();
    return current.name === deviceSize.name;
  }

  getTemplateName(template: WidgetInstance): string {
    return template.name || 'Unnamed Template';
  }

  getTemplateDescription(template: WidgetInstance): string {
    const blockCount = template.columns.reduce((total, col) => total + col.blocks.length, 0);
    return `${template.columns.length} columns, ${blockCount} blocks`;
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'f':
          event.preventDefault();
          this.toggleFullscreen();
          break;
        case 'r':
          event.preventDefault();
          this.refreshPreview();
          break;
        case 'Escape':
          if (this.isFullscreen()) {
            this.toggleFullscreen();
          }
          break;
      }
    }
  }
}
