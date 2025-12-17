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
        @if (iconClass) {
          <i [class]="'input-icon ' + iconClass"></i>
        } @else if (icon) {
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

    /* Reuse form-group styles from global if available, or define local */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
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
      color: var(--text-color-muted);
      pointer-events: none;
      display: flex; /* Ensure centering */
      align-items: center;
      justify-content: center;
    }

    /* When icon is present, add padding */
    .input-container:has(.input-icon) .form-input {
      padding-left: 2.5rem;
    }

    .form-input {
      width: 100%;
      height: var(--control-height, 40px);
      padding: 0 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background-color: var(--surface-background);
      color: var(--text-color);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-input:disabled {
      background-color: var(--surface-hover);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .has-error .form-input {
      border-color: var(--danger-color);
    }

    .has-error .form-input:focus {
      box-shadow: 0 0 0 3px var(--danger-100);
    }

    .input-error {
      font-size: 0.75rem;
      color: var(--danger-color);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() iconClass = '';
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
