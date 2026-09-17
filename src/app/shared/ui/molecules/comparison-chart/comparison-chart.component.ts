import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComparisonChartItem {
  label: string;
  seriesA: number;
  seriesB: number;
  seriesAWidth: number;
  seriesBWidth: number;
}

@Component({
  selector: 'app-comparison-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-legend" aria-label="Leyenda del gráfico">
      <span><i class="chart-legend__dot chart-legend__dot--a"></i>{{ labelA() }}</span>
      <span><i class="chart-legend__dot chart-legend__dot--b"></i>{{ labelB() }}</span>
    </div>
    
    <ol class="monthly-chart" [attr.aria-label]="ariaLabel()">
      @for (item of items(); track item.label) {
        <li>
          <strong class="monthly-chart__month">{{ item.label }}</strong>
          <div class="monthly-chart__plot" aria-hidden="true">
            <span class="monthly-chart__track">
              <i class="monthly-chart__bar monthly-chart__bar--a" [style.width.%]="item.seriesAWidth"></i>
            </span>
            <span class="monthly-chart__track">
              <i class="monthly-chart__bar monthly-chart__bar--b" [style.width.%]="item.seriesBWidth"></i>
            </span>
          </div>
          <div class="monthly-chart__values">
            <span>{{ prefixA() }} <strong>{{ formatValue(item.seriesA) }}</strong></span>
            <span>{{ prefixB() }} <strong>{{ formatValue(item.seriesB) }}</strong></span>
          </div>
        </li>
      }
    </ol>
  `,
  styleUrl: './comparison-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparisonChartComponent {
  readonly items = input<ComparisonChartItem[]>([]);
  readonly labelA = input('Ingresos');
  readonly labelB = input('Egresos');
  readonly prefixA = input('Ing.');
  readonly prefixB = input('Egr.');
  readonly ariaLabel = input('Evolución comparativa');
  readonly formatType = input<'currency' | 'number'>('currency');

  formatValue(val: number): string {
    if (this.formatType() === 'currency') {
      return '$ ' + val.toLocaleString('en-US');
    }
    return val.toLocaleString('en-US');
  }
}
