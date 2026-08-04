import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { PageHeader } from '../app/shared/ui/organisms/page-header/page-header';

const meta: Meta<PageHeader> = {
  title: '3. Organisms/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, PageHeader],
    }),
  ],
  argTypes: {
    density: { control: 'radio', options: ['comfortable', 'compact'] },
  },
};

export default meta;
type Story = StoryObj<PageHeader>;

export const Comfortable: Story = {
  args: {
    eyebrow: 'Catálogos',
    title: 'Tipos de crédito',
    subtitle: 'Administre las opciones disponibles durante una solicitud.',
    density: 'comfortable',
  },
  render: (args) => ({
    props: args,
    template: `
      <prest-page-header
        [eyebrow]="eyebrow"
        [title]="title"
        [subtitle]="subtitle"
        [density]="density"
      >
        <app-button page-header-actions variant="outline">Exportar</app-button>
        <app-button page-header-actions>Nuevo</app-button>
      </prest-page-header>
    `,
  }),
};

export const Compact: Story = {
  args: {
    title: 'Clientes',
    subtitle: 'Cartera activa y seguimiento diario.',
    density: 'compact',
  },
};
