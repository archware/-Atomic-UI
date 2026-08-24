import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  KpiCardComponent,
  KpiFormat,
  KpiTone,
  KpiTrend,
} from '../../molecules/kpi-card/kpi-card.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

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
  readonly tone?: KpiTone;
  readonly trend?: KpiTrend;
  readonly trendValue?: string;
  readonly comparisonLabel?: string;
  readonly iconClass?: string;
  readonly series?: readonly number[];
}

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [KpiCardComponent, VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="metrics-grid"
      [class.metrics-grid--empty]="metrics().length === 0"
      [appVariablesCss]="{
        '--min-col-width': minCardWidth(),
        '--metric-columns-desktop': columnCount(4),
        '--metric-columns-tablet': columnCount(2),
        '--metric-columns-mobile': columnCount(1)
      }"
      [attr.aria-label]="ariaLabel()"
    >
      @for (metric of metrics(); track metric.id ?? metric) {
        <app-kpi-card
          [title]="metric.title"
          [subtitle]="metric.subtitle ?? ''"
          [value]="metric.value"
          [displayValue]="metric.displayValue ?? ''"
          [format]="metric.format ?? 'number'"
          [currency]="metric.currency ?? 'PEN'"
          [locale]="metric.locale ?? 'es-PE'"
          [fractionDigits]="metric.fractionDigits ?? null"
          [tone]="metric.tone ?? 'neutral'"
          [trend]="metric.trend ?? null"
          [trendValue]="metric.trendValue ?? ''"
          [comparisonLabel]="metric.comparisonLabel ?? ''"
          [iconClass]="metric.iconClass ?? ''"
          [series]="metric.series ?? []"
        />
      }
    </section>
  `,
  styleUrl: './metrics-grid.component.css',
})
export class MetricsGridComponent {
  readonly metrics = input<readonly KpiMetric[]>([]);
  readonly minCardWidth = input('13.75rem');
  readonly ariaLabel = input('Resumen de indicadores');

  columnCount(capacity: number): number {
    return Math.min(this.metrics().length, capacity);
  }
}
