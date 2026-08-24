import { Component, signal, ContentChildren, QueryList, AfterContentInit, ElementRef, ViewChild, HostBinding, input, output } from '@angular/core';


/**
 * Individual tab content panel.
 * Must be used as child of `app-tabs`.
 */
@Component({
  selector: 'app-tab',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styleUrl: './tab.component.css'
})
export class TabComponent {
  /** Tab label displayed in the header */
  readonly label = input('');
  /** Emoji icon (optional) */
  readonly icon = input<string>();
  /** CSS icon class (e.g., FontAwesome) */
  readonly iconClass = input<string>();
  /** Whether this tab is disabled */
  readonly disabled = input(false);

  @HostBinding('class.active') active = false;
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
  imports: [],
  template: `
    <div class="tabs-container">
      <div class="tabs-header" #tabsHeader role="tablist" aria-label="Tabs">
        @for (tab of tabs; track tab.label(); let i = $index) {
          <button 
            type="button"
            class="tab-button"
            role="tab"
            [id]="'tab-' + i"
            [attr.aria-selected]="activeIndex() === i"
            [attr.aria-controls]="'tabpanel-' + i"
            [attr.tabindex]="activeIndex() === i ? 0 : -1"
            [class.active]="activeIndex() === i"
            [class.disabled]="tab.disabled()"
            (click)="!tab.disabled() && selectTab(i, $event)"
          >
            @if (tab.iconClass()) {
              <i [class]="tab.iconClass()" class="tab-icon" aria-hidden="true"></i>
            } @else if (tab.icon()) {
              <span class="tab-icon" aria-hidden="true">{{ tab.icon() }}</span>
            }
            {{ tab.label() }}
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
  styleUrl: './tabs.component.css'
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;
  readonly defaultIndex = input(0);
  readonly tabChange = output<number>();

  activeIndex = signal(0);
  tabs: TabComponent[] = [];

  @ViewChild('tabsHeader', { static: false }) tabsHeader!: ElementRef<HTMLElement>;

  ngAfterContentInit() {
    this.tabs = this.tabComponents.toArray();
    this.activeIndex.set(this.defaultIndex());
    this.updateTabs();
  }

  private updateTabs() {
    this.tabs.forEach((tab, i) => tab.active = i === this.activeIndex());
  }

  selectTab(index: number, event?: MouseEvent) {
    this.activeIndex.set(index);
    this.updateTabs();
    this.tabChange.emit(index);

    // Auto-scroll horizontalmente (sin afectar scroll vertical del padre)
    if (event?.target && this.tabsHeader) {
      const button = event.target as HTMLElement;
      const container = this.tabsHeader.nativeElement;

      // Calcular posición para centrar el botón
      const scrollLeft = button.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    }
  }
}
