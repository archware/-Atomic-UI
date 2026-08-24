import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  signal,
  effect,
  untracked,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="accordion" [class.accordion-flush]="flush()">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './accordion.component.css',
})
export class AccordionComponent {
  readonly flush = input(false);
  readonly single = input(false);

  private readonly items: AccordionItemComponent[] = [];

  register(item: AccordionItemComponent): void {
    this.items.push(item);
    if (this.single() && item.isOpen()) {
      this.closeOtherItems(item);
    }
  }

  unregister(item: AccordionItemComponent): void {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  requestToggle(item: AccordionItemComponent): void {
    const nextOpen = !item.isOpen();
    if (nextOpen && this.single()) {
      this.closeOtherItems(item);
    }
    item.setOpen(nextOpen, true);
  }

  moveFocus(item: AccordionItemComponent, key: string): boolean {
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

  private closeOtherItems(openItem: AccordionItemComponent): void {
    for (const item of this.items) {
      if (item !== openItem && item.isOpen()) {
        item.setOpen(false, true);
      }
    }
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
  template: `
    <div class="accordion-item" [class.open]="isOpen()" [class.disabled]="disabled()">
      <!--
        EL TITULO DE UN PANEL ES UN ENCABEZADO, Y AQUI NO LO ERA.

        El disparador era un <button> suelto, asi que los paneles NO aparecian en
        el indice de encabezados. Quien navega saltando por titulos —que es como
        se recorre una pantalla con lector de pantalla— pasaba del titulo de la
        pagina directamente a lo que hubiera DENTRO del primer panel abierto, sin
        enterarse de que existian los demas ni de como se llamaban.

        Es lo que dicen las practicas de ARIA para acordeon: el boton va envuelto
        en un elemento con rol de encabezado. El nivel lo decide quien monta la
        pantalla, porque solo alli se sabe que hay por encima; 3 es el valor
        sensato bajo un <h1> de pagina y un <h2> de seccion.
      -->
      <div role="heading" [attr.aria-level]="headingLevel()">
      <button
        #header
        type="button"
        class="accordion-header"
        [id]="headerId"
        [disabled]="disabled()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="contentId"
        (click)="toggle()"
        (keydown)="handleHeaderKeydown($event)"
      >
        <span class="accordion-heading">
          <span class="accordion-title">{{ title() }}</span>
          @if (description()) {
            <span class="accordion-description">{{ description() }}</span>
          }
        </span>
        <span class="accordion-icon" aria-hidden="true">
          <i class="fa-solid fa-chevron-down"></i>
        </span>
      </button>
      </div>
      <div
        class="accordion-content"
        [id]="contentId"
        role="region"
        [attr.aria-labelledby]="headerId"
        [attr.aria-hidden]="!isOpen()"
        [attr.inert]="isOpen() ? null : ''"
      >
        <div class="accordion-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './accordion-item.component.css',
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  private static nextId = 0;

  private readonly accordion = inject(AccordionComponent, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly id = input(`accordion-${++AccordionItemComponent.nextId}`);
  readonly title = input('');
  readonly description = input('');
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
  private readonly sincronizarAbierto = effect(() => {
    const abierto = this.entradaAbierto();
    untracked(() => {
      this.open = abierto;
    });
  });

  get headerId(): string {
    return `${this.id()}-header`;
  }

  get contentId(): string {
    return `${this.id()}-content`;
  }

  ngOnInit(): void {
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
    if (this.accordion?.moveFocus(this, event.key)) {
      event.preventDefault();
    }
  }
}
