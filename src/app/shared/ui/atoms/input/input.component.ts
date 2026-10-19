import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FIELD_LABEL_VARIANT_DEFAULT,
  FieldLabelVariant,
  esEtiquetaElevada,
  esEtiquetaFlotante,
  esMarcadorVisible,
} from '../form-field/field-label';

export type InputType = 'text' | 'password' | 'email' | 'tel' | 'date' | 'search' | 'number';
export type InputMode = 'text' | 'numeric' | 'email' | 'tel' | 'search' | 'decimal';

/**
 * Entrada de formulario canonica de Atomic UI (`InputComponent`).
 *
 * Unifica las dos implementaciones historicas (`atoms/input` y `atoms/form-input`): conserva los
 * selectores `app-input`, `prest-input` y `app-form-input`, y el alias de clase `Input` se mantiene
 * exportado desde `atoms/form-input/input` para los consumidores existentes.
 *
 * `variant` sigue el contrato comun de etiqueta (`standard` | `floating` | `floating-value`),
 * ver `form-field/field-label.ts`.
 */
@Component({
  selector: 'app-input, prest-input, app-form-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css', '../form-field/field-label.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  private static nextId = 0;
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly generatedId = `prest-input-${++InputComponent.nextId}`;

  readonly controlId = input<string | null>(null);
  readonly type = input<InputType>('text');
  readonly label = input('');
  readonly variant = input<FieldLabelVariant>(FIELD_LABEL_VARIANT_DEFAULT);
  readonly placeholder = input('');
  readonly icon = input('');
  readonly iconClass = input('');
  readonly autocomplete = input('off');
  readonly inputMode = input<InputMode>('text');
  readonly maxLength = input<number | null>(null);
  readonly minLength = input<number | null>(null);
  readonly min = input<string | number | null>(null);
  readonly max = input<string | number | null>(null);
  readonly step = input<string | number | null>(null);
  readonly error = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly revealable = input(false);

  readonly valueChange = output<string>();

  protected readonly value = signal('');
  protected readonly enfocado = signal(false);
  protected readonly controlDisabled = signal(false);
  protected readonly revealed = signal(false);
  protected readonly id = computed(() => this.controlId() ?? this.generatedId);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.controlDisabled());
  protected readonly effectiveType = computed<InputType>(() => {
    if (this.type() === 'password' && this.revealable() && this.revealed()) {
      return 'text';
    }
    return this.type();
  });

  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.variant(), this.tieneEtiqueta()),
  );
  /**
   * `date` pinta su mascara nativa (dd/mm/aaaa) aunque este vacio: la etiqueta no puede quedarse
   * debajo, asi que en modo flotante sube siempre.
   */
  protected readonly elevada = computed(
    () =>
      (this.flotante() && this.type() === 'date') ||
      esEtiquetaElevada(
        this.variant(),
        this.tieneEtiqueta(),
        this.enfocado(),
        this.value().length > 0,
      ),
  );
  protected readonly marcador = computed(() =>
    esMarcadorVisible(this.variant(), this.tieneEtiqueta(), this.elevada())
      ? this.placeholder() || null
      : null,
  );
  protected readonly descritoPor = computed(() => {
    if (this.error()) return `${this.id()}-error`;
    if (this.hint()) return `${this.id()}-hint`;
    return null;
  });

  private onChange: (value: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** Compatibilidad con el `InputComponent` historico. */
  get inputId(): string {
    return this.id();
  }

  /** Compatibilidad con el `InputComponent` historico. */
  isDisabled(): boolean {
    return this.effectiveDisabled();
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }

  protected handleFocus(): void {
    this.enfocado.set(true);
  }

  protected handleBlur(): void {
    this.enfocado.set(false);
    this.onTouched();
  }

  protected toggleReveal(): void {
    this.revealed.update((current) => !current);
  }

  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
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
