import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from '../app/shared/ui/atoms/spinner/spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: '1. Atoms/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size:    { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['primary', 'secondary', 'white', 'current'] },
  },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  args: { size: 'md', variant: 'primary' },
};

export const Tamaños: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem;padding:1rem">
        <app-spinner size="xs" variant="primary"></app-spinner>
        <app-spinner size="sm" variant="primary"></app-spinner>
        <app-spinner size="md" variant="primary"></app-spinner>
        <app-spinner size="lg" variant="primary"></app-spinner>
        <app-spinner size="xl" variant="primary"></app-spinner>
      </div>
    `,
    imports: [SpinnerComponent],
  }),
};

export const Variantes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:1.5rem;padding:1rem">
        <app-spinner size="lg" variant="primary"></app-spinner>
        <app-spinner size="lg" variant="secondary"></app-spinner>
        <div style="background:var(--color-primary);padding:0.5rem;border-radius:4px">
          <app-spinner size="lg" variant="white"></app-spinner>
        </div>
        <app-spinner size="lg" variant="current"></app-spinner>
      </div>
    `,
    imports: [SpinnerComponent],
  }),
};
