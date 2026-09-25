import { Component, forwardRef, signal, ChangeDetectionStrategy, input, output, model, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

export type FloatingTextareaVariant = 'floating' | 'underline' | 'material' | 'outline';

@Component({
  selector: 'app-floating-textarea',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FloatingTextareaComponent),
      multi: true
    }
  ],
  templateUrl: './floating-textarea.component.html',
  styleUrl: './floating-textarea.component.css'
})
export class FloatingTextareaComponent implements ControlValueAccessor {
  readonly variant = input<FloatingTextareaVariant>('floating');
  readonly label = input('');
  readonly placeholder = input('');
  readonly error = input('');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly readonly = input(false);
  readonly width = input('');
  readonly rows = input(4);
  readonly clearable = input(false);
  
  readonly clear = output<void>();

  readonly value = model<string>('');

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }
  isFocused = signal(false);

  private static instanceCounter = 0;
  private readonly _textareaId = `floating-textarea-${++FloatingTextareaComponent.instanceCounter}`;
  readonly textareaId = () => this._textareaId;

  onChange: (value: string) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  handleClearClick(event: Event): void {
    event.stopPropagation();
    if (this.clearable() && this.hasValue()) {
      this.value.set('');
      this.onChange(this.value());
      this.clear.emit();
      const nativeTextarea = (event.target as HTMLElement).closest('.floating-textarea-wrapper')?.querySelector('textarea');
      if (nativeTextarea) {
        nativeTextarea.value = '';
        nativeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  hasValue(): boolean {
    const value = this.value();
    return value !== '' && value !== null && value !== undefined;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
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

  writeValue(value: string): void {
    this.value.set(value ?? '');
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
