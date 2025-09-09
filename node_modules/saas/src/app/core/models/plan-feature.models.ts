export interface PlanFeature {
  _id: string;
  plan: any;
  feature: any;
  enabled: boolean;
  configuration: Record<string, any>;
  limits: Record<string, number | string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlanFeatureRequest {
  planId: string;
  featureId: string;
  enabled?: boolean;
  configuration?: Record<string, any>;
  limits?: Record<string, number | string>;
}

export interface UpdatePlanFeatureRequest {
  enabled?: boolean;
  configuration?: Record<string, any>;
  limits?: Record<string, number | string>;
}
