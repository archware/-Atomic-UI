import {
  Component, signal, computed, HostListener, effect, untracked,
  ElementRef, forwardRef, inject, ChangeDetectionStrategy,
  input, viewChild, afterRenderEffect, DestroyRef,
  output
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import { calcularPosicionCapaSelect2, PosicionCapaSelect2 } from './select2-posicion';
import {
  FIELD_LABEL_VARIANT_DEFAULT,
  FieldLabelVariant,
  esEtiquetaElevada,
  esEtiquetaFlotante,
  esMarcadorVisible,
} from '../../atoms/form-field/field-label';


export interface Select2Option {
  value: string | number | null;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  // Standalone component for Select2 dropdown
  selector: 'app-select2',
  standalone: true,
  imports: [FormsModule, VariablesCssDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Select2Component),
    multi: true
  }],
  templateUrl: './select2.component.html',
  styleUrls: ['./select2.component.css', '../../atoms/form-field/field-label.css']
})
export class Select2Component implements ControlValueAccessor {
  // La señal interna conserva el contrato público histórico `options` mientras se adapta su setter.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaOpciones = input<readonly Select2Option[]>([], { alias: 'options' });

  set options(value: readonly Select2Option[]) {
    this._options = [...(value || [])];
    this.reconcilePendingValue();
    this.ensureEnabledHighlight();
    this.programarPosicionCapa();
  }
  get options(): readonly Select2Option[] {
    return this._options;
  }
  readonly label = input('');
  /** Modo de etiqueta comun a todos los controles: standard | floating | floating-value. */
  readonly variant = input<FieldLabelVariant>(FIELD_LABEL_VARIANT_DEFAULT);
  /** Campo obligatorio: muestra el asterisco en la etiqueta y expone aria-required en el disparador. */
  readonly required = input(false);
  readonly ariaLabel = input('');
  readonly placeholder = input('Seleccionar...');
  readonly searchLabel = input('Buscar opciones');
  // El alias permite combinar el estado del binding con el estado entregado por ControlValueAccessor.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaDeshabilitado = input(false, { alias: 'disabled' });

  set disabled(value: boolean) {
    this.disabledState.set(value);
    if (value) {
      this.cerrarDesplegable(false, false);
    }
  }
  get disabled(): boolean {
    return this.disabledState();
  }
  readonly searchable = input(true);
  readonly multiple = input(false);
  readonly width = input(''); // Optional: e.g., '200px', '50%', 'auto'
  readonly valueChange = output<string | number | null | (string | number | null)[]>();

  isOpen = signal(false);
  /** El disparador tiene el foco del teclado (con la lista cerrada). */
  readonly triggerFocused = signal(false);
  searchTerm = signal('');
  selectedOption = signal<Select2Option | null>(null);
  selectedOptions = signal<Select2Option[]>([]);
  highlightedIndex = signal(-1);
  private _options: Select2Option[] = [];
  private readonly disabledState = signal(false);
  private pendingValue: unknown = undefined;
  private readonly sincronizarOpciones = effect(() => {
    const opciones = this.entradaOpciones();
    untracked(() => {
      this.options = opciones;
    });
  });
  private readonly sincronizarDeshabilitado = effect(() => {
    const deshabilitado = this.entradaDeshabilitado();
    untracked(() => {
      this.disabled = deshabilitado;
    });
  });

  // Generate unique ID for accessibility (aria-labelledby)
  private static instanceCounter = 0;
  private readonly _instanceId = ++Select2Component.instanceCounter;
  readonly selectId = () => `select2-label-${this._instanceId}`;
  readonly listboxId = () => `select2-listbox-${this._instanceId}`;
  readonly optionId = (index: number) => `select2-option-${this._instanceId}-${index}`;

