import { Component, signal, ContentChildren, QueryList, AfterContentInit, ElementRef, ViewChild, HostBinding, input, output } from '@angular/core';


/**
 * Individual tab content panel.
 * Must be used as child of `app-tabs`.
 */
@Component({
  selector: 'app-tab',
  standalone: true,
  styleUrl: './tab.component.css',
    templateUrl: './tab-component.component.html'
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

  /**
   * Estado de activación gobernado por el contenedor `app-tabs`.
   *
   * ES UN SIGNAL, NO UNA PROPIEDAD PLANA, A PROPÓSITO: el panel se muestra u
   * oculta con la clase `active` del host, y un host binding solo se
   * re-evalúa cuando Angular tiene un motivo para repintar. Con Zone.js el
   * motivo lo daba cualquier evento; en una aplicación zoneless la mutación
   * imperativa de una propiedad plana no notifica a nadie y el panel queda
   * muerto. Leer el signal dentro del host binding registra la dependencia y
   * programa el repintado en ambos mundos.
   */
  readonly active = signal(false);

  @HostBinding('class.active')
  get isActive(): boolean {
    return this.active();
  }
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
  styleUrl: './tabs.component.css',
    templateUrl: './tabs.component.html'
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;
  readonly defaultIndex = input(0);
  /** Accessible name of the tablist; translate it per application. */
  readonly ariaLabel = input('Tabs');
  /** Tablist orientation; decides which arrow pair traverses the tabs. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
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
    this.tabs.forEach((tab, i) => tab.active.set(i === this.activeIndex()));
  }

  /**
   * Keyboard navigation for the tablist, per WAI-ARIA APG: arrows move between
   * tabs with automatic activation, Home and End jump to the ends. Disabled
   * tabs are skipped and the traversal wraps around.
   */
  onHeaderKeydown(event: KeyboardEvent) {
    if (this.tabs.length === 0) {
      return;
    }

    // A shortcut belongs to the browser or the OS, never to the tablist:
    // Alt+Arrow navigates history and Ctrl+Home reaches the top of the page.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // APG assigns Left/Right to a horizontal tablist and Up/Down to a vertical
    // one. Claiming the other pair would cancel the page's own scrolling.
    const vertical = this.orientation() === 'vertical';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';

    const current = this.activeIndex();
    let target: number | null = null;

    switch (event.key) {
      case nextKey:
        target = this.findEnabled(current + 1, 1);
        break;
      case previousKey:
        target = this.findEnabled(current - 1, -1);
        break;
      case 'Home':
        target = this.findEnabled(0, 1);
        break;
      case 'End':
        target = this.findEnabled(this.tabs.length - 1, -1);
        break;
      default:
        return;
    }

    if (target === null || target === current) {
      return;
    }

    event.preventDefault();
    this.selectTab(target);
    this.focusTab(target);
  }

  /** First enabled tab from `start` in the given direction, wrapping around. */
  private findEnabled(start: number, direction: 1 | -1): number | null {
    const total = this.tabs.length;
    for (let step = 0; step < total; step++) {
      const index = (((start + step * direction) % total) + total) % total;
      if (!this.tabs[index].disabled()) {
        return index;
      }
    }
    return null;
  }

  /** Moves real focus to the tab button so keyboard traversal stays alive. */
  private focusTab(index: number) {
    const button = this.tabsHeader?.nativeElement.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    button?.focus();
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
