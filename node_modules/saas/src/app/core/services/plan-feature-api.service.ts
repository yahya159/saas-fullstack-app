import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlanFeature, CreatePlanFeatureRequest, UpdatePlanFeatureRequest } from '../models/plan-feature.models';

@Injectable({
  providedIn: 'root'
})
export class PlanFeatureApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/plan-features';

  createPlanFeature(request: CreatePlanFeatureRequest): Observable<PlanFeature> {
    return this.http.post<PlanFeature>(`${this.baseUrl}/create`, request);
  }

  getPlanFeatures(planId: string): Observable<PlanFeature[]> {
    return this.http.get<PlanFeature[]>(`${this.baseUrl}/plan/${planId}/features`);
  }

  getFeaturePlans(featureId: string): Observable<PlanFeature[]> {
    return this.http.get<PlanFeature[]>(`${this.baseUrl}/feature/${featureId}/plans`);
  }

  getPlanFeature(planId: string, featureId: string): Observable<PlanFeature> {
    return this.http.get<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}`);
  }

  updatePlanFeature(planId: string, featureId: string, request: UpdatePlanFeatureRequest): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}`, request);
  }

  updateConfiguration(planId: string, featureId: string, configuration: Record<string, any>): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}/configuration`, configuration);
  }

  updateLimits(planId: string, featureId: string, limits: Record<string, number | string>): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}/limits`, limits);
  }

  enableFeature(planId: string, featureId: string): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}/enable`, {});
  }

  disableFeature(planId: string, featureId: string): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}/disable`, {});
  }

  toggleFeature(planId: string, featureId: string): Observable<PlanFeature> {
    return this.http.put<PlanFeature>(`${this.baseUrl}/plan/${planId}/feature/${featureId}/toggle`, {});
  }

  removePlanFeature(planId: string, featureId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plan/${planId}/feature/${featureId}`);
  }

  removeAllPlanFeatures(planId: string): Observable<{ deletedCount: number }> {
    return this.http.delete<{ deletedCount: number }>(`${this.baseUrl}/plan/${planId}/features`);
  }
}
