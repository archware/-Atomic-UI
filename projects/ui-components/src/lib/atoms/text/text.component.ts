import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'label';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'white';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="renderAs">
      <h1 *ngSwitchCase="'h1'" [ngClass]="classes"><ng-content></ng-content></h1>
      <h2 *ngSwitchCase="'h2'" [ngClass]="classes"><ng-content></ng-content></h2>
      <h3 *ngSwitchCase="'h3'" [ngClass]="classes"><ng-content></ng-content></h3>
      <h4 *ngSwitchCase="'h4'" [ngClass]="classes"><ng-content></ng-content></h4>
      <p *ngSwitchDefault [ngClass]="classes"><ng-content></ng-content></p>
    </ng-container>
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

    /* Variants */
    .text-h1 { font-size: 2.25rem; letter-spacing: -0.025em; line-height: 1.2; }
    .text-h2 { font-size: 1.875rem; letter-spacing: -0.025em; line-height: 1.25; }
    .text-h3 { font-size: 1.5rem; letter-spacing: -0.025em; line-height: 1.3; }
    .text-h4 { font-size: 1.25rem; letter-spacing: -0.015em; line-height: 1.4; }
    
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
      [`color-${this.color}`]: true
    };
  }
}
