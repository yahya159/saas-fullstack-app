import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { I18nService } from '../../@core/services/i18n.service';

@Pipe({
  name: 'translate',
  pure: false // Make it impure to detect locale changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private i18nService = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.translate(key, params);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
