import { test, expect } from '@playwright/test';

test.describe('Widget Preview Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the widget builder
    await page.goto('/pricing-widgets');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="widget-builder"]');
  });

  test('should open preview mode from widget builder', async ({ page }) => {
    // Create a new widget or select existing one
    const createButton = page.locator('button:has-text("New Widget")');
    await createButton.click();
    
    // Wait for the widget to be created and enter edit mode
    await page.waitForSelector('[data-testid="widget-canvas"]');
    
    // Click the preview button
    const previewButton = page.locator('button:has-text("Preview")');
    await previewButton.click();
    
    // Wait for preview window to open
    const [previewPage] = await Promise.all([
      page.waitForEvent('popup'),
      previewButton.click()
    ]);
    
    // Verify preview page loaded
    await expect(previewPage).toHaveURL(/\/widgets\/preview\/.+/);
    await expect(previewPage.locator('[data-testid="preview-container"]')).toBeVisible();
  });

  test('should display device toggle buttons', async ({ page }) => {
    // Navigate directly to preview page
    await page.goto('/widgets/preview/test-widget-id');
    
    // Wait for preview to load
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check for device toggle buttons
    await expect(page.locator('button:has-text("Desktop")')).toBeVisible();
    await expect(page.locator('button:has-text("Tablet")')).toBeVisible();
    await expect(page.locator('button:has-text("Mobile")')).toBeVisible();
  });

  test('should switch between device sizes', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    const previewFrame = page.locator('[data-testid="preview-frame"]');
    
    // Test Desktop size (1280px)
    await page.locator('button:has-text("Desktop")').click();
    await expect(previewFrame).toHaveCSS('width', '1280px');
    
    // Test Tablet size (768px)
    await page.locator('button:has-text("Tablet")').click();
    await expect(previewFrame).toHaveCSS('width', '768px');
    
    // Test Mobile size (375px)
    await page.locator('button:has-text("Mobile")').click();
    await expect(previewFrame).toHaveCSS('width', '375px');
  });

  test('should toggle fullscreen mode', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    const fullscreenButton = page.locator('button:has-text("Fullscreen")');
    const previewContainer = page.locator('[data-testid="preview-container"]');
    
    // Enter fullscreen
    await fullscreenButton.click();
    await expect(fullscreenButton).toHaveText('Exit Fullscreen');
    await expect(previewContainer).toHaveClass(/fullscreen/);
    
    // Exit fullscreen
    await fullscreenButton.click();
    await expect(fullscreenButton).toHaveText('Fullscreen');
    await expect(previewContainer).not.toHaveClass(/fullscreen/);
  });

  test('should display template switcher when multiple templates available', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check if template switcher is visible
    const templateSwitcher = page.locator('[data-testid="template-switcher"]');
    
    // If templates are available, switcher should be visible
    const hasTemplates = await templateSwitcher.isVisible();
    if (hasTemplates) {
      await expect(templateSwitcher).toBeVisible();
      
      // Test template switching
      const templateButtons = page.locator('[data-testid="template-switcher"] button');
      const templateCount = await templateButtons.count();
      
      if (templateCount > 1) {
        await templateButtons.nth(1).click();
        // Verify template changed (this would depend on implementation)
        await page.waitForTimeout(500); // Wait for template to load
      }
    }
  });

  test('should display loading state while widget loads', async ({ page }) => {
    // Mock slow loading
    await page.route('**/api/widgets/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/widgets/preview/test-widget-id');
    
    // Check for loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="preview-container"]');
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should display error state when widget fails to load', async ({ page }) => {
    // Mock API error
    await page.route('**/api/widgets/**', route => route.abort());
    
    await page.goto('/widgets/preview/test-widget-id');
    
    // Check for error boundary
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    await expect(page.locator('text=Something went wrong')).toBeVisible();
    
    // Test retry functionality
    const retryButton = page.locator('button:has-text("Try Again")');
    await expect(retryButton).toBeVisible();
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check that controls are properly sized for mobile
    const deviceButtons = page.locator('[data-testid="device-controls"] button');
    await expect(deviceButtons.first()).toBeVisible();
    
    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check that layout adapts to tablet
    await expect(page.locator('[data-testid="preview-container"]')).toBeVisible();
    
    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check that layout adapts to desktop
    await expect(page.locator('[data-testid="preview-container"]')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Desktop")')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Tablet")')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button:has-text("Mobile")')).toBeFocused();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    // Verify device size changed (this would depend on implementation)
  });

  test('should maintain state when switching between device sizes', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Switch to tablet
    await page.locator('button:has-text("Tablet")').click();
    await page.waitForTimeout(100);
    
    // Switch to mobile
    await page.locator('button:has-text("Mobile")').click();
    await page.waitForTimeout(100);
    
    // Switch back to tablet
    await page.locator('button:has-text("Tablet")').click();
    
    // Verify tablet size is maintained
    const previewFrame = page.locator('[data-testid="preview-frame"]');
    await expect(previewFrame).toHaveCSS('width', '768px');
  });

  test('should handle iframe content properly', async ({ page }) => {
    await page.goto('/widgets/preview/test-widget-id');
    await page.waitForSelector('[data-testid="preview-container"]');
    
    // Check if iframe is present
    const iframe = page.locator('iframe');
    const iframeExists = await iframe.isVisible();
    
    if (iframeExists) {
      // Verify iframe has proper attributes
      await expect(iframe).toHaveAttribute('srcdoc');
      
      // Test iframe content loading
      await page.waitForTimeout(1000); // Wait for iframe content
      
      // Verify iframe content is not empty
      const iframeContent = await iframe.getAttribute('srcdoc');
      expect(iframeContent).toBeTruthy();
      expect(iframeContent!.length).toBeGreaterThan(0);
    }
  });
});
