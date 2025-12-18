import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChipComponent } from '../app/shared/ui/atoms/chip/chip.component';

const meta: Meta<ChipComponent> = {
  title: '1. Atoms/Chip',
  component: ChipComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ChipComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline'],
      description: 'Color variant of the chip',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the chip',
    },
    removable: {
      control: 'boolean',
      description: 'Shows remove button',
    },
    clickable: {
      control: 'boolean',
      description: 'Makes chip interactive',
    },
    selected: {
      control: 'boolean',
      description: 'Selected state',
    },
  },
};

export default meta;
type Story = StoryObj<ChipComponent>;

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [size]="size">Default Chip</app-chip>`,
  }),
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [size]="size">Primary</app-chip>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [size]="size">Active</app-chip>`,
  }),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [size]="size">Pending</app-chip>`,
  }),
};

export const Error: Story = {
  args: {
    variant: 'error',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [size]="size">Error</app-chip>`,
  }),
};

export const Removable: Story = {
  args: {
    variant: 'primary',
    removable: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [removable]="removable">Removable Tag</app-chip>`,
  }),
};

export const Clickable: Story = {
  args: {
    variant: 'outline',
    clickable: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [clickable]="clickable">Click Me</app-chip>`,
  }),
};

export const WithIcon: Story = {
  args: {
    variant: 'success',
    icon: '✓',
  },
  render: (args) => ({
    props: args,
    template: `<app-chip [variant]="variant" [icon]="icon">Completed</app-chip>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <app-chip variant="default">Default</app-chip>
        <app-chip variant="primary">Primary</app-chip>
        <app-chip variant="secondary">Secondary</app-chip>
        <app-chip variant="success">Success</app-chip>
        <app-chip variant="warning">Warning</app-chip>
        <app-chip variant="error">Error</app-chip>
        <app-chip variant="info">Info</app-chip>
        <app-chip variant="outline">Outline</app-chip>
      </div>
    `,
  }),
};

export const StatusChips: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <app-chip variant="success" icon="✓">Active</app-chip>
        <app-chip variant="warning">Pending</app-chip>
        <app-chip variant="secondary">In Review</app-chip>
        <app-chip variant="error">Inactive</app-chip>
        <app-chip variant="info">Draft</app-chip>
      </div>
    `,
  }),
};
