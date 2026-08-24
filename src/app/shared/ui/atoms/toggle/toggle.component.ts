import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle, prest-toggle',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ],
  template: `
    <label class="toggle-wrapper" [class.disabled]="isDisabled()">
      <input
        type="checkbox"
        role="switch"
        class="toggle-input"
        [checked]="checked"
        [disabled]="isDisabled()"
        [attr.aria-checked]="checked"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (change)="onToggleChange($event)"
      />
      <span class="toggle-track">
        <span class="toggle-thumb"></span>
      </span>
      @if (label()) {
        <span class="toggle-label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './toggle.component.css'
})
export class ToggleComponent implements ControlValueAccessor {
  readonly label = input('');
  readonly ariaLabel = input('Alternar opción');
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  checked = false;
  onChange: (value: boolean) => void = () => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };
  private readonly changeDetector = inject(ChangeDetectorRef);

  onToggleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked = value === true;
    this.changeDetector.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
    this.changeDetector.markForCheck();
  }
}
