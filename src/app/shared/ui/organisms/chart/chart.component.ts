import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container" [style.height]="height">
      @if (isBrowser) {
        <canvas baseChart
          [data]="data"
          [options]="options"
          [type]="type">
        </canvas>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
    }
    canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() type: ChartType = 'line';
  @Input() data!: ChartConfiguration['data'];
  @Input() options!: ChartConfiguration['options'];
  @Input() height = '300px';

  private platformId = inject(PLATFORM_ID);
  isBrowser = false;

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      import('chart.js').then((ChartJs) => {
        const { Chart, registerables } = ChartJs;
        Chart.register(...registerables);
      });
    }
  }

  ngOnDestroy() {}
}
