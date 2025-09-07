import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-campaign-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="campaign-editor">
      <div class="header">
        <h1>Campaign Editor</h1>
        <div class="actions">
          <button class="btn btn-outline" routerLink="/marketing/campaigns">
            Cancel
          </button>
          <button class="btn btn-primary">
            Save Campaign
          </button>
        </div>
      </div>

      <div class="content">
        <p>Campaign editor implementation coming soon...</p>
        <p>Navigate back to <a routerLink="/marketing/dashboard">Marketing Dashboard</a></p>
      </div>
    </div>
  `,
  styles: [`
    .campaign-editor {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-outline {
      background: transparent;
      color: #3182ce;
      border: 1px solid #3182ce;
    }

    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class CampaignEditorComponent {
}
