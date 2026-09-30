import type { Meta, StoryObj } from '@storybook/angular';
import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { DataTable } from '../app/shared/ui/organisms/data-table/data-table';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';

const meta: Meta = {
  id: 'atomic-alert-reference',
  title: '2. Molecules/Alert/Referencia compartida',
  args: { theme: 'dark' },
  argTypes: { theme: { control: 'select', options: ['light', 'dark', 'brand-dark'] } },
};
export default meta;

export const Superficies: StoryObj = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [Alert, DataTable, PanelComponent] },
    template: `
      <app-panel [attr.data-theme]="theme" variant="card" padding="md"
        role="region" aria-label="Referencia de alertas Atomic">
        <app-alert kind="info" title="Información:">Mensaje informativo para el usuario.</app-alert>
        <app-alert kind="success" title="Éxito:">La operación se completó correctamente.</app-alert>
        <app-alert kind="warning" title="Advertencia:">Revise los datos antes de continuar.</app-alert>
        <app-alert kind="danger" title="Error:" [closable]="true">No fue posible guardar los cambios. Revise los datos e intente nuevamente.</app-alert>
        <app-data-table caption="Error recuperable de ejemplo" [columns]="[]" [rows]="[]"
          status="error" pagination="none" />
      </app-panel>
    `,
  }),
};
