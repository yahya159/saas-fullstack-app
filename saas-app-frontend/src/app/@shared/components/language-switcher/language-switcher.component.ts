import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../@core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css'],
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageSwitcherComponent {
  private i18nService = inject(I18nService);
  
  readonly currentLocale = this.i18nService.locale;
  readonly availableLocales = this.i18nService.availableLocales;

  setLocale(locale: string): void {
    this.i18nService.setLocale(locale);
  }

  getLocaleFlag(locale: string): string {
    const flags: Record<string, string> = {
      'en': '🇺🇸',
      'fr': '🇫🇷'
    };
    return flags[locale] || '🌐';
  }

  getLocaleName(locale: string): string {
    const names: Record<string, string> = {
      'en': 'English',
      'fr': 'Français'
    };
    return names[locale] || locale;
  }
}
