import type { Meta, StoryObj } from '@storybook/angular';
import { TextComponent } from '../app/shared/ui/atoms/text/text.component';

const meta: Meta<TextComponent> = {
  title: 'Atoms/Text',
  component: TextComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'body-sm', 'caption', 'label'],
      description: 'Text variant/size',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'muted', 'success', 'warning', 'danger', 'white'],
      description: 'Text color',
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
      description: 'Font weight',
    },
  },
};

export default meta;
type Story = StoryObj<TextComponent>;

export const Heading1: Story = {
  args: {
    variant: 'h1',
    color: 'primary',
  },
  render: (args) => ({
    props: args,
    template: `<app-text [variant]="variant" [color]="color">Heading 1</app-text>`,
  }),
};

export const Heading2: Story = {
  args: {
    variant: 'h2',
    color: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<app-text [variant]="variant" [color]="color">Heading 2</app-text>`,
  }),
};

export const BodyText: Story = {
  args: {
    variant: 'body',
    color: 'default',
    weight: 'normal',
  },
  render: (args) => ({
    props: args,
    template: `<app-text [variant]="variant" [color]="color" [weight]="weight">This is body text with normal weight.</app-text>`,
  }),
};

export const Caption: Story = {
  args: {
    variant: 'caption',
    color: 'muted',
  },
  render: (args) => ({
    props: args,
    template: `<app-text [variant]="variant" [color]="color">Caption text - useful for descriptions</app-text>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <app-text variant="h1" color="primary">Heading 1</app-text>
        <app-text variant="h2">Heading 2</app-text>
        <app-text variant="h3">Heading 3</app-text>
        <app-text variant="h4">Heading 4</app-text>
        <app-text variant="body" weight="medium">Body (Medium)</app-text>
        <app-text variant="caption" color="muted">Caption text</app-text>
        <app-text variant="label">LABEL</app-text>
      </div>
    `,
  }),
};
