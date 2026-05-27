import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DividerComponent } from '../app/shared/ui/atoms/divider/divider.component';

const meta: Meta<DividerComponent> = {
  title: '1. Atoms/Divider',
  component: DividerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DividerComponent],
    }),
  ],
  argTypes: {
    label: { control: 'text', description: 'Texto centrado en el divisor' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientación del divisor',
    },
    variant: {
      control: 'select',
      options: ['default', 'light', 'strong', 'dashed'],
      description: 'Estilo del divisor',
    },
  },
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 1rem;">
        <p>Contenido superior</p>
        <app-divider></app-divider>
        <p>Contenido inferior</p>
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  args: { label: 'O continúa con' },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 1rem;">
        <p>Ingresa con email</p>
        <app-divider [label]="label"></app-divider>
        <p>Ingresa con redes sociales</p>
      </div>
    `,
  }),
};

export const Dashed: Story = {
  args: { variant: 'dashed' },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 1rem;">
        <p>Sección 1</p>
        <app-divider [variant]="variant"></app-divider>
        <p>Sección 2</p>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; align-items:center; height:40px; gap:0.5rem; padding:1rem;">
        <span>Opción A</span>
        <app-divider [orientation]="orientation"></app-divider>
        <span>Opción B</span>
        <app-divider [orientation]="orientation"></app-divider>
        <span>Opción C</span>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; padding:1rem;">
        <div>
          <p style="margin:0 0 0.5rem; font-size:0.75rem; color:#888">default</p>
          <app-divider></app-divider>
        </div>
        <div>
          <p style="margin:0 0 0.5rem; font-size:0.75rem; color:#888">light</p>
          <app-divider variant="light"></app-divider>
        </div>
        <div>
          <p style="margin:0 0 0.5rem; font-size:0.75rem; color:#888">strong</p>
          <app-divider variant="strong"></app-divider>
        </div>
        <div>
          <p style="margin:0 0 0.5rem; font-size:0.75rem; color:#888">dashed</p>
          <app-divider variant="dashed"></app-divider>
        </div>
        <div>
          <p style="margin:0 0 0.5rem; font-size:0.75rem; color:#888">con label</p>
          <app-divider label="Sección"></app-divider>
        </div>
      </div>
    `,
  }),
};
