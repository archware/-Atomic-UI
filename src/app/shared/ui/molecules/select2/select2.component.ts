import {
  Component, signal, HostListener, effect, untracked,
  ElementRef, forwardRef, inject, ChangeDetectionStrategy,
  input,
  output
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { VariablesCssDirective } from '../../directives/variables-css.directive';


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
  imports: [FormsModule, VariablesCssDirective],
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
      [class.multiple]="multiple()"
      [class.has-label]="label()"
      [appVariablesCss]="{ '--select2-width': width() || null }"
    >
      <div class="select2-trigger"
        (click)="$event.stopPropagation(); toggleDropdown()"
        (keydown)="handleKeydown($event)"
        [attr.aria-labelledby]="label() ? selectId() : null"
        [attr.aria-label]="label() ? null : ariaLabel() || placeholder()"
        [attr.aria-controls]="listboxId()"
        [attr.aria-activedescendant]="isOpen() && highlightedIndex() >= 0 ? optionId(highlightedIndex()) : null"
        [attr.aria-disabled]="disabled ? 'true' : 'false'"
        [attr.tabindex]="disabled ? -1 : 0"
        role="combobox"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
      >
        @if (label()) {
          <span class="floating-label" [id]="selectId()">{{ label() }}</span>
        }
        <!-- Single value display -->
        @if (!multiple()) {
          <span class="select2-value">
            @if (selectedOption()) {
              @if (selectedOption()!.icon) {
                <span class="option-icon">{{ selectedOption()!.icon }}</span>
              }
              {{ selectedOption()!.label }}
            } @else if (!label()) {
              <span class="placeholder">{{ placeholder() }}</span>
            }
          </span>
        }

        <!-- Multiple values as tags -->
        @if (multiple()) {
          <div class="select2-tags">
            @for (opt of selectedOptions(); track opt.value) {
              <span class="select2-tag">
                {{ opt.label }}
                <button
                  type="button"
                  class="tag-remove"
                  [disabled]="disabled"
                  [attr.aria-label]="removeTagLabel(opt)"
                  (click)="removeTag(opt, $event)">×</button>
              </span>
            }
            @if (selectedOptions().length === 0 && !label()) {
              <span class="placeholder">{{ placeholder() }}</span>
            }
          </div>
        }

        <span class="select2-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>

      @if (isOpen()) {
        <div class="select2-dropdown" (mousedown)="$event.stopPropagation()">
          <!-- Search box -->
          @if (searchable()) {
            <div class="select2-search">
              <input
                type="text"
                class="search-input"
                placeholder="Buscar..."
                [ngModel]="searchTerm()"
                (ngModelChange)="onSearchTermChange($event)"
                (click)="$event.stopPropagation()"
                (keydown)="handleKeydown($event)"
                [attr.aria-label]="searchLabel()"
                autocomplete="off"
              />
              <span class="search-icon" aria-hidden="true">🔍</span>
            </div>
          }

          <!-- Options list -->
          <div
            class="select2-options"
            role="listbox"
            [id]="listboxId()"
            [attr.aria-multiselectable]="multiple() ? 'true' : null">
            @for (option of filteredOptions(); track option.value; let i = $index) {
              <div
                [id]="optionId(i)"
                class="select2-option"
                [class.selected]="isSelected(option)"
                [class.highlighted]="highlightedIndex() === i"
                [class.disabled]="option.disabled"
                (mousedown)="$event.stopPropagation(); $event.preventDefault(); !option.disabled && selectOption(option)"
                (keydown)="handleKeydown($event)"
                tabindex="-1"
                role="option"
                [attr.aria-selected]="isSelected(option)"
                [attr.aria-disabled]="option.disabled ? 'true' : null"
              >
                @if (option.icon) {
                  <span class="option-icon" aria-hidden="true">{{ option.icon }}</span>
                }
                <span class="option-label">{{ option.label }}</span>
                @if (isSelected(option)) {
                  <span class="check-icon" aria-hidden="true">✓</span>
                }
              </div>
            } @empty {
              <div class="select2-no-results" role="status">No hay resultados</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './select2.component.css'
})
export class Select2Component implements ControlValueAccessor {
  // La señal interna conserva el contrato público histórico `options` mientras se adapta su setter.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaOpciones = input<Select2Option[]>([], { alias: 'options' });

  set options(value: Select2Option[]) {
    this._options = [...(value || [])];
    this.reconcilePendingValue();
    this.ensureEnabledHighlight();
  }
  get options(): Select2Option[] {
    return this._options;
  }
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly placeholder = input('Seleccionar...');
  readonly searchLabel = input('Buscar opciones');
  // El alias permite combinar el estado del binding con el estado entregado por ControlValueAccessor.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaDeshabilitado = input(false, { alias: 'disabled' });

  set disabled(value: boolean) {
    this.disabledState.set(value);
    if (value) {
      this.isOpen.set(false);
      this.searchTerm.set('');
      this.highlightedIndex.set(-1);
    }
  }
  get disabled(): boolean {
    return this.disabledState();
  }
  readonly searchable = input(true);
  readonly multiple = input(false);
  readonly width = input(''); // Optional: e.g., '200px', '50%', 'auto'
  readonly valueChange = output<string | number | (string | number)[]>();

  isOpen = signal(false);
  searchTerm = signal('');
  selectedOption = signal<Select2Option | null>(null);
  selectedOptions = signal<Select2Option[]>([]);
  highlightedIndex = signal(-1);
  private _options: Select2Option[] = [];
  private readonly disabledState = signal(false);
  private pendingValue: unknown = null;
  private readonly sincronizarOpciones = effect(() => {
    const opciones = this.entradaOpciones();
    untracked(() => {
      this.options = opciones;
    });
  });
  private readonly sincronizarDeshabilitado = effect(() => {
    const deshabilitado = this.entradaDeshabilitado();
    untracked(() => {
      this.disabled = deshabilitado;
    });
  });

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
    return this.multiple() ? this.selectedOptions().length > 0 : this.selectedOption() !== null;
  }

  filteredOptions(): Select2Option[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(term));
  }

  isSelected(option: Select2Option): boolean {
    if (this.multiple()) {
      return this.selectedOptions().some(o => o.value === option.value);
    }
    return this.selectedOption()?.value === option.value;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      if (this.isOpen()) {
        this.ensureEnabledHighlight();

        // Focus search input if searchable
        if (this.searchable()) {
          setTimeout(() => {
            const searchInput = this.elementRef.nativeElement.querySelector('.search-input');
            if (searchInput) searchInput.focus();
            this.scrollToHighlighted();
          }, 0);
        } else {
          setTimeout(() => {
            this.scrollToHighlighted();
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
    const isSearchInput = (event.target as HTMLElement | null)?.classList.contains('search-input');

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else {
          this.highlightedIndex.set(this.nextEnabledIndex(options, this.highlightedIndex(), 1));
          this.scrollToHighlighted();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) {
          this.toggleDropdown();
        } else {
          this.highlightedIndex.set(this.nextEnabledIndex(options, this.highlightedIndex(), -1));
          this.scrollToHighlighted();
        }
        break;
      case 'Enter':
      case ' ':
        if (event.key === ' ' && isSearchInput) return;
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
    if (this.disabled || option.disabled) return;
    if (this.multiple()) {
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
      this.onTouched();
    }
  }

  removeTag(option: Select2Option, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
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

  onSearchTermChange(value: string): void {
    this.searchTerm.set(value);
    this.highlightedIndex.set(this.nextEnabledIndex(this.filteredOptions(), -1, 1));
  }

  removeTagLabel(option: Select2Option): string {
    return `Quitar ${option.label}`;
  }

  /** Limpia selecciones actuales */
  private clearSelection(): void {
    this.selectedOption.set(null);
    this.selectedOptions.set([]);
  }

  /** Aplica un valor entrante respetando los modos single/multiple */
  private applyIncomingValue(value: unknown, emit = false): void {
    if (this.multiple()) {
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
    if (this.multiple()) {
      const currentValues = this.selectedOptions().map(o => o.value);
      this.applyIncomingValue(currentValues);
    } else {
      this.applyIncomingValue(this.selectedOption()?.value);
    }
  }

  private ensureEnabledHighlight(): void {
    if (!this.isOpen()) return;
    const options = this.filteredOptions();
    const current = this.highlightedIndex();
    if (current >= 0 && options[current] && !options[current].disabled) return;

    const selectedValue = !this.multiple() ? this.selectedOption()?.value : undefined;
    const selected = options.findIndex(option => option.value === selectedValue && !option.disabled);
    this.highlightedIndex.set(selected >= 0 ? selected : this.nextEnabledIndex(options, -1, 1));
  }

  private nextEnabledIndex(
    options: readonly Select2Option[],
    current: number,
    direction: 1 | -1
  ): number {
    let index = current;
    if (index < 0) index = direction === 1 ? -1 : options.length;
    for (index += direction; index >= 0 && index < options.length; index += direction) {
      if (!options[index].disabled) return index;
    }
    return current >= 0 && options[current] && !options[current].disabled ? current : -1;
  }
}
