import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { KpiCardComponent, KpiFormat, KpiTrend } from '../../molecules/kpi-card/kpi-card.component';

export interface KpiMetric {
  /** Stable identity. New consumers should always provide it. */
  readonly id?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly value: string | number;
  readonly displayValue?: string;
  readonly format?: KpiFormat;
  readonly currency?: string;
  readonly locale?: string;
  readonly fractionDigits?: number | null;
  readonly trend?: KpiTrend;
  readonly trendValue?: string;
  readonly comparisonLabel?: string;
  readonly iconClass?: string;
  readonly series?: readonly number[];
}

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [KpiCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="metrics-grid"
      [style.--min-col-width]="minCardWidth"
      [attr.aria-label]="ariaLabel"
    >
      @for (metric of metrics; track metric.id ?? metric) {
        <app-kpi-card
          [title]="metric.title"
          [subtitle]="metric.subtitle ?? ''"
          [value]="metric.value"
          [displayValue]="metric.displayValue ?? ''"
          [format]="metric.format ?? 'number'"
          [currency]="metric.currency ?? 'PEN'"
          [locale]="metric.locale ?? 'es-PE'"
          [fractionDigits]="metric.fractionDigits ?? null"
          [trend]="metric.trend ?? null"
          [trendValue]="metric.trendValue ?? ''"
          [comparisonLabel]="metric.comparisonLabel ?? ''"
          [iconClass]="metric.iconClass ?? ''"
          [series]="metric.series ?? []"
        />
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
      }

      .metrics-grid {
        --min-col-width: 13.75rem;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min-col-width)), 1fr));
        gap: var(--space-4);
      }

      .metrics-grid > * {
        min-width: 0;
      }

      @media (max-width: 40rem) {
        .metrics-grid {
          gap: var(--space-3);
        }
      }
    `,
  ],
})
export class MetricsGridComponent {
  @Input() metrics: readonly KpiMetric[] = [];
  @Input() minCardWidth = '13.75rem';
  @Input() ariaLabel = 'Resumen de indicadores';
}
