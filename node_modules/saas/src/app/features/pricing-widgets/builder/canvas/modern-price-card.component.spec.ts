import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ModernPriceCardComponent } from './modern-price-card.component';
import { ThemeService } from '../../../../../core/services/theme.service';
import { TierSelectionService } from '../../../../../core/services/tier-selection.service';
import { WidgetBlock, Plan, PlanTier } from '../../../../../core/models/pricing.models';

describe('ModernPriceCardComponent', () => {
  let component: ModernPriceCardComponent;
  let fixture: ComponentFixture<ModernPriceCardComponent>;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockTierSelectionService: jasmine.SpyObj<TierSelectionService>;

  const mockPlan: Plan = {
    id: 'plan-1',
    name: 'Test Plan',
    description: 'Test plan description',
    currency: 'USD',
    tiers: [
      {
        id: 'tier-1',
        name: 'Basic',
        description: 'Basic tier',
        monthlyPrice: 10,
        yearlyPrice: 100,
        currency: 'USD',
        features: ['feature-1', 'feature-2'],
        limits: { 'api.limit': 1000 },
        ctaLabel: 'Get Started',
        highlight: false
      }
    ]
  };

  const mockBlock: WidgetBlock = {
    id: 'block-1',
    type: 'price-card',
    order: 0,
    planTierId: 'tier-1',
    style: {}
  };

  beforeEach(async () => {
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', [
      'getPriceInCurrentCurrency',
      'getCurrencySymbol'
    ]);
    const tierSelectionServiceSpy = jasmine.createSpyObj('TierSelectionService', [
      'selectTier'
    ]);

    await TestBed.configureTestingModule({
      imports: [ModernPriceCardComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: TierSelectionService, useValue: tierSelectionServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModernPriceCardComponent);
    component = fixture.componentInstance;
    mockThemeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    mockTierSelectionService = TestBed.inject(TierSelectionService) as jasmine.SpyObj<TierSelectionService>;

    // Setup mock returns
    mockThemeService.getPriceInCurrentCurrency.and.returnValue(10);
    mockThemeService.getCurrencySymbol.and.returnValue('$');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tier information when plan and block are provided', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    fixture.detectChanges();

    expect(component.tierName()).toBe('Basic');
    expect(component.price()).toBe('10/month');
    expect(component.ctaLabel()).toBe('Get Started');
  });

  it('should show yearly pricing when isYearly is true', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    component.isYearly.set(true);
    fixture.detectChanges();

    expect(component.price()).toBe('100/year');
  });

  it('should calculate savings for yearly pricing', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    component.isYearly.set(true);
    fixture.detectChanges();

    const savings = component.savings();
    expect(savings).toBeTruthy();
    expect(savings!.percentage).toBe(17); // (120 - 100) / 120 * 100
  });

  it('should show recommended badge when isRecommended is true', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    component.isRecommended.set(true);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Recommended');
  });

  it('should show popular badge when tier is highlighted', () => {
    const highlightedPlan = {
      ...mockPlan,
      tiers: [
        {
          ...mockPlan.tiers[0],
          highlight: true
        }
      ]
    };

    component.block.set(mockBlock);
    component.plan.set(highlightedPlan);
    fixture.detectChanges();

    expect(component.badgeText()).toBe('Popular');
  });

  it('should handle hover events', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    fixture.detectChanges();

    expect(component.isHovered()).toBe(false);

    component.onMouseEnter();
    expect(component.isHovered()).toBe(true);

    component.onMouseLeave();
    expect(component.isHovered()).toBe(false);
  });

  it('should handle CTA click', () => {
    spyOn(console, 'log');
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    fixture.detectChanges();

    component.onCtaClick();

    expect(console.log).toHaveBeenCalledWith('CTA clicked for tier:', 'Basic');
  });

  it('should return appropriate feature icons', () => {
    expect(component.getFeatureIcon('api.limit')).toBe('🔌');
    expect(component.getFeatureIcon('storage.gb')).toBe('💾');
    expect(component.getFeatureIcon('unknown.feature')).toBe('✅');
  });

  it('should identify premium features correctly', () => {
    expect(component.isPremiumFeature('sso.saml')).toBe(true);
    expect(component.isPremiumFeature('audit.logs')).toBe(true);
    expect(component.isPremiumFeature('api.limit')).toBe(false);
  });

  it('should return appropriate feature tooltips', () => {
    expect(component.getFeatureTooltip('api.limit')).toBe('API rate limiting and quotas');
    expect(component.getFeatureTooltip('unknown.feature')).toBe('Feature included in this plan');
  });

  it('should apply correct CSS classes', () => {
    component.block.set(mockBlock);
    component.plan.set(mockPlan);
    component.isYearly.set(true);
    component.isRecommended.set(true);
    fixture.detectChanges();

    const classes = component.cardClasses();
    expect(classes['price-card']).toBe(true);
    expect(classes['price-card--yearly']).toBe(true);
    expect(classes['price-card--highlighted']).toBe(true);
  });

  it('should handle missing tier gracefully', () => {
    component.block.set({ ...mockBlock, planTierId: 'non-existent' });
    component.plan.set(mockPlan);
    fixture.detectChanges();

    expect(component.tier$()).toBeNull();
    expect(component.tierName()).toBe('No tier selected');
    expect(component.price()).toBe('No price');
  });

  it('should handle missing plan gracefully', () => {
    component.block.set(mockBlock);
    component.plan.set(null);
    fixture.detectChanges();

    expect(component.tier$()).toBeNull();
    expect(component.tierName()).toBe('No tier selected');
    expect(component.price()).toBe('No price');
  });
});
