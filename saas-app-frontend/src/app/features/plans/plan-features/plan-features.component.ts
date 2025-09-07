import { Component, ChangeDetectionStrategy, input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanFeatureApiService } from '../../../core/services/plan-feature-api.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PlanFeature } from '../../../core/models/plan-feature.models';
import { Plan, Feature } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-plan-features',
  templateUrl: './plan-features.component.html',
  styleUrls: ['./plan-features.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PlanFeaturesComponent implements OnInit {
  planId = input.required<string>();

  private readonly planFeatureApi = inject(PlanFeatureApiService);
  private readonly mockApi = inject(MockApiService);

  planFeatures = signal<PlanFeature[]>([]);
  availableFeatures = signal<Feature[]>([]);
  currentPlan = signal<Plan | null>(null);
  loading = signal(false);
  selectedFeature = signal<Feature | null>(null);
  showAddFeatureDialog = signal(false);

  // Configuration d'une feature sélectionnée
  editingFeatureId = signal<string | null>(null);
  featureConfig = signal<Record<string, any>>({});
  featureLimits = signal<Record<string, number | string>>({});

  ngOnInit() {
    this.loadPlanFeatures();
    this.loadAvailableFeatures();
    this.loadPlan();
  }

  private loadPlanFeatures() {
    this.loading.set(true);

    // Mock data pour la démonstration
    const mockPlanFeatures: PlanFeature[] = [
      {
        _id: '1',
        plan: { _id: this.planId(), name: 'Basic Plan' },
        feature: { _id: 'feat1', name: 'API Access', roleId: 'api_access' },
        enabled: true,
        configuration: { endpoint: '/api/v1', version: '1.0' },
        limits: { requests_per_hour: 1000 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        plan: { _id: this.planId(), name: 'Basic Plan' },
        feature: { _id: 'feat2', name: 'Storage', roleId: 'storage' },
        enabled: true,
        configuration: {},
        limits: { gb: 10 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.planFeatures.set(mockPlanFeatures);
    this.loading.set(false);
  }

  private loadAvailableFeatures() {
    this.availableFeatures.set(this.mockApi.features());
  }

  private loadPlan() {
    const plan = this.mockApi.getPlan(this.planId());
    this.currentPlan.set(plan || null);
  }

  getUnassignedFeatures(): Feature[] {
    const assignedFeatureIds = this.planFeatures().map(pf => pf.feature._id);
    return this.availableFeatures().filter(f => !assignedFeatureIds.includes(f.id));
  }

  openAddFeatureDialog() {
    this.selectedFeature.set(null);
    this.showAddFeatureDialog.set(true);
  }

  closeAddFeatureDialog() {
    this.showAddFeatureDialog.set(false);
    this.selectedFeature.set(null);
  }

  addFeatureToPlan() {
    const feature = this.selectedFeature();
    if (!feature) return;

    // Mock implementation
    const newPlanFeature: PlanFeature = {
      _id: Date.now().toString(),
      plan: { _id: this.planId(), name: this.currentPlan()?.name || 'Plan' },
      feature: { _id: feature.id, name: feature.name, roleId: feature.key },
      enabled: true,
      configuration: {},
      limits: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.planFeatures.update(features => [...features, newPlanFeature]);
    this.closeAddFeatureDialog();
  }

  toggleFeatureEnabled(planFeature: PlanFeature) {
    // Mock implementation
    this.planFeatures.update(features =>
      features.map(f =>
        f._id === planFeature._id
          ? { ...f, enabled: !f.enabled }
          : f
      )
    );
  }

  removeFeatureFromPlan(planFeature: PlanFeature) {
    if (!confirm(`Are you sure you want to remove "${planFeature.feature.name}" from this plan?`)) {
      return;
    }

    // Mock implementation
    this.planFeatures.update(features =>
      features.filter(f => f._id !== planFeature._id)
    );
  }

  startEditingFeature(planFeature: PlanFeature) {
    this.editingFeatureId.set(planFeature._id);
    this.featureConfig.set({ ...planFeature.configuration });
    this.featureLimits.set({ ...planFeature.limits });
  }

  cancelEditingFeature() {
    this.editingFeatureId.set(null);
    this.featureConfig.set({});
    this.featureLimits.set({});
  }

  saveFeatureConfiguration(planFeature: PlanFeature) {
    // Mock implementation
    this.planFeatures.update(features =>
      features.map(f =>
        f._id === planFeature._id
          ? { ...f, configuration: this.featureConfig(), limits: this.featureLimits() }
          : f
      )
    );
    this.cancelEditingFeature();
  }

  updateConfigField(key: string, value: any) {
    this.featureConfig.update(config => ({ ...config, [key]: value }));
  }

  updateLimitField(key: string, value: number | string) {
    this.featureLimits.update(limits => ({ ...limits, [key]: value }));
  }

  getConfigKeys(config: Record<string, any>): string[] {
    return Object.keys(config);
  }

  getLimitKeys(limits: Record<string, number | string>): string[] {
    return Object.keys(limits);
  }

  addNewConfigField(planFeature: PlanFeature) {
    const key = prompt('Enter configuration key:');
    if (key && key.trim()) {
      this.updateConfigField(key.trim(), '');
    }
  }

  addNewLimitField(planFeature: PlanFeature) {
    const key = prompt('Enter limit key:');
    if (key && key.trim()) {
      this.updateLimitField(key.trim(), 0);
    }
  }

  removeConfigField(key: string) {
    this.featureConfig.update(config => {
      const newConfig = { ...config };
      delete newConfig[key];
      return newConfig;
    });
  }

  removeLimitField(key: string) {
    this.featureLimits.update(limits => {
      const newLimits = { ...limits };
      delete newLimits[key];
      return newLimits;
    });
  }
}
