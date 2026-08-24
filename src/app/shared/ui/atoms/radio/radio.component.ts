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
  template: `
    <div class="radio-group" [class.horizontal]="direction() === 'horizontal'" [class.disabled]="isDisabled()" role="radiogroup" [attr.aria-label]="label()">
      @if (label()) {
        <span class="radio-group-label">{{ label() }}</span>
      }

      <div class="radio-options" [class.horizontal]="direction() === 'horizontal'">
        @for (option of options(); track option.value) {
          <label 
            class="radio-wrapper" 
            [class.disabled]="isDisabled() || option.disabled"
            [class.selected]="selectedValue === option.value"
          >
            <input
              type="radio"
              class="radio-input"
              [name]="name()"
              [value]="option.value"
              [checked]="selectedValue === option.value"
              [disabled]="isDisabled() || option.disabled"
              (change)="onRadioChange(option.value)"
            />
            <span class="radio-circle">
              <span class="radio-dot"></span>
            </span>
            <span class="radio-label">{{ option.label }}</span>
          </label>
        }
      </div>
    </div>
  `,
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
