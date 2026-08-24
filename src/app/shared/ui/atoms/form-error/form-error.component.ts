import { Component, inject, ChangeDetectionStrategy, input } from '@angular/core';

import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';

/**
 * Component for displaying form validation errors.
 * Automatically integrates with ValidationService to display error messages.
 * 
 * @example
 * ```html
 * <form [formGroup]="form">
 *   <input formControlName="email" />
 *   <app-form-error [control]="form.get('email')"></app-form-error>
 * </form>
 * ```
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showError) {
      <div class="form-error" role="alert" aria-live="polite">
        <i class="fa-solid fa-circle-exclamation error-icon" aria-hidden="true"></i>
        <span class="error-message">{{ errorMessage }}</span>
      </div>
    }
  `,
  styleUrl: './form-error.component.css'
})
export class FormErrorComponent {
  private readonly validationService = inject(ValidationService);

  /** The form control to validate */
  readonly control = input<AbstractControl | null>(null);

  /** Custom error message (overrides automatic message) */
  readonly customMessage = input<string>();

  /** Whether to show error only when touched (default: true) */
  readonly showOnTouched = input(true);

  get showError(): boolean {
    if (this.customMessage()) return true;
    const control = this.control();
    if (!control) return false;

    if (this.showOnTouched()) {
      return control.invalid && control.touched;
    }

    return control.invalid;
  }

  get errorMessage(): string {
    const customMessage = this.customMessage();
    if (customMessage) {
      return customMessage;
    }
    return this.validationService.getErrorMessage(this.control());
  }
}
