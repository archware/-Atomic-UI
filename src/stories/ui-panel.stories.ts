import type { Meta, StoryObj } from '@storybook/angular';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';

const meta: Meta<PanelComponent> = {
  title: 'Surfaces/Panel',
  component: PanelComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PanelComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-panel title="Panel de información">
        <p>Contenido del panel con información relevante.</p>
      </app-panel>
    `,
  }),
};

export const WithHeader: Story = {
  render: () => ({
    template: `
      <app-panel title="Estadísticas">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">150</div>
            <div style="color: var(--text-color-secondary);">Usuarios</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--secondary-color);">48</div>
            <div style="color: var(--text-color-secondary);">Pedidos</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--success-color);">$12,450</div>
            <div style="color: var(--text-color-secondary);">Ventas</div>
          </div>
        </div>
      </app-panel>
    `,
  }),
};

export const WithForm: Story = {
  render: () => ({
    template: `
      <app-panel title="Formulario de contacto">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <input type="text" placeholder="Nombre" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem;">
          <input type="email" placeholder="Email" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem;">
          <textarea placeholder="Mensaje" rows="3" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem;"></textarea>
          <button style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            Enviar
          </button>
        </div>
      </app-panel>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <app-panel title="Panel 1">
          <p>Contenido del primer panel.</p>
        </app-panel>
        <app-panel title="Panel 2">
          <p>Contenido del segundo panel.</p>
        </app-panel>
        <app-panel title="Panel 3">
          <p>Contenido del tercer panel.</p>
        </app-panel>
      </div>
    `,
  }),
};
