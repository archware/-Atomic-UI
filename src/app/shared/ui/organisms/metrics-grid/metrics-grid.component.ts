import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent, KpiFormat, KpiTrend } from '../../molecules/kpi-card/kpi-card.component';

export interface KpiMetric {
  title: string;
  subtitle?: string;
  value: string | number;
  format?: KpiFormat;
  currency?: string;
  trend?: KpiTrend;
  trendValue?: string;
  comparisonLabel?: string;
  iconClass?: string;
  series?: number[];
}

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="metrics-grid" [style.--min-col-width]="minCardWidth">
      @for (metric of metrics; track metric.title) {
        <app-kpi-card
          [title]="metric.title"
          [subtitle]="metric.subtitle || ''"
          [value]="metric.value"
          [format]="metric.format || 'number'"
          [currency]="metric.currency || 'USD'"
          [trend]="metric.trend || 'neutral'"
          [trendValue]="metric.trendValue || ''"
          [comparisonLabel]="metric.comparisonLabel || ''"
          [iconClass]="metric.iconClass || 'fa-solid fa-chart-line'"
          [series]="metric.series || []"
        ></app-kpi-card>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .metrics-grid {
      --min-col-width: 220px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(var(--min-col-width), 1fr));
      gap: var(--space-4);
      width: 100%;
    }

    @media (max-width: 640px) {
      .metrics-grid {
        gap: var(--space-3);
      }
    }
  `]
})
export class MetricsGridComponent {
  @Input() metrics: KpiMetric[] = [];
  @Input() minCardWidth = '220px';
}
