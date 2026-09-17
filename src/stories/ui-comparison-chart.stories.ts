import type { Meta, StoryObj } from '@storybook/angular';
import { ComparisonChartComponent } from '../app/shared/ui/molecules/comparison-chart/comparison-chart.component';

const meta: Meta<ComparisonChartComponent> = {
  title: 'Molecules/Comparison Chart',
  component: ComparisonChartComponent,
  tags: ['autodocs'],
  argTypes: {
    labelA: { control: 'text' },
    labelB: { control: 'text' },
    prefixA: { control: 'text' },
    prefixB: { control: 'text' },
    formatType: { control: 'radio', options: ['currency', 'number'] }
  },
};

export default meta;
type Story = StoryObj<ComparisonChartComponent>;

export const Default: Story = {
  args: {
    labelA: 'Ingresos',
    labelB: 'Egresos',
    prefixA: 'Ing.',
    prefixB: 'Egr.',
    formatType: 'currency',
    items: [
      { label: 'ENE', seriesA: 45000, seriesB: 50000, seriesAWidth: 45, seriesBWidth: 50 },
      { label: 'FEB', seriesA: 52000, seriesB: 48000, seriesAWidth: 52, seriesBWidth: 48 },
      { label: 'MAR', seriesA: 61000, seriesB: 45000, seriesAWidth: 61, seriesBWidth: 45 }
    ]
  },
};
