import { Injectable, signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { Plan, PlanTier, Feature } from '../models/pricing.models';
import * as PlansSelectors from '../store/plans/plans.selectors';

export interface TierPreview {
  tier: PlanTier;
  plan: Plan;
  features: Feature[];
  categorizedFeatures: CategorizedFeatures;
}

export interface CategorizedFeatures {
  core: Feature[];
  advanced: Feature[];
  enterprise: Feature[];
  custom: Feature[];
}

@Injectable({
  providedIn: 'root'
})
export class TierSelectionService {
  private store = inject(Store);
  
  // Reactive signals for tier selection
  private selectedPlanId = signal<string | null>(null);
  private selectedTierId = signal<string | null>(null);
  
  // Computed signals for reactive updates
  readonly selectedPlan = computed(() => {
    const planId = this.selectedPlanId();
    if (!planId) return null;
    
    // This will be updated to use NgRx selector
    return null as any; // Will be replaced with store selector
  });
  
  readonly selectedTier = computed(() => {
    const plan = this.selectedPlan();
    const tierId = this.selectedTierId();
    if (!plan || !tierId) return null;
    
    return plan.tiers.find((tier: any) => tier.id === tierId) || null;
  });
  
  readonly tierPreview = computed((): TierPreview | null => {
    const plan = this.selectedPlan();
    const tier = this.selectedTier();
    if (!plan || !tier) return null;
    
    return {
      tier,
      plan,
      features: this.getTierFeatures(plan, tier),
      categorizedFeatures: this.categorizeFeatures(this.getTierFeatures(plan, tier))
    };
  });
  
  // NgRx selectors for real-time data
  readonly plans$ = this.store.select(PlansSelectors.selectAllPlans);
  readonly features$ = this.store.select(PlansSelectors.selectAllFeatures);
  readonly selectedPlan$ = this.store.select(PlansSelectors.selectSelectedPlan);
  
  // Reactive tier preview observable
  readonly tierPreview$ = new Observable(observer => {
    this.selectedPlan$.subscribe(selectedPlan => {
      if (!selectedPlan || !this.selectedTierId()) {
        observer.next(null);
        return;
      }
      
      const tier = (selectedPlan as any).tiers?.find((t: any) => t.id === this.selectedTierId());
      if (!tier) {
        observer.next(null);
        return;
      }
      
      observer.next({
        tier,
        plan: selectedPlan,
        features: tier.features || [],
        categorizedFeatures: {}
      });
    });
  });
  
  // Actions
  selectPlan(planId: string): void {
    this.selectedPlanId.set(planId);
    this.store.dispatch({ type: '[Plans] Select Plan', planId });
  }
  
  selectTier(tierId: string): void {
    this.selectedTierId.set(tierId);
  }
  
  clearSelection(): void {
    this.selectedPlanId.set(null);
    this.selectedTierId.set(null);
    this.store.dispatch({ type: '[Plans] Clear Selection' });
  }
  
  // Helper methods
  private getTierFeatures(plan: Plan, tier: PlanTier): Feature[] {
    // This will be replaced with real feature lookup
    return [];
  }
  
  private getTierFeaturesFromKeys(featureKeys: string[], allFeatures: Feature[]): Feature[] {
    return allFeatures.filter(feature => featureKeys.includes(feature.key));
  }
  
  private categorizeFeatures(features: Feature[]): CategorizedFeatures {
    return {
      core: features.filter(f => this.isCoreFeature(f)),
      advanced: features.filter(f => this.isAdvancedFeature(f)),
      enterprise: features.filter(f => this.isEnterpriseFeature(f)),
      custom: features.filter(f => this.isCustomFeature(f))
    };
  }
  
  private isCoreFeature(feature: Feature): boolean {
    const coreKeywords = ['basic', 'standard', 'core', 'essential', 'api', 'storage', 'users'];
    return coreKeywords.some(keyword => 
      feature.name.toLowerCase().includes(keyword) || 
      feature.key.toLowerCase().includes(keyword)
    );
  }
  
  private isAdvancedFeature(feature: Feature): boolean {
    const advancedKeywords = ['advanced', 'pro', 'premium', 'analytics', 'integration', 'webhook'];
    return advancedKeywords.some(keyword => 
      feature.name.toLowerCase().includes(keyword) || 
      feature.key.toLowerCase().includes(keyword)
    );
  }
  
  private isEnterpriseFeature(feature: Feature): boolean {
    const enterpriseKeywords = ['enterprise', 'sso', 'audit', 'compliance', 'sla', 'support'];
    return enterpriseKeywords.some(keyword => 
      feature.name.toLowerCase().includes(keyword) || 
      feature.key.toLowerCase().includes(keyword)
    );
  }
  
  private isCustomFeature(feature: Feature): boolean {
    return !this.isCoreFeature(feature) && 
           !this.isAdvancedFeature(feature) && 
           !this.isEnterpriseFeature(feature);
  }
  
  // Get available tiers for a plan
  getAvailableTiers(planId: string): Observable<PlanTier[]> {
    return new Observable(observer => {
      this.plans$.subscribe(plans => {
        const plan = plans.find(p => p.id === planId);
        const tiers = (plan as any)?.tiers || [];
        observer.next(tiers);
      });
    });
  }
  
  // Get tier by ID
  getTierById(planId: string, tierId: string): Observable<PlanTier | null> {
    return new Observable(observer => {
      this.plans$.subscribe(plans => {
        const plan = plans.find(p => p.id === planId);
        if (!plan) {
          observer.next(null);
          return;
        }
        const tier = ((plan as any).tiers || []).find((t: any) => t.id === tierId) || null;
        observer.next(tier);
      });
    });
  }
  
  // Support for 1-4 tiers (basic to enterprise)
  getTierDisplayOrder(tiers: PlanTier[]): PlanTier[] {
    const tierOrder = ['basic', 'starter', 'pro', 'premium', 'enterprise', 'business'];
    
    return tiers.sort((a, b) => {
      const aIndex = tierOrder.findIndex(order => 
        a.name.toLowerCase().includes(order)
      );
      const bIndex = tierOrder.findIndex(order => 
        b.name.toLowerCase().includes(order)
      );
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
  }
}
