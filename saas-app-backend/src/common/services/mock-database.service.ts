import { Injectable } from '@nestjs/common';

@Injectable()
export class MockDatabaseService {
  private plans: any[] = [];
  private widgets: any[] = [];
  private features: any[] = [];
  private categories: any[] = [];

  // Plans
  getPlans() {
    return this.plans;
  }

  createPlan(plan: any) {
    const newPlan = { ...plan, id: this.generateId() };
    this.plans.push(newPlan);
    return newPlan;
  }

  updatePlan(id: string, updates: any) {
    const index = this.plans.findIndex(p => p.id === id);
    if (index >= 0) {
      this.plans[index] = { ...this.plans[index], ...updates };
      return this.plans[index];
    }
    return null;
  }

  deletePlan(id: string) {
    const index = this.plans.findIndex(p => p.id === id);
    if (index >= 0) {
      this.plans.splice(index, 1);
      return true;
    }
    return false;
  }

  // Widgets
  getWidgets() {
    return this.widgets;
  }

  createWidget(widget: any) {
    const newWidget = { ...widget, id: this.generateId() };
    this.widgets.push(newWidget);
    return newWidget;
  }

  updateWidget(id: string, updates: any) {
    const index = this.widgets.findIndex(w => w.id === id);
    if (index >= 0) {
      this.widgets[index] = { ...this.widgets[index], ...updates };
      return this.widgets[index];
    }
    return null;
  }

  deleteWidget(id: string) {
    const index = this.widgets.findIndex(w => w.id === id);
    if (index >= 0) {
      this.widgets.splice(index, 1);
      return true;
    }
    return false;
  }

  // Features
  getFeatures() {
    return this.features;
  }

  createFeature(feature: any) {
    const newFeature = { ...feature, id: this.generateId() };
    this.features.push(newFeature);
    return newFeature;
  }

  // Categories
  getCategories() {
    return this.categories;
  }

  createCategory(category: any) {
    const newCategory = { ...category, id: this.generateId() };
    this.categories.push(newCategory);
    return newCategory;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
