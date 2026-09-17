import { Component, forwardRef, input, output, signal } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Componente Radio Button con diseño coherente al CheckboxComponent.
 * Implementa ControlValueAccessor para integración con formularios.
 * 
 * @example
 * ```html
 * <app-radio 
 *   name="preference"
 *   [options]="[
 *     { value: 'email', label: 'Email' },
 *     { value: 'phone', label: 'Teléfono' }
 *   ]"
 *   [(ngModel)]="selectedPreference"
 * ></app-radio>
 * ```
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css'
})
export class RadioComponent implements ControlValueAccessor {
  readonly name = input('radio-group');
  readonly label = input('');
  readonly options = input<RadioOption[]>([]);
  readonly direction = input<'horizontal' | 'vertical'>('vertical');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  readonly valueChange = output<string | number>();

  selectedValue: string | number = '';
  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onRadioChange(value: string | number): void {
    this.selectedValue = value;
    this.onChange(value);
    this.valueChange.emit(value);
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.selectedValue = value ?? '';
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
