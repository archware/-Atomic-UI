import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MetricsGridComponent, KpiMetric } from '../app/shared/ui/organisms/metrics-grid/metrics-grid.component';

const demoMetrics: KpiMetric[] = [
  {
    title: 'Usuarios activos',
    subtitle: 'Ultimos 30 dias',
    value: 12480,
    format: 'compact',
    trend: 'up',
    trendValue: '+12.4%',
    comparisonLabel: 'vs mes pasado',
    iconClass: 'fa-solid fa-users',
    series: [10, 14, 13, 17, 21, 19, 23],
  },
  {
    title: 'Ingresos',
    subtitle: 'Mes actual',
    value: 248900,
    format: 'currency',
    currency: 'PEN',
    trend: 'up',
    trendValue: '+8.5%',
    comparisonLabel: 'objetivo trimestral',
    iconClass: 'fa-solid fa-sack-dollar',
    series: [120, 132, 141, 160, 154, 170, 182],
  },
  {
    title: 'Churn',
    subtitle: 'Clientes perdidos',
    value: 6.2,
    format: 'percent',
    trend: 'down',
    trendValue: '-1.1 pp',
    comparisonLabel: 'mejor que la media',
    iconClass: 'fa-solid fa-user-minus',
    series: [9.1, 8.7, 8.4, 7.8, 7.1, 6.8, 6.2],
  },
  {
    title: 'Tiempo medio de respuesta',
    subtitle: 'Mesa de soporte',
    value: 96,
    format: 'duration',
    trend: 'down',
    trendValue: '-14m',
    comparisonLabel: 'SLA en objetivo',
    iconClass: 'fa-solid fa-stopwatch',
    series: [132, 128, 121, 114, 108, 101, 96],
  },
];

const meta: Meta<MetricsGridComponent> = {
  title: '3. Organisms/MetricsGrid',
  component: MetricsGridComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [MetricsGridComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<MetricsGridComponent>;

export const Default: Story = {
  args: {
    metrics: demoMetrics,
    minCardWidth: '220px',
  },
};

export const CompactMobile: Story = {
  args: {
    metrics: demoMetrics,
    minCardWidth: '180px',
  },
};
