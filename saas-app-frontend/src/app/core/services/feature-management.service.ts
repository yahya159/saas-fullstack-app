import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, map, catchError, of } from 'rxjs';
import { Feature, FeatureCategory, TierVisibility } from '../models/pricing.models';
import { MockApiService } from './mock-api.service';

export interface CreateFeatureRequest {
  key: string;
  name: string;
  description?: string;
  enabledByDefault?: boolean;
  categoryId?: string;
  tierVisibility?: TierVisibility;
  isCustom?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isCustom?: boolean;
}

export interface FeatureManagementState {
  features: Feature[];
  categories: FeatureCategory[];
  isLoading: boolean;
  isLoadingCategories: boolean;
  error: string | null;
  lastLoaded: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureManagementService {
  private http = inject(HttpClient);
  private mockApi = inject(MockApiService);
  private baseUrl = 'http://localhost:3000/api/plan-features';

  // State management
  private stateSubject = new BehaviorSubject<FeatureManagementState>({
    features: [],
    categories: [],
    isLoading: false,
    isLoadingCategories: false,
    error: null,
    lastLoaded: null
  });

  readonly state$ = this.stateSubject.asObservable();

  // Selectors
  readonly features$ = this.state$.pipe(map(state => state.features));
  readonly categories$ = this.state$.pipe(map(state => state.categories));
  readonly isLoading$ = this.state$.pipe(map(state => state.isLoading));
  readonly isLoadingCategories$ = this.state$.pipe(map(state => state.isLoadingCategories));
  readonly error$ = this.state$.pipe(map(state => state.error));
  readonly lastLoaded$ = this.state$.pipe(map(state => state.lastLoaded));

  // Computed selectors
  readonly customFeatures$ = this.features$.pipe(
    map(features => features.filter(f => f.isCustom))
  );

  readonly customCategories$ = this.categories$.pipe(
    map(categories => categories.filter(c => c.isCustom))
  );

  readonly featuresByCategory$ = combineLatest([
    this.features$,
    this.categories$
  ]).pipe(
    map(([features, categories]) => {
      const grouped: Record<string, Feature[]> = {};
      
      categories.forEach(category => {
        grouped[category.id] = features.filter(f => f.categoryId === category.id);
      });
      
      // Add uncategorized features
      grouped['uncategorized'] = features.filter(f => !f.categoryId);
      
      return grouped;
    })
  );

  // Actions
  loadFeatures(): void {
    this.updateState({ isLoading: true, error: null });
    
    try {
      // Use mock data instead of HTTP request
      const features = this.mockApi.getFeatures();
      this.updateState({ 
        features, 
        isLoading: false, 
        error: null,
        lastLoaded: new Date()
      });
    } catch (error) {
      this.updateState({ 
        isLoading: false, 
        error: `Failed to load features: ${error}` 
      });
    }
  }

  loadCategories(): void {
    this.updateState({ isLoadingCategories: true, error: null });
    
    try {
      // Use mock data instead of HTTP request
      const categories = this.mockApi.getCategories();
      this.updateState({ 
        categories, 
        isLoadingCategories: false, 
        error: null,
        lastLoaded: new Date()
      });
    } catch (error) {
      this.updateState({ 
        isLoadingCategories: false, 
        error: `Failed to load categories: ${error}` 
      });
    }
  }

  createFeature(featureData: CreateFeatureRequest): Observable<Feature> {
    this.updateState({ isLoading: true, error: null });
    
    try {
      // Use mock data instead of HTTP request
      const newFeature = this.mockApi.addFeature(featureData);
      const currentState = this.stateSubject.value;
      this.updateState({
        features: [...currentState.features, newFeature],
        isLoading: false,
        error: null
      });
      return of(newFeature);
    } catch (error) {
      this.updateState({ 
        isLoading: false, 
        error: `Failed to create feature: ${error}` 
      });
      throw error;
    }
  }

  createCategory(categoryData: CreateCategoryRequest): Observable<FeatureCategory> {
    this.updateState({ isLoadingCategories: true, error: null });
    
    try {
      // Use mock data instead of HTTP request
      const newCategory = this.mockApi.addCategory(categoryData);
      const currentState = this.stateSubject.value;
      this.updateState({
        categories: [...currentState.categories, newCategory],
        isLoadingCategories: false,
        error: null
      });
      return of(newCategory);
    } catch (error) {
      this.updateState({ 
        isLoadingCategories: false, 
        error: `Failed to create category: ${error}` 
      });
      throw error;
    }
  }

  updateFeature(featureId: string, updates: Partial<Feature>): Observable<Feature> {
    this.updateState({ isLoading: true, error: null });
    
    return this.http.put<Feature>(`${this.baseUrl}/features/${featureId}`, updates)
      .pipe(
        map(updatedFeature => {
          const currentState = this.stateSubject.value;
          const updatedFeatures = currentState.features.map(f => 
            f.id === featureId ? updatedFeature : f
          );
          this.updateState({
            features: updatedFeatures,
            isLoading: false,
            error: null
          });
          return updatedFeature;
        }),
        catchError(error => {
          this.updateState({ 
            isLoading: false, 
            error: `Failed to update feature: ${error.message}` 
          });
          throw error;
        })
      );
  }

  updateCategory(categoryId: string, updates: Partial<FeatureCategory>): Observable<FeatureCategory> {
    this.updateState({ isLoadingCategories: true, error: null });
    
    return this.http.put<FeatureCategory>(`${this.baseUrl}/categories/${categoryId}`, updates)
      .pipe(
        map(updatedCategory => {
          const currentState = this.stateSubject.value;
          const updatedCategories = currentState.categories.map(c => 
            c.id === categoryId ? updatedCategory : c
          );
          this.updateState({
            categories: updatedCategories,
            isLoadingCategories: false,
            error: null
          });
          return updatedCategory;
        }),
        catchError(error => {
          this.updateState({ 
            isLoadingCategories: false, 
            error: `Failed to update category: ${error.message}` 
          });
          throw error;
        })
      );
  }

  deleteFeature(featureId: string): Observable<{ deletedCount: number }> {
    this.updateState({ isLoading: true, error: null });
    
    return this.http.delete<{ deletedCount: number }>(`${this.baseUrl}/features/${featureId}`)
      .pipe(
        map(result => {
          const currentState = this.stateSubject.value;
          const updatedFeatures = currentState.features.filter(f => f.id !== featureId);
          this.updateState({
            features: updatedFeatures,
            isLoading: false,
            error: null
          });
          return result;
        }),
        catchError(error => {
          this.updateState({ 
            isLoading: false, 
            error: `Failed to delete feature: ${error.message}` 
          });
          throw error;
        })
      );
  }

  deleteCategory(categoryId: string): Observable<{ deletedCount: number }> {
    this.updateState({ isLoadingCategories: true, error: null });
    
    return this.http.delete<{ deletedCount: number }>(`${this.baseUrl}/categories/${categoryId}`)
      .pipe(
        map(result => {
          const currentState = this.stateSubject.value;
          const updatedCategories = currentState.categories.filter(c => c.id !== categoryId);
          // Also remove categoryId from features that belong to this category
          const updatedFeatures = currentState.features.map(f => 
            f.categoryId === categoryId ? { ...f, categoryId: undefined } : f
          );
          this.updateState({
            categories: updatedCategories,
            features: updatedFeatures,
            isLoadingCategories: false,
            error: null
          });
          return result;
        }),
        catchError(error => {
          this.updateState({ 
            isLoadingCategories: false, 
            error: `Failed to delete category: ${error.message}` 
          });
          throw error;
        })
      );
  }

  // Helper methods
  getFeatureById(featureId: string): Observable<Feature | null> {
    return this.features$.pipe(
      map(features => features.find(f => f.id === featureId) || null)
    );
  }

  getCategoryById(categoryId: string): Observable<FeatureCategory | null> {
    return this.categories$.pipe(
      map(categories => categories.find(c => c.id === categoryId) || null)
    );
  }

  getFeaturesByCategory(categoryId: string): Observable<Feature[]> {
    return this.features$.pipe(
      map(features => features.filter(f => f.categoryId === categoryId))
    );
  }

  getFeaturesByTier(tierName: string): Observable<Feature[]> {
    return this.features$.pipe(
      map(features => features.filter(f => {
        if (!f.tierVisibility) return true; // If no visibility set, show in all tiers
        return f.tierVisibility[tierName.toLowerCase() as keyof TierVisibility] === true;
      }))
    );
  }

  // Utility methods
  generateFeatureKey(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.')
      .substring(0, 50);
  }

  validateFeatureKey(key: string, existingFeatures: Feature[]): boolean {
    return !existingFeatures.some(f => f.key === key);
  }

  getDefaultTierVisibility(): TierVisibility {
    return {
      basic: true,
      pro: true,
      enterprise: true,
      custom: true
    };
  }

  // Get current state
  getCurrentState(): FeatureManagementState {
    return this.stateSubject.value;
  }

  // Update state helper
  private updateState(updates: Partial<FeatureManagementState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }
}
