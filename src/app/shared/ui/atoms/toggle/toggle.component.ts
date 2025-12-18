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
      gap: var(--space-3);
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
      background: var(--surface-background);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
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
      box-shadow: var(--shadow-focus-primary);
    }

    .toggle-label {
      font-size: var(--text-sm);
      color: var(--text-color);
      line-height: 1.4;
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --border-color, --surface-background, --primary-color, --shadow-focus-primary
     * ya tienen valores apropiados para temas oscuros.
     */
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
