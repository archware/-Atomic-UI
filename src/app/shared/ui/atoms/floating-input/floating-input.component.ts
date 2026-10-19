import { Component, forwardRef, signal, computed, ChangeDetectionStrategy, input, output, model } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { VariablesCssDirective } from '../../directives/variables-css.directive';
import {
  FieldLabelVariant,
  esEtiquetaElevada,
  esEtiquetaFlotante,
  esMarcadorVisible,
} from '../form-field/field-label';

export type FloatingInputType = 'text' | 'search' | 'date' | 'number' | 'password' | 'email' | 'tel' | 'datetime-local' | 'time';
/**
 * Modo de etiqueta del campo flotante.
 *
 * Comparte el contrato FieldLabelVariant (standard | floating | floating-value) con el resto de
 * controles. underline, material y outline son formas visuales historicas del modo flotante.
 * El valor por defecto sigue siendo floating: es la identidad de este componente.
 */
export type FloatingInputVariant = FieldLabelVariant | 'underline' | 'material' | 'outline';

@Component({
  selector: 'app-floating-input',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatingInputComponent),
      multi: true
    }
  ],
  templateUrl: './floating-input.component.html',
  styleUrls: ['./floating-input.component.css', '../form-field/field-label.css']
})
export class FloatingInputComponent implements ControlValueAccessor {
  readonly type = input<FloatingInputType>('text');
  readonly variant = input<FloatingInputVariant>('floating');
  readonly label = input('');
  readonly placeholder = input('');
  readonly icon = input('');
  readonly error = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly readonly = input(false);
  readonly width = input(''); // Optional: e.g., '200px', '50%', 'auto'
  readonly autocomplete = input(''); // Optional: 'off', 'current-password', 'new-password', etc.
  readonly iconClass = input('');
  readonly clearable = input(false);
  readonly iconClick = output<void>();
  readonly clear = output<void>();

  readonly value = model<string | number>('');

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }
  isFocused = signal(false);
  showPassword = signal(false);

  /** Las formas historicas se reducen a su comportamiento de etiqueta: suben con enfoque o valor. */
  private readonly modoEtiqueta = computed<FieldLabelVariant>(() => {
    const variant = this.variant();
    return variant === 'standard' || variant === 'floating-value' ? variant : 'floating';
  });
  /** Clase visual: floating-value dibuja la caja flotante y solo cambia el momento de la subida. */
  protected readonly claseVisual = computed(() =>
    this.variant() === 'floating-value' ? 'floating' : this.variant(),
  );
  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.modoEtiqueta(), this.tieneEtiqueta()),
  );
  /** Con floating-value el enfoque no sube la etiqueta: solo el valor. */
  protected readonly soloValor = computed(() => this.variant() === 'floating-value');
  protected readonly elevada = computed(() =>
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

  // Generate unique ID for accessibility (label-for association)
  private static instanceCounter = 0;
  private readonly _inputId = `floating-input-${++FloatingInputComponent.instanceCounter}`;
  readonly inputId = () => this._inputId;

  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  actualType(): string {
    const type = this.type();
    if (type === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return type;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  passwordToggleAccessibleLabel(): string {
    return this.showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña';
  }

  onPasswordToggleClick(event: Event): void {
    event.stopPropagation();
    this.togglePassword();
    this.iconClick.emit();
  }

  getIconClass(): string {
    if (this.clearable() && this.hasValue()) {
      return 'fa-solid fa-times';
    }
    return this.iconClass();
  }

  handleIconClick(event: Event): void {
    event.stopPropagation();
    if (this.clearable() && this.hasValue()) {
      this.value.set('');
      this.onChange(this.value());
      this.clear.emit();
      // If parent is listening to (input) event directly on the native element,
      // it won't fire unless we dispatch it. We will emit both.
      const nativeInput = (event.target as HTMLElement).closest('.floating-input-wrapper')?.querySelector('input');
      if (nativeInput) {
        nativeInput.value = '';
        nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }
    this.iconClick.emit();
  }

  emitIconClick(event: Event): void {
    event.stopPropagation();
    this.iconClick.emit();
  }

  hasValue(): boolean {
    const value = this.value();
    return value !== '' && value !== null && value !== undefined;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(this.value());
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
