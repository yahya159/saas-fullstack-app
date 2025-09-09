import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlansState } from './plans.state';
import { Plan, Feature, PlanTier } from '../../models/pricing.models';

export const selectPlansState = createFeatureSelector<PlansState>('plans');

// Basic selectors
export const selectAllPlans = createSelector(
  selectPlansState,
  (state: PlansState) => state.plans
);

export const selectAllFeatures = createSelector(
  selectPlansState,
  (state: PlansState) => state.features
);

export const selectSelectedPlanId = createSelector(
  selectPlansState,
  (state: PlansState) => state.selectedPlanId
);

export const selectIsLoading = createSelector(
  selectPlansState,
  (state: PlansState) => state.isLoading
);

export const selectIsLoadingFeatures = createSelector(
  selectPlansState,
  (state: PlansState) => state.isLoadingFeatures
);

export const selectError = createSelector(
  selectPlansState,
  (state: PlansState) => state.error
);

export const selectLastLoaded = createSelector(
  selectPlansState,
  (state: PlansState) => state.lastLoaded
);

// Computed selectors
export const selectSelectedPlan = createSelector(
  selectAllPlans,
  selectSelectedPlanId,
  (plans: Plan[], selectedPlanId: string | null): Plan | null => {
    if (!selectedPlanId) return null;
    return plans.find(plan => plan.id === selectedPlanId) || null;
  }
);

export const selectPlanById = (planId: string) => createSelector(
  selectAllPlans,
  (plans: Plan[]): Plan | null => {
    return plans.find(plan => plan.id === planId) || null;
  }
);

export const selectFeaturesByPlanId = (planId: string) => createSelector(
  selectAllPlans,
  selectAllFeatures,
  (plans: Plan[], features: Feature[]): Feature[] => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return [];
    
    return features.filter(feature => 
      plan.tiers.some(tier => tier.features.includes(feature.key))
    );
  }
);

export const selectTierById = (planId: string, tierId: string) => createSelector(
  selectPlanById(planId),
  (plan: Plan | null): PlanTier | null => {
    if (!plan) return null;
    return plan.tiers.find(tier => tier.id === tierId) || null;
  }
);

export const selectPublicPlans = createSelector(
  selectAllPlans,
  (plans: Plan[]): Plan[] => {
    return plans.filter(plan => plan.public);
  }
);

export const selectPlansWithTiers = createSelector(
  selectAllPlans,
  (plans: Plan[]): Plan[] => {
    return plans.filter(plan => plan.tiers && plan.tiers.length > 0);
  }
);

// Loading state selectors
export const selectIsDataLoaded = createSelector(
  selectAllPlans,
  selectAllFeatures,
  (plans: Plan[], features: Feature[]): boolean => {
    return plans.length > 0 && features.length > 0;
  }
);

export const selectHasError = createSelector(
  selectError,
  (error: string | null): boolean => {
    return error !== null;
  }
);
