import type { Meta, StoryObj } from '@storybook/angular';
import { KpiCardComponent } from '../app/shared/ui/molecules/kpi-card/kpi-card.component';

const meta: Meta<KpiCardComponent> = {
  title: '2. Molecules/KpiCard',
  component: KpiCardComponent,
  tags: ['autodocs'],
  argTypes: {
    trend: {
      control: 'select',
      options: [null, 'up', 'down', 'neutral'],
      description: 'Comparación explícita. Null evita mostrar una tendencia inventada.',
    },
    format: {
      control: 'select',
      options: ['number', 'currency', 'percent', 'compact', 'duration'],
    },
    fractionDigits: {
      control: { type: 'number', min: 0, max: 6 },
    },
  },
};

export default meta;
type Story = StoryObj<KpiCardComponent>;

export const WithoutInventedTrend: Story = {
  args: {
    title: 'Cuentas activas',
    subtitle: 'Conteo confirmado por el servicio',
    value: 128,
    trend: null,
    iconClass: 'fa-solid fa-wallet',
  },
};

export const AuthoritativeFinancialValue: Story = {
  args: {
    title: 'Desembolsos del mes',
    subtitle: 'Importe reportado por la API',
    value: 248900.5,
    displayValue: 'S/ 248,900.50',
    trend: 'up',
    trendValue: '+8.5%',
    comparisonLabel: 'frente al periodo anterior',
    iconClass: 'fa-solid fa-hand-holding-dollar',
    series: [120, 132, 141, 160, 154, 170, 182],
  },
};

export const CurrencyWithConfigurableDecimals: Story = {
  args: {
    title: 'Saldo promedio',
    value: 1234.5,
    format: 'currency',
    currency: 'PEN',
    fractionDigits: 2,
    iconClass: 'fa-solid fa-coins',
  },
};

export const NarrowContainer: Story = {
  args: {
    title: 'Indicador con una etiqueta deliberadamente extensa',
    subtitle: 'El contenido debe permanecer dentro de la tarjeta a 320 px.',
    value: 96,
    format: 'duration',
    comparisonLabel: 'Sin tendencia porque el backend no entregó una comparación',
    series: [132, 128, 121, 114, 108, 101, 96],
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 320px; max-width: 100%; padding: 1rem; box-sizing: border-box;">
        <app-kpi-card
          [title]="title"
          [subtitle]="subtitle"
          [value]="value"
          [format]="format"
          [trend]="trend"
          [comparisonLabel]="comparisonLabel"
          [series]="series"
        />
      </div>
    `,
  }),
};
