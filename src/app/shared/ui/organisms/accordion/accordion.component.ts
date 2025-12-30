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
          <i class="fa-solid fa-chevron-down"></i>
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
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--surface-background);
    }

    .accordion-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      background: var(--surface-section);
      border: none;
      border-bottom: 1px solid transparent;
      cursor: pointer;
      font-size: var(--text-md);
      font-weight: 600;
      color: var(--text-color);
      transition: all 150ms ease;
    }

    .accordion-item.open .accordion-header {
      border-bottom-color: var(--border-color);
      background: var(--hover-background);
      color: var(--primary-color);
    }

    .accordion-header:hover {
      background: var(--hover-background);
    }

    .accordion-icon {
      font-size: var(--text-xs);
      color: var(--text-color-muted);
      transition: transform 300ms ease;
    }

    .accordion-item.open .accordion-icon {
      transform: rotate(180deg);
      color: var(--primary-color);
    }

    .accordion-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 300ms ease;
      background: var(--surface-background);
    }

    .accordion-item.open .accordion-content {
      max-height: 500px;
    }

    .accordion-body {
      padding: var(--space-5);
      font-size: var(--text-sm);
      color: var(--text-color-secondary);
      line-height: 1.6;
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-background, --border-color, --hover-background, --primary-color
     * ya tienen valores apropiados para temas oscuros.
     */
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
      gap: var(--space-2);
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
