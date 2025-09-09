import { Component, ChangeDetectionStrategy, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WidgetStoreService } from '../../state/widget-store.service';
import { WidgetBlockType } from '../../../../core/models/pricing.models';

@Component({
  selector: 'app-properties-panel',
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PropertiesPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private widgetStore = inject(WidgetStoreService);

  selectedWidget = this.widgetStore.selectedWidget;
  selectedBlock = this.widgetStore.selectedBlock;
  attachedPlan = this.widgetStore.attachedPlan;
  plans = this.widgetStore.plans;

  blockForm!: FormGroup;
  widgetForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
    
    // Create effects to populate forms when signals change
    effect(() => {
      const block = this.selectedBlock();
      if (block) {
        this.populateBlockForm(block.block);
      } else {
        this.blockForm.reset();
      }
    });
    
    effect(() => {
      const widget = this.selectedWidget();
      if (widget) {
        this.populateWidgetForm(widget);
      } else {
        this.widgetForm.reset();
      }
    });
  }

  private initializeForms(): void {
    this.blockForm = this.fb.group({
      text: [''],
      planTierId: [''],
      width: [null],
      textAlign: ['left'],
      radius: [null],
      padding: [null],
      elevation: [0]
    });

    this.widgetForm = this.fb.group({
      name: ['', Validators.required],
      attachedPlanId: [''],
      gap: [16],
      background: ['#ffffff'],
      maxWidth: [1200]
    });

    // Subscribe to form changes
    this.blockForm.valueChanges.subscribe(value => {
      this.updateBlockProperties(value);
    });

    this.widgetForm.valueChanges.subscribe(value => {
      this.updateWidgetProperties(value);
    });
  }

  private populateBlockForm(block: any): void {
    this.blockForm.patchValue({
      text: block.text || '',
      planTierId: block.planTierId || '',
      width: block.style?.width || null,
      textAlign: block.style?.textAlign || 'left',
      radius: block.style?.radius || null,
      padding: block.style?.padding || null,
      elevation: block.style?.elevation || 0
    });
  }

  private populateWidgetForm(widget: any): void {
    console.log('=== PROPERTIES PANEL: populateWidgetForm ===');
    console.log('Widget:', widget);
    console.log('Available plans:', this.plans());
    
    this.widgetForm.patchValue({
      name: widget.name || '',
      attachedPlanId: widget.attachedPlanId || '',
      gap: widget.style?.gap || 16,
      background: widget.style?.background || '#ffffff',
      maxWidth: widget.style?.maxWidth || 1200
    });
  }

  private updateBlockProperties(value: Record<string, unknown>): void {
    console.log('=== PROPERTIES PANEL: updateBlockProperties ===');
    console.log('Value:', value);
    
    const selectedBlock = this.selectedBlock();
    const selectedWidget = this.selectedWidget();
    
    if (!selectedBlock || !selectedWidget) {
      console.log('No selected block or widget');
      return;
    }

    const { text, planTierId, ...style } = value;
    
    console.log('Extracted values:', { text, planTierId, style });
    
    if (text !== undefined && typeof text === 'string') {
      console.log('Updating block text:', text);
      this.widgetStore.updateBlockText(selectedWidget.id, selectedBlock.block.id, text);
    }
    
    if (planTierId !== undefined && planTierId !== null) {
      console.log('Updating block planTierId:', planTierId);
      this.widgetStore.updateBlockPlanTier(selectedWidget.id, selectedBlock.block.id, planTierId as string);
    }
    
    if (Object.keys(style).length > 0) {
      console.log('Updating block style:', style);
      this.widgetStore.updateBlockStyle(selectedWidget.id, selectedBlock.block.id, style);
    }
  }

  private updateWidgetProperties(value: Record<string, unknown>): void {
    const selectedWidget = this.selectedWidget();
    if (!selectedWidget) return;

    // Special handling for attachedPlanId
    if (value.hasOwnProperty('attachedPlanId')) {
      console.log('Updating attached plan ID:', value['attachedPlanId']);
      this.widgetStore.attachPlan(selectedWidget.id, value['attachedPlanId'] as string);
    }

    this.widgetStore.updateWidget(selectedWidget.id, value);
  }

  getBlockType(): WidgetBlockType | null {
    return this.selectedBlock()?.block.type || null;
  }

  getAvailableTiers() {
    const plan = this.attachedPlan();
    return plan?.tiers || [];
  }

  isPriceCardBlock(): boolean {
    return this.getBlockType() === 'price-card';
  }

  isFeatureListBlock(): boolean {
    return this.getBlockType() === 'feature-list';
  }

  getTextAlignOptions() {
    return [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ];
  }

  getElevationOptions() {
    return [
      { value: 0, label: 'None' },
      { value: 1, label: 'Small' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'Large' }
    ];
  }
}