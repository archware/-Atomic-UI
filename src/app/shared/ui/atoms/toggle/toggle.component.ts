import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ],
  template: `
    <label class="toggle-wrapper" [class.disabled]="disabled">
      <input
        type="checkbox"
        class="toggle-input"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggleChange($event)"
      />
      <span class="toggle-track">
        <span class="toggle-thumb"></span>
      </span>
      @if (label) {
        <span class="toggle-label">{{ label }}</span>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
    }

    .toggle-wrapper.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-track {
      width: 48px;
      height: 28px;
      background: var(--border-color);
      border-radius: 14px;
      padding: 2px;
      transition: all 200ms ease;
      flex-shrink: 0;
    }

    .toggle-thumb {
      display: block;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 200ms ease;
    }

    /* Hover */
    .toggle-wrapper:hover:not(.disabled) .toggle-track {
      background: var(--text-color-secondary);
    }

    /* Checked */
    .toggle-input:checked + .toggle-track {
      background: var(--primary-color);
    }

    .toggle-input:checked + .toggle-track .toggle-thumb {
      transform: translateX(20px);
    }

    /* Focus */
    .toggle-input:focus-visible + .toggle-track {
      box-shadow: 0 0 0 3px rgba(121, 53, 118, 0.2);
    }

    .toggle-label {
      font-size: 0.875rem;
      color: var(--text-color);
      line-height: 1.4;
    }

    /* Dark Mode */
    :host-context(.dark) .toggle-track,
    :host-context([data-theme="dark"]) .toggle-track {
      background: var(--border-color);
    }

    :host-context(.dark) .toggle-thumb,
    :host-context([data-theme="dark"]) .toggle-thumb {
      background: var(--surface-background);
    }

    :host-context(.dark) .toggle-wrapper:hover:not(.disabled) .toggle-track,
    :host-context([data-theme="dark"]) .toggle-wrapper:hover:not(.disabled) .toggle-track {
      background: var(--text-color-secondary);
    }

    :host-context(.dark) .toggle-input:checked + .toggle-track,
    :host-context([data-theme="dark"]) .toggle-input:checked + .toggle-track {
      background: var(--primary-color-light);
    }

    :host-context(.dark) .toggle-input:checked + .toggle-track .toggle-thumb,
    :host-context([data-theme="dark"]) .toggle-input:checked + .toggle-track .toggle-thumb {
      background: #1f2937;
    }

    :host-context(.dark) .toggle-input:focus-visible + .toggle-track,
    :host-context([data-theme="dark"]) .toggle-input:focus-visible + .toggle-track {
      box-shadow: 0 0 0 3px rgba(188, 154, 187, 0.3);
    }

    :host-context(.dark) .toggle-label,
    :host-context([data-theme="dark"]) .toggle-label {
      color: var(--text-color);
    }
  `]
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() disabled = false;

  checked = false;
  onChange: (value: boolean) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onToggleChange(event: Event): void {
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
