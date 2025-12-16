import { Component, Input, Output, EventEmitter, signal, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Individual tab content panel.
 * Must be used as child of `app-tabs`.
 */
@Component({
  selector: 'app-tab',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [`:host { display: block; }`]
})
export class TabComponent {
  /** Tab label displayed in the header */
  @Input() label = '';
  /** Emoji icon (optional) */
  @Input() icon?: string;
  /** CSS icon class (e.g., FontAwesome) */
  @Input() iconClass?: string;
  /** Whether this tab is disabled */
  @Input() disabled = false;
}

/**
 * Tab container component for organizing content into tabbed sections.
 * 
 * @example
 * ```html
 * <app-tabs (tabChange)="onTabChange($event)">
 *   <app-tab label="General" icon="⚙️">Content 1</app-tab>
 *   <app-tab label="Profile" icon="👤">Content 2</app-tab>
 *   <app-tab label="Disabled" [disabled]="true">Disabled content</app-tab>
 * </app-tabs>
 * ```
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container">
      <div class="tabs-header" role="tablist" aria-label="Tabs">
        @for (tab of tabs; track tab.label; let i = $index) {
          <button 
            type="button"
            class="tab-button"
            role="tab"
            [id]="'tab-' + i"
            [attr.aria-selected]="activeIndex() === i"
            [attr.aria-controls]="'tabpanel-' + i"
            [attr.tabindex]="activeIndex() === i ? 0 : -1"
            [class.active]="activeIndex() === i"
            [class.disabled]="tab.disabled"
            (click)="!tab.disabled && selectTab(i)"
          >
            @if (tab.iconClass) {
              <i [class]="tab.iconClass" class="tab-icon" aria-hidden="true"></i>
            } @else if (tab.icon) {
              <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
            }
            {{ tab.label }}
          </button>
        }
      </div>
      <div 
        class="tabs-content"
        role="tabpanel"
        [id]="'tabpanel-' + activeIndex()"
        [attr.aria-labelledby]="'tab-' + activeIndex()"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    /* ... (previous styles omitted) ... */
    
    .tabs-container {
      width: 100%;
    }

    .tabs-header {
      display: flex;
      position: relative;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      margin-bottom: 1.5rem;
      gap: 6px; /* User Request: 6px gap */
    }

    .tab-button {
      flex: 1;
      padding: 1rem 1.25rem;
      
      /* Base Style (Inactive): Visible background to show gap */
      background: var(--surface-ground, #f9fafb); 
      border: 1px solid var(--border-color-strong, #9ca3af); /* Stronger border */
      border-bottom: none; 
      
      margin-bottom: -1px;
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 200ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border-radius: 0.5rem 0.5rem 0 0;
    }

    /* Hover state */
    .tab-button:not(.disabled):not(.active):hover {
      color: var(--primary-color);
      background: var(--hover-background-subtle);
      border-color: var(--primary-color);
    }

    /* Pressed state effects (User Request) */
    .tab-button:active {
      box-shadow: inset 0 1px 0 hsl(224, 84%, 74%), 
                  0 1px 3px hsla(0, 0%, 0%, 0.2);
    }

    .tab-button.active {
      color: var(--text-color);
      font-weight: 600;
      background: var(--surface-background);
      
      /* Active: Thick Top Border + Sides matching content border */
      border-top: 3px solid var(--primary-color);
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--surface-background); /* Merge with content */
    }

    .tab-button.disabled {
      cursor: not-allowed;
      /* Disabled: Distinct gray background + Border */
      background: var(--surface-section);
      border: 1px solid var(--border-color);
      border-bottom: none;
      opacity: 0.7;
      color: var(--text-color-muted);
    }

    .tab-icon {
      font-size: 1.125rem;
    }

    .tabs-content {
      padding: 1rem;
      background: var(--surface-background);
      border-radius: 0 0 0.5rem 0.5rem;
      border: 1px solid var(--border-color);
      border-top: none;
    }

    /* Dark mode overrides (Tokenized) */
    :host-context(.dark) .tabs-header,
    :host-context(html.dark) .tabs-header,
    :host-context([data-theme="dark"]) .tabs-header {
      border-color: var(--border-color);
    }

    :host-context(.dark) .tab-button,
    :host-context(html.dark) .tab-button,
    :host-context([data-theme="dark"]) .tab-button {
      color: var(--text-color-secondary);
      background: var(--surface-sunken);
      border-color: var(--border-color-strong); /* Stronger border in dark mode */
    }

    :host-context(.dark) .tab-button:not(.disabled):not(.active):hover,
    :host-context(html.dark) .tab-button:not(.disabled):not(.active):hover,
    :host-context([data-theme="dark"]) .tab-button:not(.disabled):not(.active):hover {
      color: var(--primary-color);
      background: var(--hover-background-subtle);
      border-color: var(--primary-color);
    }

    :host-context(.dark) .tab-button.active,
    :host-context(html.dark) .tab-button.active,
    :host-context([data-theme="dark"]) .tab-button.active {
      color: var(--text-color);
      background: var(--surface-background);
      
      border-top-color: var(--primary-color);
      border-left-color: var(--border-color);
      border-right-color: var(--border-color);
      border-bottom-color: var(--surface-background);
    }
    
    :host-context(.dark) .tab-button.disabled,
    :host-context(html.dark) .tab-button.disabled,
    :host-context([data-theme="dark"]) .tab-button.disabled {
       background: var(--surface-section);
       border-color: var(--border-color);
       color: var(--text-color-muted);
    }

    :host-context(.dark) .tabs-content,
    :host-context(html.dark) .tabs-content,
    :host-context([data-theme="dark"]) .tabs-content {
      color: var(--text-color);
      background: var(--surface-background);
      border-color: var(--border-color);
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
