import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, Subject, takeUntil, combineLatest, firstValueFrom } from 'rxjs';
import { WidgetPreviewService, DeviceSize } from '../../../core/services/widget-preview.service';
import { WidgetStoreService } from '../state/widget-store.service';
import { WidgetInstance, WidgetTemplate } from '../../../core/models/pricing.models';
import { WidgetPreviewPaymentService } from '../../../core/services/widget-preview-payment.service';

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
  private paymentService = inject(WidgetPreviewPaymentService);
  
  private destroy$ = new Subject<void>();
  
  // Component state
  readonly isFullscreen = signal(false);
  readonly showDeviceToggle = signal(true);
  readonly showTemplateSwitcher = signal(true);
  readonly currentWidgetId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly paymentProcessed = signal(false);
  readonly sessionId = signal<string | null>(null);
  
  // Handle fullscreen changes with effect as a field initializer
  private fullscreenEffect = effect(() => {
    const isFullscreen = this.isFullscreen();
    // Use untracked to avoid circular dependencies
    untracked(() => {
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
  });
  
  // Service observables
  readonly currentWidget$ = this.widgetPreviewService.currentWidget$;
  readonly currentDeviceSize$ = this.widgetPreviewService.currentDeviceSize$;
  readonly isLoading$ = this.widgetPreviewService.isLoading$;
  readonly error$ = this.widgetPreviewService.error$;
  readonly availableTemplates$ = this.widgetStore.templates; // Use templates from widget store instead
  
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
    
    // Check for payment success in URL parameters
    this.checkPaymentStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // The effect will be automatically cleaned up when the component is destroyed
  }

  // Actions
  loadWidget(widgetId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      // Set the current widget ID to load from widget store
      this.currentWidgetId.set(widgetId);
      
      // Note: We're not calling widgetPreviewService.loadWidget anymore since
      // we're using the widget store which gets data from the mock API
      
      this.isLoading.set(false);
    } catch (err: unknown) {
      // Properly handle the unknown error type
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      this.error.set('Failed to load widget: ' + errorMessage);
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
    const newValue = !this.isFullscreen();
    this.isFullscreen.set(newValue);
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

  // Payment functionality
  async processPayment(): Promise<void> {
    const widgetId = this.currentWidgetId();
    if (!widgetId) {
      this.error.set('No widget selected for payment');
      return;
    }

    try {
      this.isLoading.set(true);
      
      // Get current URL for success/cancel callbacks
      const currentUrl = window.location.origin + this.router.createUrlTree([], { 
        relativeTo: this.route 
      }).toString();
      
      const successUrl = `${currentUrl}?payment=success`;
      const cancelUrl = `${currentUrl}?payment=cancelled`;
      
      // Create checkout session using the payment service
      const response = await firstValueFrom(
        this.paymentService.createCheckoutSession({
          widgetId,
          successUrl,
          cancelUrl
        })
      );
      
      if (response && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (err: unknown) {
      // Properly handle the unknown error type
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      this.error.set('Failed to process payment: ' + errorMessage);
      this.isLoading.set(false);
      console.error('Payment error:', err);
    }
  }

  private checkPaymentStatus(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      this.paymentProcessed.set(true);
      this.sessionId.set(sessionId);
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      this.error.set('Payment was cancelled. Please try again.');
      // Remove URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
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

  // Template helpers for WidgetTemplate
  getTemplateTemplateName(template: WidgetTemplate): string {
    return template.name || 'Unnamed Template';
  }

  getTemplateTemplateDescription(template: WidgetTemplate): string {
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