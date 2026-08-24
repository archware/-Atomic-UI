import {
  Component,
  forwardRef,
  signal,
  ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ChipComponent } from '../../atoms/chip/chip.component';

export interface TagInputOption {
  label: string;
  value: string;
}

/**
 * TagInputComponent — Campo de entrada con etiquetas/chips removibles.
 * Compatible con `ngModel` y `FormControl`.
 *
 * @example
 * ```html
 * <app-tag-input
 *   [(ngModel)]="tags"
 *   label="Etiquetas"
 *   placeholder="Escribe y presiona Enter"
 *   [maxTags]="5"
 * ></app-tag-input>
 * ```
 */
@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [FormsModule, ChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="tag-input-wrapper" [class.tag-input--disabled]="isDisabled()" [class.tag-input--focused]="focused()">
      @if (label()) {
        <label class="tag-input__label" [for]="inputId">{{ label() }}</label>
      }
      <div class="tag-input__field">
        <!-- Tags -->
        @for (tag of tags(); track tag) {
          <app-chip
            size="sm"
            variant="primary"
            [removable]="!isDisabled()"
            (remove)="removeTag(tag)"
          >{{ tag }}</app-chip>
        }

        <!-- Input -->
        @if (maxTags() === null || tags().length < (maxTags() ?? 0)) {
          <input
            #inputEl
            [id]="inputId"
            class="tag-input__input"
            [placeholder]="tags().length === 0 ? placeholder() : ''"
            [disabled]="isDisabled()"
            [(ngModel)]="inputValue"
            (keydown)="onKeydown($event)"
            (focus)="focused.set(true)"
            (blur)="onBlur()"
            [attr.aria-label]="label() || placeholder()"
          />
        }
      </div>

      @if (hint()) {
        <span class="tag-input__hint">{{ hint() }}</span>
      }
      @if (error()) {
        <span class="tag-input__error">{{ error() }}</span>
      }
    </div>
  `,
  styleUrl: './tag-input.component.css',
})
export class TagInputComponent implements ControlValueAccessor {
  readonly inputId = 'tag-input-' + Math.random().toString(36).slice(2, 8);

  readonly label = input('');
  readonly placeholder = input('Agregar etiqueta…');
  readonly hint = input('');
  readonly error = input('');
  readonly maxTags = input<number | null>(null);
  readonly allowDuplicates = input(false);
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }
  readonly separator = input<string[]>(['Enter', ',']);

  readonly tagAdded = output<string>();
  readonly tagRemoved = output<string>();

  protected tags = signal<string[]>([]);
  protected focused = signal(false);
  protected inputValue = '';

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    this.tags.set(Array.isArray(value) ? value : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.separator().includes(event.key)) {
      event.preventDefault();
      this.addTag();
    } else if (event.key === 'Backspace' && !this.inputValue && this.tags().length) {
      const current = this.tags();
      this.removeTag(current[current.length - 1]);
    }
  }

  onBlur(): void {
    this.focused.set(false);
    if (this.inputValue.trim()) {
      this.addTag();
    }
    this.onTouched();
  }

  private addTag(): void {
    const value = this.inputValue.trim().replace(/,$/, '');
    if (!value) return;
    if (!this.allowDuplicates() && this.tags().includes(value)) {
      this.inputValue = '';
      return;
    }
    const maxTags = this.maxTags();
    if (maxTags && this.tags().length >= maxTags) return;

    const newTags = [...this.tags(), value];
    this.tags.set(newTags);
    this.inputValue = '';
    this.onChange(newTags);
    this.tagAdded.emit(value);
  }

  removeTag(tag: string): void {
    const newTags = this.tags().filter(t => t !== tag);
    this.tags.set(newTags);
    this.onChange(newTags);
    this.tagRemoved.emit(tag);
  }
}
