import { createReducer, on } from '@ngrx/store';
import { PlansState, initialPlansState } from './plans.state';
import * as PlansActions from './plans.actions';

export const plansReducer = createReducer(
  initialPlansState,

  // Load Plans
  on(PlansActions.loadPlans, (state): PlansState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(PlansActions.loadPlansSuccess, (state, { plans }): PlansState => ({
    ...state,
    plans,
    isLoading: false,
    error: null,
    lastLoaded: new Date()
  })),

  on(PlansActions.loadPlansFailure, (state, { error }): PlansState => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Features
  on(PlansActions.loadFeatures, (state): PlansState => ({
    ...state,
    isLoadingFeatures: true,
    error: null
  })),

  on(PlansActions.loadFeaturesSuccess, (state, { features }): PlansState => ({
    ...state,
    features,
    isLoadingFeatures: false,
    error: null
  })),

  on(PlansActions.loadFeaturesFailure, (state, { error }): PlansState => ({
    ...state,
    isLoadingFeatures: false,
    error
  })),

  // Select Plan
  on(PlansActions.selectPlan, (state, { planId }): PlansState => ({
    ...state,
    selectedPlanId: planId
  })),

  // Clear Selection
  on(PlansActions.clearSelection, (state): PlansState => ({
    ...state,
    selectedPlanId: null
  })),

  // Refresh Data
  on(PlansActions.refreshPlansData, (state): PlansState => ({
    ...state,
    isLoading: true,
    isLoadingFeatures: true,
    error: null
  }))
);
