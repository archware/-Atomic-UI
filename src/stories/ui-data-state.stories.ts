import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DataStateComponent } from '../app/shared/ui/molecules/data-state/data-state.component';
import { LoaderComponent } from '../app/shared/ui/atoms/loader/loader.component';

const meta: Meta<DataStateComponent> = {
  title: '2. Molecules/DataState',
  component: DataStateComponent,
  decorators: [
    moduleMetadata({
      imports: [LoaderComponent],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    isEmpty: {
      control: 'boolean',
      description: 'Show empty state',
    },
    loadingText: {
      control: 'text',
      description: 'Text to show while loading',
    },
    errorTitle: {
      control: 'text',
      description: 'Title for error state',
    },
    emptyText: {
      control: 'text',
      description: 'Text for empty state',
    },
    loaderVariant: {
      control: 'select',
      options: ['spinner', 'dots', 'pulse', 'bars'],
      description: 'Loader variant',
    },
    loaderSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Loader size',
    },
  },
};

export default meta;
type Story = StoryObj<DataStateComponent>;

export const Loading: Story = {
  args: {
    loading: true,
    loadingText: 'Cargando datos...',
    loaderVariant: 'spinner',
    loaderSize: 'md',
  },
};

export const Error: Story = {
  args: {
    loading: false,
    error: {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/users',
    },
    errorTitle: 'Error de conexión',
    showRetryButton: true,
  },
};

export const Empty: Story = {
  args: {
    loading: false,
    isEmpty: true,
    emptyText: 'No hay usuarios registrados',
  },
};

export const WithContent: Story = {
  args: {
    loading: false,
    isEmpty: false,
    error: null,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-data-state [loading]="loading" [isEmpty]="isEmpty" [error]="error">
        <ng-template #content>
          <div style="padding: 1rem; background: var(--surface-section); border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem">Datos cargados correctamente</h3>
            <p style="margin: 0; color: var(--text-color-secondary)">
              Este contenido se muestra cuando loading=false, error=null, e isEmpty=false
            </p>
          </div>
        </ng-template>
      </app-data-state>
    `,
  }),
};
