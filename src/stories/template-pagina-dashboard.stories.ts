import type { Meta, StoryObj } from '@storybook/angular';
import { PaginaDashboardComponent } from '../app/shared/ui/templates/pagina-dashboard/pagina-dashboard';
import { CommonModule } from '@angular/common';

const meta: Meta<PaginaDashboardComponent> = {
  title: 'Templates/Pagina Dashboard (Chasis D)',
  component: PaginaDashboardComponent,
  tags: ['autodocs'],
  argTypes: {
    titulo: { control: 'text' },
    subtitulo: { control: 'text' },
    eyebrow: { control: 'text' },
    cargando: { control: 'boolean' },
    vacio: { control: 'boolean' }
  },
};

export default meta;
type Story = StoryObj<PaginaDashboardComponent>;

export const Default: Story = {
  args: {
    titulo: 'Panel de Control',
    subtitulo: 'Vista general de indicadores',
    eyebrow: 'Inicio',
    cargando: false,
    vacio: false,
    metricas: [
      { id: '1', title: 'Ventas', value: 12000, displayValue: '$12k', format: 'currency', tone: 'success', iconClass: 'fa-solid fa-chart-line' }
    ]
  },
  render: (args) => ({
    props: args,
    template: `
      <app-pagina-dashboard
        [titulo]="titulo"
        [subtitulo]="subtitulo"
        [eyebrow]="eyebrow"
        [cargando]="cargando"
        [vacio]="vacio"
        [metricas]="metricas"
      >
        <ng-container ngProjectAs="[dashboard-acciones]">
          <button class="atomic-button">Exportar</button>
        </ng-container>
        <ng-container dashboard-contenido>
          <div style="padding: 1rem; background: var(--surface-bg); border-radius: 8px;">
            <p>Aquí se proyectan los paneles y widgets del dashboard.</p>
          </div>
        </ng-container>
      </app-pagina-dashboard>
    `,
  }),
};
