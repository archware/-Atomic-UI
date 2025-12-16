import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label class="checkbox-wrapper" [class.disabled]="disabled">
      <input
        type="checkbox"
        class="checkbox-input"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onCheckChange($event)"
      />
      <span class="checkbox-box">
        <svg class="checkbox-check" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      @if (label) {
        <span class="checkbox-label">{{ label }}</span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .checkbox-wrapper.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .checkbox-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .checkbox-box {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--border-color);
      border-radius: 0.375rem;
      background: var(--surface-background);
      transition: all 200ms ease;
      flex-shrink: 0;
    }

    .checkbox-check {
      width: 14px;
      height: 14px;
      color: white;
      opacity: 0;
      transform: scale(0.5);
      transition: all 200ms ease;
    }

    /* Hover */
    .checkbox-wrapper:hover:not(.disabled) .checkbox-box {
      border-color: var(--primary-color);
    }

    /* Checked */
    .checkbox-input:checked + .checkbox-box {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .checkbox-input:checked + .checkbox-box .checkbox-check {
      opacity: 1;
      transform: scale(1);
    }

    /* Focus */
    .checkbox-input:focus-visible + .checkbox-box {
      box-shadow: 0 0 0 3px rgba(121, 53, 118, 0.2);
    }

    .checkbox-label {
      font-size: 0.875rem;
      color: var(--text-color);
      line-height: 1.4;
    }

    /* Dark Mode */
    :host-context(.dark) .checkbox-box,
    :host-context([data-theme="dark"]) .checkbox-box {
      background: var(--surface-elevated);
      border-color: var(--border-color);
    }

    :host-context(.dark) .checkbox-wrapper:hover:not(.disabled) .checkbox-box,
    :host-context([data-theme="dark"]) .checkbox-wrapper:hover:not(.disabled) .checkbox-box {
      border-color: var(--primary-color-light);
    }

    :host-context(.dark) .checkbox-input:checked + .checkbox-box,
    :host-context([data-theme="dark"]) .checkbox-input:checked + .checkbox-box {
      background: var(--primary-color-light);
      border-color: var(--primary-color-light);
    }

    :host-context(.dark) .checkbox-input:checked + .checkbox-box .checkbox-check,
    :host-context([data-theme="dark"]) .checkbox-input:checked + .checkbox-box .checkbox-check {
      color: #1f2937;
    }

    :host-context(.dark) .checkbox-input:focus-visible + .checkbox-box,
    :host-context([data-theme="dark"]) .checkbox-input:focus-visible + .checkbox-box {
      box-shadow: 0 0 0 3px rgba(188, 154, 187, 0.3);
    }

    :host-context(.dark) .checkbox-label,
    :host-context([data-theme="dark"]) .checkbox-label {
      color: var(--text-color);
    }
  `]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;

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
    this.disabled = isDisabled;
  }
}
