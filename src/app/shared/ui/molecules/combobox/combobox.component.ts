import {
  Component, Input, Output, EventEmitter, signal, computed,
  forwardRef, ChangeDetectionStrategy, ElementRef, ViewChild, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface ComboboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * ComboboxComponent — Input con sugerencias de autocompletado.
 *
 * @example
 * ```html
 * <app-combobox
 *   [options]="userOptions"
 *   [(ngModel)]="selectedUser"
 *   label="Buscar usuario"
 *   placeholder="Escribe para buscar..."
 * ></app-combobox>
 * ```
 */
@Component({
  selector: 'app-combobox',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true
    }
  ],
  template: `
    <div class="combobox" [class.combobox-open]="isOpen()" [class.combobox-disabled]="disabled">
      @if (label) {
        <label class="combobox-label" [for]="inputId">{{ label }}</label>
      }
      <div class="combobox-control" #controlRef>
        <input
          #inputRef
          [id]="inputId"
          class="combobox-input"
          type="text"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [value]="inputValue()"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeydown($event)"
          autocomplete="off"
          role="combobox"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-autocomplete]="'list'"
          [attr.aria-controls]="listboxId"
          aria-haspopup="listbox"
        />
        @if (inputValue() && !disabled && clearable) {
          <button type="button" class="combobox-clear" (click)="clear()" aria-label="Limpiar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        } @else {
          <span class="combobox-icon"><i class="fa-solid fa-chevron-down"></i></span>
        }
      </div>

      @if (isOpen() && filteredOptions().length > 0) {
        <ul class="combobox-dropdown" role="listbox" [id]="listboxId">
          @for (option of filteredOptions(); track option.value; let i = $index) {
            <li
              class="combobox-option"
              [class.combobox-option-highlighted]="i === highlightedIndex()"
              [class.combobox-option-selected]="option.value === value"
              [class.combobox-option-disabled]="option.disabled"
              role="option"
              [attr.aria-selected]="option.value === value"
              (mousedown)="selectOption(option)"
              (mouseenter)="highlightedIndex.set(i)"
            >
              <span class="combobox-option-label">{{ option.label }}</span>
              @if (option.value === value) {
                <i class="fa-solid fa-check combobox-check" aria-hidden="true"></i>
              }
            </li>
          }
        </ul>
      }

      @if (isOpen() && filteredOptions().length === 0) {
        <div class="combobox-empty">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Sin resultados para "{{ inputValue() }}"</span>
        </div>
      }

      @if (error) {
        <span class="combobox-error">{{ error }}</span>
      }
    </div>
  `,
  styles: [`
    .combobox { position: relative; width: 100%; }

    .combobox-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--text-color-secondary);
      margin-bottom: var(--space-1);
    }

    .combobox-control {
      position: relative;
      display: flex;
      align-items: center;
    }

    .combobox-input {
      width: 100%;
      padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--input-background);
      color: var(--text-color-primary);
      font-size: var(--text-sm);
      line-height: 1.5;
      outline: none;
      transition: border-color 150ms ease, box-shadow 150ms ease;
    }

    .combobox-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-alpha);
    }

    .combobox-input:disabled {
      background: var(--surface-disabled);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .combobox-icon, .combobox-clear {
      position: absolute;
      right: var(--space-3);
      color: var(--text-color-muted);
      font-size: var(--text-sm);
      pointer-events: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .combobox-clear { pointer-events: all; }
    .combobox-clear:hover { color: var(--text-color-primary); }

    .combobox-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      z-index: 1000;
      max-height: 240px;
      overflow-y: auto;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      list-style: none;
      margin: 0;
      padding: var(--space-1) 0;
    }

    .combobox-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-3);
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--text-color-primary);
      transition: background 100ms ease;
    }

    .combobox-option:hover,
    .combobox-option-highlighted { background: var(--surface-hover); }
    .combobox-option-selected { color: var(--primary-color); font-weight: 500; }
    .combobox-option-disabled { opacity: 0.5; cursor: not-allowed; }

    .combobox-check { color: var(--primary-color); font-size: var(--text-xs); }

    .combobox-empty {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      color: var(--text-color-muted);
      font-size: var(--text-sm);
      position: absolute;
      top: calc(100% + 4px);
      left: 0; right: 0;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
    }

    .combobox-error {
      display: block;
      font-size: var(--text-xs);
      color: var(--color-error);
      margin-top: var(--space-1);
    }
  `]
})
export class ComboboxComponent implements ControlValueAccessor {
  private readonly platformId = inject(PLATFORM_ID);
  readonly inputId = 'combobox-input-' + Math.random().toString(36).slice(2, 8);
  readonly listboxId = 'combobox-list-' + Math.random().toString(36).slice(2, 8);

  @Input() options: ComboboxOption[] = [];
  @Input() label = '';
  @Input() placeholder = 'Buscar...';
  @Input() disabled = false;
  @Input() clearable = true;
  @Input() error = '';

  @Output() optionSelected = new EventEmitter<ComboboxOption>();
  @Output() inputChange = new EventEmitter<string>();

  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  value: string | number | null = null;
  inputValue = signal('');
  isOpen = signal(false);
  highlightedIndex = signal(-1);

  filteredOptions = computed(() => {
    const query = this.inputValue().toLowerCase().trim();
    if (!query) return this.options.filter(o => !o.disabled);
    return this.options.filter(o =>
      !o.disabled && o.label.toLowerCase().includes(query)
    );
  });

  private onChange: (v: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string | number | null): void {
    this.value = val;
    const opt = this.options.find(o => o.value === val);
    this.inputValue.set(opt ? opt.label : '');
  }

  registerOnChange(fn: (v: string | number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.inputValue.set(val);
    this.isOpen.set(true);
    this.highlightedIndex.set(-1);
    this.inputChange.emit(val);

    if (!val) {
      this.value = null;
      this.onChange(null);
    }
  }

  onFocus(): void { this.isOpen.set(true); }

  onBlur(): void {
    this.onTouched();
    setTimeout(() => this.isOpen.set(false), 150);
  }

  onKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.set(Math.min(this.highlightedIndex() + 1, opts.length - 1));
        this.isOpen.set(true);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.set(Math.max(this.highlightedIndex() - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex() >= 0 && opts[this.highlightedIndex()]) {
          this.selectOption(opts[this.highlightedIndex()]);
        }
        break;
      case 'Escape':
        this.isOpen.set(false);
        break;
    }
  }

  selectOption(option: ComboboxOption): void {
    if (option.disabled) return;
    this.value = option.value;
    this.inputValue.set(option.label);
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.onChange(option.value);
    this.optionSelected.emit(option);
  }

  clear(): void {
    this.value = null;
    this.inputValue.set('');
    this.isOpen.set(false);
    this.onChange(null);
    if (isPlatformBrowser(this.platformId)) {
      this.inputRef?.nativeElement.focus();
    }
  }
}
