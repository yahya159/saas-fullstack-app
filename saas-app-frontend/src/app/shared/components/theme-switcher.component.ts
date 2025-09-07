import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <div class="theme-switcher">
      <div class="theme-header">
        <h3>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12a5 5 0 110-10 5 5 0 010 10z"/>
            <path d="M8 4a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
          Brand Theme
        </h3>
        <p>Customize the look and feel of your widgets</p>
      </div>
      
      <form [formGroup]="themeForm" class="theme-form">
        <!-- Accent Color -->
        <div class="form-group">
          <label for="accentColor">Accent Color</label>
          <div class="color-input-group">
            <input 
              type="color" 
              id="accentColor"
              formControlName="accentColor"
              class="color-picker">
            <input 
              type="text" 
              formControlName="accentColorText"
              class="color-text"
              placeholder="#3498db">
          </div>
        </div>

        <!-- Radius Scale -->
        <div class="form-group">
          <label for="radiusScale">Border Radius Scale</label>
          <div class="radius-preview">
            <div class="radius-demo" 
                 [style.border-radius]="themeService.radiusScale() + 'px'">
              {{ themeService.radiusScale() }}px
            </div>
          </div>
          <input 
            type="range" 
            id="radiusScale"
            formControlName="radiusScale"
            min="4" 
            max="16" 
            step="2"
            class="radius-slider">
          <div class="radius-options">
            <button type="button" 
                    *ngFor="let size of radiusOptions" 
                    (click)="setRadiusScale(size)"
                    [class.active]="themeService.radiusScale() === size"
                    class="radius-btn">
              {{ size }}px
            </button>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <div class="form-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              formControlName="isDarkMode"
              class="toggle-input">
            <span class="toggle-slider"></span>
            <span class="toggle-text">Dark Mode</span>
          </label>
        </div>

        <!-- Currency Toggle -->
        <div class="form-group">
          <label for="currency">Currency</label>
          <div class="currency-toggle">
            <button type="button" 
                    (click)="setCurrency('USD')"
                    [class.active]="themeService.currency() === 'USD'"
                    class="currency-btn">
              USD
            </button>
            <button type="button" 
                    (click)="setCurrency('MAD')"
                    [class.active]="themeService.currency() === 'MAD'"
                    class="currency-btn">
              MAD
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="form-actions">
          <button type="button" (click)="resetTheme()" class="btn btn-outline">
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .theme-switcher {
      padding: 1.25rem;
      background: var(--bg-secondary, #f8f9fa);
      border-radius: var(--radius-lg, 12px);
      border: 1px solid var(--border-color, #e0e0e0);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .theme-header {
      margin-bottom: 1.25rem;
    }

    .theme-header h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #333);
      font-size: 1.125rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .theme-header p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary, #666);
      line-height: 1.5;
    }

    .theme-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text-primary, #333);
      font-size: 0.875rem;
    }

    .color-input-group {
      display: flex;
      gap: 0.625rem;
      align-items: center;
    }

    .color-picker {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .color-text {
      flex: 1;
      padding: 0.625rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: var(--radius-md, 6px);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .color-text:focus {
      outline: none;
      border-color: var(--accent-color, #007bff);
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
    }

    .radius-preview {
      margin-bottom: 0.625rem;
    }

    .radius-demo {
      display: inline-block;
      padding: 0.625rem 1.125rem;
      background: var(--accent-color, #3498db);
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: var(--radius-md, 6px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .radius-slider {
      width: 100%;
      margin-bottom: 0.625rem;
      height: 6px;
      border-radius: 3px;
      background: #e0e0e0;
      outline: none;
      -webkit-appearance: none;
    }

    .radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent-color, #3498db);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .radius-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent-color, #3498db);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .radius-options {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
    }

    .radius-btn {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .radius-btn:hover {
      background: var(--bg-secondary, #f8f9fa);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .radius-btn.active {
      background: var(--accent-color, #3498db);
      color: white;
      border-color: var(--accent-color, #3498db);
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 44px;
      height: 22px;
      background: #ccc;
      border-radius: 22px;
      transition: background 0.3s;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .toggle-input:checked + .toggle-slider {
      background: var(--accent-color, #3498db);
    }

    .toggle-input:checked + .toggle-slider::before {
      transform: translateX(22px);
    }

    .toggle-text {
      color: var(--text-primary, #333);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .form-actions {
      margin-top: 0.625rem;
    }

    .btn {
      padding: 0.625rem 1.125rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .btn:hover {
      background: var(--bg-secondary, #f8f9fa);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .btn-outline {
      border-color: var(--accent-color, #3498db);
      color: var(--accent-color, #3498db);
    }

    .btn-outline:hover {
      background: var(--accent-color, #3498db);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }

    .currency-toggle {
      display: flex;
      gap: 0.375rem;
    }

    .currency-btn {
      flex: 1;
      padding: 0.625rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-md, 6px);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    }

    .currency-btn:hover {
      background: var(--bg-secondary, #f8f9fa);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .currency-btn.active {
      background: var(--accent-color, #3498db);
      color: white;
      border-color: var(--accent-color, #3498db);
      box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
    }
  `],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  themeForm!: FormGroup;
  radiusOptions = [4, 6, 8, 10, 12, 14, 16];

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.themeForm = this.fb.group({
      accentColor: [this.themeService.accentColor()],
      accentColorText: [this.themeService.accentColor()],
      radiusScale: [this.themeService.radiusScale()],
      isDarkMode: [this.themeService.isDarkMode()]
    });
  }

  private setupFormSubscriptions(): void {
    // Accent color changes
    this.themeForm.get('accentColor')?.valueChanges.subscribe(color => {
      this.themeService.setAccentColor(color);
      this.themeForm.get('accentColorText')?.setValue(color, { emitEvent: false });
    });

    this.themeForm.get('accentColorText')?.valueChanges.subscribe(color => {
      if (this.isValidColor(color)) {
        this.themeService.setAccentColor(color);
        this.themeForm.get('accentColor')?.setValue(color, { emitEvent: false });
      }
    });

    // Radius scale changes
    this.themeForm.get('radiusScale')?.valueChanges.subscribe(scale => {
      this.themeService.setRadiusScale(scale);
    });

    // Dark mode changes
    this.themeForm.get('isDarkMode')?.valueChanges.subscribe(isDark => {
      this.themeService.setDarkMode(isDark);
    });
  }

  setRadiusScale(scale: number): void {
    this.themeService.setRadiusScale(scale);
    this.themeForm.get('radiusScale')?.setValue(scale);
  }

  setCurrency(currency: 'USD' | 'MAD'): void {
    this.themeService.setCurrency(currency);
  }

  resetTheme(): void {
    this.themeService.resetTheme();
    this.initializeForm();
  }

  private isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}