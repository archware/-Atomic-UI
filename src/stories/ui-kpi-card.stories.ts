import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { KpiCardComponent } from '../app/shared/ui/molecules/kpi-card/kpi-card.component';

const meta: Meta<KpiCardComponent> = {
  title: '2. Molecules/KpiCard',
  component: KpiCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [KpiCardComponent],
    }),
  ],
  argTypes: {
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
    },
    format: {
      control: 'select',
      options: ['number', 'currency', 'percent'],
    },
  },
};

export default meta;
type Story = StoryObj<KpiCardComponent>;

export const Default: Story = {
  args: {
    title: 'Usuarios activos',
    subtitle: 'Ultimos 30 dias',
    value: 12480,
    trend: 'up',
    trendValue: '+12.4%',
    iconClass: 'fa-solid fa-users',
    series: [10, 14, 13, 17, 21, 19, 23],
  },
};

export const Revenue: Story = {
  args: {
    title: 'Ingresos',
    subtitle: 'Mes actual',
    value: 248900,
    format: 'currency',
    currency: 'PEN',
    trend: 'up',
    trendValue: '+8.5%',
    iconClass: 'fa-solid fa-sack-dollar',
    series: [120, 132, 141, 160, 154, 170, 182],
  },
};

export const Decreasing: Story = {
  args: {
    title: 'Churn',
    subtitle: 'Clientes perdidos',
    value: 6.2,
    format: 'percent',
    trend: 'down',
    trendValue: '-1.1 pp',
    iconClass: 'fa-solid fa-user-minus',
    series: [9.1, 8.7, 8.4, 7.8, 7.1, 6.8, 6.2],
  },
};
