import { Component, forwardRef, signal, ChangeDetectionStrategy, input, output, model } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

export type FloatingInputType = 'text' | 'date' | 'number' | 'password' | 'email' | 'tel' | 'datetime-local' | 'time';
export type FloatingInputVariant = 'floating' | 'underline' | 'material' | 'outline';

@Component({
  selector: 'app-floating-input',
  standalone: true,
  imports: [VariablesCssDirective],
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
      [class]="'variant-' + variant()"
      [class.focused]="isFocused()"
      [class.has-value]="hasValue()"
      [class.has-error]="error()"
      [class.disabled]="isDisabled()"
      [class.has-icon]="icon() || type() === 'password'"
      [appVariablesCss]="{ '--floating-input-width': width() || null }"
    >
      <input
        #inputEl
        class="floating-input"
        [id]="inputId()"
        [type]="actualType()"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [value]="value()"
        [attr.data-clipboard-policy]="type() === 'password' ? 'paste-only' : null"
        [attr.autocomplete]="autocomplete() || (type() === 'password' ? 'current-password' : 'off')"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [attr.placeholder]="variant() === 'floating' || variant() === 'material' ? ' ' : placeholder()"
      />
      <label class="floating-label" [attr.for]="inputId()">{{ label() }}</label>
      <span class="input-line"></span>

      <!-- Icon button (password toggle or custom icon) -->
      @if (type() === 'password') {
        <button
          type="button"
          class="input-icon-btn"
          [disabled]="isDisabled()"
          [attr.aria-label]="passwordToggleAccessibleLabel()"
          [attr.aria-pressed]="showPassword()"
          [attr.aria-controls]="inputId()"
          (click)="onPasswordToggleClick($event)"
        >
          <i
            class="fa-solid"
            [class.fa-eye]="!showPassword()"
            [class.fa-eye-slash]="showPassword()"
            aria-hidden="true"
          ></i>
        </button>
      } @else if (iconClass() || clearable()) {
        <button
          type="button"
          class="input-icon-btn input-icon-btn--static"
          (click)="handleIconClick($event)"
          (keydown.enter)="handleIconClick($event)"
          (keydown.space)="handleIconClick($event); $event.preventDefault()"
          tabindex="0"
          [attr.aria-label]="label() || 'Input icon action'"
          [appVariablesCss]="{
            '--floating-input-icon-cursor': clearable() && hasValue() ? 'pointer' : 'default'
          }"
        >
          <i [class]="getIconClass()"></i>
        </button>
      } @else if (icon()) {
        <button
          type="button"
          class="input-icon-btn input-icon-btn--static"
          (click)="emitIconClick($event)"
          (keydown.enter)="emitIconClick($event)"
          (keydown.space)="emitIconClick($event); $event.preventDefault()"
          tabindex="0"
          [attr.aria-label]="label() || 'Input icon action'"
        >
          {{ icon() }}
        </button>
      }

      @if (error()) {
        <span class="input-error">{{ error() }}</span>
      }
    </div>
  `,
  styleUrl: './floating-input.component.css'
})
export class FloatingInputComponent implements ControlValueAccessor {
  readonly type = input<FloatingInputType>('text');
  readonly variant = input<FloatingInputVariant>('floating');
  readonly label = input('');
  readonly placeholder = input('');
  readonly icon = input('');
  readonly error = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly readonly = input(false);
  readonly width = input(''); // Optional: e.g., '200px', '50%', 'auto'
  readonly autocomplete = input(''); // Optional: 'off', 'current-password', 'new-password', etc.
  readonly iconClass = input('');
  readonly clearable = input(false);
  readonly iconClick = output<void>();
  readonly clear = output<void>();

  readonly value = model<string | number>('');

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }
  isFocused = signal(false);
  showPassword = signal(false);

  // Generate unique ID for accessibility (label-for association)
  private static instanceCounter = 0;
  private readonly _inputId = `floating-input-${++FloatingInputComponent.instanceCounter}`;
  readonly inputId = () => this._inputId;

  onChange: (value: string | number) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  actualType(): string {
    const type = this.type();
    if (type === 'password') {
      return this.showPassword() ? 'text' : 'password';
    }
    return type;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  passwordToggleAccessibleLabel(): string {
    return this.showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña';
  }

  onPasswordToggleClick(event: Event): void {
    event.stopPropagation();
    this.togglePassword();
    this.iconClick.emit();
  }

  getIconClass(): string {
    if (this.clearable() && this.hasValue()) {
      return 'fa-solid fa-times';
    }
    return this.iconClass();
  }

  handleIconClick(event: Event): void {
    event.stopPropagation();
    if (this.clearable() && this.hasValue()) {
      this.value.set('');
      this.onChange(this.value());
      this.clear.emit();
      // If parent is listening to (input) event directly on the native element,
      // it won't fire unless we dispatch it. We will emit both.
      const nativeInput = (event.target as HTMLElement).closest('.floating-input-wrapper')?.querySelector('input');
      if (nativeInput) {
        nativeInput.value = '';
        nativeInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return;
    }
    this.iconClick.emit();
  }

  emitIconClick(event: Event): void {
    event.stopPropagation();
    this.iconClick.emit();
  }

  hasValue(): boolean {
    const value = this.value();
    return value !== '' && value !== null && value !== undefined;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(this.value());
  }

  onFocus(): void {
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  writeValue(value: string | number): void {
    this.value.set(value ?? '');
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
