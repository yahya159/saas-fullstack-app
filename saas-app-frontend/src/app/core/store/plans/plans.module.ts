import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { plansReducer } from './plans.reducer';
import { PlansEffects } from './plans.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('plans', plansReducer),
    EffectsModule.forFeature([PlansEffects])
  ]
})
export class PlansModule {}
