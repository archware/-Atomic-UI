import { Component, Input, Output, EventEmitter, forwardRef, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type FloatingInputType = 'text' | 'date' | 'number' | 'password' | 'email' | 'tel' | 'datetime-local' | 'time';
export type FloatingInputVariant = 'floating' | 'underline' | 'material' | 'outline';

@Component({
  selector: 'app-floating-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatingInputComponent),
      multi: true
    }
  ],
  template: `
    <div 
      class="floating-input-wrapper"
      [class]="'variant-' + variant"
      [class.focused]="isFocused()"
      [class.has-value]="hasValue()"
      [class.has-error]="error"
      [class.disabled]="disabled"
      [class.has-icon]="icon || type === 'password'"
      [style.width]="width || null"
    >
      <input
        #inputEl
        class="floating-input"
        [id]="inputId()"
        [type]="actualType()"
        [disabled]="disabled"
        [readonly]="readonly"
        [value]="value"
        [attr.autocomplete]="autocomplete || (type === 'password' ? 'current-password' : 'off')"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [attr.placeholder]="variant === 'floating' || variant === 'material' ? ' ' : placeholder"
      />
      <label class="floating-label" [attr.for]="inputId()">{{ label }}</label>
      <span class="input-line"></span>
      
      <!-- Icon button (password toggle or custom icon) -->
      @if (type === 'password') {
        <button type="button" class="input-icon-btn" (click)="togglePassword()" tabindex="-1">
          <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
        </button>
      } @else if (iconClass) {
        <span class="input-icon"><i [class]="iconClass"></i></span>
      } @else if (icon) {
        <span class="input-icon">{{ icon }}</span>
      }
      
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

    .floating-input-wrapper {
      position: relative;
      width: 100%;
      min-width: 15rem; /* 240px minimum */
      margin-top: 0.75rem;
    }

    /* === BASE INPUT === */
    .floating-input {
      width: 100%;
      height: var(--control-height);
      padding: 0 0.875rem;
      line-height: calc(var(--control-height) - 2px); /* Robust vertical centering */
      font-size: 0.875rem;
      color: var(--input-text);
      background: transparent;
      border: none;
      outline: none;
      transition: all 200ms ease;
      box-sizing: border-box; /* Ensure padding doesn't affect height */
    }

    /* Standardize date and number inputs */
    .floating-input[type="date"],
    .floating-input[type="number"] {
      line-height: normal; /* Reset line-height to prevent expansion */
      height: var(--control-height);
      box-sizing: border-box;
      margin: 0;
    }
    
    /* Reset native date picker indicator spacing */
    .floating-input::-webkit-calendar-picker-indicator {
      margin: 0;
      padding: 0;
    }
    
    /* Reveal mask only when focused or has value to prevent label overlap */
    .floating-input-wrapper:not(.focused):not(.has-value) .floating-input::-webkit-datetime-edit {
      color: transparent;
    }

    .has-icon .floating-input {
      padding-right: 3rem;
    }
    
    .floating-input::placeholder {
      color: transparent;
    }

    /* === FLOATING LABEL === */
    .floating-label {
      position: absolute;
      left: 0.875rem;
      top: calc(var(--control-height) / 2);
      transform: translateY(-50%);
      font-size: 1.0625rem;
      color: var(--input-placeholder);
      pointer-events: none;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left center;
      z-index: 10; /* Ensure label sits above borders/content */
    }

    /* Label goes up when focused or has value */
    .focused .floating-label,
    .has-value .floating-label {
      top: 0.125rem;
      transform: translateY(0);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--primary-color);
    }

    /* === INPUT LINE (for underline/material) === */
    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--input-border);
    }

    .input-line::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: var(--primary-color);
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(-50%);
    }

    .focused .input-line::after {
      width: 100%;
    }

    /* === VARIANT: FLOATING === */
    .variant-floating .floating-input {
      height: var(--control-height);
      /* padding inherited from base: 0 0.875rem */
      border: var(--input-border-width, 1.5px) solid var(--input-border);
      border-radius: 0.5rem;
      background: var(--input-bg);
      font-size: 0.875rem;
      box-shadow: var(--input-shadow);
    }

    .variant-floating .floating-label {
      left: 0.875rem;
      background: var(--input-bg);
      padding: 0 0.5rem;
      white-space: nowrap;
    }

    .variant-floating.focused .floating-label,
    .variant-floating.has-value .floating-label {
      top: -0.625rem;
      transform: translateY(0);
    }

    .variant-floating.focused .floating-input {
      border-color: var(--input-border-focus);
      box-shadow: 0 0 0 3px var(--hover-background);
    }

    .variant-floating .input-line {
      display: none;
    }

    /* === VARIANT: UNDERLINE === */
    .variant-underline .floating-input {
      height: var(--control-height);
      padding: 0;
      padding-top: 1.25rem; /* Increased for 46px height */
      line-height: 1.5; /* Reset line-height for underline */
      font-size: 0.875rem;
      border-bottom: 1px solid var(--input-border);
    }

    .variant-underline .floating-label {
      left: 0;
      /* font-size hereda de .floating-label base (1.0625rem) */
    }

    .variant-underline.focused .floating-label,
    .variant-underline.has-value .floating-label {
      top: -0.25rem;
      font-size: 0.75rem;
    }

    .variant-underline.focused .floating-input,
    .variant-underline.has-value .floating-input {
      border-bottom-color: transparent;
    }

    .variant-underline .input-line {
      height: 2px;
    }

    /* === VARIANT: MATERIAL === */
    .variant-material .floating-input {
      height: var(--control-height);
      padding: 0;
      padding-top: 1.25rem;
      line-height: 1.5;
      font-size: 0.875rem;
    }

    .variant-material.has-icon .floating-input {
      padding-right: 3rem;
    }

    .variant-material .floating-label {
      left: 0;
      font-size: 0.875rem;
    }

    .variant-material.focused .floating-label,
    .variant-material.has-value .floating-label {
      top: -0.25rem;
      font-size: 0.75rem;
      color: var(--primary-color);
      font-weight: 600;
    }

    /* === VARIANT: OUTLINE === */
    .variant-outline .floating-input {
      height: var(--control-height);
      height: var(--control-height);
      /* padding inherited from base: 0 0.875rem */
      font-size: 0.875rem;
      border: var(--input-border-width, 1.5px) solid var(--input-border);
      border-radius: 0.5rem;
      box-shadow: var(--input-shadow);
    }

    .variant-outline .floating-label {
      top: 50%;
      background: var(--input-bg);
      padding: 0 0.5rem;
      font-size: 1.0625rem;
      white-space: nowrap;
    }

    .variant-outline.focused .floating-label,
    .variant-outline.has-value .floating-label {
      top: -0.625rem;
      font-size: 0.8125rem;
    }

    .variant-outline.focused .floating-input {
      border-color: var(--input-border-focus);
      box-shadow: 0 0 0 3px var(--hover-background);
    }

    .variant-outline .input-line {
      display: none;
    }

    /* === ICONS === */
    .input-icon {
      position: absolute;
      right: 0.875rem;
      top: calc(var(--control-height) / 2);
      transform: translateY(-50%);
      color: var(--text-color-muted);
      font-size: 1rem;
      /* Fix strict sizing to prevent height variations */
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-icon-btn {
      position: absolute;
      right: 0.5rem;
      top: calc(var(--control-height) / 2);
      transform: translateY(-50%);
      width: 2.25rem;
      height: 2.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .input-icon-btn:hover {
      background: var(--hover-background-subtle);
      color: var(--primary-color);
    }

    .input-icon-btn i {
      font-size: 1rem;
    }

    /* === STATES === */
    .disabled .floating-input {
      background: var(--input-disabled-bg);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .has-error .floating-input {
      border-color: var(--danger-color) !important;
    }

    .has-error .floating-label {
      color: var(--danger-color) !important;
    }

    .has-error .input-line::after {
      background: var(--danger-color);
    }

    .input-error {
      display: block;
      margin-top: 0.375rem;
      font-size: 0.8125rem;
      color: var(--danger-color);
    }
    
    /* Dark mode handled automatically by CSS variables */
  `]
})
export class FloatingInputComponent implements ControlValueAccessor {
  @Input() type: FloatingInputType = 'text';
  @Input() variant: FloatingInputVariant = 'floating';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() icon = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() width = ''; // Optional: e.g., '200px', '50%', 'auto'
  @Input() autocomplete = ''; // Optional: 'off', 'current-password', 'new-password', etc.
  @Input() iconClass = '';
  @Output() iconClick = new EventEmitter<void>();

  @Input() value: string | number = '';
  isFocused = signal(false);
  showPassword = signal(false);

  // Generate unique ID for accessibility (label-for association)
  private static instanceCounter = 0;
  readonly inputId = computed(() => `floating-input-${FloatingInputComponent.instanceCounter++}`);

  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  actualType(): string {
    if (this.type === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return this.type;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  hasValue(): boolean {
    return this.value !== '' && this.value !== null && this.value !== undefined;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
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
