import { createAction, props } from '@ngrx/store';
import { Plan, Feature } from '../../models/pricing.models';

// Load Plans Actions
export const loadPlans = createAction(
  '[Plans] Load Plans'
);

export const loadPlansSuccess = createAction(
  '[Plans] Load Plans Success',
  props<{ plans: Plan[] }>()
);

export const loadPlansFailure = createAction(
  '[Plans] Load Plans Failure',
  props<{ error: string }>()
);

// Load Features Actions
export const loadFeatures = createAction(
  '[Features] Load Features'
);

export const loadFeaturesSuccess = createAction(
  '[Features] Load Features Success',
  props<{ features: Feature[] }>()
);

export const loadFeaturesFailure = createAction(
  '[Features] Load Features Failure',
  props<{ error: string }>()
);

// Select Plan Action
export const selectPlan = createAction(
  '[Plans] Select Plan',
  props<{ planId: string }>()
);

// Clear Selection Action
export const clearSelection = createAction(
  '[Plans] Clear Selection'
);

// Refresh Data Action
export const refreshPlansData = createAction(
  '[Plans] Refresh Plans Data'
);
