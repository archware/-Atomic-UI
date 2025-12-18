import type { Meta, StoryObj } from '@storybook/angular';
import { RowComponent } from '../app/shared/ui/atoms/row/row.component';

const meta: Meta<RowComponent> = {
  title: '1. Atoms/Row',
  component: RowComponent,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'text',
      description: 'Grid template columns (e.g., "1fr 1fr", "repeat(3, 1fr)", "auto auto")',
    },
    gap: {
      control: 'text',
      description: 'Gap between items (e.g., "1rem", "16px")',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Horizontal alignment',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around'],
      description: 'Justify content',
    },
  },
};

export default meta;
type Story = StoryObj<RowComponent>;

export const TwoColumns: Story = {
  args: {
    columns: '1fr 1fr',
    gap: '1rem',
    align: 'left',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-row [columns]="columns" [gap]="gap" [align]="align">
        <div style="background: #793576; color: white; padding: 1rem; border-radius: 8px;">Column 1</div>
        <div style="background: #23a7d4; color: white; padding: 1rem; border-radius: 8px;">Column 2</div>
      </app-row>
    `,
  }),
};

export const ThreeColumns: Story = {
  args: {
    columns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    align: 'center',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-row [columns]="columns" [gap]="gap" [align]="align">
        <div style="background: #10b981; color: white; padding: 1rem; border-radius: 8px;">Item A</div>
        <div style="background: #f59e0b; color: white; padding: 1rem; border-radius: 8px;">Item B</div>
        <div style="background: #ef4444; color: white; padding: 1rem; border-radius: 8px;">Item C</div>
      </app-row>
    `,
  }),
};

export const AutoColumns: Story = {
  args: {
    columns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    align: 'left',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-row [columns]="columns" [gap]="gap" [align]="align">
        <div style="background: #793576; color: white; padding: 1rem; border-radius: 8px;">Responsive 1</div>
        <div style="background: #23a7d4; color: white; padding: 1rem; border-radius: 8px;">Responsive 2</div>
        <div style="background: #10b981; color: white; padding: 1rem; border-radius: 8px;">Responsive 3</div>
        <div style="background: #f59e0b; color: white; padding: 1rem; border-radius: 8px;">Responsive 4</div>
      </app-row>
    `,
  }),
};
