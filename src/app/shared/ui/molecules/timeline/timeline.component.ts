import {
  Component, ChangeDetectionStrategy,
  input
} from '@angular/core';


export type TimelineItemStatus = 'completed' | 'active' | 'pending' | 'error';

export interface TimelineItem {
  id?: string | number;
  title: string;
  description?: string;
  date?: string;
  status?: TimelineItemStatus;
  icon?: string;
  badge?: string;
}

/**
 * TimelineComponent — Historial cronológico de eventos.
 *
 * @example
 * ```html
 * <app-timeline [items]="activityLog" orientation="vertical"></app-timeline>
 * ```
 */
@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timeline" [class.timeline-horizontal]="orientation() === 'horizontal'">
      @for (item of items(); track item.id ?? item.title; let last = $last) {
        <div class="timeline-item" [class]="'timeline-' + (item.status ?? 'pending')">
          <!-- Connector line -->
          @if (!last) {
            <div class="timeline-connector"></div>
          }

          <!-- Dot / Icon -->
          <div class="timeline-dot" [attr.aria-label]="item.status ?? 'pending'">
            @if (item.icon) {
              <i [class]="item.icon" aria-hidden="true"></i>
            } @else if (item.status === 'completed') {
              <i class="fa-solid fa-check" aria-hidden="true"></i>
            } @else if (item.status === 'error') {
              <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            } @else if (item.status === 'active') {
              <span class="timeline-dot-pulse"></span>
            }
          </div>

          <!-- Content -->
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-title">{{ item.title }}</span>
              @if (item.badge) {
                <span class="timeline-badge">{{ item.badge }}</span>
              }
            </div>
            @if (item.description) {
              <p class="timeline-description">{{ item.description }}</p>
            }
            @if (item.date) {
              <time class="timeline-date">{{ item.date }}</time>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './timeline.component.css'
})
export class TimelineComponent {
  /** Items to display in the timeline */
  readonly items = input<TimelineItem[]>([]);

  /** Layout orientation */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
}
