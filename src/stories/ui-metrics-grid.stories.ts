import type { Meta, StoryObj } from '@storybook/angular';
import {
  KpiMetric,
  MetricsGridComponent,
} from '../app/shared/ui/organisms/metrics-grid/metrics-grid.component';

const demoMetrics: readonly KpiMetric[] = [
  {
    id: 'active-accounts',
    title: 'Cuentas activas',
    subtitle: 'Conteo reportado',
    value: 128,
    iconClass: 'fa-solid fa-wallet',
  },
  {
    id: 'monthly-income',
    title: 'Ingresos del mes',
    subtitle: 'Importe reportado',
    value: 248900.5,
    displayValue: 'S/ 248,900.50',
    iconClass: 'fa-solid fa-arrow-trend-up',
    series: [120, 132, 141, 160, 154, 170, 182],
  },
  {
    id: 'monthly-expense',
    title: 'Egresos del mes',
    subtitle: 'Importe reportado',
    value: 82400.25,
    displayValue: 'S/ 82,400.25',
    iconClass: 'fa-solid fa-arrow-trend-down',
  },
  {
    id: 'response-time',
    title: 'Tiempo medio de respuesta',
    subtitle: 'Canales configurados',
    value: 96,
    format: 'duration',
    iconClass: 'fa-solid fa-stopwatch',
  },
];

const meta: Meta<MetricsGridComponent> = {
  title: '3. Organisms/MetricsGrid',
  component: MetricsGridComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MetricsGridComponent>;

export const Default: Story = {
  args: {
    metrics: demoMetrics,
    minCardWidth: '13.75rem',
    ariaLabel: 'Indicadores de demostración',
  },
};

export const ResponsiveAt320Px: Story = {
  args: {
    metrics: demoMetrics,
    minCardWidth: '15rem',
    ariaLabel: 'Indicadores en contenedor estrecho',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 320px; max-width: 100%; padding: 1rem; box-sizing: border-box;">
        <app-metrics-grid
          [metrics]="metrics"
          [minCardWidth]="minCardWidth"
          [ariaLabel]="ariaLabel"
        />
      </div>
    `,
  }),
};

export const RepeatedTitlesWithStableIds: Story = {
  args: {
    metrics: [
      { id: 'income-today', title: 'Ingresos', value: 120, displayValue: 'S/ 120.00' },
      { id: 'income-month', title: 'Ingresos', value: 900, displayValue: 'S/ 900.00' },
    ],
  },
};
