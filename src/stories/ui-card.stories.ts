import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CardComponent } from '../app/shared/ui/molecules/card/card.component';

const meta: Meta<CardComponent> = {
  title: '2. Molecules/Card',
  component: CardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CardComponent],
    }),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'filled', 'interactive'],
      description: 'Estilo visual de la tarjeta',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño de padding interno',
    },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    clickable: { control: 'boolean', description: 'Agrega estilos de hover y cursor pointer' },
    horizontal: { control: 'boolean', description: 'Layout horizontal (imagen a la izquierda)' },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: { title: 'Título de la tarjeta', subtitle: 'Subtítulo descriptivo', variant: 'default', size: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [subtitle]="subtitle" [variant]="variant" [size]="size" style="max-width:300px;">
        <p>Contenido de la tarjeta. Puede contener cualquier elemento HTML.</p>
      </app-card>
    `,
  }),
};

export const Elevated: Story = {
  args: { title: 'Tarjeta elevada', subtitle: 'Con sombra prominente', variant: 'elevated', size: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [subtitle]="subtitle" [variant]="variant" [size]="size" style="max-width:300px;">
        <p>Ideal para destacar contenido importante en dashboards.</p>
      </app-card>
    `,
  }),
};

export const Interactive: Story = {
  args: { title: 'Tarjeta interactiva', subtitle: 'Haz clic en mí', variant: 'interactive', clickable: true, size: 'md' },
  render: (args) => ({
    props: { ...args, clicked: false },
    template: `
      <app-card [title]="title" [subtitle]="subtitle" [variant]="variant" [clickable]="clickable" [size]="size"
        (cardClick)="clicked = !clicked" style="max-width:300px; cursor:pointer;">
        <p>{{ clicked ? '¡Seleccionada!' : 'Haz clic para seleccionar' }}</p>
      </app-card>
    `,
  }),
};

export const WithImage: Story = {
  args: { title: 'Artículo destacado', variant: 'outlined', size: 'md' },
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [variant]="variant" [size]="size" style="max-width:280px;">
        <img slot="image" src="https://picsum.photos/seed/card/300/150" alt="Imagen de ejemplo" style="width:100%; height:150px; object-fit:cover;" />
        <p>Descripción del artículo con imagen de portada.</p>
        <div slot="actions" style="display:flex; gap:0.5rem;">
          <button style="padding:0.25rem 0.75rem; background:var(--primary-color,#6366f1); color:white; border:none; border-radius:4px; cursor:pointer;">Leer más</button>
        </div>
      </app-card>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:1rem; padding:1rem;">
        <app-card title="Default" variant="default" size="sm" style="width:180px;">
          <p style="margin:0; font-size:0.875rem;">Contenido</p>
        </app-card>
        <app-card title="Elevated" variant="elevated" size="sm" style="width:180px;">
          <p style="margin:0; font-size:0.875rem;">Contenido</p>
        </app-card>
        <app-card title="Outlined" variant="outlined" size="sm" style="width:180px;">
          <p style="margin:0; font-size:0.875rem;">Contenido</p>
        </app-card>
        <app-card title="Filled" variant="filled" size="sm" style="width:180px;">
          <p style="margin:0; font-size:0.875rem;">Contenido</p>
        </app-card>
        <app-card title="Interactive" variant="interactive" size="sm" [clickable]="true" style="width:180px;">
          <p style="margin:0; font-size:0.875rem;">Contenido</p>
        </app-card>
      </div>
    `,
  }),
};
