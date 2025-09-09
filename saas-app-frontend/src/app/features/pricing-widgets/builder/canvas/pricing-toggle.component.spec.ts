import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PricingToggleComponent } from './pricing-toggle.component';

describe('PricingToggleComponent', () => {
  let component: PricingToggleComponent;
  let fixture: ComponentFixture<PricingToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingToggleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingToggleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isYearly()).toBe(false);
    expect(component.monthlyLabel()).toBe('Monthly');
    expect(component.yearlyLabel()).toBe('Yearly');
    expect(component.showSavings()).toBe(true);
    expect(component.savingsText()).toBe('Save up to 20%');
  });

  it('should apply correct CSS classes for monthly state', () => {
    component.isYearly.set(false);
    fixture.detectChanges();

    const toggleClasses = component.toggleClasses();
    expect(toggleClasses['pricing-toggle']).toBe(true);
    expect(toggleClasses['pricing-toggle--yearly']).toBe(false);
    expect(toggleClasses['pricing-toggle--animating']).toBe(false);

    const monthlyClasses = component.monthlyClasses();
    expect(monthlyClasses['toggle-option--active']).toBe(true);
    expect(monthlyClasses['toggle-option--inactive']).toBe(false);

    const yearlyClasses = component.yearlyClasses();
    expect(yearlyClasses['toggle-option--active']).toBe(false);
    expect(yearlyClasses['toggle-option--inactive']).toBe(true);
  });

  it('should apply correct CSS classes for yearly state', () => {
    component.isYearly.set(true);
    fixture.detectChanges();

    const toggleClasses = component.toggleClasses();
    expect(toggleClasses['pricing-toggle--yearly']).toBe(true);

    const monthlyClasses = component.monthlyClasses();
    expect(monthlyClasses['toggle-option--active']).toBe(false);
    expect(monthlyClasses['toggle-option--inactive']).toBe(true);

    const yearlyClasses = component.yearlyClasses();
    expect(yearlyClasses['toggle-option--active']).toBe(true);
    expect(yearlyClasses['toggle-option--inactive']).toBe(false);
  });

  it('should emit toggle change when clicked', () => {
    spyOn(component.toggleChange, 'emit');
    component.isYearly.set(false);
    fixture.detectChanges();

    component.onToggleClick();

    expect(component.toggleChange.emit).toHaveBeenCalledWith(true);
  });

  it('should not emit when animating', () => {
    spyOn(component.toggleChange, 'emit');
    component.isYearly.set(false);
    component.isAnimating.set(true);
    fixture.detectChanges();

    component.onToggleClick();

    expect(component.toggleChange.emit).not.toHaveBeenCalled();
  });

  it('should handle monthly click when in yearly state', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(true);
    fixture.detectChanges();

    component.onMonthlyClick();

    expect(component.onToggleClick).toHaveBeenCalled();
  });

  it('should not handle monthly click when in monthly state', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(false);
    fixture.detectChanges();

    component.onMonthlyClick();

    expect(component.onToggleClick).not.toHaveBeenCalled();
  });

  it('should handle yearly click when in monthly state', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(false);
    fixture.detectChanges();

    component.onYearlyClick();

    expect(component.onToggleClick).toHaveBeenCalled();
  });

  it('should not handle yearly click when in yearly state', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(true);
    fixture.detectChanges();

    component.onYearlyClick();

    expect(component.onToggleClick).not.toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(false);
    fixture.detectChanges();

    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onKeyDown(enterEvent);
    expect(component.onToggleClick).toHaveBeenCalled();

    // Test Space key
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    component.onKeyDown(spaceEvent);
    expect(component.onToggleClick).toHaveBeenCalledTimes(2);

    // Test Arrow Right (should toggle from monthly to yearly)
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(rightEvent);
    expect(component.onToggleClick).toHaveBeenCalledTimes(3);

    // Test Arrow Left (should not toggle when in monthly state)
    component.isYearly.set(false);
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.onKeyDown(leftEvent);
    expect(component.onToggleClick).toHaveBeenCalledTimes(3); // No additional call
  });

  it('should handle keyboard navigation in yearly state', () => {
    spyOn(component, 'onToggleClick');
    component.isYearly.set(true);
    fixture.detectChanges();

    // Test Arrow Left (should toggle from yearly to monthly)
    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    component.onKeyDown(leftEvent);
    expect(component.onToggleClick).toHaveBeenCalled();

    // Test Arrow Right (should not toggle when in yearly state)
    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(rightEvent);
    expect(component.onToggleClick).toHaveBeenCalledTimes(1); // No additional call
  });

  it('should prevent default behavior for handled keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');
    
    component.onKeyDown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent default for unhandled keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');
    
    component.onKeyDown(event);
    
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should set animating state during toggle', () => {
    component.isYearly.set(false);
    fixture.detectChanges();

    expect(component.isAnimating()).toBe(false);

    component.onToggleClick();

    expect(component.isAnimating()).toBe(true);

    // Wait for timeout to complete
    setTimeout(() => {
      expect(component.isAnimating()).toBe(false);
    }, 350);
  });

  it('should show savings badge when yearly and showSavings is true', () => {
    component.isYearly.set(true);
    component.showSavings.set(true);
    fixture.detectChanges();

    // The savings badge should be visible in the template
    const compiled = fixture.nativeElement;
    const savingsBadge = compiled.querySelector('.savings-badge');
    expect(savingsBadge).toBeTruthy();
  });

  it('should not show savings badge when monthly', () => {
    component.isYearly.set(false);
    component.showSavings.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const savingsBadge = compiled.querySelector('.savings-badge');
    expect(savingsBadge).toBeFalsy();
  });

  it('should not show savings badge when showSavings is false', () => {
    component.isYearly.set(true);
    component.showSavings.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const savingsBadge = compiled.querySelector('.savings-badge');
    expect(savingsBadge).toBeFalsy();
  });
});
