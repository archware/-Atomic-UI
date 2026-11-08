import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  signal,
  viewChild,
  input,
  output
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';

import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';
import { FooterComponent } from '../../organisms/footer/footer.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import { LinkComponent } from '../../atoms/link/link.component';

/** Ancho a partir del cual el cajón deja de convivir con el contenido y lo tapa. */
const COMPACT_VIEWPORT = '(max-width: 768px)';

/** Clave de almacenamiento de sesión para persistir posición de scroll por ruta. */
const SCROLL_STORAGE_KEY = 'atomic-ui:layout-scroll:v1';

export interface RouteScrollPosition {
  readonly top: number;
  readonly left: number;
}

const ROUTE_SCROLL_POSITIONS = new Map<string, RouteScrollPosition>();
let storageHydrated = false;

function hydrateScrollPositionsFromStorage(): void {
  if (storageHydrated) return;
  storageHydrated = true;
  try {
    if (typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, RouteScrollPosition>;
    if (!parsed || typeof parsed !== 'object') return;
    for (const [key, val] of Object.entries(parsed)) {
      if (val && typeof val.top === 'number' && typeof val.left === 'number') {
        ROUTE_SCROLL_POSITIONS.set(key, { top: Math.max(0, val.top), left: Math.max(0, val.left) });
      }
    }
  } catch {
    // Ignorar errores de acceso a sessionStorage en contextos restringidos.
  }
}

function persistScrollPositionsToStorage(): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const serialized: Record<string, RouteScrollPosition> = {};
    for (const [key, val] of ROUTE_SCROLL_POSITIONS.entries()) {
      serialized[key] = val;
    }
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Ignorar errores de cuota o acceso a sessionStorage.
  }
}

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [ScrollOverlayComponent, FooterComponent, VariablesCssDirective, LinkComponent],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.css'
})
export class LayoutShellComponent implements OnInit, AfterViewInit, OnChanges {
  /** Limpia la memoria de posiciones de scroll guardadas por ruta. */
  static clearSavedScrollPositions(): void {
    ROUTE_SCROLL_POSITIONS.clear();
    storageHydrated = true;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(SCROLL_STORAGE_KEY);
      }
    } catch {
      // Ignorar errores de acceso a sessionStorage.
    }
  }

  /** Whether the sidebar is visible */
  readonly sidebarVisible = input(true);

  /** Sidebar width (default: 260px). Supports any CSS value: '260px', '25%', 'clamp(200px, 20%, 300px)' */
  readonly sidebarWidth = input('16.25rem');

  /** Controls the canonical footer row outside the scroll viewport. */
  readonly footerVisible = input(true);
  readonly footerCompanyName = input('Suite Barracuda');
  readonly footerYear = input(new Date().getFullYear());
  readonly footerCopyrightText = input('Todos los derechos reservados.');
  readonly footerShowVersion = input(true);
  readonly footerVersion = input('v1.0.0');
  readonly footerEnvironment = input('PROD');

  /** Texto del enlace de salto al contenido. */
  readonly skipLinkLabel = input('Saltar al contenido principal');

  /** Nombre accesible de la región de navegación lateral. */
  readonly sidebarLabel = input('Navegación principal');

  /**
   * Consulta de medios que decide cuándo el cajón deja de convivir con el
   * contenido y pasa a taparlo. Debe coincidir con el punto de ruptura de los
   * estilos; se expone para el consumidor que cambie el suyo, y porque hace
   * comprobable el comportamiento modal sin depender del ancho real de la
   * ventana de pruebas.
   */
  readonly compactViewportQuery = input(COMPACT_VIEWPORT);

  /** Event emitted when sidebar backdrop is clicked */
  readonly closeSidebar = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router, { optional: true });
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');
  private readonly mainScrollOverlay = viewChild<ScrollOverlayComponent>('mainScrollOverlay');
  private readonly contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapper');

  protected readonly compactViewport = signal(false);

  private desconectarMedia: (() => void) | null = null;
  private activeRouteKey = '/';
  private isNavigating = false;
  private isRestoringScroll = false;
  private restoreCleanup: (() => void) | null = null;

  ngOnInit(): void {
    hydrateScrollPositionsFromStorage();
    this.activeRouteKey = this.resolveCurrentRouteKey();
    this.observarViewport();
    this.observarNavegacion();
  }

  ngAfterViewInit(): void {
    this.activeRouteKey = this.resolveCurrentRouteKey();
    this.configurarEscuchaScroll();
    this.restoreScrollForRoute(this.activeRouteKey);
  }

  private observarViewport(): void {
    this.desconectarMedia?.();
    this.desconectarMedia = null;

    if (!this.document.defaultView?.matchMedia) return; const mediaQuery = this.document.defaultView.matchMedia(this.compactViewportQuery());
    if (!mediaQuery) {
      return;
    }

    const sincronizar = (): void => this.compactViewport.set(mediaQuery.matches);
    sincronizar();
    mediaQuery.addEventListener('change', sincronizar);
    this.desconectarMedia = () => mediaQuery.removeEventListener('change', sincronizar);
    this.destroyRef.onDestroy(() => this.desconectarMedia?.());
  }

  /*
    UN ELEMENTO ESCONDIDO POR CSS SIGUE SIENDO TABULABLE.

    El cajón se ocultaba solo con una clase, así que sus enlaces seguían en el
    orden de tabulación y el lector de pantalla los seguía anunciando aunque
    estuvieran fuera de la pantalla. `inert` los saca de las dos cosas a la vez.

    Y al revés: con el cajón abierto en móvil, el contenido de detrás tiene que
    quedar inerte, o no es un cajón modal —se puede tabular hasta debajo del
    velo—.
  */
  protected get sidebarInert(): '' | null {
    return this.compactViewport() && !this.sidebarVisible() ? '' : null;
  }

  protected get contentInert(): '' | null {
    return this.compactViewport() && this.sidebarVisible() ? '' : null;
  }

  /*
    CUANDO ALGO SE VUELVE INERTE CON EL FOCO DENTRO, EL NAVEGADOR LO DESCARTA.

    Y no avisa: la siguiente tabulación reempieza desde el principio del
    documento, lo que en una aplicación con menú largo significa recorrerlo
    entero otra vez. Pasa siempre que se cierra el cajón, porque al cajón se le
    cierra pulsando uno de sus enlaces, o sea con el foco dentro.

    Se traslada al contenido, que es donde el usuario acaba de pedir estar.
  */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['compactViewportQuery'] && !changes['compactViewportQuery'].firstChange) {
      this.observarViewport();
    }

    const cambio = changes['sidebarVisible'];
    if (!cambio || cambio.firstChange || cambio.currentValue) {
      return;
    }

    const contenido = this.mainContent()?.nativeElement;
    const activo = this.document.activeElement;
    const foco = activo instanceof HTMLElement ? activo : null;
    if (contenido && foco && contenido.contains(foco) === false) {
      contenido.focus({ preventScroll: true });
    }
  }

  onOverlayClick() {
    this.closeSidebar.emit();
  }

  private normalizeRouteKey(rawUrl: string): string {
    const clean = (rawUrl || '/').split('#')[0]?.trim() || '/';
    return clean.startsWith('/') ? clean : `/${clean}`;
  }

  private resolveCurrentRouteKey(urlOverride?: string): string {
    if (urlOverride) {
      return this.normalizeRouteKey(urlOverride);
    }
    if (this.router?.url) {
      return this.normalizeRouteKey(this.router.url);
    }
    const win = this.document?.defaultView;
    if (win?.location) {
      return this.normalizeRouteKey(`${win.location.pathname}${win.location.search}`);
    }
    return '/';
  }

  private saveRouteScrollPosition(routeKey: string, position: RouteScrollPosition): void {
    const normalized: RouteScrollPosition = {
      top: Math.max(0, Math.round(position.top)),
      left: Math.max(0, Math.round(position.left)),
    };
    ROUTE_SCROLL_POSITIONS.set(routeKey, normalized);
    persistScrollPositionsToStorage();
  }

  private observarNavegacion(): void {
    if (!this.router?.events) {
      return;
    }

    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.isNavigating && !this.isRestoringScroll) {
          const overlay = this.mainScrollOverlay();
          const scrollEl = overlay?.getScrollElement();
          const pos = overlay?.getScrollPosition();
          if (
            pos &&
            scrollEl &&
            (pos.top > 0 || pos.left > 0 || scrollEl.scrollHeight > scrollEl.clientHeight + 1)
          ) {
            this.saveRouteScrollPosition(this.activeRouteKey, pos);
          }
        }
        this.isNavigating = true;
        this.cancelPendingRestore();
      } else if (event instanceof NavigationEnd) {
        const nextKey = this.resolveCurrentRouteKey(event.urlAfterRedirects || event.url);
        this.activeRouteKey = nextKey;
        this.isNavigating = false;
        this.restoreScrollForRoute(nextKey);
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating = false;
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cancelPendingRestore();
      sub.unsubscribe();
    });
  }

  private configurarEscuchaScroll(): void {
    const overlay = this.mainScrollOverlay();
    const scrollEl = overlay?.getScrollElement();
    if (!overlay || !scrollEl) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const onScroll = (): void => {
        if (this.isNavigating || this.isRestoringScroll) {
          return;
        }
        const pos = overlay.getScrollPosition();
        const prev = ROUTE_SCROLL_POSITIONS.get(this.activeRouteKey);
        if (
          pos.top === 0 &&
          pos.left === 0 &&
          prev &&
          (prev.top > 0 || prev.left > 0) &&
          scrollEl.scrollHeight <= scrollEl.clientHeight + 1
        ) {
          return;
        }
        this.saveRouteScrollPosition(this.activeRouteKey, pos);
      };

      scrollEl.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        scrollEl.removeEventListener('scroll', onScroll);
      });
    });
  }

  private cancelPendingRestore(): void {
    this.restoreCleanup?.();
    this.restoreCleanup = null;
    this.isRestoringScroll = false;
  }

  private restoreScrollForRoute(routeKey: string): void {
    this.cancelPendingRestore();
    const overlay = this.mainScrollOverlay();
    const scrollEl = overlay?.getScrollElement();
    if (!overlay || !scrollEl) {
      return;
    }

    const saved = ROUTE_SCROLL_POSITIONS.get(routeKey);
    if (!saved || (saved.top <= 0 && saved.left <= 0)) {
      overlay.setScrollPosition({ top: 0, left: 0 });
      return;
    }

    this.isRestoringScroll = true;

    const applySavedPosition = (): boolean => {
      overlay.setScrollPosition(saved);
      const maxTop = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      const maxLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      return (
        maxTop >= saved.top - 2 &&
        maxLeft >= saved.left - 2 &&
        Math.abs(scrollEl.scrollTop - saved.top) <= 2 &&
        Math.abs(scrollEl.scrollLeft - saved.left) <= 2
      );
    };

    const succeededImmediately = applySavedPosition();

    this.zone.runOutsideAngular(() => {
      const cleanups: (() => void)[] = [];
      let rafId: number | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const scheduleFinalizeAfterSuccess = (): void => {
        if (settleTimeoutId !== null) {
          return;
        }
        settleTimeoutId = setTimeout(() => {
          if (this.isRestoringScroll) {
            applySavedPosition();
            this.cancelPendingRestore();
          }
        }, 120);
      };

      const scheduleApply = (): void => {
        if (!this.isRestoringScroll) return;
        if (applySavedPosition()) {
          scheduleFinalizeAfterSuccess();
        }
      };

      if (succeededImmediately) {
        scheduleFinalizeAfterSuccess();
      }

      const stopOnUserInteraction = (event: Event): void => {
        if (event instanceof KeyboardEvent) {
          const scrollKeys = [
            'ArrowUp',
            'ArrowDown',
            'PageUp',
            'PageDown',
            'Home',
            'End',
            ' ',
          ];
          if (!scrollKeys.includes(event.key)) {
            return;
          }
        }
        this.cancelPendingRestore();
      };

      scrollEl.addEventListener('wheel', stopOnUserInteraction, { passive: true });
      scrollEl.addEventListener('touchstart', stopOnUserInteraction, { passive: true });
      scrollEl.addEventListener('pointerdown', stopOnUserInteraction, { passive: true });
      scrollEl.addEventListener('keydown', stopOnUserInteraction, { passive: true });
      cleanups.push(() => {
        scrollEl.removeEventListener('wheel', stopOnUserInteraction);
        scrollEl.removeEventListener('touchstart', stopOnUserInteraction);
        scrollEl.removeEventListener('pointerdown', stopOnUserInteraction);
        scrollEl.removeEventListener('keydown', stopOnUserInteraction);
      });

      const wrapperEl = this.contentWrapper()?.nativeElement;
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => scheduleApply());
        ro.observe(scrollEl);
        if (wrapperEl) {
          ro.observe(wrapperEl);
        }
        cleanups.push(() => ro.disconnect());
      }

      if (typeof MutationObserver !== 'undefined' && wrapperEl) {
        const mo = new MutationObserver(() => scheduleApply());
        mo.observe(wrapperEl, { childList: true, subtree: true });
        cleanups.push(() => mo.disconnect());
      }

      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(() => {
          scheduleApply();
          rafId = requestAnimationFrame(() => {
            scheduleApply();
          });
        });
        cleanups.push(() => {
          if (rafId !== null && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(rafId);
          }
        });
      }

      timeoutId = setTimeout(() => {
        scheduleApply();
        this.cancelPendingRestore();
      }, 1500);
      cleanups.push(() => {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
        if (settleTimeoutId !== null) {
          clearTimeout(settleTimeoutId);
        }
      });

      this.restoreCleanup = () => {
        for (const fn of cleanups) {
          fn();
        }
      };
    });
  }
}

