import type { Meta, StoryObj } from '@storybook/angular';
import { SummaryListComponent } from '../app/shared/ui/molecules/summary-list/summary-list.component';

const meta: Meta<SummaryListComponent> = {
  title: 'Catalogos/Detalle semantico',
  component: SummaryListComponent,
  args: { items: [
    { label: 'Código', value: 'FAM-EJEMPLO' },
    { label: 'Nombre', value: 'Café Mixto' },
    { label: 'Descripción', value: 'Ejemplo de presentación, no datos reales.\nSegunda línea.' },
    { label: 'Estado', value: 'Activo' },
  ] },
};
export default meta;
type Story = StoryObj<SummaryListComponent>;
export const ResumenCompatible: Story = {};
export const Detalle: Story = { args: { layout: 'detail' } };
export const TextoLargo: Story = { args: { layout: 'detail', items: [
  { label: 'Descripción', value: 'Descripción muy extensa con tildes. '.repeat(20) },
] } };
