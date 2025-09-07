import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = signal<Map<string, boolean>>(new Map());
  
  readonly isLoading = computed(() => {
    const states = this.loadingStates();
    return Array.from(states.values()).some(loading => loading);
  });

  setLoading(key: string, loading: boolean): void {
    this.loadingStates.update(states => {
      const newStates = new Map(states);
      if (loading) {
        newStates.set(key, true);
      } else {
        newStates.delete(key);
      }
      return newStates;
    });
  }

  isKeyLoading(key: string): boolean {
    return this.loadingStates().get(key) || false;
  }

  clearAll(): void {
    this.loadingStates.set(new Map());
  }
}
