import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
  input,
  output
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * NumberInputComponent — Input numérico con botones de incremento/decremento.
 * Compatible con `ngModel` y `FormControl`.
 *
 * @example
 * ```html
 * <app-number-input [(ngModel)]="quantity" [min]="1" [max]="99" label="Cantidad"></app-number-input>
 * ```
 */
@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="number-input-wrapper" [class.number-input--disabled]="isDisabled()">
      @if (label()) {
        <label class="number-input__label" [attr.for]="inputId()">{{ label() }}</label>
      }
      <div class="number-input__control">
        <button
          type="button"
          class="number-input__btn"
          aria-label="Decrementar"
          [disabled]="isDisabled() || value() <= min()"
          (click)="decrement()"
        >
          <i class="fa-solid fa-minus" aria-hidden="true"></i>
        </button>

        <input
          #nativeInput
          [id]="inputId()"
          type="number"
          class="number-input__field"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [disabled]="isDisabled()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          [attr.aria-label]="label() ? null : 'Número'"
          [attr.aria-describedby]="describedBy"
          [attr.aria-invalid]="error() ? 'true' : null"
        />

        <button
          type="button"
          class="number-input__btn"
          aria-label="Incrementar"
          [disabled]="isDisabled() || value() >= max()"
          (click)="increment()"
        >
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
      </div>
      @if (hint()) {
        <span class="number-input__hint" [id]="inputId() + '-hint'">{{ hint() }}</span>
      }
      @if (error()) {
        <span class="number-input__error" [id]="inputId() + '-error'" role="alert">{{ error() }}</span>
      }
      <!--
        Un recorte mudo es lo mismo que un dato falso: el campo enseña una cifra
        y el total suma otra. Si se ajusta lo tecleado, se dice.
      -->
      @if (adjustment(); as adjusted) {
        <span class="number-input__adjustment" role="status">{{ adjusted }}</span>
      }
    </div>
  `,
  styleUrl: './number-input.component.css',
})
export class NumberInputComponent implements ControlValueAccessor, AfterViewInit {
  private static nextId = 0;

  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly min = input(0);
  readonly max = input(9999);
  readonly step = input(1);
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly inputId = input(`number-input-${++NumberInputComponent.nextId}`);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  readonly valueChange = output<number>();

  protected value = signal<number>(0);
  /** Lo que se ajusto de lo tecleado, para poder decirlo. */
  protected readonly adjustment = signal<string | null>(null);

  @ViewChild('nativeInput') private nativeInput?: ElementRef<HTMLInputElement>;

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  protected get describedBy(): string | null {
    const ids = [this.hint() ? `${this.inputId()}-hint` : '', this.error() ? `${this.inputId()}-error` : ''].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : null;
  }

  ngAfterViewInit(): void {
    this.syncNative();
  }

  writeValue(value: number): void {
    this.value.set(value ?? 0);
    this.adjustment.set(null);
    /*
    RECHAZAR UNA ENTRADA TAMBIEN TIENE QUE RETIRARLA DEL CAMPO.

    `[value]` solo reescribe el `<input>` cuando el numero CAMBIA. Si el padre
    repone el mismo valor que ya tenia —que es exactamente lo que hace un
    rechazo— el binding no toca el DOM y el campo se queda con lo que tecleo la
    persona. A partir de ahi, lo que se ve y lo que se cuenta son dos cifras
    distintas y nada lo delata.
    */
    this.syncNative();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  increment(): void {
    const next = Math.min(this.value() + this.step(), this.max());
    this.adjustment.set(null);
    this.setValue(next);
    this.onTouched();
  }

  decrement(): void {
    const next = Math.max(this.value() - this.step(), this.min());
    this.adjustment.set(null);
    this.setValue(next);
    this.onTouched();
  }

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const raw = element.value;

    if (raw.trim() === '') {
      /*
      UN CAMPO `type=number` MIENTE CUANDO LO TECLEADO NO ES UN NUMERO.

      Si se escribe `1o0`, el navegador ENSEÑA `1o0` y a la vez nos entrega
      cadena vacia; solo `validity.badInput` distingue eso de un campo borrado.
      Antes esto caia en `isNaN` y se ignoraba sin mas: el modelo conservaba la
      cantidad anterior mientras la fila seguia mostrando `1o0`. En un arqueo de
      caja, esa fila cuenta una cosa y enseña otra.

      Se limpia el estado invalido —solo asi el navegador suelta el texto— y se
      repone la cantidad contada.
      */
      if (element.validity?.badInput) {
        this.adjustment.set('Solo se admiten números: se repuso la cantidad contada.');
        element.value = '';
        this.syncNative();
        return;
      }

      // Vacio de verdad: se interpreta como cero, pero conserva el contrato
      // declarado por min/max igual que cualquier otro valor tecleado.
      const bounded = this.boundToRange(0);
      this.adjustment.set(
        bounded === 0
          ? null
          : `Se ajustó a ${bounded} (permitido de ${this.min()} a ${this.max()}).`,
      );
      this.setValue(bounded);
      return;
    }

    const parsed = parseFloat(raw);
    if (isNaN(parsed)) {
      this.adjustment.set('Solo se admiten números: se repuso la cantidad contada.');
      this.syncNative();
      return;
    }

    const bounded = this.boundToRange(parsed);
    this.adjustment.set(
      bounded === parsed
        ? null
        : `Se ajustó a ${bounded} (permitido de ${this.min()} a ${this.max()}).`,
    );
    this.setValue(bounded);
  }

  private setValue(val: number, options: { readonly sync?: boolean } = {}): void {
    this.value.set(val);
    this.onChange(val);
    this.valueChange.emit(val);
    if (options.sync !== false) {
      // Aunque el numero no haya cambiado: es justo el caso en que el binding
      // no reescribe y el campo se queda con lo tecleado.
      this.syncNative();
    }
  }

  private boundToRange(value: number): number {
    return Math.min(Math.max(value, this.min()), this.max());
  }

  private syncNative(): void {
    const element = this.nativeInput?.nativeElement;
    if (!element) {
      return;
    }
    const expected = String(this.value());
    if (element.value !== expected) {
      element.value = expected;
    }
  }
}