  private readonly elementRef = inject(ElementRef);
  private readonly destruir = inject(DestroyRef);
  private readonly capa = viewChild<ElementRef<HTMLElement>>('capa');
  private readonly disparador = viewChild<ElementRef<HTMLElement>>('disparador');
  private readonly metricas = viewChild<ElementRef<HTMLElement>>('metricas');
  protected readonly posicionCapa = signal<PosicionCapaSelect2 | null>(null);
  protected readonly variablesCapa = computed(() => {
    const posicion = this.posicionCapa();
    return {
      '--select2-capa-izquierda': posicion ? `${posicion.izquierda}px` : null,
      '--select2-capa-superior': posicion ? `${posicion.superior}px` : null,
      '--select2-capa-ancho': posicion ? `${posicion.ancho}px` : null,
      '--select2-capa-alto-maximo': posicion ? `${posicion.altoMaximo}px` : null,
    };
  });
  private panelActivo: HTMLElement | null = null;
  private ventanaActiva: Window | null = null;
  private cuadroPendiente: number | null = null;
  private cuadroFocoPendiente: number | null = null;
  private cierreTabPendiente: number | null = null;
  private limpiarEscuchas: (() => void)[] = [];
  private enfocarBusquedaPendiente = false;
  private desplazamientoInicialPendiente = false;

  constructor() {
    afterRenderEffect(() => {
      const panel = this.capa()?.nativeElement;
      const abierto = this.isOpen();
      this.posicionCapa();
      this.searchable();
      this.multiple();
      this.width();
      this.entradaOpciones();
      this.searchTerm();
      if (!abierto || !panel || this.disabled) {
        this.liberarCapa();
        return;
      }
      if (panel !== this.panelActivo) this.activarCapa(panel);
      this.actualizarPosicionCapa();
      if ((this.enfocarBusquedaPendiente || this.desplazamientoInicialPendiente) &&
          panel.classList.contains('capa-posicionada')) {
        this.programarFocoBusqueda();
      }
    });
    this.destruir.onDestroy(() => this.liberarCapa());
  }

  private activarCapa(panel: HTMLElement): void {
    this.liberarCapa();
    this.panelActivo = panel;
    const documento = panel.ownerDocument;
    const ventana = documento.defaultView;
    if (!ventana) return;
    this.ventanaActiva = ventana;
    // El nodo permanece dentro de su dialogo y conserva herencia y foco modal.
    if (typeof panel.showPopover === 'function' && typeof panel.hidePopover === 'function') {
      panel.showPopover();
    }
    const escuchar = (objetivo: EventTarget, tipo: string, accion: EventListener, captura = false) => {
      objetivo.addEventListener(tipo, accion, captura);
      this.limpiarEscuchas.push(() => objetivo.removeEventListener(tipo, accion, captura));
    };
    const reposicionar = () => this.programarPosicionCapa();
    escuchar(documento, 'scroll', evento => {
      if (!(evento.target instanceof Node) || !panel.contains(evento.target)) reposicionar();
    }, true);
    escuchar(ventana, 'resize', reposicionar);
    if (ventana.visualViewport) {
      escuchar(ventana.visualViewport, 'resize', reposicionar);
      escuchar(ventana.visualViewport, 'scroll', reposicionar);
    }
    escuchar(documento, 'pointerdown', evento => {
      if (!this.elementRef.nativeElement.contains(evento.target)) this.cerrarDesplegable(false, true);
    }, true);
    if (typeof ResizeObserver !== 'undefined') {
      const observador = new ResizeObserver(reposicionar);
      const disparador = this.disparador()?.nativeElement;
      if (disparador) observador.observe(disparador);
      observador.observe(panel);
      panel.querySelectorAll('.select2-options, .select2-search').forEach(elemento => observador.observe(elemento));
      this.limpiarEscuchas.push(() => observador.disconnect());
    }
    const observadorVisibilidad = new MutationObserver(reposicionar);
    const elementosObservados = new Set<HTMLElement>();
    for (let ancestro: HTMLElement | null = this.disparador()?.nativeElement ?? null;
         ancestro; ancestro = ancestro.parentElement) {
      elementosObservados.add(ancestro);
      observadorVisibilidad.observe(ancestro, {
        attributes: true, attributeFilter: ['style', 'class', 'hidden'],
      });
    }
    this.limpiarEscuchas.push(() => observadorVisibilidad.disconnect());
    const alTerminarVisibilidad: EventListener = evento => {
      if ((evento as TransitionEvent).propertyName === 'visibility' &&
          elementosObservados.has(evento.target as HTMLElement)) reposicionar();
    };
    escuchar(documento, 'transitionend', alTerminarVisibilidad, true);
    escuchar(documento, 'transitioncancel', alTerminarVisibilidad, true);
    const dialogo = panel.closest('dialog');
    if (dialogo) {
      const cerrar = () => this.cerrarDesplegable(false, true);
      escuchar(dialogo, 'close', cerrar);
      const observador = new MutationObserver(() => { if (!dialogo.open) cerrar(); });
      observador.observe(dialogo, { attributes: true, attributeFilter: ['open'] });
      this.limpiarEscuchas.push(() => observador.disconnect());
    }
    this.enfocarBusquedaPendiente = this.searchable();
    this.desplazamientoInicialPendiente = true;
    this.programarPosicionCapa();
  }

