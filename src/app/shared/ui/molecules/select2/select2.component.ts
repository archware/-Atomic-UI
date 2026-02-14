import {
  Component, Input, Output, EventEmitter, signal, HostListener,
  ElementRef, forwardRef, inject, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface Select2Option {
  value: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  // Standalone component for Select2 dropdown
  selector: 'app-select2',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Select2Component),
    multi: true
  }],
  template: `
    <div 
      class="select2-wrapper"
      [class.open]="isOpen()"
      [class.disabled]="disabled"
      [class.focused]="isOpen()"
      [class.has-value]="hasValue()"
      [class.multiple]="multiple"
      [class.has-label]="label"
      [style.width]="width || null"
    >
      <div class="select2-trigger" 
        (click)="toggleDropdown()" 
        (keydown)="handleKeydown($event)"
        [attr.aria-labelledby]="label ? selectId() : null"
        [attr.aria-controls]="listboxId()"
        [attr.aria-activedescendant]="highlightedIndex() >= 0 ? optionId(highlightedIndex()) : null"
        tabindex="0"
        role="combobox"
        [attr.aria-expanded]="isOpen()"
      >
        @if (label) {
          <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
          <label class="floating-label" [id]="selectId()">{{ label }}</label>
        }
        <!-- Single value display -->
        @if (!multiple) {
          <span class="select2-value">
            @if (selectedOption()) {
              @if (selectedOption()!.icon) {
                <span class="option-icon">{{ selectedOption()!.icon }}</span>
              }
              {{ selectedOption()!.label | translate }}
            } @else if (!label) {
              <span class="placeholder">{{ placeholder | translate }}</span>
            }
          </span>
        }
        
        <!-- Multiple values as tags -->
        @if (multiple) {
          <div class="select2-tags">
            @for (opt of selectedOptions(); track opt.value) {
              <span class="select2-tag">
                {{ opt.label | translate }}
                <button type="button" class="tag-remove" (click)="removeTag(opt, $event)">×</button>
              </span>
            }
            @if (selectedOptions().length === 0 && !label) {
              <span class="placeholder">{{ placeholder | translate }}</span>
            }
          </div>
        }
        
        <span class="select2-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>

      @if (isOpen()) {
        <div class="select2-dropdown">
          <!-- Search box -->
          @if (searchable) {
            <div class="select2-search">
              <input 
                type="text" 
                class="search-input" 
                placeholder="Buscar..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                (click)="$event.stopPropagation()"
                (keydown)="handleKeydown($event)"
              />
              <span class="search-icon">🔍</span>
            </div>
          }
          
          <!-- Options list -->
          <div class="select2-options" role="listbox" [id]="listboxId()">
            @for (option of filteredOptions(); track option.value; let i = $index) {
              <div 
                [id]="optionId(i)"
                class="select2-option"
                [class.selected]="isSelected(option)"
                [class.highlighted]="highlightedIndex() === i"
                [class.disabled]="option.disabled"
                (click)="!option.disabled && selectOption(option)"
                (keydown)="handleKeydown($event)"
                tabindex="-1"
                role="option"
                [attr.aria-selected]="isSelected(option)"
              >
                @if (option.icon) {
                  <span class="option-icon">{{ option.icon }}</span>
                }
                <span class="option-label">{{ option.label | translate }}</span>
                @if (isSelected(option)) {
                  <span class="check-icon">✓</span>
                }
              </div>
            } @empty {
              <div class="select2-no-results">No hay resultados</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .select2-wrapper {
      position: relative;
      width: 100%;
      min-width: 15rem;
    }

    .select2-wrapper.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .select2-wrapper.has-label {
      margin-top: var(--space-3);
    }

    /* === TRIGGER === */
    .select2-trigger {
      position: relative;
      display: flex;
      align-items: center;
      height: var(--control-height);
      padding: var(--space-1) var(--space-3);
      padding-right: 2.75rem;
      background: var(--input-bg);
      border: var(--input-border-width, 1.5px) solid var(--input-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 200ms ease;
      font-size: var(--text-sm);
      box-sizing: border-box;
      box-shadow: var(--input-shadow);
    }

    .select2-wrapper.has-label .select2-trigger {
      padding: var(--space-1) var(--space-3);
    }

    /* === FLOATING LABEL === */
    .floating-label {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--text-sm);
      color: var(--input-placeholder);
      pointer-events: none;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      background: var(--input-bg);
      padding: 0 var(--space-2);
      white-space: nowrap;
    }

    .select2-wrapper.focused .floating-label,
    .select2-wrapper.has-value .floating-label {
      top: -0.625rem;
      transform: translateY(0);
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--primary-color);
    }

    /* === MULTI-SELECT FIX === */
    .select2-wrapper.multiple .select2-trigger {
      min-height: var(--control-height);
      height: auto;
      padding: var(--space-1) var(--space-3);
      padding-right: 2.75rem;
      align-items: center;
    }

    .select2-wrapper.focused .select2-trigger,
    .select2-trigger:hover {
      border-color: var(--input-border-focus);
    }

    .select2-wrapper.focused .select2-trigger {
      box-shadow: var(--shadow-focus-primary);
    }

    .select2-value {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex: 1;
      font-size: var(--text-sm);
      color: var(--input-text);
      line-height: normal;
    }

    .placeholder {
      color: var(--input-placeholder);
    }

    .select2-arrow {
      position: absolute;
      right: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-color-secondary);
      transition: transform 200ms ease;
    }

    .select2-wrapper.open .select2-arrow {
      transform: translateY(-50%) rotate(180deg);
    }

    /* === TAGS (Multiple) === */
    .select2-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      flex: 1;
      padding: var(--space-1) 0;
    }

    .select2-tag {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      background: var(--primary-color-lighter);
      color: var(--primary-color);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 500;
    }

    .tag-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      padding: 0;
      background: none;
      border: none;
      border-radius: 50%;
      font-size: var(--text-sm);
      color: var(--primary-color);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .tag-remove:hover {
      background: var(--primary-color-lighter);
    }

    /* === DROPDOWN === */
    .select2-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--dropdown-bg);
      border: 1px solid var(--dropdown-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-dropdown);
      z-index: 10000;
      animation: dropdownSlide 200ms ease;
      overflow: hidden;
    }

    @keyframes dropdownSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* === SEARCH === */
    .select2-search {
      position: relative;
      padding: var(--space-2);
      border-bottom: 1px solid var(--dropdown-border);
    }

    .search-input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      padding-left: 2.25rem;
      font-size: var(--text-md);
      border: 1px solid var(--input-border);
      border-radius: var(--radius-sm);
      background: var(--input-bg);
      color: var(--input-text);
      outline: none;
      transition: all 150ms ease;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      background: var(--input-bg);
    }

    .search-icon {
      position: absolute;
      left: var(--space-4);
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--text-sm);
    }

    /* === OPTIONS === */
    .select2-options {
      max-height: 240px;
      overflow-y: auto;
    }

    .select2-option {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-md);
      color: var(--dropdown-text, var(--text-color));
      cursor: pointer;
      transition: background 100ms ease;
    }

    .select2-option:hover:not(.disabled),
    .select2-option.highlighted:not(.disabled) {
      background: var(--dropdown-item-hover);
    }

    .select2-option.selected {
      background: var(--dropdown-item-selected);
      color: var(--primary-color);
      font-weight: 500;
    }

    .select2-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-icon {
      font-size: var(--text-md);
    }

    .option-label {
      flex: 1;
    }

    .check-icon {
      color: var(--primary-color);
      font-weight: bold;
    }

    .select2-no-results {
      padding: var(--space-4);
      text-align: center;
      color: var(--text-color-muted);
      font-size: var(--text-sm);
    }

    /* Dark mode handled automatically by CSS variables */
  `]
})
export class Select2Component implements ControlValueAccessor {
  @Input()
  set options(value: Select2Option[]) {
    this._options = value || [];
    this.reconcilePendingValue();
  }
  get options(): Select2Option[] {
    return this._options;
  }
  @Input() label = '';
  @Input() placeholder = 'Seleccionar...';
  @Input() disabled = false;
  @Input() searchable = true;
  @Input() multiple = false;
  @Input() width = ''; // Optional: e.g., '200px', '50%', 'auto'
  @Output() valueChange = new EventEmitter<string | number | (string | number)[]>();

