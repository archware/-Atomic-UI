import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core';

type ListenerUnsubscriber = () => void;

@Component({
  selector: 'app-scroll-overlay',
  standalone: true,
  templateUrl: './scroll-overlay.component.html',
  styleUrl: './scroll-overlay.component.css',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'so-root'
  }
})
export class ScrollOverlayComponent implements AfterViewInit, OnDestroy {
  /**
   * CSS selector used to locate the element that controls the vertical scroll.
   * Defaults to the first <tbody> found within the component's content.
   */
  @Input() verticalSelector: string | null = '[data-scroll-overlay-vertical], tbody';

  /**
   * CSS selector used to locate the element that controls horizontal scroll.
   * Defaults to the internal scroll area wrapper.
   */
  @Input() horizontalSelector: string | null = '[data-scroll-overlay-horizontal]';

  /** Minimum size (in px) for the scrollbar thumbs. */
  @Input() minThumbSize = 28;

  /** Thickness (in px) of the overlay tracks. */
  @Input() trackSize = 7;

  /** Delay (in ms) before auto-hiding the scrollbars after interaction. */
  @Input() autoHideDelay = 800;

  /** When true, the component will not override a custom --so-column-template value. */
  private _lockColumnTemplate = false;
  private _columnTemplate: string | null = null;

  /**
   * When true, the component will keep any user-provided column template intact and will not
   * attempt to measure and override column widths automatically.
   */
  @Input()
  set lockColumnTemplate(value: boolean) {
    const coerced = !!value;
    this._lockColumnTemplate = coerced;
    if (this.hostEl) {
      this.hostEl.classList.toggle('so-lock-template', coerced);
      if (coerced && this._columnTemplate) {
        this.applyColumnTemplate();
      } else if (!coerced && !this._columnTemplate) {
        this.hostEl.style.removeProperty('--so-column-template');
      }
      this.syncGeometry();
    }
  }
  get lockColumnTemplate(): boolean {
    return this._lockColumnTemplate;
  }

