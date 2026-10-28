import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { InputComponent } from '../app/shared/ui/atoms/input/input.component';
import { QueryToolbar } from '../app/shared/ui/organisms/query-toolbar/query-toolbar';

const meta: Meta<QueryToolbar> = {
  title: '3. Organisms/QueryToolbar',
  component: QueryToolbar,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, InputComponent, QueryToolbar],
    }),
  ],
  argTypes: {
    density: { control: 'radio', options: ['comfortable', 'compact'] },
    layout: { control: 'radio', options: ['auto', 'inline', 'stacked'] },
  },
};

export default meta;
type Story = StoryObj<QueryToolbar>;

export const Auto: Story = {
  args: {
    density: 'comfortable',
    layout: 'auto',
    accessibleLabel: 'Buscar clientes y crear registros',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-query-toolbar
        [density]="density"
        [layout]="layout"
        [accessibleLabel]="accessibleLabel"
      >
        <app-input query-filters label="Buscar" placeholder="Nombre o documento" />
        <app-button query-actions variant="outline">Exportar</app-button>
        <app-button query-actions>Nuevo</app-button>
      </app-query-toolbar>
    `,
  }),
};

export const CompactStacked: Story = {
  ...Auto,
  args: {
    density: 'compact',
    layout: 'stacked',
    accessibleLabel: 'Filtros del reporte',
  },
};
