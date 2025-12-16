import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Individual accordion item with collapsible content.
 * Must be used as child of `app-accordion`.
 * 
 * @example
 * ```html
 * <app-accordion-item title="Question 1" [open]="true">
 *   Answer to question 1
 * </app-accordion-item>
 * ```
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="accordion-item" [class.open]="isOpen()">
      <button 
        type="button" 
        class="accordion-header" 
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="'accordion-content-' + id"
        (click)="toggle()"
      >
        <span class="accordion-title">{{ title }}</span>
        <span class="accordion-icon" aria-hidden="true">
          <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem;"></i>
        </span>
      </button>
      <div 
        class="accordion-content"
        [id]="'accordion-content-' + id"
        role="region"
        [attr.aria-labelledby]="'accordion-header-' + id"
      >
        <div class="accordion-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accordion-item {
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 0.5rem;
      overflow: hidden;
      background: var(--surface-background, #ffffff);
    }

    .accordion-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--surface-section, #f3f4f6); /* Slightly darker than content */
      border: none;
      border-bottom: 1px solid transparent; /* Prepare for transition */
      cursor: pointer;
      font-size: 0.9375rem; /* Reverted size as requested */
      font-weight: 600;
      color: #000000;
      transition: all 150ms ease;
    }

    .accordion-item.open .accordion-header {
      border-bottom-color: var(--border-color, #e5e7eb);
      background: #e5e7eb; /* Darker background (~10% darker than previous #f3f4f6) */
      color: var(--primary-color, #793576);
    }

    .accordion-header:hover {
      background: #e5e7eb;
    }

    .accordion-icon {
      color: var(--text-color-muted, #6b7280);
      transition: transform 300ms ease;
    }

    .accordion-item.open .accordion-icon {
      transform: rotate(180deg);
      color: var(--primary-color, #793576);
    }

    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 300ms ease;
      background: var(--surface-background, #ffffff);
    }

    .accordion-item.open .accordion-content {
      max-height: 500px;
    }

    .accordion-body {
      padding: 1.25rem;
      font-size: 0.875rem;
      color: var(--text-color-secondary, #4b5563);
      line-height: 1.6;
    }

    /* Dark mode */
    :host-context(html.dark) .accordion-item,
    :host-context([data-theme="dark"]) .accordion-item {
      border-color: var(--border-color);
      background: var(--surface-background);
    }

    :host-context(html.dark) .accordion-content,
    :host-context([data-theme="dark"]) .accordion-content {
      background: var(--surface-background);
    }

    :host-context(html.dark) .accordion-header,
    :host-context([data-theme="dark"]) .accordion-header {
      background: var(--surface-section);
      color: var(--text-color);
    }

    :host-context(html.dark) .accordion-item.open .accordion-header,
    :host-context([data-theme="dark"]) .accordion-item.open .accordion-header {
      border-bottom-color: var(--border-color);
      background: var(--hover-background);
      color: var(--primary-color);
    }

    :host-context(html.dark) .accordion-header:hover,
    :host-context([data-theme="dark"]) .accordion-header:hover {
      background: var(--hover-background);
    }

    :host-context(html.dark) .accordion-body,
    :host-context([data-theme="dark"]) .accordion-body {
      color: var(--text-color);
    }
  `]
})
export class AccordionItemComponent {
  /** Title displayed in the accordion header */
  @Input() title = '';
  /** Whether the accordion item is initially open */
  @Input() set open(value: boolean) {
    this.isOpen.set(value);
  }

  /** Unique ID for ARIA attributes */
  readonly id = Math.random().toString(36).substring(2, 9);

  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="accordion" [class.accordion-flush]="flush">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .accordion {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .accordion-flush {
      gap: 0;
    }

    .accordion-flush ::ng-deep .accordion-item {
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .accordion-flush ::ng-deep .accordion-item:first-child {
      border-top: none;
    }
  `]
})
export class AccordionComponent {
  @Input() flush = false;
}