  private actualizarPosicionCapa(): void {
    const panel = this.panelActivo;
    const disparador = this.disparador()?.nativeElement;
    const ventana = this.ventanaActiva;
    if (!panel || !disparador || !ventana || !this.isOpen()) return;
    const rectangulo = disparador.getBoundingClientRect();
    const estilo = ventana.getComputedStyle(disparador);
    const dialogo = panel.closest('dialog');
    if (!disparador.isConnected || !disparador.getClientRects().length ||
        estilo.visibility === 'hidden' || estilo.visibility === 'collapse' ||
        rectangulo.width <= 0 || rectangulo.height <= 0 || (dialogo && !dialogo.open)) {
      this.cerrarDesplegable(false, true);
      return;
    }
    const visual = ventana.visualViewport;
    const documento = panel.ownerDocument.documentElement;
    const metrica = this.metricas()?.nativeElement.getBoundingClientRect();
    const opciones = panel.querySelector<HTMLElement>('.select2-options');
    const busqueda = panel.querySelector<HTMLElement>('.select2-search');
    const estiloPanel = ventana.getComputedStyle(panel);
    const limiteOpciones = opciones ? parseFloat(ventana.getComputedStyle(opciones).maxHeight) : 0;
    // scrollHeight recupera el contenido natural incluso cuando flex ya recorto la lista.
    const altoNatural = (busqueda?.getBoundingClientRect().height ?? 0) +
      (opciones ? Math.min(opciones.scrollHeight, limiteOpciones || opciones.scrollHeight) : 0) +
      parseFloat(estiloPanel.borderTopWidth) + parseFloat(estiloPanel.borderBottomWidth);
    const posicion = calcularPosicionCapaSelect2({
      disparador: { izquierda: rectangulo.left, superior: rectangulo.top, ancho: rectangulo.width, alto: rectangulo.height },
      ventana: { izquierda: visual?.offsetLeft ?? 0, superior: visual?.offsetTop ?? 0,
        ancho: visual?.width ?? (documento.clientWidth || ventana.innerWidth),
        alto: visual?.height ?? (documento.clientHeight || ventana.innerHeight) },
      altoNatural, margen: metrica?.width ?? 0, separacion: metrica?.height ?? 0,
    });
    const anterior = this.posicionCapa();
    if (!anterior || anterior.izquierda !== posicion.izquierda || anterior.superior !== posicion.superior ||
        anterior.ancho !== posicion.ancho || anterior.altoMaximo !== posicion.altoMaximo || anterior.lado !== posicion.lado) {
      this.posicionCapa.set(posicion);
    }
  }

  private programarPosicionCapa(): void {
    if (!this.isOpen() || !this.ventanaActiva || this.cuadroPendiente !== null) return;
    this.cuadroPendiente = this.ventanaActiva.requestAnimationFrame(() => {
      this.cuadroPendiente = null;
      this.actualizarPosicionCapa();
    });
  }

