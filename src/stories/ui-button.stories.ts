import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Atoms/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">Primary Button</app-button>`,
  }),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Secondary Button</app-button>`,
  }),
};

export const Success: Story = {
  args: {
    variant: 'success',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Success Button</app-button>`,
  }),
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Warning Button</app-button>`,
  }),
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Danger Button</app-button>`,
  }),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Outline Button</app-button>`,
  }),
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Ghost Button</app-button>`,
  }),
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Small Button</app-button>`,
  }),
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size">Large Button</app-button>`,
  }),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [disabled]="disabled">Disabled Button</app-button>`,
  }),
};

export const WithIcon: Story = {
  args: {
    variant: 'success',
    size: 'md',
    icon: '✓',
  },
  render: (args) => ({
    props: args,
    template: `<app-button [variant]="variant" [size]="size" [icon]="icon" iconPosition="left">With Icon</app-button>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <app-button variant="primary">Primary</app-button>
        <app-button variant="secondary">Secondary</app-button>
        <app-button variant="success">Success</app-button>
        <app-button variant="warning">Warning</app-button>
        <app-button variant="danger">Danger</app-button>
        <app-button variant="outline">Outline</app-button>
        <app-button variant="ghost">Ghost</app-button>
      </div>
    `,
  }),
};
