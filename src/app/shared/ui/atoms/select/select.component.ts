import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group" [class.has-error]="error" [class.disabled]="disabled">
      @if (label) {
        <label class="form-label">{{ label }}</label>
      }
      <div class="select-container">
        <select
          class="form-select"
          [disabled]="disabled"
          [value]="value"
          (change)="onSelectChange($event)"
          (blur)="onTouched()"
        >
          @if (placeholder) {
            <option value="" disabled [selected]="!value">{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [value]="option.value">{{ option.label }}</option>
          }
        </select>
        <span class="select-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
      @if (error) {
        <span class="select-error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .select-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .select-arrow {
      position: absolute;
      right: 0.875rem;
      color: var(--text-color-muted, #9ca3af);
      pointer-events: none;
      transition: transform 200ms ease;
    }

    .select-error {
      font-size: 0.75rem;
      color: var(--error-color, #dc2626);
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() disabled = false;

  value: string | number = '';
  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
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
