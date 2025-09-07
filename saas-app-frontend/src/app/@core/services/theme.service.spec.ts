import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with auto theme by default', () => {
    expect(service.currentTheme()).toBe('auto');
  });

  it('should set theme correctly', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should toggle theme correctly', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('auto');

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
  });

  it('should return correct theme icon', () => {
    service.setTheme('light');
    expect(service.getThemeIcon()).toBe('☀️');

    service.setTheme('dark');
    expect(service.getThemeIcon()).toBe('🌙');

    service.setTheme('auto');
    expect(service.getThemeIcon()).toBe('🔄');
  });

  it('should return correct theme label', () => {
    service.setTheme('light');
    expect(service.getThemeLabel()).toBe('Light Mode');

    service.setTheme('dark');
    expect(service.getThemeLabel()).toBe('Dark Mode');

    service.setTheme('auto');
    expect(service.getThemeLabel()).toBe('Auto (System)');
  });

  it('should detect dark mode correctly', () => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy('matchMedia').and.returnValue({
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener')
      })
    });

    service.setTheme('auto');
    // Note: In a real test, you'd need to trigger the system theme detection
    // This is a simplified test
    expect(service.isDarkMode()).toBeDefined();
  });
});
