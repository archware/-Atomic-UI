import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css'
})
export class SkeletonComponent {
  readonly variant = input<'text' | 'circular' | 'rectangular' | 'card' | 'avatar-text'>('text');
  readonly width = input<string>();
  readonly height = input<string>();
}
