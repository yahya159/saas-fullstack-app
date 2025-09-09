import { Component, ChangeDetectionStrategy, input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetBlock, Plan, PlanTier } from '../../../../core/models/pricing.models';
import { ThemeService } from '../../../../core/services/theme.service';
import { TierSelectionService } from '../../../../core/services/tier-selection.service';

@Component({
  selector: 'app-modern-price-card',
  templateUrl: './modern-price-card.component.html',
  styleUrls: ['./modern-price-card.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ModernPriceCardComponent {
  private themeService = inject(ThemeService);
  private tierSelectionService = inject(TierSelectionService);
  
  block = input<WidgetBlock>();
  plan = input<Plan | null>(null);
  isYearly = input<boolean>(false);
  isRecommended = input<boolean>(false);

  // Component state
  readonly isHovered = signal(false);

  // Reactive tier data
  readonly tier$ = computed(() => {
    const block = this.block();
    const plan = this.plan();
    if (!block?.planTierId || !plan) return null;
    
    return plan.tiers.find(tier => tier.id === block.planTierId) || null;
  });

  // Computed properties
  readonly price = computed(() => {
    const tier = this.tier$();
    const yearly = this.isYearly();
    if (!tier) return 'No price';
    
    const originalCurrency = tier.currency as 'USD' | 'MAD';
    const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;
    const convertedPrice = this.themeService.getPriceInCurrentCurrency(price || 0, originalCurrency);
    const period = yearly ? '/year' : '/month';
    return `${convertedPrice}${period}`;
  });

  readonly originalPrice = computed(() => {
    const tier = this.tier$();
    const yearly = this.isYearly();
    if (!tier) return null;
    
    const originalCurrency = tier.currency as 'USD' | 'MAD';
    const price = yearly ? tier.yearlyPrice : tier.monthlyPrice;
    return this.themeService.getPriceInCurrentCurrency(price || 0, originalCurrency);
  });

  readonly currencySymbol = computed(() => {
    const tier = this.tier$();
    if (!tier) return '$';
    
    const originalCurrency = tier.currency as 'USD' | 'MAD';
    return this.themeService.getCurrencySymbol(originalCurrency);
  });

  readonly ctaLabel = computed(() => {
    const tier = this.tier$();
    return tier?.ctaLabel || 'Get Started';
  });

  readonly tierName = computed(() => {
    const tier = this.tier$();
    return tier?.name || 'No tier selected';
  });

  readonly tierDescription = computed(() => {
    const tier = this.tier$();
    return (tier as any)?.description || '';
  });

  readonly isHighlighted = computed(() => {
    const tier = this.tier$();
    return tier?.highlight || this.isRecommended();
  });

  readonly savings = computed(() => {
    const tier = this.tier$();
    if (!tier || !this.isYearly() || !tier.yearlyPrice || !tier.monthlyPrice) return null;
    
    const monthlyTotal = tier.monthlyPrice * 12;
    const yearlyPrice = tier.yearlyPrice;
    const savings = monthlyTotal - yearlyPrice;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    
    return { amount: savings, percentage };
  });

  readonly cardClasses = computed(() => {
    const isHighlighted = this.isHighlighted();
    const isHovered = this.isHovered();
    
    return {
      'price-card': true,
      'price-card--highlighted': isHighlighted,
      'price-card--hovered': isHovered,
      'price-card--yearly': this.isYearly()
    };
  });

  readonly badgeText = computed(() => {
    if (this.isRecommended()) return 'Recommended';
    const tier = this.tier$();
    if (tier?.highlight) return 'Popular';
    return null;
  });

  // Event handlers
  onMouseEnter(): void {
    this.isHovered.set(true);
  }

  onMouseLeave(): void {
    this.isHovered.set(false);
  }

  onCtaClick(): void {
    const tier = this.tier$();
    if (tier) {
      // Handle CTA click - could emit event or navigate
      console.log('CTA clicked for tier:', tier.name);
    }
  }

  // Helper methods
  getFeatureIcon(featureKey: string): string {
    const iconMap: Record<string, string> = {
      'api.limit': '🔌',
      'custom.domain': '🌐',
      'sso.saml': '🔐',
      'audit.logs': '📊',
      'branding.remove': '🎨',
      'support.priority': '🎧',
      'webhooks': '🔗',
      'rate.limit': '⚡',
      'seats': '👥',
      'projects.max': '📁',
      'storage.gb': '💾'
    };
    
    return iconMap[featureKey] || '✅';
  }

  getFeatureTooltip(featureKey: string): string {
    const tooltipMap: Record<string, string> = {
      'api.limit': 'API rate limiting and quotas',
      'custom.domain': 'Custom domain configuration',
      'sso.saml': 'Single Sign-On with SAML',
      'audit.logs': 'Comprehensive audit logging',
      'branding.remove': 'Remove platform branding',
      'support.priority': 'Priority customer support',
      'webhooks': 'Webhook integrations',
      'rate.limit': 'Advanced rate limiting',
      'seats': 'User seat management',
      'projects.max': 'Maximum number of projects',
      'storage.gb': 'Storage capacity in GB'
    };
    
    return tooltipMap[featureKey] || 'Feature included in this plan';
  }

  isPremiumFeature(featureKey: string): boolean {
    const premiumFeatures = ['sso.saml', 'audit.logs', 'branding.remove', 'support.priority'];
    return premiumFeatures.includes(featureKey);
  }
}
