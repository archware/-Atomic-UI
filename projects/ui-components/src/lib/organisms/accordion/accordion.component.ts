import { Component, Input, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="accordion-item" [class.open]="isOpen()">
      <button type="button" class="accordion-header" (click)="toggle()" (keydown.enter)="toggle()" (keydown.space)="toggle()">
        <span class="accordion-title">{{ title }}</span>
        <span class="accordion-icon">
          <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem;"></i>
        </span>
      </button>
      <div class="accordion-content">
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
      border-color: var(--border-color, #4b5563);
      background: var(--surface-background, #1f2937);
    }

    :host-context(html.dark) .accordion-content,
    :host-context([data-theme="dark"]) .accordion-content {
      background: var(--surface-background, #1f2937);
    }

    :host-context(html.dark) .accordion-header,
    :host-context([data-theme="dark"]) .accordion-header {
      background: var(--surface-section, #374151);
      color: #f3f4f6;
    }

    :host-context(html.dark) .accordion-item.open .accordion-header,
    :host-context([data-theme="dark"]) .accordion-item.open .accordion-header {
      border-bottom-color: var(--border-color, #4b5563);
      background: #4b5563;
      color: #ffffff; /* Changed from purple to white for better visibility */
    }

    :host-context(html.dark) .accordion-header:hover,
    :host-context([data-theme="dark"]) .accordion-header:hover {
      background: #4b5563;
    }

    :host-context(html.dark) .accordion-body,
    :host-context([data-theme="dark"]) .accordion-body {
      color: #e5e7eb; /* Light gray text for better readability on dark bg */
    }
  `]
})
export class AccordionItemComponent {
  @Input() title = '';
  @Input() set open(value: boolean) {
    this.isOpen.set(value);
  }

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
