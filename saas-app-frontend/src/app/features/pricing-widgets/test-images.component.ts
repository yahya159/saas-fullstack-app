import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-images',
  template: `
    <div style="padding: 20px;">
      <h2>Template Image Test</h2>
      
      <div style="margin: 20px 0;">
        <h3>Direct Image Tests</h3>
        <div>
          <p>3-column-classic.svg:</p>
          <img src="assets/templates/3-column-classic.svg" alt="3-column classic" width="200" height="120" (error)="onImageError('3-column-classic.svg')" (load)="onImageLoad('3-column-classic.svg')">
        </div>
        <div>
          <p>2-column-spotlight.svg:</p>
          <img src="assets/templates/2-column-spotlight.svg" alt="2-column spotlight" width="200" height="120" (error)="onImageError('2-column-spotlight.svg')" (load)="onImageLoad('2-column-spotlight.svg')">
        </div>
        <div>
          <p>comparison-matrix.svg:</p>
          <img src="assets/templates/comparison-matrix.svg" alt="Comparison matrix" width="200" height="120" (error)="onImageError('comparison-matrix.svg')" (load)="onImageLoad('comparison-matrix.svg')">
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Image Status</h3>
        <pre>{{ imageStatus | json }}</pre>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class TestImagesComponent {
  imageStatus: Record<string, string> = {};

  onImageLoad(imageName: string) {
    this.imageStatus[imageName] = 'Loaded successfully';
    console.log('Image loaded:', imageName);
  }

  onImageError(imageName: string) {
    this.imageStatus[imageName] = 'Failed to load';
    console.error('Image failed to load:', imageName);
  }
}