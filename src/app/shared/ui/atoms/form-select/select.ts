import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
  readonly disabled?: boolean;
}

/** Selección portable para formularios reactivos y usos controlados. */
@Component({
  selector: 'app-select, prest-select, app-form-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select.html',
  styleUrl: './select.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
})
export class Select implements ControlValueAccessor {
  private static nextId = 0;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly generatedId = `prest-select-${++Select.nextId}`;

  readonly options = input<readonly SelectOption[]>([]);
  readonly selected = input<string | number | null>(null);
  readonly label = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly placeholder = input('Seleccione');
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly controlId = input<string | null>(null);

  readonly selectionChange = output<string>();

  private readonly nativeSelect = viewChild<ElementRef<HTMLSelectElement>>('nativeSelect');

  constructor() {
    /*
    RECHAZAR UNA ELECCION TAMBIEN TIENE QUE RETIRARLA DE LA PANTALLA.

    En modo gobernado —`[selected]` atado a una señal del padre mas
    `(selectionChange)`— `value()` ignora `formValue()` mientras `selected()` no
    sea nulo. Si el padre rechaza lo elegido y deja su señal como estaba,
    `value()` devuelve lo mismo que antes, las expresiones `[selected]` de las
    `<option>` no cambian, Angular no escribe nada, y el `<select>` se queda
    mostrando la opcion que marco el navegador con el clic.

    Lo que se ve deja de ser lo que se envia, y desde el consumidor no hay forma
    de arreglarlo: es la causa raiz de los rechazos mudos de pantalla.

    El efecto SI se vuelve a ejecutar aunque `selected()` no cambie, porque
    `handleChange` escribe `formValue` en cada interaccion. Es el mismo patron
    «señal gobernada + effect» que ya usa `file-input`.
    */
    afterRenderEffect(() => {
      const esperado = this.value();
      // Dependencia explicita: sin leerla, una eleccion rechazada dos veces
      // seguidas no volveria a disparar el efecto.
      this.formValue();
      const element = this.nativeSelect()?.nativeElement;
      if (element && element.value !== esperado) {
        element.value = esperado;
      }
    });
  }

  protected readonly formValue = signal('');
  protected readonly controlDisabled = signal(false);
  protected readonly id = computed(() => this.controlId() ?? this.generatedId);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());
  protected readonly value = computed(() => {
    const selected = this.selected();
    return selected == null ? this.formValue() : String(selected);
  });
  protected readonly legacyOption = computed<SelectOption | null>(() => {
    const value = this.value();
    if (!value || this.options().some((option) => String(option.value) === value)) {
      return null;
    }
    return { value, label: value };
  });

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const selectedOption = this.options().find((option) => String(option.value) === value);
    this.formValue.set(value);
    this.onChange(selectedOption?.value ?? value);
    this.selectionChange.emit(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.formValue.set(value == null ? '' : String(value));
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.controlDisabled.set(disabled);
    this.changeDetector.markForCheck();
  }
}
