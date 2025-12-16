import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'date' | 'number' | 'password' | 'email' | 'tel';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group" [class.has-error]="error" [class.disabled]="disabled">
      @if (label) {
        <label class="form-label">{{ label }}</label>
      }
      <div class="input-container">
        @if (icon) {
          <span class="input-icon">{{ icon }}</span>
        }
        <input
          class="form-input"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
      </div>
      @if (error) {
        <span class="input-error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .input-icon {
      position: absolute;
      left: 0.875rem;
      font-size: 1rem;
      color: var(--text-color-muted, #9ca3af);
      pointer-events: none;
    }

    .input-container:has(.input-icon) .form-input {
      padding-left: 2.5rem;
    }

    .input-error {
      font-size: 0.75rem;
      color: var(--error-color, #dc2626);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() error = '';
  @Input() disabled = false;

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
    this.disabled = isDisabled;
  }
}
