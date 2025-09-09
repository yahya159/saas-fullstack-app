import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-template-thumbnail',
  templateUrl: './template-thumbnail.component.html',
  styleUrls: ['./template-thumbnail.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TemplateThumbnailComponent {
  templateName = input('');
  templateType = input('');
  imageSrc = input('');

  getImageAlt(): string {
    return `${this.templateName()} template preview`;
  }

  getImageSrc(): string {
    // If we have an imageSrc input, use it (this comes from getTemplateImage in the parent)
    if (this.imageSrc() && this.imageSrc() !== 'assets/templates/3-column-classic.svg') {
      console.log('Using provided imageSrc:', this.imageSrc());
      return this.imageSrc();
    }

    // Use the template name to determine the image
    const templateName = this.templateName();
    console.log('Processing template name:', `"${templateName}"`);

    const imageMap: Record<string, string> = {
      '3-column classic': 'assets/templates/3-column-classic.svg',
      '2-column spotlight': 'assets/templates/2-column-spotlight.svg',
      'Comparison matrix': 'assets/templates/comparison-matrix.svg'
    };

    // Check for exact match first
    if (imageMap[templateName]) {
      const image = imageMap[templateName];
      console.log('Exact match found, image:', image);
      return image;
    }

    // Check for trimmed match
    const trimmedName = templateName.trim();
    if (imageMap[trimmedName]) {
      const image = imageMap[trimmedName];
      console.log('Trimmed match found, image:', image);
      return image;
    }

    // Fallback to the templateType if provided
    if (this.templateType()) {
      console.log('Using templateType as fallback:', this.templateType());
      // Convert templateType to expected format
      const typeToImageMap: Record<string, string> = {
        '3-column-classic': 'assets/templates/3-column-classic.svg',
        '2-column-spotlight': 'assets/templates/2-column-spotlight.svg',
        'comparison-matrix': 'assets/templates/comparison-matrix.svg'
      };

      const image = typeToImageMap[this.templateType()] || 'assets/templates/3-column-classic.svg';
      console.log('Mapped image for templateType:', this.templateType(), '->', image);
      return image;
    }

    // Log all available keys for debugging
    console.log('Available template names in image map:', Object.keys(imageMap));

    // Fallback to default image
    const image = 'assets/templates/3-column-classic.svg';
    console.log('No match found, using default image:', image);
    return image;
  }

  onImageError(event: any) {
    console.error('Image failed to load for template:', this.templateName(), event);
    // Set a fallback image
    event.target.src = 'assets/templates/3-column-classic.svg';
    event.target.classList.remove('loading');
    event.target.classList.add('loaded');
  }

  onImageLoad(event: any) {
    console.log('Image loaded successfully for template:', this.templateName(), event);
    event.target.classList.remove('loading');
    event.target.classList.add('loaded');
  }
}
