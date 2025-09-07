import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-optimized-image',
  templateUrl: './optimized-image.component.html',
  styleUrls: ['./optimized-image.component.css'],
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedImageComponent {
  @Input() src = '';
  @Input() alt = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() priority = false;
  @Input() loading: 'lazy' | 'eager' = 'lazy';
  @Input() placeholder = 'blur';
  @Input() class = '';
  @Input() style = '';

  get imageSrc(): string {
    // In a real app, you might want to use a CDN or image optimization service
    return this.src;
  }

  get imageAlt(): string {
    return this.alt || 'Image';
  }
}
