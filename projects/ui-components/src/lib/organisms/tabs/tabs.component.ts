import { Component, Input, Output, EventEmitter, signal, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`:host { display: block; }`]
})
export class TabComponent {
  @Input() label = '';
  @Input() icon?: string;
  @Input() disabled = false;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container">
      <div class="tabs-header">
        @for (tab of tabs; track tab.label; let i = $index) {
          <button 
            class="tab-button"
            [class.active]="activeIndex() === i"
            [class.disabled]="tab.disabled"
            (click)="!tab.disabled && selectTab(i)"
          >
            @if (tab.icon) {
              <span class="tab-icon">{{ tab.icon }}</span>
            }
            {{ tab.label }}
          </button>
        }
      </div>
      <div class="tabs-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      width: 100%;
    }

    .tabs-header {
      display: flex;
      position: relative;
      border-bottom: 2px solid var(--border-color, #e5e7eb);
      margin-bottom: 1.5rem; /* Increased spacing */
      gap: 0.5rem; /* Space between tabs if using background */
    }

    .tab-button {
      flex: 1;
      padding: 1rem 1.25rem; /* Larger touch area */
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent; /* Prepare for border transition */
      margin-bottom: -2px; /* Overlap bottom border */
      font-size: 1rem; /* Larger text */
      font-weight: 500;
      color: var(--text-color-secondary, #6b7280);
      cursor: pointer;
      transition: all 200ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: 0.5rem 0.5rem 0 0; /* Rounded top */
    }

    .tab-button:hover:not(.disabled) {
      color: var(--primary-color, #793576);
      background: var(--surface-elevated, #f3f4f6);
    }

    .tab-button.active {
      color: var(--primary-color, #793576);
      font-weight: 700; /* Bold active state */
      border-bottom-color: var(--primary-color, #793576);
      background: var(--surface-elevated, #f9fafb); /* Subtle background for active */
    }

    .tab-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-icon {
      font-size: 1.125rem; /* Larger icon */
    }

    /* Indicator lines up with active tab border */
    .tab-indicator {
      display: none; /* Removed in favor of border-bottom on button */
    }

    .tabs-content {
      padding: 1rem;
      background: var(--surface-background, #ffffff);
      border-radius: 0 0 0.5rem 0.5rem;
      border: 1px solid var(--border-color, #e5e7eb); /* Enclose content */
      border-top: none; /* Connect to header */
    }

    /* Dark mode - improved */
    :host-context(.dark) .tabs-header,
    :host-context(html.dark) .tabs-header,
    :host-context([data-theme="dark"]) .tabs-header {
      border-color: #4b5563;
    }

    :host-context(.dark) .tab-button,
    :host-context(html.dark) .tab-button,
    :host-context([data-theme="dark"]) .tab-button {
      color: #9ca3af;
    }

    :host-context(.dark) .tab-button:hover:not(.disabled),
    :host-context(html.dark) .tab-button:hover:not(.disabled),
    :host-context([data-theme="dark"]) .tab-button:hover:not(.disabled) {
      color: #d8b4d8;
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(.dark) .tab-button.active,
    :host-context(html.dark) .tab-button.active,
    :host-context([data-theme="dark"]) .tab-button.active {
      color: #ffffff;
      background: #374151;
      border-bottom-color: #bc9abb;
    }

    :host-context(.dark) .tabs-content,
    :host-context(html.dark) .tabs-content,
    :host-context([data-theme="dark"]) .tabs-content {
      color: #e5e7eb;
      background: #1f2937;
      border-color: #4b5563;
    }
  `]
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;
  @Input() defaultIndex = 0;
  @Output() tabChange = new EventEmitter<number>();

  activeIndex = signal(0);
  tabs: TabComponent[] = [];

  ngAfterContentInit() {
    this.tabs = this.tabComponents.toArray();
    this.activeIndex.set(this.defaultIndex);
  }

  selectTab(index: number) {
    this.activeIndex.set(index);
    this.tabChange.emit(index);
  }
}
