import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetPreviewComponent } from './widget-preview.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { WidgetPreviewService } from '../../../core/services/widget-preview.service';
import { WidgetStoreService } from '../state/widget-store.service';
import { WidgetPreviewPaymentService } from '../../../core/services/widget-preview-payment.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('WidgetPreviewComponent', () => {
  let component: WidgetPreviewComponent;
  let fixture: ComponentFixture<WidgetPreviewComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockWidgetPreviewService: any;
  let mockWidgetStoreService: any;
  let mockPaymentService: any;
  let mockDomSanitizer: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj(['navigate', 'createUrlTree']);
    mockActivatedRoute = {
      params: of({ id: 'test-widget-id' }),
      snapshot: {}
    };
    mockWidgetPreviewService = jasmine.createSpyObj([
      'loadWidget', 
      'loadAvailableTemplates', 
      'getCurrentState',
      'generateWidgetHtml'
    ]);
    mockWidgetStoreService = jasmine.createSpyObj(['widgets']);
    mockPaymentService = jasmine.createSpyObj(['createCheckoutSession']);
    mockDomSanitizer = jasmine.createSpyObj(['bypassSecurityTrustHtml']);
    
    // Mock implementations
    mockWidgetStoreService.widgets.and.returnValue([]);
    mockWidgetPreviewService.getCurrentState.and.returnValue({ widgetId: 'test-widget-id' });
    mockWidgetPreviewService.generateWidgetHtml.and.returnValue('<div>Test Widget</div>');
    mockDomSanitizer.bypassSecurityTrustHtml.and.returnValue('<div>Test Widget</div>');
    mockRouter.createUrlTree.and.returnValue({ toString: () => '/preview/test-widget-id' });

    await TestBed.configureTestingModule({
      imports: [WidgetPreviewComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WidgetPreviewService, useValue: mockWidgetPreviewService },
        { provide: WidgetStoreService, useValue: mockWidgetStoreService },
        { provide: WidgetPreviewPaymentService, useValue: mockPaymentService },
        { provide: DomSanitizer, useValue: mockDomSanitizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have paymentProcessed signal initialized to false', () => {
    expect(component.paymentProcessed()).toBeFalse();
  });

  it('should have isLoading signal initialized to false', () => {
    expect(component.isLoading()).toBeFalse();
  });

  it('should have error signal initialized to null', () => {
    expect(component.error()).toBeNull();
  });
});