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
  templateUrl: './progress.component.html',
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
