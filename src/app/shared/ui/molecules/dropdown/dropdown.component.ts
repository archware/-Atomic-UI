import {
  Component, signal, computed, HostListener, model,
  ElementRef, ChangeDetectionStrategy, forwardRef, OnChanges, SimpleChanges, inject,
  input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FIELD_LABEL_VARIANT_DEFAULT,
  FieldLabelVariant,
  esEtiquetaElevada,
  esEtiquetaFlotante,
  esMarcadorVisible,
} from '../../atoms/form-field/field-label';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DropdownComponent),
    multi: true
  }],
  template: `
    <div class="dropdown fl-field" [class.fl-field--floating]="flotante()" [class.open]="isOpen()" [class.disabled]="isDisabled()">
      @if (label() && !flotante()) {
        <span class="fl-label" [id]="labelId">{{ label() }}</span>
      }
      <div class="fl-control dropdown-box">
      @if (flotante()) {
        <span
          class="fl-label fl-label--floating"
          [class.fl-label--floated]="elevada()"
          [class.fl-label--disabled]="isDisabled()"
          [id]="labelId"
        >{{ label() }}</span>
      }
      <button type="button"
        class="dropdown-trigger"
        [attr.aria-labelledby]="label() ? labelId : null"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (focus)="triggerFocused.set(true)"
        (blur)="triggerFocused.set(false)"
        (click)="toggleDropdown()"
        (keydown.enter)="toggleDropdown()"
        (keydown.space)="toggleDropdown()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        [disabled]="isDisabled()"
      >
        <span class="dropdown-value">
          @if (selectedOption()) {
            @if (selectedOption()!.icon) {
              <span class="option-icon">{{ selectedOption()!.icon }}</span>
            }
            {{ selectedOption()!.label }}
          } @else if (marcadorVisible()) {
            <span class="placeholder">{{ placeholder() }}</span>
          }
        </span>
        <span class="dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </button>
      </div>

      @if (isOpen()) {
        <div class="dropdown-menu" role="listbox">
          @for (option of options(); track option.value) {
            <button type="button"
              class="dropdown-option"
              [class.selected]="option.value === value()"
              [class.disabled]="option.disabled"
              (click)="!option.disabled && selectOption(option)"
              (keydown.enter)="!option.disabled && selectOption(option)"
              (keydown.space)="!option.disabled && selectOption(option)"
              role="option"
              [attr.aria-selected]="option.value === value()"
            >
              @if (option.icon) {
                <span class="option-icon">{{ option.icon }}</span>
              }
              {{ option.label }}
              @if (option.value === value()) {
                <span class="check-icon">✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./dropdown.component.css', '../../atoms/form-field/field-label.css']
})
export class DropdownComponent implements OnChanges, ControlValueAccessor {
  readonly options = input<DropdownOption[]>([]);
  readonly label = input('');
  /** Modo de etiqueta comun: standard | floating | floating-value. */
  readonly variant = input<FieldLabelVariant>(FIELD_LABEL_VARIANT_DEFAULT);
  /** Nombre accesible cuando no hay etiqueta visible. */
  readonly ariaLabel = input('');
  readonly value = model<string | number | undefined>(undefined);
  readonly placeholder = input('Seleccionar...');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  isOpen = signal(false);
  selectedOption = signal<DropdownOption | null>(null);
  readonly triggerFocused = signal(false);

  private static labelCounter = 0;
  protected readonly labelId = `dropdown-label-${++DropdownComponent.labelCounter}`;
  protected readonly tieneEtiqueta = computed(() => this.label().length > 0);
  protected readonly flotante = computed(() =>
    esEtiquetaFlotante(this.variant(), this.tieneEtiqueta()),
  );
  protected readonly elevada = computed(() =>
    esEtiquetaElevada(
      this.variant(),
      this.tieneEtiqueta(),
      this.isOpen() || this.triggerFocused(),
      this.selectedOption() !== null,
    ),
  );
  protected readonly marcadorVisible = computed(() =>
    esMarcadorVisible(this.variant(), this.tieneEtiqueta(), this.elevada()),
  );

  // ControlValueAccessor
  private onChange: (value: string | number) => void = () => { /* noop */ };
  private onTouched: () => void = () => { /* noop */ };

  private readonly elementRef = inject(ElementRef);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] || changes['options']) {
      this.updateSelectedOption();
    }
  }

  writeValue(value: string | number): void {
    this.value.set(value);
    this.updateSelectedOption();
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

  private updateSelectedOption() {
    if (this.value() !== undefined) {
      const option = this.options().find(o => o.value === this.value());
      this.selectedOption.set(option || null);
    } else {
      this.selectedOption.set(null);
    }
  }

  toggleDropdown() {
    if (!this.isDisabled()) {
      this.isOpen.update(v => !v);
      this.onTouched();
    }
  }

  selectOption(option: DropdownOption) {
    this.value.set(option.value);
    this.selectedOption.set(option);
    this.onChange(option.value);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
