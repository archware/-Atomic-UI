import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
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

/**
 * Modo de etiqueta del Textarea.
 *
 * Comparte el contrato `FieldLabelVariant` con el resto de controles. `outline` y `material` son
 * variantes visuales historicas que se conservan por compatibilidad:
 * - `outline`:  etiqueta siempre elevada sobre el borde.
 * - `material`: etiqueta flotante (enfoque o valor) con subrayado de enfoque.
 */
export type TextareaVariant = FieldLabelVariant | 'outline' | 'material';

/**
 * Textarea con etiqueta superior o flotante.
 * Implementa ControlValueAccessor: el valor es una senal, de modo que la etiqueta flotante reacciona
 * a `ngModel`, `FormControl` y `writeValue` programaticos (con OnPush o sin zona).
 *
 * @example
 * ```html
 * <app-textarea label="Mensaje" variant="floating" [(ngModel)]="message"></app-textarea>
 * ```
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.css', '../form-field/field-label.css'],
})
export class TextareaComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly variant = input<TextareaVariant>(FIELD_LABEL_VARIANT_DEFAULT);
  readonly rows = input(4);
  readonly maxlength = input<number>();
  readonly showCounter = input(true);
  readonly error = input('');
  readonly hint = input('');
  readonly disabled = input(false);
  readonly readonly = input(false);

  private readonly disabledByForm = signal(false);
  private static idCounter = 0;
  private readonly generatedId = `textarea-${++TextareaComponent.idCounter}`;

  readonly isFocused = signal(false);
  /** Valor actual. Es una senal: de ella depende `hasValue`, y por tanto la etiqueta flotante. */
  readonly valor = signal('');
  readonly hasValue = computed(() => this.valor().length > 0);

  /** Compatibilidad: la propiedad publica historica `value` sigue siendo legible. */
  get value(): string {
    return this.valor();
  }
  readonly textareaId = computed(() => this.generatedId);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  /** Contrato comun: las variantes historicas se reducen a su comportamiento de etiqueta. */
  private readonly modoEtiqueta = computed<FieldLabelVariant>(() => {
    const variant = this.variant();
    return variant === 'outline' || variant === 'material' ? 'floating' : variant;
  });
  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.modoEtiqueta(), this.tieneEtiqueta()),
  );
  protected readonly elevada = computed(
    () =>
      (this.variant() === 'outline' && this.flotante()) ||
      esEtiquetaElevada(
        this.modoEtiqueta(),
        this.tieneEtiqueta(),
        this.isFocused(),
        this.hasValue(),
      ),
  );
  protected readonly marcador = computed(() =>
    esMarcadorVisible(this.modoEtiqueta(), this.tieneEtiqueta(), this.elevada())
      ? this.placeholder() || null
      : null,
  );
  protected readonly descritoPor = computed(() => {
    if (this.error()) return `${this.textareaId()}-error`;
    if (this.hint()) return `${this.textareaId()}-hint`;
    return null;
  });

  onChange: (value: string) => void = () => {
    /* noop */
  };
  onTouched: () => void = () => {
    /* noop */
  };

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valor.set(target.value);
    this.onChange(target.value);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  writeValue(value: string | null | undefined): void {
    this.valor.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
