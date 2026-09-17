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
  templateUrl: './textarea.component.html',
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
