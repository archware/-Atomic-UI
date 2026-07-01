import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container" [style.height]="height">
      @if (isChartReady()) {
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
  isChartReady = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('chart.js').then((ChartJs) => {
        import('chartjs-plugin-datalabels').then((DataLabels) => {
          const { Chart, registerables } = ChartJs;
          Chart.register(...registerables, DataLabels.default);

        // Inject Atomic UI tokens into Chart.js defaults
        const style = getComputedStyle(document.documentElement);
        Chart.defaults.color = style.getPropertyValue('--chart-text-color').trim() || '#a1a1aa';
        Chart.defaults.font.family = 'Inter, sans-serif';

        if (Chart.defaults.plugins.tooltip) {
          Chart.defaults.plugins.tooltip.backgroundColor = style.getPropertyValue('--chart-tooltip-bg').trim() || 'rgba(24, 24, 27, 0.9)';
          Chart.defaults.plugins.tooltip.titleColor = style.getPropertyValue('--chart-tooltip-text').trim() || '#f4f4f5';
          Chart.defaults.plugins.tooltip.bodyColor = style.getPropertyValue('--chart-tooltip-text').trim() || '#f4f4f5';
          Chart.defaults.plugins.tooltip.borderColor = style.getPropertyValue('--chart-tooltip-border').trim() || '#3f3f46';
          Chart.defaults.plugins.tooltip.borderWidth = 1;
          Chart.defaults.plugins.tooltip.padding = 12;
          Chart.defaults.plugins.tooltip.cornerRadius = 8;
        }

        if (Chart.defaults.scale) {
          Chart.defaults.scale.grid.color = style.getPropertyValue('--chart-grid-color').trim() || 'rgba(255, 255, 255, 0.05)';
        }

        // Global Arc (Doughnut/Pie) defaults for depth
        Chart.defaults.elements.arc.borderWidth = 3;
        Chart.defaults.elements.arc.borderColor = style.getPropertyValue('--surface-color').trim() || '#18181b';
        Chart.defaults.elements.arc.hoverOffset = 8;

        // Custom Shadow Plugin for 3D depth on Doughnuts
        // FIX (WebView2): save/restore MUST be unconditional for all chart types.
        // WebView2 reuses the canvas context between dataset draws; leaving ctx.shadowColor
        // set on a bar chart causes subsequent datasets to render with an unintended shadow.
        const shadowPlugin = {
          id: 'shadowPlugin',
          beforeDatasetDraw: (chart: any) => {
            const ctx = chart.ctx;
            ctx.save(); // Always save — never skip, regardless of chart type
            if (chart.config.type === 'doughnut' || chart.config.type === 'pie') {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
              ctx.shadowBlur = 12;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 5;
            }
            // For all other types: ctx is saved clean, shadow props are at default (none)
          },
          afterDatasetDraw: (chart: any) => {
            chart.ctx.restore(); // Always restore — mirrors the unconditional save above
          }
        };
        Chart.register(shadowPlugin);

        if (Chart.defaults.plugins.datalabels) {
          Chart.defaults.plugins.datalabels.color = '#fff';
          Chart.defaults.plugins.datalabels.font = { weight: 'bold', size: 14 };
          Chart.defaults.plugins.datalabels.formatter = function(value: any, context: any) {
            if (typeof value === 'number') {
              // If it's a percentage (e.g. from a bar chart), add % sign
              if (context.chart.config.type === 'bar') {
                return (Math.round(value * 100) / 100) + '%';
              }
              return Math.round(value * 100) / 100;
            }
            return value;
          };
          Chart.defaults.plugins.datalabels.display = function(context: any) {
            const val = context.dataset.data[context.dataIndex];
            return typeof val === 'number' && val > 0;
          };
        }

        this.isChartReady.set(true);
        });
      });
    }
  }

  ngOnDestroy() {}
}