  private liberarCapa(): void {
    if (this.cuadroFocoPendiente !== null) this.ventanaActiva?.cancelAnimationFrame(this.cuadroFocoPendiente);
    this.cuadroFocoPendiente = null;
    if (this.cierreTabPendiente !== null) this.ventanaActiva?.clearTimeout(this.cierreTabPendiente);
    this.cierreTabPendiente = null;
    if (this.cuadroPendiente !== null) this.ventanaActiva?.cancelAnimationFrame(this.cuadroPendiente);
    this.cuadroPendiente = null;
    this.limpiarEscuchas.forEach(limpiar => limpiar());
    this.limpiarEscuchas = [];
    const panel = this.panelActivo;
    this.panelActivo = null;
    this.ventanaActiva = null;
    this.enfocarBusquedaPendiente = false;
    this.desplazamientoInicialPendiente = false;
    if (panel && typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) panel.hidePopover();
    if (this.posicionCapa() !== null) this.posicionCapa.set(null);
  }

  private programarFocoBusqueda(reintentos = 1): void {
    const panel = this.panelActivo;
    const ventana = this.ventanaActiva;
    if (!panel || !ventana || (!this.enfocarBusquedaPendiente && !this.desplazamientoInicialPendiente) ||
        this.cuadroFocoPendiente !== null) return;
    this.cuadroFocoPendiente = ventana.requestAnimationFrame(() => {
      this.cuadroFocoPendiente = null;
      if (this.panelActivo !== panel || !this.isOpen() || this.disabled ||
          (!this.enfocarBusquedaPendiente && !this.desplazamientoInicialPendiente)) return;
      const utilizaPopover = typeof panel.showPopover === 'function' && typeof panel.hidePopover === 'function';
      const estiloPanel = ventana.getComputedStyle(panel);
      const panelVisible = panel.isConnected && panel.classList.contains('capa-posicionada') &&
        estiloPanel.display !== 'none' && estiloPanel.visibility !== 'hidden' && estiloPanel.visibility !== 'collapse' &&
        (!utilizaPopover || panel.matches(':popover-open'));
      const lista = panel.querySelector<HTMLElement>('.select2-options');
      if (panelVisible && this.desplazamientoInicialPendiente && lista?.isConnected && lista.clientHeight > 0) {
        this.scrollToHighlighted();
        this.desplazamientoInicialPendiente = false;
      }
      const buscador = panel.querySelector<HTMLInputElement>('.search-input');
      const estilo = buscador ? ventana.getComputedStyle(buscador) : null;
      const rectangulo = buscador?.getBoundingClientRect();
      if (panelVisible && this.searchable() && this.enfocarBusquedaPendiente &&
          buscador?.isConnected && buscador.getClientRects().length &&
          rectangulo && rectangulo.width > 0 && rectangulo.height > 0 &&
          estilo?.display !== 'none' && estilo?.visibility !== 'hidden' && estilo?.visibility !== 'collapse') {
        buscador.focus({ preventScroll: true });
        if (panel.ownerDocument.activeElement === buscador) {
          this.enfocarBusquedaPendiente = false;
        }
      }
      if (reintentos > 0 && (this.enfocarBusquedaPendiente || this.desplazamientoInicialPendiente)) {
        this.programarFocoBusqueda(reintentos - 1);
      }
    });
  }

  private programarCierrePorTab(evento: KeyboardEvent): void {
    const panel = this.panelActivo;
    const ventana = this.ventanaActiva;
    if (!panel || !ventana) return;
    if (this.cierreTabPendiente !== null) ventana.clearTimeout(this.cierreTabPendiente);
    this.enfocarBusquedaPendiente = false;
    this.desplazamientoInicialPendiente = false;
    if (this.cuadroFocoPendiente !== null) ventana.cancelAnimationFrame(this.cuadroFocoPendiente);
    this.cuadroFocoPendiente = null;
    // El navegador debe resolver el destino nativo antes de retirar el buscador enfocado.
    this.cierreTabPendiente = ventana.setTimeout(() => {
      this.cierreTabPendiente = null;
      if (this.panelActivo === panel && this.isOpen() && !evento.defaultPrevented &&
          !panel.contains(panel.ownerDocument.activeElement)) {
        this.cerrarDesplegable(false, true);
      }
    }, 0);
  }

