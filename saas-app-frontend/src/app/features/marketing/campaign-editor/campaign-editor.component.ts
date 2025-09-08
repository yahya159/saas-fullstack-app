import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarketingMenuComponent } from '../marketing-menu.component';
import { MarketingService, MarketingCampaign, CreateCampaignDto } from '../services/marketing.service';

@Component({
  selector: 'app-campaign-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MarketingMenuComponent],
  template: `
    <app-marketing-menu></app-marketing-menu>

    <div class="campaign-editor">
      <div class="header">
        <h1>{{ isEditMode() ? 'Edit Campaign' : 'Create New Campaign' }}</h1>
        <div class="actions">
          <button class="btn btn-outline" (click)="cancel()">
            Cancel
          </button>
          <button class="btn btn-primary" (click)="saveCampaign()" [disabled]="campaignForm.invalid || isSaving()">
            <span *ngIf="isSaving()">Saving...</span>
            <span *ngIf="!isSaving()">{{ isEditMode() ? 'Update Campaign' : 'Create Campaign' }}</span>
          </button>
        </div>
      </div>

      <div class="content">
        <form [formGroup]="campaignForm" class="campaign-form">
          <div class="form-section">
            <h2>Campaign Details</h2>

            <div class="form-group">
              <label for="name">Campaign Name *</label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="form-control"
                [class.error]="campaignForm.get('name')?.invalid && campaignForm.get('name')?.touched">
              <div class="error-message" *ngIf="campaignForm.get('name')?.invalid && campaignForm.get('name')?.touched">
                Campaign name is required
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="type">Campaign Type *</label>
              <select
                id="type"
                formControlName="type"
                class="form-control"
                [class.error]="campaignForm.get('type')?.invalid && campaignForm.get('type')?.touched">
                <option value="">Select a campaign type</option>
                <option value="AB_TEST">A/B Test</option>
                <option value="PRICING_TEST">Pricing Test</option>
                <option value="LANDING_PAGE">Landing Page Optimization</option>
                <option value="EMAIL_CAMPAIGN">Email Campaign</option>
                <option value="CONVERSION_OPTIMIZATION">Conversion Optimization</option>
              </select>
              <div class="error-message" *ngIf="campaignForm.get('type')?.invalid && campaignForm.get('type')?.touched">
                Campaign type is required
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Target Audience</h2>

            <div class="form-group">
              <label for="audienceType">Audience Type</label>
              <select id="audienceType" formControlName="audienceType" class="form-control">
                <option value="all">All Users</option>
                <option value="new">New Users</option>
                <option value="returning">Returning Users</option>
                <option value="paid">Paid Users</option>
                <option value="trial">Trial Users</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" formControlName="startDate" class="form-control">
              </div>

              <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" id="endDate" formControlName="endDate" class="form-control">
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2>Variants</h2>
            <p>Define the different versions of your campaign for testing</p>

            <div class="variant-section">
              <h3>Control Variant (A)</h3>
              <p>This is your baseline version for comparison</p>
              <div class="form-group">
                <label for="controlDescription">Description</label>
                <textarea
                  id="controlDescription"
                  formControlName="controlDescription"
                  class="form-control"
                  rows="2"
                  placeholder="Describe the control variant"></textarea>
              </div>
            </div>

            <div class="variant-section">
              <h3>Variation (B)</h3>
              <p>This is the alternative version you want to test</p>
              <div class="form-group">
                <label for="variationDescription">Description</label>
                <textarea
                  id="variationDescription"
                  formControlName="variationDescription"
                  class="form-control"
                  rows="2"
                  placeholder="Describe the variation"></textarea>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .campaign-editor {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary, #1a202c);
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md, 6px);
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--accent-primary, #3182ce);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--accent-primary-hover, #2c5282);
    }

    .btn-outline {
      background: transparent;
      color: var(--accent-primary, #3182ce);
      border: 1px solid var(--accent-primary, #3182ce);
    }

    .btn-outline:hover {
      background: var(--accent-primary, #3182ce);
      color: white;
    }

    .content {
      background: var(--bg-primary, #ffffff);
      padding: 2rem;
      border-radius: var(--radius-lg, 12px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .campaign-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      padding: 1.5rem;
      background: var(--bg-secondary, #f7fafc);
      border-radius: var(--radius-lg, 12px);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .form-section h2 {
      margin-top: 0;
      color: var(--text-primary, #1a202c);
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-secondary, #718096);
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #1a202c);
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-primary, #3182ce);
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    }

    .form-control.error {
      border-color: var(--error, #e53e3e);
    }

    .error-message {
      color: var(--error, #e53e3e);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .variant-section {
      padding: 1rem;
      background: var(--bg-primary, #ffffff);
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
      margin-bottom: 1rem;
    }

    .variant-section h3 {
      margin-top: 0;
      color: var(--text-primary, #1a202c);
    }

    .variant-section p {
      color: var(--text-secondary, #718096);
      font-size: 0.875rem;
      margin-top: 0;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .campaign-editor {
        padding: 1rem;
      }

      .content {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .actions {
        width: 100%;
        justify-content: space-between;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CampaignEditorComponent implements OnInit {
  private readonly marketingService = inject(MarketingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  campaignForm!: FormGroup;
  isEditMode = signal(false);
  campaignId = signal<string | null>(null);
  isSaving = signal(false);
  existingCampaign = signal<MarketingCampaign | null>(null);

  ngOnInit() {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm() {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      audienceType: ['all'],
      startDate: [''],
      endDate: [''],
      controlDescription: [''],
      variationDescription: ['']
    });
  }

  private checkEditMode() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.campaignId.set(params['id']);
        this.loadCampaign(params['id']);
      }
    });
  }

  private loadCampaign(id: string) {
    this.marketingService.getCampaignById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.existingCampaign.set(response.data);
          this.populateForm(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load campaign:', error);
      }
    });
  }

  private populateForm(campaign: MarketingCampaign) {
    this.campaignForm.patchValue({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      audienceType: 'all', // Default value
      startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
      controlDescription: campaign.variants?.control?.['description'] || '',
      variationDescription: campaign.variants?.variations?.[0]?.['description'] || ''
    });
  }

  saveCampaign() {
    if (this.campaignForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    const formValue = this.campaignForm.value;

    // For update, we need to convert to Partial<MarketingCampaign>
    if (this.isEditMode() && this.campaignId()) {
      const updateData: Partial<MarketingCampaign> = {
        name: formValue.name,
        description: formValue.description,
        type: formValue.type,
        targetAudience: {
          type: formValue.audienceType
        },
        startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined,
        variants: {
          control: {
            description: formValue.controlDescription
          },
          variations: [
            {
              description: formValue.variationDescription
            }
          ]
        }
      };

      // Update existing campaign
      this.marketingService.updateCampaign(this.campaignId()!, updateData).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.router.navigate(['/marketing/campaigns']);
          }
        },
        error: (error) => {
          this.isSaving.set(false);
          console.error('Failed to update campaign:', error);
        }
      });
    } else {
      // Create new campaign
      const campaignData: CreateCampaignDto = {
        applicationId: '507f1f77bcf86cd799439011', // Mock application ID
        name: formValue.name,
        description: formValue.description,
        type: formValue.type,
        targetAudience: {
          type: formValue.audienceType
        },
        startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined,
        variants: {
          control: {
            description: formValue.controlDescription
          },
          variations: [
            {
              description: formValue.variationDescription
            }
          ]
        }
      };

      this.marketingService.createCampaign(campaignData).subscribe({
        next: (response) => {
          this.isSaving.set(false);
          if (response.success) {
            this.router.navigate(['/marketing/campaigns']);
          }
        },
        error: (error) => {
          this.isSaving.set(false);
          console.error('Failed to create campaign:', error);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/marketing/campaigns']);
  }
}