  isOpen = signal(false);
  searchTerm = signal('');
  selectedOption = signal<Select2Option | null>(null);
  selectedOptions = signal<Select2Option[]>([]);
  highlightedIndex = signal(-1);
  private _options: Select2Option[] = [];
  private pendingValue: unknown = null;

  // Generate unique ID for accessibility (aria-labelledby)
  private static instanceCounter = 0;
  private readonly _instanceId = ++Select2Component.instanceCounter;
  readonly selectId = () => `select2-label-${this._instanceId}`;
  readonly listboxId = () => `select2-listbox-${this._instanceId}`;
  readonly optionId = (index: number) => `select2-option-${this._instanceId}-${index}`;

  private readonly elementRef = inject(ElementRef);
  private onChange: (value: unknown) => void = () => { /* noop */ };
  private onTouched: () => void = () => { /* noop */ };

  hasValue(): boolean {
    return this.multiple ? this.selectedOptions().length > 0 : this.selectedOption() !== null;
  }

  filteredOptions(): Select2Option[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(term));
  }

  isSelected(option: Select2Option): boolean {
    if (this.multiple) {
      return this.selectedOptions().some(o => o.value === option.value);
    }
    return this.selectedOption()?.value === option.value;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        this.highlightedIndex.set(0);
        // Focus search input if searchable
        if (this.searchable) {
          setTimeout(() => {
            const searchInput = this.elementRef.nativeElement.querySelector('.search-input');
            if (searchInput) searchInput.focus();
          }, 0);
        }
      } else {
        this.searchTerm.set('');
        this.highlightedIndex.set(-1);
        this.onTouched();
      }
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const options = this.filteredOptions();
    const maxIndex = options.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else {
          this.highlightedIndex.update(i => (i < maxIndex ? i + 1 : i));
          this.scrollToHighlighted();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => (i > 0 ? i - 1 : 0));
        this.scrollToHighlighted();
        break;
      case 'Enter':
      case ' ':
        if (event.key === ' ' && this.searchTerm() !== '') return; // Allow space in search
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else if (this.highlightedIndex() >= 0) {
          const option = options[this.highlightedIndex()];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.stopPropagation();
          this.isOpen.set(false);
          this.searchTerm.set('');
          this.highlightedIndex.set(-1);
          this.elementRef.nativeElement.querySelector('.select2-trigger')?.focus();
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.isOpen.set(false);
          this.searchTerm.set('');
          this.highlightedIndex.set(-1);
        }
        break;
    }
  }

  private scrollToHighlighted(): void {
    const listbox = this.elementRef.nativeElement.querySelector('.select2-options');
    const highlighted = listbox?.querySelectorAll('.select2-option')[this.highlightedIndex()];
    if (highlighted) {
      highlighted.scrollIntoView({ block: 'nearest' });
    }
  }

  selectOption(option: Select2Option): void {
    if (this.multiple) {
      const current = this.selectedOptions();
      if (this.isSelected(option)) {
        this.selectedOptions.set(current.filter(o => o.value !== option.value));
      } else {
        this.selectedOptions.set([...current, option]);
      }
      const values = this.selectedOptions().map(o => o.value);
      this.onChange(values);
      this.valueChange.emit(values);
      this.onTouched();
    } else {
      this.selectedOption.set(option);
      this.onChange(option.value);
      this.valueChange.emit(option.value);
      this.isOpen.set(false);
      this.searchTerm.set('');
      this.highlightedIndex.set(-1);
      // Return focus to trigger
      this.elementRef.nativeElement.querySelector('.select2-trigger')?.focus();
      this.onTouched();
    }
  }

  removeTag(option: Select2Option, event: Event): void {
    event.stopPropagation();
    const current = this.selectedOptions();
    this.selectedOptions.set(current.filter(o => o.value !== option.value));
    const values = this.selectedOptions().map(o => o.value);
    this.onChange(values);
    this.valueChange.emit(values);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.searchTerm.set('');
        this.highlightedIndex.set(-1);
        this.onTouched();
      }
    }
  }

  writeValue(value: unknown): void {
    if (!this.options.length) {
      // Guarda el valor hasta que lleguen las opciones (carga asíncrona)
      this.pendingValue = value;
      this.clearSelection();
      return;
    }
    this.applyIncomingValue(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Limpia selecciones actuales */
  private clearSelection(): void {
    this.selectedOption.set(null);
    this.selectedOptions.set([]);
  }

  /** Aplica un valor entrante respetando los modos single/multiple */
  private applyIncomingValue(value: unknown, emit = false): void {
    if (this.multiple) {
      const values = Array.isArray(value) ? value as (string | number)[] : [];
      const validOptions = this.options.filter(o => values.includes(o.value));
      this.selectedOptions.set(validOptions);
      if (emit) {
        this.onChange(validOptions.map(o => o.value));
        this.valueChange.emit(validOptions.map(o => o.value));
      }
    } else {
      const option = this.options.find(o => o.value === value);
      this.selectedOption.set(option || null);
      if (emit && option) {
        this.onChange(option.value);
        this.valueChange.emit(option.value);
      }
    }
  }

  /** Rehidrata selección cuando cambian las opciones */
  private reconcilePendingValue(): void {
    if (this.pendingValue !== null) {
      this.applyIncomingValue(this.pendingValue);
      this.pendingValue = null;
      return;
    }

    // Revalida selección actual por si alguna opción desapareció
    if (this.multiple) {
      const currentValues = this.selectedOptions().map(o => o.value);
      this.applyIncomingValue(currentValues);
    } else {
      this.applyIncomingValue(this.selectedOption()?.value);
    }
  }
}
