import type { Meta, StoryObj } from '@storybook/angular';
import { ScrollOverlayComponent } from '../app/shared/ui/organisms/scroll-overlay/scroll-overlay.component';

const meta: Meta<ScrollOverlayComponent> = {
  title: '3. Organisms/ScrollOverlay',
  component: ScrollOverlayComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Contenedor con scroll personalizado y overlays para indicar más contenido.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ScrollOverlayComponent>;

export const Default: Story = {
  args: {
    maxBodyHeight: 300,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-scroll-overlay [maxBodyHeight]="maxBodyHeight">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--surface-section);">
              <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--primary-color);">ID</th>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--primary-color);">Nombre</th>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--primary-color);">Email</th>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--primary-color);">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]">
              <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">{{i}}</td>
              <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">Usuario {{i}}</td>
              <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">usuario{{i}}@ejemplo.com</td>
              <td style="padding: 0.75rem; border-bottom: 1px solid var(--border-color);">Activo</td>
            </tr>
          </tbody>
        </table>
      </app-scroll-overlay>
    `,
  }),
};

export const WithColumnTemplate: Story = {
  args: {
    maxBodyHeight: 300,
    lockColumnTemplate: true,
    columnTemplate: '70px minmax(150px, 1fr) minmax(200px, 2fr) 100px',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-scroll-overlay 
        [maxBodyHeight]="maxBodyHeight"
        [lockColumnTemplate]="lockColumnTemplate"
        [columnTemplate]="columnTemplate">
        <table class="rtc-table">
          <thead class="rtc-header">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody class="rtc-body">
            <tr class="rtc-row" *ngFor="let i of [1,2,3,4,5,6,7,8]">
              <td>{{i}}</td>
              <td>Usuario {{i}}</td>
              <td>usuario{{i}}@ejemplo.com</td>
              <td>Activo</td>
            </tr>
          </tbody>
        </table>
      </app-scroll-overlay>
    `,
  }),
};

export const SmallHeight: Story = {
  args: {
    maxBodyHeight: 150,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-scroll-overlay [maxBodyHeight]="maxBodyHeight">
        <div style="padding: 1rem;">
          <p *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]" style="margin-bottom: 1rem;">
            Párrafo {{i}}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </app-scroll-overlay>
    `,
  }),
};

export const NoScroll: Story = {
  args: {
    maxBodyHeight: 500,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-scroll-overlay [maxBodyHeight]="maxBodyHeight">
        <div style="padding: 1rem;">
          <p>Este contenido no necesita scroll.</p>
          <p>Es más pequeño que el contenedor.</p>
        </div>
      </app-scroll-overlay>
    `,
  }),
};
