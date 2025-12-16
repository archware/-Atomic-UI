import {
  Component, Input, Output, EventEmitter, signal, HostListener,
  ElementRef, ChangeDetectionStrategy, forwardRef, OnChanges, SimpleChanges, inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
    <div class="dropdown" [class.open]="isOpen()" [class.disabled]="disabled">
      <button type="button"
        class="dropdown-trigger" 
        (click)="toggleDropdown()"
        (keydown.enter)="toggleDropdown()"
        (keydown.space)="toggleDropdown()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="listbox"
        [disabled]="disabled"
      >
        <span class="dropdown-value">
          @if (selectedOption()) {
            @if (selectedOption()!.icon) {
              <span class="option-icon">{{ selectedOption()!.icon }}</span>
            }
            {{ selectedOption()!.label }}
          } @else {
            <span class="placeholder">{{ placeholder }}</span>
          }
        </span>
        <span class="dropdown-arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </button>
      
      @if (isOpen()) {
        <div class="dropdown-menu" role="listbox">
          @for (option of options; track option.value) {
            <button type="button"
              class="dropdown-option"
              [class.selected]="option.value === value"
              [class.disabled]="option.disabled"
              (click)="!option.disabled && selectOption(option)"
              (keydown.enter)="!option.disabled && selectOption(option)"
              (keydown.space)="!option.disabled && selectOption(option)"
              role="option"
              [attr.aria-selected]="option.value === value"
            >
              @if (option.icon) {
                <span class="option-icon">{{ option.icon }}</span>
              }
              {{ option.label }}
              @if (option.value === value) {
                <span class="check-icon">✓</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dropdown {
      position: relative;
      display: inline-block;
      min-width: 180px;
    }

    .dropdown.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .dropdown-trigger {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.875rem;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-color);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .dropdown-trigger:hover:not(:disabled) {
      border-color: var(--primary-color);
    }

    .dropdown.open .dropdown-trigger {
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring);
    }

    .dropdown-value {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .placeholder {
      color: var(--text-color-muted);
    }

    .dropdown-arrow {
      color: var(--text-color-muted);
      transition: transform 200ms ease;
    }

    .dropdown.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      box-shadow: var(--shadow-lg);
      z-index: 100;
      max-height: 240px;
      overflow-y: auto;
      animation: dropdownFade 150ms ease;
    }

    .dropdown-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      background: none;
      border: none;
      font-size: 0.875rem;
      color: var(--text-color);
      cursor: pointer;
      transition: background 100ms ease;
      text-align: left;
    }

    .dropdown-option:hover:not(.disabled) {
      background: var(--surface-elevated);
    }

    .dropdown-option.selected {
      color: var(--primary-color);
      font-weight: 500;
    }

    .dropdown-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-icon {
      font-size: 1rem;
    }

    .check-icon {
      margin-left: auto;
      color: var(--primary-color);
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Dark mode - improved */
    :host-context(.dark) .dropdown-trigger,
    :host-context(html.dark) .dropdown-trigger,
    :host-context([data-theme="dark"]) .dropdown-trigger {
      background: #1f2937;
      border-color: #4b5563;
      color: #e5e7eb;
    }

    :host-context(.dark) .dropdown-trigger:hover:not(:disabled),
    :host-context(html.dark) .dropdown-trigger:hover:not(:disabled),
    :host-context([data-theme="dark"]) .dropdown-trigger:hover:not(:disabled) {
      border-color: #bc9abb;
    }

    :host-context(.dark) .dropdown.open .dropdown-trigger,
    :host-context(html.dark) .dropdown.open .dropdown-trigger,
    :host-context([data-theme="dark"]) .dropdown.open .dropdown-trigger {
      border-color: #bc9abb;
      box-shadow: 0 0 0 3px rgba(188, 154, 187, 0.2);
    }

    :host-context(.dark) .placeholder,
    :host-context(html.dark) .placeholder,
    :host-context([data-theme="dark"]) .placeholder {
      color: #6b7280;
    }

    :host-context(.dark) .dropdown-arrow,
    :host-context(html.dark) .dropdown-arrow,
    :host-context([data-theme="dark"]) .dropdown-arrow {
      color: #9ca3af;
    }

    :host-context(.dark) .dropdown-menu,
    :host-context(html.dark) .dropdown-menu,
    :host-context([data-theme="dark"]) .dropdown-menu {
      background: #1f2937;
      border-color: #4b5563;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(188, 154, 187, 0.1);
    }

    :host-context(.dark) .dropdown-option,
    :host-context(html.dark) .dropdown-option,
    :host-context([data-theme="dark"]) .dropdown-option {
      color: #d1d5db;
    }

    :host-context(.dark) .dropdown-option:hover:not(.disabled),
    :host-context(html.dark) .dropdown-option:hover:not(.disabled),
    :host-context([data-theme="dark"]) .dropdown-option:hover:not(.disabled) {
      background: #374151;
      color: #ffffff;
    }

    :host-context(.dark) .dropdown-option.selected,
    :host-context(html.dark) .dropdown-option.selected,
    :host-context([data-theme="dark"]) .dropdown-option.selected {
      color: #d8b4d8;
      background: rgba(188, 154, 187, 0.1);
    }

    :host-context(.dark) .check-icon,
    :host-context(html.dark) .check-icon,
    :host-context([data-theme="dark"]) .check-icon {
      color: #d8b4d8;
      text-shadow: 0 0 10px rgba(188, 154, 187, 0.5);
    }
  `]
})
export class DropdownComponent implements OnChanges, ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() value?: string | number;
  @Input() placeholder = 'Seleccionar...';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string | number>();

  isOpen = signal(false);
  selectedOption = signal<DropdownOption | null>(null);

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
    this.value = value;
    this.updateSelectedOption();
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

  private updateSelectedOption() {
    if (this.value !== undefined) {
      const option = this.options.find(o => o.value === this.value);
      this.selectedOption.set(option || null);
    } else {
      this.selectedOption.set(null);
    }
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen.update(v => !v);
      this.onTouched();
    }
  }

  selectOption(option: DropdownOption) {
    this.value = option.value;
    this.selectedOption.set(option);
    this.valueChange.emit(option.value);
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
