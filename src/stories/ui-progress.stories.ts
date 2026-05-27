import type { Meta, StoryObj } from '@storybook/angular';
import { ProgressComponent } from '../app/shared/ui/atoms/progress/progress.component';

const meta: Meta<ProgressComponent> = {
  title: '1. Atoms/Progress',
  component: ProgressComponent,
  tags: ['autodocs'],
  argTypes: {
    value:   { control: { type: 'range', min: 0, max: 100, step: 1 } },
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'danger'] },
    size:    { control: 'select', options: ['sm', 'md', 'lg'] },
    showLabel: { control: 'boolean' },
    animated:  { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ProgressComponent>;

export const Default: Story = {
  args: { value: 60, variant: 'primary', size: 'md', showLabel: true, animated: false },
};

export const Variantes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:1rem">
        <app-progress [value]="30" variant="default"  size="md" [showLabel]="true"></app-progress>
        <app-progress [value]="45" variant="primary"  size="md" [showLabel]="true"></app-progress>
        <app-progress [value]="70" variant="success"  size="md" [showLabel]="true"></app-progress>
        <app-progress [value]="55" variant="warning"  size="md" [showLabel]="true"></app-progress>
        <app-progress [value]="85" variant="danger"   size="md" [showLabel]="true"></app-progress>
      </div>
    `,
    imports: [ProgressComponent],
  }),
};

export const Tamaños: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;padding:1rem">
        <app-progress [value]="60" variant="primary" size="sm" [showLabel]="true"></app-progress>
        <app-progress [value]="60" variant="primary" size="md" [showLabel]="true"></app-progress>
        <app-progress [value]="60" variant="primary" size="lg" [showLabel]="true"></app-progress>
      </div>
    `,
    imports: [ProgressComponent],
  }),
};

export const Animado: Story = {
  args: { value: 75, variant: 'primary', size: 'md', showLabel: true, animated: true },
};
