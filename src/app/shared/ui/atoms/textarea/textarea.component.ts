import { Component, forwardRef, signal, computed, input } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TextareaVariant = 'floating' | 'outline' | 'material';

/**
 * Componente Textarea con label flotante y variantes de estilo.
 * Implementa ControlValueAccessor para integración con formularios.
 * 
 * @example
 * ```html
 * <app-textarea 
 *   label="Mensaje" 
 *   variant="floating"
 *   [(ngModel)]="message"
 * ></app-textarea>
 * ```
 */
@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div 
      class="textarea-wrapper"
      [class]="'variant-' + variant()"
      [class.focused]="isFocused()"
      [class.has-value]="hasValue()"
      [class.has-error]="error()"
      [class.disabled]="isDisabled()"
    >
      <textarea
        class="textarea-input"
        [id]="textareaId()"
        [rows]="rows()"
        [disabled]="isDisabled()"
        [readonly]="readonly()"
        [value]="value"
        [attr.maxlength]="maxlength()"
        [attr.placeholder]="variant() === 'floating' || variant() === 'material' ? ' ' : placeholder()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      ></textarea>
      <label class="textarea-label" [attr.for]="textareaId()">{{ label() }}</label>
      <span class="textarea-line"></span>

      <!-- Character counter -->
      @if (maxlength() && showCounter()) {
        <span class="textarea-counter">{{ value.length }} / {{ maxlength() }}</span>
      }
    </div>

    <!-- Error message -->
    @if (error()) {
      <span class="textarea-error">{{ error() }}</span>
    }
  `,
  styleUrl: './textarea.component.css'
})
export class TextareaComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly variant = input<TextareaVariant>('floating');
  readonly rows = input(4);
  readonly maxlength = input<number>();
  readonly showCounter = input(true);
  readonly error = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly readonly = input(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  value = '';
  private idCounter = Math.random().toString(36).substring(2, 9);

  isFocused = signal(false);
  hasValue = computed(() => this.value.length > 0);
  textareaId = computed(() => `textarea-${this.idCounter}`);

  onChange: (value: string) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }
}
