import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type KpiTrend = 'up' | 'down' | 'neutral' | null;
export type KpiFormat = 'number' | 'currency' | 'percent' | 'compact' | 'duration';
export type KpiTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="kpi-card"
      [class]="'kpi-card kpi-card--' + tone()"
      [attr.aria-label]="accessibleLabel"
    >
      <header class="kpi-card__header">
        <div class="kpi-card__heading">
          <p class="kpi-card__title">{{ title() }}</p>
          @if (subtitle()) {
            <p class="kpi-card__subtitle">{{ subtitle() }}</p>
          }
        </div>
        @if (iconClass()) {
          <span class="kpi-card__icon" aria-hidden="true">
            <i [class]="iconClass()"></i>
          </span>
        }
      </header>

      <div class="kpi-card__content">
        <p class="kpi-card__value">{{ formattedValue }}</p>

        @if (trend() || comparisonLabel()) {
          <div class="kpi-card__meta">
            @if (trend()) {
              <span class="kpi-card__trend" [class]="'kpi-card__trend--' + trend()">
                @switch (trend()) {
                  @case ('up') {
                    <i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>
                  }
                  @case ('down') {
                    <i class="fa-solid fa-arrow-trend-down" aria-hidden="true"></i>
                  }
                  @case ('neutral') {
                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                  }
                }
                {{ trendLabel }}
              </span>
            }
            @if (comparisonLabel()) {
              <span class="kpi-card__comparison">{{ comparisonLabel() }}</span>
            }
          </div>
        }
      </div>

      @if (sparklinePoints; as points) {
        <footer class="kpi-card__chart" aria-hidden="true">
          <svg viewBox="0 0 120 32" preserveAspectRatio="none" focusable="false">
            <polyline
              [attr.points]="points"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
            ></polyline>
          </svg>
        </footer>
      }
    </article>
  `,
  styleUrl: './kpi-card.component.css',
})
export class KpiCardComponent {
  /** Visible KPI label. */
  readonly title = input('Métrica');

  /** Optional context shown under the label. */
  readonly subtitle = input('');

  /** Raw value used only when displayValue is not supplied. */
  readonly value = input<string | number>(0);

  /** Preformatted value. Prefer this for authoritative financial presentation. */
  readonly displayValue = input('');

  readonly format = input<KpiFormat>('number');
  readonly currency = input('PEN');
  readonly locale = input('es-PE');

  /** Decimal places for number/currency/percent. Null keeps each format default. */
  readonly fractionDigits = input<number | null>(null);

  /** Semantic emphasis. Neutral avoids turning every metric into a brand action. */
  readonly tone = input<KpiTone>('neutral');

  /** Null intentionally means that no comparison trend is available. */
  readonly trend = input<KpiTrend>(null);
  readonly trendValue = input('');
  readonly iconClass = input('');
  readonly series = input<readonly number[]>([]);
  readonly comparisonLabel = input('');

  get formattedValue(): string {
    const authoritativeDisplay = this.displayValue().trim();
    if (authoritativeDisplay) {
      return authoritativeDisplay;
    }

    const number = Number(this.value());
    if (!Number.isFinite(number)) {
      return String(this.value());
    }

    const format = this.format();
    if (format === 'currency') {
      const digits = this.normalizedFractionDigits(2);
      return new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currency(),
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(number);
    }

    if (format === 'percent') {
      return `${number.toFixed(this.normalizedFractionDigits(1))}%`;
    }

    if (format === 'compact') {
      return new Intl.NumberFormat(this.locale(), {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: this.normalizedFractionDigits(1),
      }).format(number);
    }

    if (format === 'duration') {
      const totalMinutes = Math.max(0, Math.round(number));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}m` : `${minutes}m`;
    }

    const digits = this.fractionDigits();
    return new Intl.NumberFormat(
      this.locale(),
      digits === null
        ? undefined
        : {
            minimumFractionDigits: this.normalizedFractionDigits(0),
            maximumFractionDigits: this.normalizedFractionDigits(0),
          },
    ).format(number);
  }

  get trendLabel(): string {
    const trend = this.trend();
    if (!trend) {
      return '';
    }
    const trendValue = this.trendValue();
    if (trendValue) {
      return trendValue;
    }
    return trend === 'up' ? 'Sube' : trend === 'down' ? 'Baja' : 'Estable';
  }

  get sparklinePoints(): string {
    const finiteSeries = this.series().filter((point) => Number.isFinite(point));
    if (finiteSeries.length < 2) {
      return '';
    }

    const min = Math.min(...finiteSeries);
    const max = Math.max(...finiteSeries);
    const range = max - min || 1;

    return finiteSeries
      .map((point, index) => {
        const x = (index / (finiteSeries.length - 1)) * 120;
        const y = 30 - ((point - min) / range) * 24;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }

  get accessibleLabel(): string {
    return [
      `${this.title()}: ${this.formattedValue}`,
      this.subtitle(),
      this.trend() ? this.trendLabel : '',
      this.comparisonLabel(),
    ]
      .filter(Boolean)
      .join('. ');
  }

  private normalizedFractionDigits(fallback: number): number {
    const fractionDigits = this.fractionDigits();
    if (fractionDigits === null || !Number.isFinite(fractionDigits)) {
      return fallback;
    }
    return Math.min(6, Math.max(0, Math.trunc(fractionDigits)));
  }
}
