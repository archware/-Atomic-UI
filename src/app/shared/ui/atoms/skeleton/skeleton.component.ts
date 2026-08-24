import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (variant()) {
      @case ('text') {
        <div
          class="skeleton skeleton-text"
          [appVariablesCss]="{ '--skeleton-width': width(), '--skeleton-height': height() }"
        ></div>
      }
      @case ('circular') {
        <div
          class="skeleton skeleton-circular"
          [appVariablesCss]="{ '--skeleton-width': width(), '--skeleton-height': height() }"
        ></div>
      }
      @case ('rectangular') {
        <div
          class="skeleton skeleton-rectangular"
          [appVariablesCss]="{ '--skeleton-width': width(), '--skeleton-height': height() }"
        ></div>
      }
      @case ('card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-rectangular skeleton-card-media"></div>
          <div class="skeleton-card-content">
            <div class="skeleton skeleton-text skeleton-card-title"></div>
            <div class="skeleton skeleton-text skeleton-card-line"></div>
            <div class="skeleton skeleton-text skeleton-card-line-short"></div>
          </div>
        </div>
      }
      @case ('avatar-text') {
        <div class="skeleton-avatar-text">
          <div class="skeleton skeleton-circular skeleton-avatar"></div>
          <div class="skeleton-text-group">
            <div class="skeleton skeleton-text skeleton-avatar-title"></div>
            <div class="skeleton skeleton-text skeleton-avatar-subtitle"></div>
          </div>
        </div>
      }
      @default {
        <div
          class="skeleton"
          [appVariablesCss]="{ '--skeleton-width': width(), '--skeleton-height': height() }"
        ></div>
      }
    }
  `,
  styleUrl: './skeleton.component.css'
})
export class SkeletonComponent {
  readonly variant = input<'text' | 'circular' | 'rectangular' | 'card' | 'avatar-text'>('text');
  readonly width = input<string>();
  readonly height = input<string>();
}
