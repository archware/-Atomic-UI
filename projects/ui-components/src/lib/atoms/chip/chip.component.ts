import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export type ChipVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
export type ChipSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span 
      class="chip"
      [class]="'chip-' + variant + ' chip-' + size"
      [class.chip-interactive]="clickable"
      [class.chip-selected]="selected"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick()"
      [attr.role]="clickable ? 'button' : null"
      [attr.tabindex]="clickable ? 0 : null"
    >
      @if (icon) {
        <span class="chip-icon">{{ icon }}</span>
      }
      <span class="chip-label"><ng-content></ng-content></span>
      @if (removable) {
        <button type="button"
          class="chip-remove" 
          (click)="onRemove($event)"
          (keydown.enter)="onRemove($event)"
          (keydown.space)="onRemove($event)"
          aria-label="Eliminar"
        >×</button>
      }
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 150ms ease;
      border: 1px solid transparent;
    }

    .chip-sm { padding: 0.125rem 0.5rem; font-size: 0.6875rem; }
    .chip-md { padding: 0.25rem 0.625rem; font-size: 0.75rem; }
    .chip-lg { padding: 0.375rem 0.75rem; font-size: 0.8125rem; }

    .chip-default {
      background: var(--ui-surface-elevated, #f3f4f6);
      color: var(--ui-text, #1f2937);
    }

    .chip-primary {
      background: var(--ui-primary-50, #efe7ef);
      color: var(--ui-primary-500, #793576);
    }

    .chip-secondary {
      background: var(--ui-secondary-50, #e6f7fc);
      color: var(--ui-secondary-500, #23a7d4);
    }

    .chip-success {
      background: var(--ui-success-light, #d1fae5);
      color: var(--ui-success, #10b981);
    }

    .chip-warning {
      background: var(--ui-warning-light, #fef3c7);
      color: var(--ui-warning, #f59e0b);
    }

    .chip-error {
      background: var(--ui-error-light, #fee2e2);
      color: var(--ui-error, #dc2626);
    }

    .chip-info {
      background: var(--ui-info-light, #e0f2fe);
      color: var(--ui-info, #0ea5e9);
    }

    .chip-outline {
      background: transparent;
      border-color: var(--ui-border, #e5e7eb);
      color: var(--ui-text, #1f2937);
    }

    .chip-interactive {
      cursor: pointer;
    }

    .chip-interactive:hover {
      filter: brightness(0.95);
    }

    .chip-interactive:focus {
      outline: none;
      box-shadow: var(--ui-focus-ring, 0 0 0 3px rgba(121, 53, 118, 0.15));
    }

    .chip-selected {
      background: var(--ui-primary-500, #793576);
      color: white;
    }

    .chip-icon {
      font-size: 0.875rem;
    }

    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      margin-left: 0.125rem;
      padding: 0;
      background: none;
      border: none;
      border-radius: 50%;
      font-size: 0.875rem;
      color: currentColor;
      opacity: 0.7;
      cursor: pointer;
      transition: all 100ms ease;
    }

    .chip-remove:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.1);
    }

    /* Dark mode */
    :host-context(html.dark) .chip-default,
    :host-context([data-theme="dark"]) .chip-default {
      background: var(--ui-surface-section, #374151);
    }

    :host-context(html.dark) .chip-primary,
    :host-context([data-theme="dark"]) .chip-primary {
      background: rgba(121, 53, 118, 0.2);
      color: var(--ui-primary-200, #bc9abb);
    }

    :host-context(html.dark) .chip-secondary,
    :host-context([data-theme="dark"]) .chip-secondary {
      background: rgba(35, 167, 212, 0.2);
      color: #85d3ef;
    }

    :host-context(html.dark) .chip-success,
    :host-context([data-theme="dark"]) .chip-success {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }

    :host-context(html.dark) .chip-warning,
    :host-context([data-theme="dark"]) .chip-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
    }

    :host-context(html.dark) .chip-error,
    :host-context([data-theme="dark"]) .chip-error {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    :host-context(html.dark) .chip-info,
    :host-context([data-theme="dark"]) .chip-info {
      background: rgba(14, 165, 233, 0.2);
      color: #7dd3fc;
    }

    :host-context(html.dark) .chip-outline,
    :host-context([data-theme="dark"]) .chip-outline {
      border-color: var(--ui-border, #374151);
    }

    :host-context(html.dark) .chip-selected,
    :host-context([data-theme="dark"]) .chip-selected {
      background: var(--ui-primary-200, #bc9abb);
      color: #1f2937;
    }
  `]
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'default';
  @Input() size: ChipSize = 'md';
  @Input() icon?: string;
  @Input() removable = false;
  @Input() clickable = false;
  @Input() selected = false;

  @Output() chipClick = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onClick() {
    if (this.clickable) {
      this.chipClick.emit();
    }
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit();
  }
}
