import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = signal<Theme>('auto');
  private systemTheme = signal<'light' | 'dark'>('light');
  
  readonly currentTheme = this.theme.asReadonly();
  readonly isDarkMode = computed(() => {
    const theme = this.theme();
    if (theme === 'auto') {
      return this.systemTheme() === 'dark';
    }
    return theme === 'dark';
  });

  constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  private initializeTheme(): void {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      this.theme.set(savedTheme);
    } else {
      // Default to system preference
      this.theme.set('auto');
    }

    // Get system theme
    this.updateSystemTheme();
    this.applyTheme();
  }

  private setupSystemThemeListener(): void {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        this.updateSystemTheme();
        this.applyTheme();
      });
    }
  }

  private updateSystemTheme(): void {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.systemTheme.set('dark');
    } else {
      this.systemTheme.set('light');
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    if (currentTheme === 'light') {
      this.setTheme('dark');
    } else if (currentTheme === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('light');
    }
  }

  private applyTheme(): void {
    const isDark = this.isDarkMode();
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark-mode');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark-mode');
      root.setAttribute('data-theme', 'light');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1a1a1a' : '#3b82f6');
    }
  }

  getThemeIcon(): string {
    const theme = this.theme();
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
      default:
        return '☀️';
    }
  }

  getThemeLabel(): string {
    const theme = this.theme();
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'auto':
        return 'Auto (System)';
      default:
        return 'Light Mode';
    }
  }
}
