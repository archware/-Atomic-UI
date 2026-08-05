/**
 * ScrollOverlay unificado (5.5.0). Sustituye la implementacion previa del ADN.
 *
 * No eran dos versiones del mismo componente: la anterior era un scroller MAS un
 * motor de maquetacion de tablas. Buscaba con querySelectorAll un scroller ajeno
 * dentro del contenido proyectado, le escribia atributos, forzaba display:block
 * en thead/tbody y display:grid en tr, y bloqueaba anchos de columna en pixeles.
 * De sus 13 entradas, ~8 eran de layout de tabla infiltradas en el organismo
 * equivocado; 5 no tenian ningun call site y sus selectores por omision no
 * casaban con ningun elemento de los dos repositorios.
 *
 * Defectos que decidieron el descarte:
 * - El elemento con role/tabindex era `.so-root`, que tiene overflow:hidden; el
 *   que scrollea es otro. El teclado no movia nada.
 * - El arrastre del pulgar se calculaba sobre `clientHeight` mientras el dibujo
 *   usaba una altura recortada por la barra horizontal: el pulgar se despegaba
 *   del cursor con dos ejes activos.
 * - El modo grid destruia la semantica ARIA de tabla sin restaurar los roles.
 * - `skipTableDetection` se usaba en 6 de 8 sitios y SIEMPRE con `true`: sus
 *   propios consumidores apagaban su funcion distintiva.
 *
 * Esta version posee un viewport propio por viewChild, de modo que la clase de
 * fallo que obligaba a aislar overlays anidados es estructuralmente imposible.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

type ScrollAxis = 'horizontal' | 'vertical';

interface DragState {
  readonly axis: ScrollAxis;
  readonly origin: number;
  readonly scrollOrigin: number;
}

@Component({
  selector: 'app-scroll-overlay, prest-scroll-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-overlay.component.html',
  styleUrl: './scroll-overlay.component.scss',
  host: {
    '[class.scroll-overlay-host--fill]': 'fill()',
    '[style.--scroll-overlay-viewport-max-height]': 'maxHeight()',
  },
})
export class ScrollOverlayComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewportRef = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private readonly horizontalTrackRef = viewChild<ElementRef<HTMLDivElement>>('horizontalTrack');
  private readonly verticalTrackRef = viewChild<ElementRef<HTMLDivElement>>('verticalTrack');

  readonly horizontal = input(true);
  readonly vertical = input(true);
  readonly fill = input(false);
  readonly focusable = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly viewportRole = input<string | null>(null);
  readonly autoHide = input(true);
  /**
   * Altura maxima del viewport. Admite numero -interpretado en pixeles, que es
   * como lo expresaba el `maxBodyHeight` anterior- o cualquier longitud CSS.
   * Es lo unico que sobrevive de la implementacion previa del ADN.
   */
  readonly maxHeight = input<string | null, string | number | null>(null, {
    transform: (value: string | number | null) =>
      value === null || value === '' ? null : typeof value === 'number' ? `${value}px` : value,
  });

  protected readonly hasHorizontalOverflow = signal(false);
  protected readonly hasVerticalOverflow = signal(false);
  protected readonly controlsVisible = signal(false);
  protected readonly horizontalThumbSize = signal('0px');
  protected readonly horizontalThumbOffset = signal('0px');
  protected readonly verticalThumbSize = signal('0px');
  protected readonly verticalThumbOffset = signal('0px');

  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private metricsFrameId: number | null = null;
  private hideTimer: number | null = null;
  private dragState: DragState | null = null;
  private removePointerListeners: (() => void) | null = null;

  get viewportElement(): HTMLDivElement {
    return this.viewportRef().nativeElement;
  }

  constructor() {
    afterNextRender(() => this.initialize());
    this.destroyRef.onDestroy(() => this.dispose());
  }

  protected onScroll(): void {
    this.scheduleMetricsUpdate();
    this.revealControls();
  }

  /**
   * Routes the wheel from any point of the projected content to this viewport.
   * A nested native scroller keeps ownership while it can move; at its edge the
   * gesture is allowed to continue through the surrounding overlay.
   */
  protected onWheel(event: WheelEvent): void {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey) {
      return;
    }

    const boundary = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const target = event.target instanceof Element ? event.target : null;
    if (!boundary || !target) {
      return;
    }

    const viewport = this.viewportRef().nativeElement;
    const shiftToHorizontal = event.shiftKey && Math.abs(event.deltaX) < 0.01;
    const verticalDelta = shiftToHorizontal
      ? 0
      : this.normalizeWheelDelta(event.deltaY, event.deltaMode, viewport.clientHeight);
    const horizontalDelta = this.normalizeWheelDelta(
      shiftToHorizontal ? event.deltaY : event.deltaX,
      event.deltaMode,
      viewport.clientWidth,
    );

    if (
      this.descendantCanConsumeWheel(
        target,
        boundary,
        viewport,
        horizontalDelta,
        verticalDelta,
      )
    ) {
      this.revealControls();
      return;
    }

    let consumed = false;
    if (this.vertical() && Math.abs(verticalDelta) > 0.01) {
      consumed = this.scrollElementBy(viewport, 'vertical', verticalDelta) || consumed;
    }
    if (this.horizontal() && Math.abs(horizontalDelta) > 0.01) {
      consumed = this.scrollElementBy(viewport, 'horizontal', horizontalDelta) || consumed;
    }

    if (!consumed) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.scheduleMetricsUpdate();
    this.revealControls();
  }

  scrollToStart(): void {
    const viewport = this.viewportElement;
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
    this.scheduleMetricsUpdate();
  }

  protected onTrackPointerDown(event: PointerEvent, axis: ScrollAxis): void {
    if (event.button !== 0 || event.target !== event.currentTarget) {
      return;
    }

    const viewport = this.viewportRef().nativeElement;
    const track = (axis === 'horizontal' ? this.horizontalTrackRef() : this.verticalTrackRef())
      ?.nativeElement;
    if (!track) {
      return;
    }

    const bounds = track.getBoundingClientRect();
    const pointer =
      axis === 'horizontal' ? event.clientX - bounds.left : event.clientY - bounds.top;
    const visibleSize = axis === 'horizontal' ? viewport.clientWidth : viewport.clientHeight;
    const current = axis === 'horizontal' ? viewport.scrollLeft : viewport.scrollTop;
    const thumbOffset = Number.parseFloat(
      axis === 'horizontal' ? this.horizontalThumbOffset() : this.verticalThumbOffset(),
    );
    const thumbSize = Number.parseFloat(
      axis === 'horizontal' ? this.horizontalThumbSize() : this.verticalThumbSize(),
    );
    const next = pointer < thumbOffset ? current - visibleSize * 0.8 : current + visibleSize * 0.8;

    if (axis === 'horizontal') {
      viewport.scrollTo({ left: next, behavior: 'smooth' });
    } else {
      viewport.scrollTo({ top: next, behavior: 'smooth' });
    }
    this.revealControls();
  }

  protected startDrag(event: PointerEvent, axis: ScrollAxis): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const viewport = this.viewportRef().nativeElement;
    this.dragState = {
      axis,
      origin: axis === 'horizontal' ? event.clientX : event.clientY,
      scrollOrigin: axis === 'horizontal' ? viewport.scrollLeft : viewport.scrollTop,
    };

    const pointerMove = (moveEvent: PointerEvent): void => this.drag(moveEvent);
    const pointerUp = (): void => this.stopDrag();
    this.document.addEventListener('pointermove', pointerMove);
    this.document.addEventListener('pointerup', pointerUp, { once: true });
    this.removePointerListeners = () => {
      this.document.removeEventListener('pointermove', pointerMove);
      this.document.removeEventListener('pointerup', pointerUp);
    };
    this.revealControls();
  }

  private initialize(): void {
    const viewport = this.viewportRef().nativeElement;
    this.updateMetrics();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.scheduleMetricsUpdate());
      this.resizeObserver.observe(viewport);
      for (const child of Array.from(viewport.children)) {
        this.resizeObserver.observe(child);
      }
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => {
        if (this.resizeObserver) {
          for (const child of Array.from(viewport.children)) {
            this.resizeObserver.observe(child);
          }
        }
        this.scheduleMetricsUpdate();
      });
      this.mutationObserver.observe(viewport, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  private descendantCanConsumeWheel(
    target: Element,
    boundary: HTMLElement,
    viewport: HTMLElement,
    horizontalDelta: number,
    verticalDelta: number,
  ): boolean {
    let candidate: HTMLElement | null =
      target instanceof HTMLElement ? target : target.parentElement;

    while (candidate && candidate !== boundary) {
      if (candidate !== viewport) {
        if (
          (Math.abs(verticalDelta) > 0.01 &&
            this.canElementConsumeWheel(candidate, 'vertical', verticalDelta)) ||
          (Math.abs(horizontalDelta) > 0.01 &&
            this.canElementConsumeWheel(candidate, 'horizontal', horizontalDelta))
        ) {
          return true;
        }
      }
      candidate = candidate.parentElement;
    }

    return false;
  }

  private canElementConsumeWheel(
    element: HTMLElement,
    axis: ScrollAxis,
    delta: number,
  ): boolean {
    const current = axis === 'vertical' ? element.scrollTop : element.scrollLeft;
    const maximum =
      axis === 'vertical'
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth;
    if (maximum <= 1) {
      return false;
    }

    const styles = getComputedStyle(element);
    const overflow = axis === 'vertical' ? styles.overflowY : styles.overflowX;
    if (!/(auto|scroll|overlay)/.test(overflow)) {
      return false;
    }

    return maximum > 1 && (delta < 0 ? current > 0 : current < maximum);
  }

  private scrollElementBy(element: HTMLElement, axis: ScrollAxis, delta: number): boolean {
    const current = axis === 'vertical' ? element.scrollTop : element.scrollLeft;
    const maximum = Math.max(
      0,
      axis === 'vertical'
        ? element.scrollHeight - element.clientHeight
        : element.scrollWidth - element.clientWidth,
    );
    const next = Math.min(maximum, Math.max(0, current + delta));
    if (Math.abs(next - current) < 0.01) {
      return false;
    }

    if (axis === 'vertical') {
      element.scrollTop = next;
    } else {
      element.scrollLeft = next;
    }
    return true;
  }

  private normalizeWheelDelta(delta: number, deltaMode: number, pageSize: number): number {
    if (deltaMode === 1) {
      return delta * 16;
    }
    if (deltaMode === 2) {
      return delta * Math.max(pageSize, 1);
    }
    return delta;
  }

  private scheduleMetricsUpdate(): void {
    const window = this.document.defaultView;
    if (!window || typeof window.requestAnimationFrame !== 'function') {
      this.updateMetrics();
      return;
    }
    if (this.metricsFrameId !== null) {
      return;
    }

    this.metricsFrameId = window.requestAnimationFrame(() => {
      this.metricsFrameId = null;
      this.updateMetrics();
    });
  }

  private updateMetrics(): void {
    const viewport = this.viewportRef().nativeElement;
    const horizontalOverflow = this.horizontal() && viewport.scrollWidth > viewport.clientWidth + 1;
    const verticalOverflow = this.vertical() && viewport.scrollHeight > viewport.clientHeight + 1;

    this.hasHorizontalOverflow.set(horizontalOverflow);
    this.hasVerticalOverflow.set(verticalOverflow);

    if (horizontalOverflow) {
      const thumbSize = Math.max(32, viewport.clientWidth ** 2 / viewport.scrollWidth);
      const availableTravel = Math.max(viewport.clientWidth - thumbSize, 0);
      const maximumScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 1);
      this.horizontalThumbSize.set(`${thumbSize}px`);
      this.horizontalThumbOffset.set(
        `${(viewport.scrollLeft / maximumScroll) * availableTravel}px`,
      );
    }

    if (verticalOverflow) {
      const thumbSize = Math.max(32, viewport.clientHeight ** 2 / viewport.scrollHeight);
      const availableTravel = Math.max(viewport.clientHeight - thumbSize, 0);
      const maximumScroll = Math.max(viewport.scrollHeight - viewport.clientHeight, 1);
      this.verticalThumbSize.set(`${thumbSize}px`);
      this.verticalThumbOffset.set(`${(viewport.scrollTop / maximumScroll) * availableTravel}px`);
    }
  }

  private drag(event: PointerEvent): void {
    const state = this.dragState;
    if (!state) {
      return;
    }

    const viewport = this.viewportRef().nativeElement;
    const track = (
      state.axis === 'horizontal' ? this.horizontalTrackRef() : this.verticalTrackRef()
    )?.nativeElement;
    if (!track) {
      return;
    }

    const pointer = state.axis === 'horizontal' ? event.clientX : event.clientY;
    const trackSize = state.axis === 'horizontal' ? track.clientWidth : track.clientHeight;
    const thumbSize = Number.parseFloat(
      state.axis === 'horizontal' ? this.horizontalThumbSize() : this.verticalThumbSize(),
    );
    const maximumScroll =
      state.axis === 'horizontal'
        ? viewport.scrollWidth - viewport.clientWidth
        : viewport.scrollHeight - viewport.clientHeight;
    const ratio = maximumScroll / Math.max(trackSize - thumbSize, 1);
    const next = state.scrollOrigin + (pointer - state.origin) * ratio;

    if (state.axis === 'horizontal') {
      viewport.scrollLeft = next;
    } else {
      viewport.scrollTop = next;
    }
    this.scheduleMetricsUpdate();
  }

  private stopDrag(): void {
    this.dragState = null;
    this.removePointerListeners?.();
    this.removePointerListeners = null;
    this.revealControls();
  }

  private revealControls(): void {
    this.controlsVisible.set(true);
    if (!this.autoHide()) {
      return;
    }
    const window = this.document.defaultView;
    if (!window) {
      return;
    }
    if (this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
    }
    this.hideTimer = window.setTimeout(() => {
      this.controlsVisible.set(false);
      this.hideTimer = null;
    }, 900);
  }

  private dispose(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.removePointerListeners?.();
    const window = this.document.defaultView;
    if (window && this.metricsFrameId !== null) {
      window.cancelAnimationFrame(this.metricsFrameId);
      this.metricsFrameId = null;
    }
    if (window && this.hideTimer !== null) {
      window.clearTimeout(this.hideTimer);
    }
  }
}
