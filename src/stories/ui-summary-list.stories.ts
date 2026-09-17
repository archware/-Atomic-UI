import type { Meta, StoryObj } from '@storybook/angular';
import { SummaryListComponent } from '../app/shared/ui/molecules/summary-list/summary-list.component';

const meta: Meta<SummaryListComponent> = {
  title: 'Molecules/Summary List',
  component: SummaryListComponent,
  tags: ['autodocs'],
  argTypes: {
    featured: { control: 'boolean', description: 'Destaca el estilo de los valores (más grandes y color primario)' },
  },
};

export default meta;
type Story = StoryObj<SummaryListComponent>;

export const Default: Story = {
  args: {
    featured: false,
    items: [
      { label: 'Pedidos atrasados', value: 245, icon: 'fa-solid fa-file-circle-exclamation' },
      { label: 'Clientes en mora', value: 18, icon: 'fa-solid fa-user-clock' },
      { label: 'Saldo pendiente', value: '$ 45,200.00', icon: 'fa-solid fa-money-bill-wave' }
    ]
  },
};

export const Featured: Story = {
  args: {
    featured: true,
    items: [
      { label: 'Ingresos Totales', value: '$ 124,500.00', icon: 'fa-solid fa-coins' },
      { label: 'Crecimiento', value: '+12%', icon: 'fa-solid fa-arrow-trend-up', valueColor: 'var(--success-color)' }
    ]
  }
};