  /** Custom grid template columns definition applied when locking the template. */
  @Input()
  set columnTemplate(value: string | null | undefined) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    const template = normalized ? normalized : null;
    if (this._columnTemplate === template) {
      return;
    }
    this._columnTemplate = template;
    if (this.hostEl) {
      this.applyColumnTemplate();
      this.syncGeometry();
    }
  }
  get columnTemplate(): string | null {
    return this._columnTemplate;
  }

  /**
   * When true the component will measure table columns (thead/tbody) to keep header and body aligned.
   */
  @Input() syncTableColumns = true;

  /**
   * When true, skip auto-detection of tbody and use the internal scroll area directly.
   * Useful for layout containers that should NOT control nested table scrolls.
   */
  @Input() skipTableDetection = false;

  /** Minimum width (in px) applied when syncing table columns. */
  @Input()
  set minColumnWidth(value: number) {
    const parsed = Number(value);
    this._minColumnWidth = Number.isFinite(parsed) && parsed > 0 ? parsed : 140;
    this.applyMinColumnWidth();
    if (this.hostEl) {
      this.syncGeometry();
    }
  }
  get minColumnWidth(): number {
    return this._minColumnWidth;
  }

  /** Provide a max height for the vertical scroller (number in px or any CSS size). */
  @Input()
  set maxBodyHeight(value: number | string | null | undefined) {
    const parsed = typeof value === 'string' ? value.trim() : value;
    this._maxBodyHeight = parsed === '' || parsed === null || parsed === undefined ? undefined : parsed;
    this.applyMaxHeight();
    if (this.hostEl) {
      this.syncGeometry();
    }
  }
  get maxBodyHeight(): number | string | null | undefined {
    return this._maxBodyHeight;
  }

  /** Disable the custom vertical overlay. */
  @Input()
  set disableVertical(value: boolean) {
    this._disableVertical = value;
    if (this.hostEl) {
      this.hostEl.classList.toggle('so-no-vertical', !!value);
      if (value) {
        this.hostEl.classList.remove('so-has-overflow-y');
      }
      this.updateThumbs();
      this.updateScrollAreaOverflow();
    }
  }
  get disableVertical(): boolean {
    return this._disableVertical;
  }

  /** Disable the custom horizontal overlay. */
  @Input()
  set disableHorizontal(value: boolean) {
    this._disableHorizontal = value;
    if (this.hostEl) {
      this.hostEl.classList.toggle('so-no-horizontal', !!value);
      if (value) {
        this.hostEl.classList.remove('so-has-overflow-x');
      }
      this.updateThumbs();
    }
  }
  get disableHorizontal(): boolean {
    return this._disableHorizontal;
  }

  @ViewChild('scrollArea', { static: true }) private scrollAreaRef!: ElementRef<HTMLElement>;
  @ViewChild('barY', { static: true }) private barYRef!: ElementRef<HTMLElement>;
  @ViewChild('barX', { static: true }) private barXRef!: ElementRef<HTMLElement>;
  @ViewChild('thumbY', { static: true }) private thumbYRef!: ElementRef<HTMLElement>;
  @ViewChild('thumbX', { static: true }) private thumbXRef!: ElementRef<HTMLElement>;

  private readonly listeners: ListenerUnsubscriber[] = [];
  private readonly isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  private readonly horizontalBarGap = 3;
  private readonly verticalBarGap = 10;

  private hostEl!: HTMLElement;
  private verticalScroller?: HTMLElement;
  private horizontalScroller?: HTMLElement;
  private tableHead?: HTMLElement | null;
  private headerRow?: HTMLElement | null;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private verticalThumbSize = this.minThumbSize;
  private horizontalThumbSize = this.minThumbSize;
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  private draggingY = false;
  private draggingX = false;
  private dragStartClientY = 0;
  private dragStartClientX = 0;
  private dragStartScrollTop = 0;
  private dragStartScrollLeft = 0;
  private dragPointerIdY?: number;
  private dragPointerIdX?: number;

  private _maxBodyHeight: number | string | undefined;
  private _minColumnWidth = 140;
  private _disableVertical = false;
  private _disableHorizontal = false;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.hostEl = this.elementRef.nativeElement;
    this.hostEl.style.setProperty('--so-track-size', `${this.trackSize}px`);
    this.hostEl.classList.toggle('so-lock-template', this._lockColumnTemplate);
    this.applyMinColumnWidth();
    this.applyColumnTemplate();
    this.resolveScrollElements(true);
    this.applyMaxHeight();
    if (!this.horizontalScroller) {
      this.horizontalScroller = this.scrollAreaRef.nativeElement;
    }

    if (this.disableVertical) {
      this.hostEl.classList.add('so-no-vertical');
    }
    if (this.disableHorizontal) {
      this.hostEl.classList.add('so-no-horizontal');
    }

    this.attachListeners();
    this.syncGeometry();
    this.showBar();
  }

  ngOnDestroy(): void {
    this.clearHideTimer();
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.length = 0;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.verticalScroller?.hasAttribute('data-so-vertical-temp')) {
      this.verticalScroller.removeAttribute('data-so-vertical');
      this.verticalScroller.removeAttribute('data-so-vertical-temp');
    }
    if (this.horizontalScroller?.hasAttribute('data-so-horizontal-temp')) {
      this.horizontalScroller.removeAttribute('data-so-horizontal');
      this.horizontalScroller.removeAttribute('data-so-horizontal-temp');
    }
  }

  private applyMinColumnWidth(): void {
    if (!this.hostEl) {
      return;
    }
    this.hostEl.style.setProperty('--so-min-column-width', `${this._minColumnWidth}px`);
  }

  private applyColumnTemplate(): void {
    if (!this.hostEl) {
      return;
    }

    if (this._columnTemplate) {
      this.hostEl.style.setProperty('--so-column-template', this._columnTemplate);
    } else if (!this._lockColumnTemplate) {
      this.hostEl.style.removeProperty('--so-column-template');
    }
  }

  private applyMaxHeight(): void {
    if (!this.hostEl) {
      return;
    }

    const value = this.normalizeCssSize(this._maxBodyHeight);
    if (!value) {
      this.hostEl.removeAttribute('data-so-max-height');
      this.hostEl.style.removeProperty('--so-max-height');
      this.hostEl.style.removeProperty('--so-body-height');
      this.updateVerticalMaxHeight(null);
      return;
    }

    this.hostEl.setAttribute('data-so-max-height', 'true');
    this.hostEl.style.setProperty('--so-max-height', value);
    this.hostEl.style.setProperty('--so-body-height', value);
    this.updateVerticalMaxHeight(value);
  }

  private resolveScrollElements(_isInitial = false): void {
    const host = this.elementRef.nativeElement;
    host.querySelectorAll('[data-so-horizontal-temp]').forEach((el) => {
      el.removeAttribute('data-so-horizontal');
      el.removeAttribute('data-so-horizontal-temp');
    });
    host.querySelectorAll('[data-so-vertical-temp]').forEach((el) => {
      el.removeAttribute('data-so-vertical');
      el.removeAttribute('data-so-vertical-temp');
      const element = el as HTMLElement;
      element.style.removeProperty('--so-body-height');
      element.style.removeProperty('max-height');
      element.style.removeProperty('height');
      element.style.removeProperty('min-height');
      element.style.removeProperty('display');
      element.style.removeProperty('overflow-y');
      element.style.removeProperty('overflow-x');
      element.style.removeProperty('box-sizing');
    });

    // Helper: Check if element is inside a nested scroll-overlay (not this one)
    const isInsideNestedScrollOverlay = (el: Element): boolean => {
      let parent = el.parentElement;
      while (parent && parent !== host) {
        if (parent.classList.contains('so-root')) {
          return true; // Element is inside a nested scroll-overlay
        }
        parent = parent.parentElement;
      }
      return false;
    };

    // Helper: Find first element matching selector that is NOT inside a nested scroll-overlay
    const searchDirect = (selector: string | null | undefined): HTMLElement | null => {
      if (!selector) {
        return null;
      }
      const parts = selector.split(',').map((part) => part.trim()).filter(Boolean);
      for (const part of parts) {
        const candidates = Array.from(host.querySelectorAll(part)) as HTMLElement[];
        const directMatch = candidates.find((el) => !isInsideNestedScrollOverlay(el));
        if (directMatch) {
          return directMatch;
        }
      }
      return null;
    };

    const scrollArea = this.scrollAreaRef.nativeElement;
    scrollArea.setAttribute('data-so-horizontal', 'true');

    const resolvedHorizontal = searchDirect(this.horizontalSelector);
    this.horizontalScroller = resolvedHorizontal ?? scrollArea;
    if (this.horizontalScroller !== scrollArea) {
      this.horizontalScroller.setAttribute('data-so-horizontal', 'true');
      this.horizontalScroller.setAttribute('data-so-horizontal-temp', 'true');
    } else {
      this.horizontalScroller.removeAttribute('data-so-horizontal-temp');
    }

    let vertical = searchDirect(this.verticalSelector) ?? undefined;
    if (!vertical) {
      // Skip tbody detection if explicitly disabled (for layout containers)
      if (this.skipTableDetection) {
        vertical = scrollArea;
      } else {
        // Find tbody that is a DIRECT descendant (not inside nested scroll-overlay)
        const allTbodies = Array.from(host.querySelectorAll('tbody')) as HTMLElement[];
        const directTbody = allTbodies.find((tbody) => !isInsideNestedScrollOverlay(tbody));
        vertical = directTbody ?? scrollArea;
      }
    }
    this.verticalScroller = vertical ?? undefined;
    if (this.verticalScroller) {
      if (!this.verticalScroller.hasAttribute('data-so-vertical')) {
        this.verticalScroller.setAttribute('data-so-vertical', 'true');
        this.verticalScroller.setAttribute('data-so-vertical-temp', 'true');
      } else {
        this.verticalScroller.removeAttribute('data-so-vertical-temp');
      }
      this.applyVerticalScrollerDefaults();
    }

    // Find table that is a DIRECT descendant (not inside nested scroll-overlay)
    // Skip table detection if explicitly disabled
    if (!this.skipTableDetection) {
      const allTables = Array.from(host.querySelectorAll('table')) as HTMLElement[];
      const directTable = allTables.find((t) => !isInsideNestedScrollOverlay(t));
      this.tableHead = directTable?.querySelector('thead') as HTMLElement | null;
      this.headerRow = this.tableHead?.querySelector('tr') as HTMLElement | null;
    } else {
      this.tableHead = null;
      this.headerRow = null;
    }

    if (this.tableHead && this.verticalScroller?.tagName === 'TBODY') {
      host.setAttribute('data-so-table', 'true');
      if (this.syncTableColumns) {
        host.setAttribute('data-so-sync-columns', 'true');
      } else {
        host.removeAttribute('data-so-sync-columns');
      }
    } else {
      host.removeAttribute('data-so-table');
      host.removeAttribute('data-so-sync-columns');
    }

    this.updateScrollAreaOverflow();
    const value = this.normalizeCssSize(this._maxBodyHeight);
    this.updateVerticalMaxHeight(value);

    this.ensureSingleScrollbar();
  }

  private attachListeners(): void {
    const host = this.hostEl;
    const _barY = this.barYRef.nativeElement;
    const _barX = this.barXRef.nativeElement;
    const thumbY = this.thumbYRef.nativeElement;
    const thumbX = this.thumbXRef.nativeElement;

    const addListener = (
      target: EventTarget,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions
    ) => {
      target.addEventListener(type, listener, options);
      this.listeners.push(() => target.removeEventListener(type, listener, options));
    };

    const vertical = this.verticalScroller;
    const horizontal = this.horizontalScroller;

    const handleScroll = () => {
      this.updateThumbs();
      this.showBar();
    };

    const handlePointer = () => {
      this.updateThumbs();
      this.showBar();
    };

    addListener(host, 'mouseenter', handlePointer);
    addListener(host, 'mouseleave', () => this.hideBar());

    if (!this.disableVertical && vertical) {
      addListener(vertical, 'scroll', handleScroll, { passive: true });
      addListener(vertical, 'wheel', handlePointer, { passive: true });
      addListener(vertical, 'mouseenter', handlePointer);
      addListener(vertical, 'mouseleave', () => this.hideBar());
      addListener(vertical, 'touchstart', handlePointer, { passive: true });
      addListener(vertical, 'touchmove', handlePointer, { passive: true });
    }

    if (!this.disableHorizontal && horizontal) {
      addListener(horizontal, 'scroll', handleScroll, { passive: true });
      addListener(horizontal, 'wheel', handlePointer, { passive: true });
      addListener(horizontal, 'mouseenter', handlePointer);
      addListener(horizontal, 'mouseleave', () => this.hideBar());
      addListener(horizontal, 'touchstart', handlePointer, { passive: true });
      addListener(horizontal, 'touchmove', handlePointer, { passive: true });
    }

    if (!this.disableVertical) {
      addListener(thumbY, 'pointerdown', (event) => this.startDragY(event as PointerEvent));
      addListener(thumbY, 'pointermove', (event) => this.moveDragY(event as PointerEvent));
      addListener(thumbY, 'pointerup', (event) => this.endDragY(event as PointerEvent));
      addListener(thumbY, 'pointercancel', (event) => this.endDragY(event as PointerEvent));
    }

    if (!this.disableHorizontal) {
      addListener(thumbX, 'pointerdown', (event) => this.startDragX(event as PointerEvent));
      addListener(thumbX, 'pointermove', (event) => this.moveDragX(event as PointerEvent));
      addListener(thumbX, 'pointerup', (event) => this.endDragX(event as PointerEvent));
      addListener(thumbX, 'pointercancel', (event) => this.endDragX(event as PointerEvent));
    }

    const supportsResize = typeof ResizeObserver !== 'undefined';
    const supportsMutation = typeof MutationObserver !== 'undefined';

    if (supportsResize) {
      this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.syncGeometry();
        });
      });

      // Observe the host element for container size changes
      this.resizeObserver.observe(this.hostEl);

      if (vertical) {
        this.resizeObserver.observe(vertical);
      }
      if (horizontal && horizontal !== vertical) {
        this.resizeObserver.observe(horizontal);
      }
      const table = this.tableHead?.closest('table');
      if (table) {
        this.resizeObserver.observe(table);
      }
      if (this.headerRow) {
        this.resizeObserver.observe(this.headerRow);
      }
    }

    if (supportsMutation && this.verticalScroller) {
      this.mutationObserver = new MutationObserver(() => this.syncGeometry());
      this.mutationObserver.observe(this.verticalScroller, { childList: true, subtree: true });
    }
  }

  private showBar(): void {
    if (this.disableVertical && this.disableHorizontal) {
      return;
    }

    this.hostEl.classList.add('so-scrolling');
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.hostEl.classList.remove('so-scrolling');
      this.hideTimer = undefined;
    }, this.autoHideDelay);
  }

  private hideBar(): void {
    this.hostEl.classList.remove('so-scrolling');
    this.clearHideTimer();
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  private updateVerticalThumb(): void {
    const vertical = this.verticalScroller;
    const bar = this.barYRef.nativeElement;
    const thumb = this.thumbYRef.nativeElement;

    if (!vertical || this.disableVertical) {
      this.hostEl.classList.remove('so-has-overflow-y');
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = vertical;
    const hasOverflow = scrollHeight > clientHeight + 1;

    if (!hasOverflow) {
      this.hostEl.classList.remove('so-has-overflow-y');
      this.verticalThumbSize = clientHeight;
      thumb.style.height = `${clientHeight}px`;
      thumb.style.transform = 'translateY(0)';
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      return;
    }

    this.hostEl.classList.add('so-has-overflow-y');
    bar.style.opacity = '';
    bar.style.pointerEvents = 'auto';

    const thumbHeight = Math.max(this.minThumbSize, (clientHeight * clientHeight) / scrollHeight);
    this.verticalThumbSize = thumbHeight;
    thumb.style.height = `${thumbHeight}px`;

    const maxThumbOffset = Math.max(1, clientHeight - thumbHeight);
    const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
    const offset = (scrollTop / maxScrollTop) * maxThumbOffset;
    thumb.style.transform = `translateY(${offset}px)`;
  }

  private updateHorizontalThumb(): void {
    const horizontal = this.horizontalScroller;
    const bar = this.barXRef.nativeElement;
    const thumb = this.thumbXRef.nativeElement;

    if (!horizontal || this.disableHorizontal) {
      this.hostEl.classList.remove('so-has-overflow-x');
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = horizontal;
    const hasOverflow = scrollWidth > clientWidth + 1;

    if (!hasOverflow) {
      this.hostEl.classList.remove('so-has-overflow-x');
      this.horizontalThumbSize = clientWidth;
      thumb.style.width = `${clientWidth}px`;
      thumb.style.transform = 'translateX(0)';
      bar.style.opacity = '0';
      bar.style.pointerEvents = 'none';
      return;
    }

    this.hostEl.classList.add('so-has-overflow-x');
    bar.style.opacity = '';
    bar.style.pointerEvents = 'auto';

    const thumbWidth = Math.max(this.minThumbSize, (clientWidth * clientWidth) / scrollWidth);
    this.horizontalThumbSize = thumbWidth;
    thumb.style.width = `${thumbWidth}px`;

    // Calcular el ancho efectivo de la barra cuando la vertical también está activa
    const hasVerticalOverflow = this.hasVerticalScrollOverflow();
    let effectiveBarWidth = clientWidth;
    if (hasVerticalOverflow && !this.disableVertical) {
      effectiveBarWidth = Math.max(0, clientWidth - this.trackSize - this.horizontalBarGap);
    }

    // Usar el ancho efectivo para calcular el offset del thumb
    const maxThumbOffset = Math.max(1, effectiveBarWidth - thumbWidth);
    const maxScrollLeft = Math.max(1, scrollWidth - clientWidth);
    const offset = (scrollLeft / maxScrollLeft) * maxThumbOffset;
    thumb.style.transform = `translateX(${offset}px)`;
  }

  private updateThumbs(): void {
    this.updateVerticalThumb();
    this.updateHorizontalThumb();
  }

  private syncGeometry(): void {
    this.syncColumnTemplate();
    this.updateScrollAreaDimensions();
    const hostRect = this.getSafeRect(this.hostEl);

    // Primero detectar overflow real ANTES de ajustar posiciones
    const hasVerticalOverflow = this.hasVerticalScrollOverflow();
    const hasHorizontalOverflow = this.hasHorizontalScrollOverflow();

    let horizontalRect: DOMRect | null = null;
    let horizontalBarTop: number | null = null;
    if (this.horizontalScroller && !this.disableHorizontal) {
      horizontalRect = this.getSafeRect(this.horizontalScroller);
      horizontalBarTop = horizontalRect.top - hostRect.top + horizontalRect.height - this.trackSize;
    }

    if (this.verticalScroller && !this.disableVertical) {
      const verticalRect = this.getSafeRect(this.verticalScroller);
      const barY = this.barYRef.nativeElement;
      const barTop = verticalRect.top - hostRect.top;
      barY.style.top = `${barTop}px`;

      // Ajustar altura si hay overflow horizontal para evitar colisión
      let barHeight = verticalRect.height;
      if (hasHorizontalOverflow && horizontalBarTop !== null) {
        barHeight = Math.max(0, horizontalBarTop - barTop - this.verticalBarGap);
      }
      barY.style.height = `${barHeight}px`;
    }

    if (horizontalRect && !this.disableHorizontal) {
      const barX = this.barXRef.nativeElement;

      const leftPosition = horizontalRect.left - hostRect.left;
      barX.style.left = `${leftPosition}px`;
      const horizontalBarVisualTop =
        horizontalBarTop ?? horizontalRect.top - hostRect.top + horizontalRect.height - this.trackSize;
      barX.style.top = `${horizontalBarVisualTop}px`;

      // Calcular ancho disponible desde la posición left hasta el borde derecho del host
      let barWidth = hostRect.width - leftPosition;

      if (hasVerticalOverflow && !this.disableVertical) {
        const horizontalInset = this.trackSize + this.horizontalBarGap;
        barWidth = Math.max(0, barWidth - horizontalInset);
      }
      barX.style.width = `${barWidth}px`;
    }

    this.updateThumbs();
  }

  private hasVerticalScrollOverflow(): boolean {
    if (!this.verticalScroller || this.disableVertical) {
      return false;
    }
    const { scrollHeight, clientHeight } = this.verticalScroller;
    return scrollHeight > clientHeight + 1;
  }

  private hasHorizontalScrollOverflow(): boolean {
    if (!this.horizontalScroller || this.disableHorizontal) {
      return false;
    }
    const { scrollWidth, clientWidth } = this.horizontalScroller;
    return scrollWidth > clientWidth + 1;
  }

  private updateVerticalMaxHeight(value: string | null): void {
    if (!this.verticalScroller) {
      return;
    }

    if (!value) {
      this.verticalScroller.style.removeProperty('--so-body-height');
      this.verticalScroller.style.removeProperty('max-height');
      this.verticalScroller.style.removeProperty('height');
      this.verticalScroller.style.removeProperty('min-height');
      return;
    }

    this.verticalScroller.style.setProperty('--so-body-height', value);
    this.verticalScroller.style.maxHeight = value;
    this.verticalScroller.style.height = value;
    this.verticalScroller.style.minHeight = value;
  }

  private updateScrollAreaOverflow(): void {
    const scrollArea = this.scrollAreaRef?.nativeElement;
    if (!scrollArea) {
      return;
    }

    const shouldAllowVerticalScroll =
      this.disableVertical || !this.verticalScroller || this.verticalScroller === scrollArea;
    scrollArea.style.overflowY = shouldAllowVerticalScroll ? 'auto' : 'hidden';
  }

  private applyVerticalScrollerDefaults(): void {
    if (!this.verticalScroller) {
      return;
    }

    if (this.verticalScroller === this.scrollAreaRef.nativeElement) {
      this.verticalScroller.style.overflowY = 'auto';
      return;
    }

    const nodeName = this.verticalScroller.nodeName;
    const style = this.verticalScroller.style;
    if (nodeName === 'TBODY') {
      style.display = 'block';
      style.overflowY = 'auto';
      style.overflowX = 'hidden';
      style.boxSizing = 'border-box';
    }
  }

  private normalizeCssSize(value: number | string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value}px`;
    }

    const stringValue = String(value).trim();
    if (!stringValue) {
      return null;
    }

    const numericPattern = /^-?\d+(?:\.\d+)?$/;
    if (numericPattern.test(stringValue)) {
      return `${stringValue}px`;
    }

    return stringValue;
  }

  private updateScrollAreaDimensions(): void {
    const scrollArea = this.scrollAreaRef?.nativeElement;
    if (!scrollArea) {
      return;
    }

    // Ensure scroll area can expand horizontally but respects container width
    if (this.horizontalScroller === scrollArea) {
      const hostRect = this.getSafeRect(this.hostEl);
      if (hostRect.width > 0) {
        scrollArea.style.maxWidth = '100%';
        scrollArea.style.width = '100%';
      }
    }

    // For table mode, ensure proper width calculation
    if (this.hostEl.hasAttribute('data-so-table')) {
      this.updateTableDimensions();
    }
  }

  private updateTableDimensions(): void {
    const table = this.hostEl.querySelector('table') as HTMLElement;
    if (!table) {
      return;
    }

    // Force table to recalculate its width based on content
    table.style.width = 'max-content';
    table.style.minWidth = '100%';

    // Ensure thead and tbody match the table width
    const thead = table.querySelector('thead') as HTMLElement;
    const tbody = table.querySelector('tbody') as HTMLElement;

    if (thead && tbody) {
      thead.style.width = '100%';
      tbody.style.width = '100%';

      // Force recalculation of grid template after width changes
      requestAnimationFrame(() => {
        this.syncColumnTemplate();
      });
    }
  }

  private ensureSingleScrollbar(): void {
    if (!this.verticalScroller || this.disableVertical) {
      return;
    }

    const host = this.hostEl;
    const scrollableCandidates = Array.from(host.querySelectorAll('[data-so-vertical]')) as HTMLElement[];
    const duplicates = scrollableCandidates.filter((el) => el !== this.verticalScroller);
    duplicates.forEach((el) => {
      if (el.hasAttribute('data-so-vertical-temp')) {
        el.removeAttribute('data-so-vertical');
        el.removeAttribute('data-so-vertical-temp');
      }
      el.style.removeProperty('--so-body-height');
      el.style.removeProperty('max-height');
      el.style.removeProperty('height');
      el.style.removeProperty('min-height');
      el.style.removeProperty('overflow-y');
      el.style.removeProperty('overflow-x');
      el.style.removeProperty('box-sizing');
    });
  }

  private syncColumnTemplate(): void {
    if (!this.syncTableColumns || this._lockColumnTemplate || !this.headerRow || !this.verticalScroller || this.verticalScroller.tagName !== 'TBODY') {
      if (!this._lockColumnTemplate) {
        this.hostEl.style.removeProperty('--so-column-template');
      }
      return;
    }

    const bodyRows = Array.from(this.verticalScroller.querySelectorAll(':scope > tr')) as HTMLElement[];
    const headerCells = Array.from(this.headerRow.children) as HTMLElement[];
    const columnCount = Math.max(
      headerCells.length,
      ...bodyRows.map((row) => row.children.length)
    );

    if (!columnCount) {
      this.hostEl.style.removeProperty('--so-column-template');
      return;
    }

    // Get container width to calculate responsive column sizing
    const containerWidth = this.getSafeRect(this.hostEl).width;
    const availableWidth = Math.max(containerWidth, 300); // Minimum width fallback

    // Calculate base column width considering container constraints
    const baseColumnWidth = Math.max(
      this._minColumnWidth,
      Math.floor((availableWidth - 20) / columnCount) // 20px for scrollbars/padding
    );

    const widths = Array.from({ length: columnCount }, () => baseColumnWidth);

    const updateWidth = (cell: Element, index: number) => {
      const rect = this.getSafeRect(cell);
      const contentWidth = Math.ceil(rect.width);

      // Use content width but respect minimum and don't exceed reasonable maximums
      const calculatedWidth = Math.max(
        this._minColumnWidth,
        Math.min(contentWidth, Math.floor(availableWidth / 2)) // Don't let one column take more than half
      );

      if (calculatedWidth > widths[index]) {
        widths[index] = calculatedWidth;
      }
    };

    headerCells.forEach((cell, index) => updateWidth(cell, index));
    bodyRows.forEach((row) => {
      Array.from(row.children).forEach((cell, index) => updateWidth(cell, index));
    });

    // Ensure total width doesn't exceed container significantly
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    if (totalWidth > availableWidth * 1.5) {
      // Scale down proportionally if too wide
      const scale = (availableWidth * 1.3) / totalWidth;
      widths.forEach((width, index) => {
        widths[index] = Math.max(this._minColumnWidth, Math.floor(width * scale));
      });
    }

    const template = widths.map((width) => `${width}px`).join(' ');
    this.hostEl.style.setProperty('--so-column-template', template);
  }

  private getSafeRect(element: Element | null): DOMRect {
    if (element && typeof (element as HTMLElement).getBoundingClientRect === 'function') {
      return (element as HTMLElement).getBoundingClientRect();
    }

    const fallback = element as HTMLElement | null;
    const width = fallback?.offsetWidth ?? 0;
    const height = fallback?.offsetHeight ?? 0;

    return {
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      width,
      height,
      x: 0,
      y: 0,
      toJSON() {
        return '';
      }
    } as DOMRect;
  }

  private startDragY(event: PointerEvent): void {
    if (event.button === 1 || event.button === 2 || !this.verticalScroller || this.disableVertical) {
      return;
    }

    this.draggingY = true;
    this.dragPointerIdY = event.pointerId;
    this.dragStartClientY = event.clientY;
    this.dragStartScrollTop = this.verticalScroller.scrollTop;
    this.thumbYRef.nativeElement.setPointerCapture(event.pointerId);
    this.showBar();
    event.preventDefault();
  }

  private moveDragY(event: PointerEvent): void {
    if (!this.draggingY || !this.verticalScroller || this.disableVertical) {
      return;
    }

    const maxScrollTop = Math.max(1, this.verticalScroller.scrollHeight - this.verticalScroller.clientHeight);
    const maxThumbOffset = Math.max(1, this.verticalScroller.clientHeight - this.verticalThumbSize);
    const delta = event.clientY - this.dragStartClientY;
    const scrollDelta = (delta * maxScrollTop) / maxThumbOffset;
    this.verticalScroller.scrollTop = this.dragStartScrollTop + scrollDelta;
    this.showBar();
    event.preventDefault();
  }

  private endDragY(_event: PointerEvent): void {
    if (!this.draggingY) {
      return;
    }

    this.draggingY = false;
    if (this.dragPointerIdY !== undefined && this.thumbYRef.nativeElement.hasPointerCapture?.(this.dragPointerIdY)) {
      this.thumbYRef.nativeElement.releasePointerCapture(this.dragPointerIdY);
    }
    this.dragPointerIdY = undefined;
    this.showBar();
  }

  private startDragX(event: PointerEvent): void {
    if (event.button === 1 || event.button === 2 || !this.horizontalScroller || this.disableHorizontal) {
      return;
    }

    this.draggingX = true;
    this.dragPointerIdX = event.pointerId;
    this.dragStartClientX = event.clientX;
    this.dragStartScrollLeft = this.horizontalScroller.scrollLeft;
    this.thumbXRef.nativeElement.setPointerCapture(event.pointerId);
    this.showBar();
    event.preventDefault();
  }

  private moveDragX(event: PointerEvent): void {
    if (!this.draggingX || !this.horizontalScroller || this.disableHorizontal) {
      return;
    }

    const maxScrollLeft = Math.max(1, this.horizontalScroller.scrollWidth - this.horizontalScroller.clientWidth);
    const maxThumbOffset = Math.max(1, this.horizontalScroller.clientWidth - this.horizontalThumbSize);
    const delta = event.clientX - this.dragStartClientX;
    const scrollDelta = (delta * maxScrollLeft) / maxThumbOffset;
    this.horizontalScroller.scrollLeft = this.dragStartScrollLeft + scrollDelta;
    this.showBar();
    event.preventDefault();
  }

  private endDragX(_event: PointerEvent): void {
    if (!this.draggingX) {
      return;
    }

    this.draggingX = false;
    if (this.dragPointerIdX !== undefined && this.thumbXRef.nativeElement.hasPointerCapture?.(this.dragPointerIdX)) {
      this.thumbXRef.nativeElement.releasePointerCapture(this.dragPointerIdX);
    }
    this.dragPointerIdX = undefined;
    this.showBar();
  }
}

