import { Plan, Feature } from '../../models/pricing.models';

export interface PlansState {
  plans: Plan[];
  features: Feature[];
  selectedPlanId: string | null;
  isLoading: boolean;
  isLoadingFeatures: boolean;
  error: string | null;
  lastLoaded: Date | null;
}

export const initialPlansState: PlansState = {
  plans: [],
  features: [],
  selectedPlanId: null,
  isLoading: false,
  isLoadingFeatures: false,
  error: null,
  lastLoaded: null
};