  private cerrarDesplegable(restaurarFoco: boolean, notificarTocado: boolean): void {
    const estabaAbierto = this.isOpen();
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.highlightedIndex.set(-1);
    this.liberarCapa();
    if (estabaAbierto && notificarTocado) this.onTouched();
    if (estabaAbierto && restaurarFoco && !this.disabled) {
      this.disparador()?.nativeElement.focus({ preventScroll: true });
    }
  }

  protected alCambiarCapa(evento: Event): void {
    if ((evento as ToggleEvent).newState === 'closed' && this.isOpen() &&
        this.panelActivo === evento.target && !this.panelActivo?.matches(':popover-open')) {
      this.cerrarDesplegable(false, true);
    }
  }

  protected alTecladoLista(evento: KeyboardEvent): void {
    if (evento.target !== evento.currentTarget || (evento.key !== 'Tab' && evento.key !== 'Escape')) return;
    this.handleKeydown(evento);
  }
  private onChange: (value: unknown) => void = () => { /* noop */ };
  private onTouched: () => void = () => { /* noop */ };

  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.variant(), this.tieneEtiqueta()),
  );
  /** Con la lista abierta o el disparador enfocado, la etiqueta flotante (floating) sube. */
  protected readonly elevada = computed(() =>
    esEtiquetaElevada(
      this.variant(),
      this.tieneEtiqueta(),
      this.isOpen() || this.triggerFocused(),
      this.hasValue(),
    ),
  );
  protected readonly marcadorVisible = computed(() =>
    esMarcadorVisible(this.variant(), this.tieneEtiqueta(), this.elevada()),
  );

  hasValue(): boolean {
    return this.multiple() ? this.selectedOptions().length > 0 : this.selectedOption() !== null;
  }

  filteredOptions(): readonly Select2Option[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(term));
  }

  isSelected(option: Select2Option): boolean {
    if (this.multiple()) {
      return this.selectedOptions().some(o => o.value === option.value);
    }
    return this.selectedOption()?.value === option.value;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    if (this.isOpen()) this.cerrarDesplegable(false, true);
    else {
      this.isOpen.set(true);
      this.ensureEnabledHighlight();
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const options = this.filteredOptions();
    const isSearchInput = (event.target as HTMLElement | null)?.classList.contains('search-input');

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else {
          this.highlightedIndex.set(this.nextEnabledIndex(options, this.highlightedIndex(), 1));
          this.scrollToHighlighted();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else {
          this.highlightedIndex.set(this.nextEnabledIndex(options, this.highlightedIndex(), -1));
          this.scrollToHighlighted();
        }
        break;
      case 'Enter':
      case ' ':
        if (event.key === ' ' && isSearchInput) return;
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else if (this.highlightedIndex() >= 0) {
          const option = options[this.highlightedIndex()];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          event.stopPropagation();
          this.cerrarDesplegable(true, true);
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.programarCierrePorTab(event);
        }
        break;
    }
  }

  private scrollToHighlighted(): void {
    const listbox = this.panelActivo?.querySelector<HTMLElement>('.select2-options');
    const highlighted = listbox?.querySelectorAll<HTMLElement>('.select2-option')[this.highlightedIndex()];
    if (highlighted && listbox) {
      const caja = listbox.getBoundingClientRect();
      const opcion = highlighted.getBoundingClientRect();
      if (opcion.top < caja.top) listbox.scrollTop -= caja.top - opcion.top;
      else if (opcion.bottom > caja.bottom) listbox.scrollTop += opcion.bottom - caja.bottom;
    }
  }

  selectOption(option: Select2Option): void {
    if (this.disabled || option.disabled) return;
    if (this.multiple()) {
      const current = this.selectedOptions();
      if (this.isSelected(option)) {
        this.selectedOptions.set(current.filter(o => o.value !== option.value));
      } else {
        this.selectedOptions.set([...current, option]);
      }
      const values = this.selectedOptions().map(o => o.value);
      this.onChange(values);
      this.valueChange.emit(values);
      this.onTouched();
      this.programarPosicionCapa();
    } else {
      this.selectedOption.set(option);
      this.onChange(option.value);
      this.valueChange.emit(option.value);

      this.cerrarDesplegable(true, false);
      this.onTouched();
    }
  }

  removeTag(option: Select2Option, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    const current = this.selectedOptions();
    this.selectedOptions.set(current.filter(o => o.value !== option.value));
    const values = this.selectedOptions().map(o => o.value);
    this.onChange(values);
    this.valueChange.emit(values);
    this.onTouched();
    this.programarPosicionCapa();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.cerrarDesplegable(false, true);
      }
    }
  }

  writeValue(value: unknown): void {
    if (!this.options.length) {
      // Guarda el valor hasta que lleguen las opciones (carga asíncrona)
      this.pendingValue = value;
      this.clearSelection();
      return;
    }
    this.applyIncomingValue(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.highlightedIndex.set(this.nextEnabledIndex(this.filteredOptions(), -1, 1));
    this.programarPosicionCapa();
  }

  removeTagLabel(option: Select2Option): string {
    return `Quitar ${option.label}`;
  }

  /** Limpia selecciones actuales */
  private clearSelection(): void {
    this.selectedOption.set(null);
    this.selectedOptions.set([]);
  }

  /** Aplica un valor entrante respetando los modos single/multiple */
  private applyIncomingValue(value: unknown, emit = false): void {
    if (this.multiple()) {
      const values = Array.isArray(value) ? value as (string | number)[] : [];
      const validOptions = this.options.filter(o => o.value !== null && values.includes(o.value as string | number));
      this.selectedOptions.set(validOptions);
      if (emit) {
        this.onChange(validOptions.map(o => o.value));
        this.valueChange.emit(validOptions.map(o => o.value));
      }
    } else {
      const option = this.options.find(o => o.value === value);
      this.selectedOption.set(option || null);
      if (emit && option) {
        this.onChange(option.value);
        this.valueChange.emit(option.value);
      }
    }
  }

  /** Rehidrata selección cuando cambian las opciones */
  private reconcilePendingValue(): void {
    if (this.pendingValue !== undefined) {
      this.applyIncomingValue(this.pendingValue);
      this.pendingValue = undefined;
      return;
    }

    // Revalida selección actual por si alguna opción desapareció
    if (this.multiple()) {
      const currentValues = this.selectedOptions().map(o => o.value);
      this.applyIncomingValue(currentValues);
    } else {
      this.applyIncomingValue(this.selectedOption()?.value);
    }
  }

  private ensureEnabledHighlight(): void {
    if (!this.isOpen()) return;
    const options = this.filteredOptions();
    const current = this.highlightedIndex();
    if (current >= 0 && options[current] && !options[current].disabled) return;

    const selectedValue = !this.multiple() ? this.selectedOption()?.value : undefined;
    const selected = options.findIndex(option => option.value === selectedValue && !option.disabled);
    this.highlightedIndex.set(selected >= 0 ? selected : this.nextEnabledIndex(options, -1, 1));
  }

  private nextEnabledIndex(
    options: readonly Select2Option[],
    current: number,
    direction: 1 | -1
  ): number {
    let index = current;
    if (index < 0) index = direction === 1 ? -1 : options.length;
    for (index += direction; index >= 0 && index < options.length; index += direction) {
      if (!options[index].disabled) return index;
    }
    return current >= 0 && options[current] && !options[current].disabled ? current : -1;
  }
}
