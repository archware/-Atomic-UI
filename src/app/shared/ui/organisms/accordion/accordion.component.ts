import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  effect,
  untracked,
  input,
  output
} from '@angular/core';

export type AccordionVariant = 'default' | 'multiple' | 'single' | 'flush';

@Component({
  selector: 'app-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './accordion.component.css',
    templateUrl: './accordion.component.html'
})
export class AccordionComponent {
  readonly variant = input<AccordionVariant>('default');
  readonly flush = input(false);
  readonly single = input(false);
  /**
   * En modo de selección única (`single` o `variant="single"`), indica si el
   * panel activo puede cerrarse al volver a pulsarlo (`true` por omisión) o si
   * debe permanecer siempre al menos un panel abierto (`false`).
   */
  readonly collapsible = input(true);

  readonly esModoUnico = computed(() => this.single() || this.variant() === 'single');
  readonly esSinMarco = computed(() => this.flush() || this.variant() === 'flush');

  private readonly items: AccordionItemComponent[] = [];

  private readonly sincronizarModoUnico = effect(() => {
    const modoUnico = this.esModoUnico();
    const esColapsable = this.collapsible();
    if (!modoUnico) {
      return;
    }
    untracked(() => {
      this.ordenarItemsPorDom();
      const abiertos = this.items.filter((candidate) => candidate.isOpen());
      if (abiertos.length > 1) {
        this.closeOtherItems(abiertos[0]);
      } else if (abiertos.length === 0 && !esColapsable) {
        this.asegurarAlMenosUnoAbierto();
      }
    });
  });

  register(item: AccordionItemComponent): void {
    if (!this.items.includes(item)) {
      this.items.push(item);
    }
    this.ordenarItemsPorDom();
    if (this.esModoUnico() && item.isOpen()) {
      const primeroAbierto = this.items.find((candidate) => candidate.isOpen());
      if (primeroAbierto) {
        this.closeOtherItems(primeroAbierto, false);
      }
    }
  }

  unregister(item: AccordionItemComponent): void {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
    this.asegurarAlMenosUnoAbierto();
  }

  notifyItemOpened(item: AccordionItemComponent): void {
    if (this.esModoUnico() && this.items.includes(item)) {
      this.closeOtherItems(item);
    }
  }

  requestToggle(item: AccordionItemComponent): void {
    const nextOpen = !item.isOpen();
    if (!nextOpen && this.esModoUnico() && !this.collapsible()) {
      const otrosAbiertos = this.items.some(
        (candidate) => candidate !== item && candidate.isOpen(),
      );
      if (!otrosAbiertos) {
        return;
      }
    }
    item.setOpen(nextOpen, true);
  }

  moveFocus(item: AccordionItemComponent, key: string): boolean {
    this.ordenarItemsPorDom();
    const enabledItems = this.items.filter((candidate) => !candidate.disabled());
    const currentIndex = enabledItems.indexOf(item);
    if (currentIndex < 0 || enabledItems.length === 0) {
      return false;
    }

    let nextIndex: number;
    switch (key) {
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % enabledItems.length;
        break;
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledItems.length - 1;
        break;
      default:
        return false;
    }

    enabledItems[nextIndex]?.focusHeader();
    return true;
  }

  private closeOtherItems(openItem: AccordionItemComponent, emit = true): void {
    for (const item of this.items) {
      if (item !== openItem && item.isOpen()) {
        item.setOpen(false, emit);
      }
    }
  }

  private asegurarAlMenosUnoAbierto(): void {
    if (!this.esModoUnico() || this.collapsible()) {
      return;
    }
    this.ordenarItemsPorDom();
    const hayAbierto = this.items.some((candidate) => candidate.isOpen() && !candidate.disabled());
    if (hayAbierto) {
      return;
    }
    const primeroHabilitado = this.items.find((candidate) => !candidate.disabled());
    primeroHabilitado?.setOpen(true, true);
  }

  private ordenarItemsPorDom(): void {
    this.items.sort((a, b) => {
      const pos = a.nativeElement.compareDocumentPosition(b.nativeElement);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }
      return 0;
    });
  }
}

/**
 * Elemento colapsable accesible. Debe utilizarse dentro de `app-accordion`.
 *
 * El encabezado es un botón nativo, mantiene relaciones ARIA completas y
 * participa en la navegación opcional con flechas, Home y End del organismo.
 */
@Component({
  selector: 'app-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './accordion-item.component.css',
    templateUrl: './accordion-item-component.component.html'
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  private static nextId = 0;

  private readonly accordion = inject(AccordionComponent, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = input(`accordion-${++AccordionItemComponent.nextId}`);
  readonly title = input('');
  readonly description = input('');
  readonly icon = input('');
  /** Nivel del encabezado que anuncia este panel. Ver el comentario de arriba. */
  readonly headingLevel = input(3);
  readonly disabled = input(false);
  // La señal interna conserva `open` y delega en el setter que mantiene sincronizado `isOpen`.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaAbierto = input(false, { alias: 'open' });
  set open(value: boolean) {
    this.setOpen(value, false);
  }
  readonly openChange = output<boolean>();

  readonly isOpen = signal(false);
  private ultimoAbiertoEntrada: boolean | undefined = undefined;
  private readonly sincronizarAbierto = effect(() => {
    const abierto = this.entradaAbierto();
    if (this.ultimoAbiertoEntrada === abierto) {
      return;
    }
    this.ultimoAbiertoEntrada = abierto;
    untracked(() => {
      this.open = abierto;
    });
  });

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  get headerId(): string {
    return `${this.id()}-header`;
  }

  get contentId(): string {
    return `${this.id()}-content`;
  }

  ngOnInit(): void {
    const abiertoInicial = this.entradaAbierto();
    this.ultimoAbiertoEntrada = abiertoInicial;
    if (abiertoInicial && !this.isOpen()) {
      this.isOpen.set(true);
    }
    this.accordion?.register(this);
  }

  ngOnDestroy(): void {
    this.accordion?.unregister(this);
  }

  toggle(): void {
    if (this.disabled()) {
      return;
    }

    if (this.accordion) {
      this.accordion.requestToggle(this);
      return;
    }

    this.setOpen(!this.isOpen(), true);
  }

  setOpen(value: boolean, emit: boolean): void {
    if (this.isOpen() === value) {
      return;
    }

    if (!value) {
      this.focusHeaderWhenContentContainsFocus();
    }
    this.isOpen.set(value);
    if (value) {
      this.accordion?.notifyItemOpened(this);
    }
    if (emit) {
      this.openChange.emit(value);
    }
  }

  focusHeader(): void {
    this.elementRef.nativeElement
      .querySelector<HTMLButtonElement>('.accordion-header')
      ?.focus();
  }

  private focusHeaderWhenContentContainsFocus(): void {
    const host = this.elementRef.nativeElement;
    const content = host.querySelector<HTMLElement>('.accordion-content');
    const activeElement = host.ownerDocument.activeElement;
    if (content && activeElement && content.contains(activeElement)) {
      this.focusHeader();
    }
  }

  handleHeaderKeydown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    if (this.accordion?.moveFocus(this, event.key)) {
      event.preventDefault();
    }
  }
}
