import { Component, forwardRef, input, signal } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css'
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  checked = false;
  onChange: (value: boolean) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onCheckChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
