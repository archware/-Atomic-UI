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
import { TranslateModule } from '@ngx-translate/core';
import {
  FIELD_LABEL_VARIANT_DEFAULT,
  FieldLabelVariant,
  esEtiquetaElevada,
  esEtiquetaFlotante,
} from '../form-field/field-label';
import { FormErrorComponent } from '../form-error/form-error.component';

export interface SelectOption {
  readonly value: string | number;
  readonly label: string;
  readonly disabled?: boolean;
}

/**
 * Seleccion canonica de Atomic UI (`SelectComponent`).
 *
 * Unifica `atoms/select` y `atoms/form-select`: conserva los selectores `app-select`,
 * `prest-select` y `app-form-select`; el alias `Select` se mantiene exportado desde
 * `atoms/form-select/select`.
 *
 * `variant` sigue el contrato comun de etiqueta (`standard` | `floating` | `floating-value`).
 * Un `<select>` nativo siempre muestra el texto de la opcion elegida; con etiqueta flotante en
 * reposo, ese texto (marcador) se hace transparente para no superponerse a la etiqueta.
 */
@Component({
  selector: 'app-select, prest-select, app-form-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormErrorComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css', '../form-field/field-label.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  private static nextId = 0;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly generatedId = `prest-select-${++SelectComponent.nextId}`;

  readonly options = input<readonly SelectOption[]>([]);
  readonly selected = input<string | number | null>(null);
  readonly label = input('');
  readonly variant = input<FieldLabelVariant>(FIELD_LABEL_VARIANT_DEFAULT);
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
  protected readonly enfocado = signal(false);
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

  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.variant(), this.tieneEtiqueta()),
  );
  protected readonly elevada = computed(() =>
    esEtiquetaElevada(this.variant(), this.tieneEtiqueta(), this.enfocado(), this.value() !== ''),
  );
  /** Etiqueta flotante en reposo y sin valor: el texto del marcador se oculta (no se superpone). */
  protected readonly marcadorOculto = computed(() => this.flotante() && !this.elevada());
  protected readonly descritoPor = computed(() => {
    if (this.error()) return `${this.id()}-error`;
    if (this.hint()) return `${this.id()}-hint`;
    return null;
  });

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Compatibilidad con el `SelectComponent` historico. */
  get selectId(): string {
    return this.id();
  }

  /** Compatibilidad con el `SelectComponent` historico. */
  isDisabled(): boolean {
    return this.effectiveDisabled();
  }

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const selectedOption = this.options().find((option) => String(option.value) === value);
    this.formValue.set(value);
    this.onChange(selectedOption?.value ?? value);
    this.selectionChange.emit(value);
  }

  protected handleFocus(): void {
    this.enfocado.set(true);
  }

  protected handleBlur(): void {
    this.enfocado.set(false);
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
