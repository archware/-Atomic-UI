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
  styleUrl: './metrics-grid.component.css',
    templateUrl: './metrics-grid.component.html'
})
export class MetricsGridComponent {
  readonly metrics = input<readonly KpiMetric[]>([]);
  readonly minCardWidth = input('13.75rem');
  readonly ariaLabel = input('Resumen de indicadores');

  columnCount(capacity: number): number {
    return Math.min(this.metrics().length, capacity);
  }
}
