import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'label';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'white';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (renderAs) {
      @case ('h1') { <h1 [ngClass]="classes"><ng-container *ngTemplateOutlet="content"></ng-container></h1> }
      @case ('h2') { <h2 [ngClass]="classes"><ng-container *ngTemplateOutlet="content"></ng-container></h2> }
      @case ('h3') { <h3 [ngClass]="classes"><ng-container *ngTemplateOutlet="content"></ng-container></h3> }
      @case ('h4') { <h4 [ngClass]="classes"><ng-container *ngTemplateOutlet="content"></ng-container></h4> }
      @default { <p [ngClass]="classes"><ng-container *ngTemplateOutlet="content"></ng-container></p> }
    }
    <ng-template #content><ng-content></ng-content></ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Base Styles */
    h1, h2, h3, h4, p {
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }

    /* Alignment */
    .align-left { text-align: left; }
    .align-center { text-align: center; }
    .align-right { text-align: right; }
    .align-justify { text-align: justify; }

    /* Variants - Headings */
    .text-h1 { font-size: 2.25rem; letter-spacing: -0.025em; line-height: 1.2; margin-top: 2.25rem; margin-bottom: 0.75rem; }
    .text-h2 { font-size: 1.875rem; letter-spacing: -0.025em; line-height: 1.25; margin-top: 2.25rem; margin-bottom: 0.75rem; }
    .text-h3 { font-size: 1.5rem; letter-spacing: -0.025em; line-height: 1.3; margin-top: 2.25rem; margin-bottom: 0.75rem; }
    .text-h4 { font-size: 1.25rem; letter-spacing: -0.015em; line-height: 1.4; margin-top: 2.25rem; margin-bottom: 0.75rem; }
    
    /* First heading in container should not have top margin */
    :host(:first-child) .text-h1,
    :host(:first-child) .text-h2,
    :host(:first-child) .text-h3,
    :host(:first-child) .text-h4 {
      margin-top: 0;
    }
    
    .text-body-lg { font-size: 1.125rem; }
    .text-body { font-size: 1rem; }
    .text-body-sm { font-size: 0.875rem; }
    
    .text-caption { font-size: 0.75rem; letter-spacing: 0.02em; }
    .text-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Weights */
    .weight-normal { font-weight: 400; }
    .weight-medium { font-weight: 500; }
    .weight-semibold { font-weight: 600; }
    .weight-bold { font-weight: 700; }

    /* Colors */
    .color-default { color: var(--text-color, #111827); }
    .color-primary { color: var(--primary-color, #793576); }
    .color-secondary { color: var(--secondary-color, #23a7d4); }
    .color-muted { color: var(--text-color-secondary, #6b7280); }
    .color-success { color: var(--success-color, #10b981); }
    .color-warning { color: var(--warning-color, #f59e0b); }
    .color-danger { color: var(--danger-color, #ef4444); }
    .color-white { color: #ffffff; }

    /* Dark Mode Adjustments handled by CSS variables normally, but specific overrides here if needed */
    :host-context(.dark) .color-default,
    :host-context([data-theme="dark"]) .color-default {
      color: var(--text-color, #f3f4f6);
    }
  `]
})
export class TextComponent implements OnInit {
  @Input() variant: TextVariant = 'body';
  @Input() weight: TextWeight = 'normal';
  @Input() color: TextColor = 'default';
  @Input() align: TextAlign = 'left';

  renderAs = 'p';

  ngOnInit() {
    // Map variant to semantic HTML tag
    if (['h1', 'h2', 'h3', 'h4'].includes(this.variant)) {
      this.renderAs = this.variant;
    } else {
      this.renderAs = 'p';
    }
  }

  get classes() {
    return {
      [`text-${this.variant}`]: true,
      [`weight-${this.weight}`]: true,
      [`color-${this.color}`]: true,
      [`align-${this.align}`]: true
    };
  }
}
