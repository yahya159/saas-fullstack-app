import { Component, ChangeDetectionStrategy, input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetBlock, Plan, PlanTier } from '../../../../core/models/pricing.models';
import { ThemeService } from '../../../../core/services/theme.service';
import { ModernPriceCardComponent } from './modern-price-card.component';
import { PricingToggleComponent } from './pricing-toggle.component';

@Component({
  selector: 'app-modern-pricing-table',
  templateUrl: './modern-pricing-table.component.html',
  styleUrls: ['./modern-pricing-table.component.css'],
  imports: [CommonModule, ModernPriceCardComponent, PricingToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ModernPricingTableComponent {
  private themeService = inject(ThemeService);
  
  block = input<WidgetBlock>();
  plan = input<Plan | null>(null);

  // Component state
  readonly isYearly = signal(false);
  readonly showToggle = signal(true);
  readonly recommendedTierId = signal<string | null>(null);

  // Computed properties
  readonly tiers = computed(() => {
    const plan = this.plan();
    if (!plan) return [];
    
    return plan.tiers.sort((a, b) => {
      // Sort by price (monthly)
      return a.monthlyPrice - b.monthlyPrice;
    });
  });

  readonly hasMultipleTiers = computed(() => {
    return this.tiers().length > 1;
  });

  readonly tableClasses = computed(() => ({
    'pricing-table': true,
    'pricing-table--single': !this.hasMultipleTiers(),
    'pricing-table--multiple': this.hasMultipleTiers(),
    'pricing-table--yearly': this.isYearly()
  }));

  readonly containerClasses = computed(() => ({
    'pricing-container': true,
    'pricing-container--centered': !this.hasMultipleTiers()
  }));

  // Event handlers
  onToggleChange(isYearly: boolean): void {
    this.isYearly.set(isYearly);
  }

  onTierClick(tier: PlanTier): void {
    console.log('Tier clicked:', tier.name);
    // Handle tier selection
  }

  // Helper methods
  isRecommendedTier(tier: PlanTier): boolean {
    const recommendedId = this.recommendedTierId();
    if (recommendedId) {
      return tier.id === recommendedId;
    }
    // Default: recommend the middle tier if 3+ tiers, or the highest if 2 tiers
    const tiers = this.tiers();
    if (tiers.length >= 3) {
      const middleIndex = Math.floor(tiers.length / 2);
      return tier.id === tiers[middleIndex].id;
    } else if (tiers.length === 2) {
      return tier.id === tiers[1].id; // Highest tier
    }
    return false;
  }

  getTierFeatures(tier: PlanTier): string[] {
    return tier.features || [];
  }

  getTierLimits(tier: PlanTier): Record<string, number | string> {
    return tier.limits || {};
  }

  // Animation helpers
  getCardDelay(index: number): string {
    return `${index * 100}ms`;
  }

  getCardStyle(index: number): Record<string, string> {
    return {
      'animation-delay': this.getCardDelay(index)
    };
  }
}
