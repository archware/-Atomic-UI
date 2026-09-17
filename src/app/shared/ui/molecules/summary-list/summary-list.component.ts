import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SummaryListItem {
  label: string;
  value: string | number;
  icon?: string;
  valueColor?: string;
}

@Component({
  selector: 'app-summary-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dl class="summary-list" [class.summary-list--featured]="featured()">
      @for (item of items(); track item.label) {
        <div>
          <dt>
            @if (item.icon) {
              <i [class]="item.icon" aria-hidden="true"></i>
            }
            {{ item.label }}
          </dt>
          <dd [style.color]="item.valueColor">{{ item.value }}</dd>
        </div>
      }
    </dl>
  `,
  styleUrl: './summary-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryListComponent {
  readonly items = input<SummaryListItem[]>([]);
  readonly featured = input(false);
}
