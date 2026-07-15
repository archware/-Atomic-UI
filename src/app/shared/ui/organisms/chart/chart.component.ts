import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div #chartContainer class="chart-container" [style.height]="height">
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
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      min-height: 0;
    }
    .chart-container {
      position: relative;
      width: 100%;
      min-height: 0;
      flex: 1 1 auto;
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
  @ViewChild('chartContainer') private chartContainer?: ElementRef<HTMLDivElement>;
  @ViewChild(BaseChartDirective) private chart?: BaseChartDirective;

  private platformId = inject(PLATFORM_ID);
  private el = inject(ElementRef);
  isChartReady = signal(false);

  private themeObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeFrame: number | null = null;
  private ChartRef: any = null;

  /** Lee los tokens CSS actuales y los aplica a los defaults globales de Chart.js */
  private applyChartTheme(Chart: any): void {
    const style = getComputedStyle(this.el.nativeElement);
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

    Chart.defaults.elements.arc.borderWidth = 3;
    Chart.defaults.elements.arc.borderColor = style.getPropertyValue('--surface-color').trim() || '#18181b';
    Chart.defaults.elements.arc.hoverOffset = 8;
  }

  private refreshChartSize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
    }

    this.resizeFrame = requestAnimationFrame(() => {
      this.resizeFrame = null;
      this.chart?.chart?.resize();
      this.chart?.chart?.update('none');
    });
  }

  private watchContainerSize(): void {
    if (!isPlatformBrowser(this.platformId) || typeof ResizeObserver === 'undefined') return;

    const target = this.chartContainer?.nativeElement;
    if (!target) return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.refreshChartSize());
    this.resizeObserver.observe(target);
  }

  private renderChart(): void {
    this.isChartReady.set(true);
    setTimeout(() => {
      this.watchContainerSize();
      this.refreshChartSize();
    }, 0);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      import('chart.js').then((ChartJs) => {
        import('chartjs-plugin-datalabels').then((DataLabels) => {
          const { Chart, registerables } = ChartJs;
          Chart.register(...registerables, DataLabels.default);
          this.ChartRef = Chart;

          // Aplicar tema inicial
          this.applyChartTheme(Chart);

        // Custom Shadow Plugin for 3D depth on Doughnuts
        // FIX (WebView2): save/restore MUST be unconditional for all chart types.
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
          },
          afterDatasetDraw: (chart: any) => {
            chart.ctx.restore(); // Always restore — mirrors the unconditional save above
          }
        };
        Chart.register(shadowPlugin);

        if (Chart.defaults.plugins.datalabels) {
          Chart.defaults.plugins.datalabels.color = 'var(--gray-0)';
          Chart.defaults.plugins.datalabels.font = { weight: 'bold', size: 14 };
          Chart.defaults.plugins.datalabels.formatter = function(value: any, context: any) {
            if (typeof value === 'number') {
              if (context.chart.config.type === 'bar') {
                return (Math.round(value * 100) / 100) + '%';
              }
              return Math.round(value * 100) / 100;
            }
            return value;
          };
          Chart.defaults.plugins.datalabels.display = function(context: any) {
            const chartType = context.chart.config.type;
            const isPieOrDoughnut = chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea';
            const isVisible = isPieOrDoughnut
              ? context.chart.getDataVisibility(context.dataIndex)
              : context.chart.isDatasetVisible(context.datasetIndex);

            if (!isVisible) return false;

            const val = context.dataset.data[context.dataIndex];
            return typeof val === 'number' && val > 0;
          };
        }

        this.renderChart();

        // Observar cambios de tema: data-theme en <html> o clase dark en <body>
        this.themeObserver = new MutationObserver(() => {
          this.applyChartTheme(Chart);
          // Forzar recreación del canvas para que Chart.js aplique los nuevos defaults
          this.isChartReady.set(false);
          setTimeout(() => this.renderChart(), 0);
        });
        this.themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme', 'class']
        });
        this.themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['data-theme', 'class']
        });

        });
      });
    }
  }

  ngOnDestroy() {
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.resizeFrame !== null) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }
  }
}
