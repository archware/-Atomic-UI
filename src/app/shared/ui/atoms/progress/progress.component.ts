import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input
} from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-wrapper">
      @if (label()) {
        <div class="progress-header">
          <span class="progress-label">{{ label() }}</span>
          @if (showLabel() && !indeterminate()) {
            <span class="progress-value">{{ clampedValue() }}%</span>
          }
        </div>
      }
      <div
        class="progress-track"
        [class]="'progress-track--' + size()"
        role="progressbar"
        [attr.aria-valuenow]="indeterminate() ? null : clampedValue()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="100"
        [attr.aria-label]="label() || 'Progreso'"
      >
        <div
          class="progress-bar"
          [class]="'progress-bar--' + variant()"
          [class.progress-bar--indeterminate]="indeterminate()"
          [appVariablesCss]="{
            '--progress-bar-width': indeterminate() ? null : clampedValue() + '%'
          }"
        ></div>
      </div>
      @if (!label() && showLabel() && !indeterminate()) {
        <div class="progress-footer">
          <span class="progress-value">{{ clampedValue() }}%</span>
        </div>
      }
    </div>
  `,
  styleUrl: './progress.component.css',
})
export class ProgressComponent {
  readonly value = input(0);
  readonly variant = input<ProgressVariant>('primary');
  readonly size = input<ProgressSize>('md');
  readonly showLabel = input(false);
  readonly indeterminate = input(false);
  readonly label = input('');

  readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
