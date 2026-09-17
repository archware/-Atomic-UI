import { Component, forwardRef, ChangeDetectionStrategy, input, signal } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'date' | 'number' | 'password' | 'email' | 'tel';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent implements ControlValueAccessor {
  readonly type = input<InputType>('text');
  readonly label = input('');
  readonly placeholder = input('');
  readonly icon = input('');
  readonly iconClass = input('');
  readonly error = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  private static idCounter = 0;
  readonly inputId = `app-input-${++InputComponent.idCounter}`;

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  value: string | number = '';
  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  writeValue(value: string | number): void {
    this.value = value ?? '';
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
