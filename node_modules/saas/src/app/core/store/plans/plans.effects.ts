import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom, filter } from 'rxjs/operators';
import { of } from 'rxjs';

import { PlanFeatureApiService } from '../../services/plan-feature-api.service';
import * as PlansActions from './plans.actions';
import * as PlansSelectors from './plans.selectors';

@Injectable()
export class PlansEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly planFeatureApi = inject(PlanFeatureApiService);

  // Load Plans Effect
  loadPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadPlans, PlansActions.refreshPlansData),
      switchMap(() =>
        this.planFeatureApi.getPlans().pipe(
          map((plans) => PlansActions.loadPlansSuccess({ plans })),
          catchError((error) =>
            of(PlansActions.loadPlansFailure({ 
              error: error.message || 'Failed to load plans' 
            }))
          )
        )
      )
    )
  );

  // Load Features Effect
  loadFeatures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadFeatures, PlansActions.refreshPlansData),
      switchMap(() =>
        this.planFeatureApi.getFeatures().pipe(
          map((features) => PlansActions.loadFeaturesSuccess({ features })),
          catchError((error) =>
            of(PlansActions.loadFeaturesFailure({ 
              error: error.message || 'Failed to load features' 
            }))
          )
        )
      )
    )
  );

  // Auto-load features when plans are loaded successfully
  loadFeaturesAfterPlans$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadPlansSuccess),
      withLatestFrom(this.store.select(PlansSelectors.selectAllFeatures)),
      filter(([action, features]) => features.length === 0),
      map(() => PlansActions.loadFeatures())
    )
  );

  // Auto-load plans when features are loaded successfully (if plans not loaded)
  loadPlansAfterFeatures$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlansActions.loadFeaturesSuccess),
      withLatestFrom(this.store.select(PlansSelectors.selectAllPlans)),
      filter(([action, plans]) => plans.length === 0),
      map(() => PlansActions.loadPlans())
    )
  );
}
