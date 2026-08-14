import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';
import { FooterComponent } from '../../organisms/footer/footer.component';

/** Ancho a partir del cual el cajón deja de convivir con el contenido y lo tapa. */
const COMPACT_VIEWPORT = '(max-width: 768px)';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [ScrollOverlayComponent, FooterComponent],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.css'
})
export class LayoutShellComponent implements OnInit, OnChanges {
  /** Whether the sidebar is visible */
  @Input() sidebarVisible = true;

  /** Sidebar width (default: 260px). Supports any CSS value: '260px', '25%', 'clamp(200px, 20%, 300px)' */
  @Input() sidebarWidth = '260px';

  /** Controls the canonical footer row outside the scroll viewport. */
  @Input() footerVisible = true;
  @Input() footerCompanyName = 'Company';
  @Input() footerYear = new Date().getFullYear();
  @Input() footerCopyrightText = 'Todos los derechos reservados.';
  @Input() footerShowVersion = true;
  @Input() footerVersion = 'v1.0.0';
  @Input() footerEnvironment = 'BETA';

  /** Texto del enlace de salto al contenido. */
  @Input() skipLinkLabel = 'Saltar al contenido principal';

  /** Nombre accesible de la región de navegación lateral. */
  @Input() sidebarLabel = 'Navegación principal';

  /**
   * Consulta de medios que decide cuándo el cajón deja de convivir con el
   * contenido y pasa a taparlo. Debe coincidir con el punto de ruptura de los
   * estilos; se expone para el consumidor que cambie el suyo, y porque hace
   * comprobable el comportamiento modal sin depender del ancho real de la
   * ventana de pruebas.
   */
  @Input() compactViewportQuery = COMPACT_VIEWPORT;

  /** Event emitted when sidebar backdrop is clicked */
  @Output() closeSidebar = new EventEmitter<void>();

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  protected readonly compactViewport = signal(false);

  private desconectarMedia: (() => void) | null = null;

  ngOnInit(): void {
    this.observarViewport();
  }

  private observarViewport(): void {
    this.desconectarMedia?.();
    this.desconectarMedia = null;

    const mediaQuery = this.document.defaultView?.matchMedia(this.compactViewportQuery);
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
    return this.sidebarVisible ? null : '';
  }

  protected get contentInert(): '' | null {
    return this.compactViewport() && this.sidebarVisible ? '' : null;
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
    if (!this.compactViewport()) {
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
}
