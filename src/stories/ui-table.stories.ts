import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { TableCellComponent } from '../app/shared/ui/atoms/table/table-cell.component';
import { TableRowComponent } from '../app/shared/ui/atoms/table/table-row.component';
import { TableComponent } from '../app/shared/ui/atoms/table/table.component';

const SAMPLE_DATA = [
  {
    id: '001',
    name: 'Ana García',
    email: 'ana@email.com',
    role: 'Administradora',
    status: 'Activo',
  },
  { id: '002', name: 'Carlos López', email: 'carlos@email.com', role: 'Editor', status: 'Activo' },
  {
    id: '003',
    name: 'María Torres',
    email: 'maria@email.com',
    role: 'Consulta',
    status: 'Inactivo',
  },
  { id: '004', name: 'Juan Pérez', email: 'juan@email.com', role: 'Editor', status: 'Pendiente' },
  {
    id: '005',
    name: 'Laura Ruiz',
    email: 'laura@email.com',
    role: 'Administradora',
    status: 'Activo',
  },
  { id: '006', name: 'Pedro Ríos', email: 'pedro@email.com', role: 'Consulta', status: 'Activo' },
  { id: '007', name: 'Sofía Mora', email: 'sofia@email.com', role: 'Editor', status: 'Inactivo' },
];

const meta: Meta<TableComponent> = {
  id: 'atoms-table',
  title: '1. Atoms/Table',
  component: TableComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [TableComponent, TableRowComponent, TableCellComponent] }),
  ],
  argTypes: {
    striped: { control: 'boolean', description: 'Alterna el fondo de las filas.' },
    maxHeight: { control: 'text', description: 'Altura máxima del viewport.' },
    columnTemplate: { control: 'text', description: 'Plantilla estable para las columnas.' },
    unifiedScroll: { control: 'boolean', description: 'Usa un único propietario para ambos ejes.' },
    scrollbarMode: {
      control: 'radio',
      options: ['overlay', 'native'],
      description: 'Selecciona indicadores Atomic superpuestos o barras nativas tokenizadas.',
    },
    scrollResetKey: { control: 'text', description: 'Reinicia ambos ejes al cambiar.' },
    ariaLabel: { control: 'text', description: 'Nombre accesible del viewport real.' },
    cellOverflow: { control: 'radio', options: ['wrap', 'truncate'] },
  },
};

export default meta;
type Story = StoryObj<TableComponent>;

const renderTable = (args: Partial<TableComponent>) => ({
  props: { ...args, data: SAMPLE_DATA },
  template: `
    <app-table
      [striped]="striped"
      [maxHeight]="maxHeight"
      [columnTemplate]="columnTemplate"
      [unifiedScroll]="unifiedScroll"
      [scrollbarMode]="scrollbarMode"
      [scrollResetKey]="scrollResetKey"
      [ariaLabel]="ariaLabel"
      [cellOverflow]="cellOverflow"
    >
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Nombre</th>
          <th scope="col">Email</th>
          <th scope="col">Rol</th>
          <th scope="col">Estado</th>
        </tr>
      </thead>
      <tbody>
        @for (row of data; track row.id) {
          <tr app-table-row>
            <td app-table-cell dataLabel="ID">{{ row.id }}</td>
            <td app-table-cell dataLabel="Nombre" [wrap]="true">{{ row.name }}</td>
            <td app-table-cell dataLabel="Email">{{ row.email }}</td>
            <td app-table-cell dataLabel="Rol">{{ row.role }}</td>
            <td app-table-cell dataLabel="Estado">{{ row.status }}</td>
          </tr>
        }
      </tbody>
    </app-table>
  `,
});

export const Default: Story = {
  args: {
    striped: false,
    unifiedScroll: false,
    scrollbarMode: 'overlay',
    ariaLabel: '',
    cellOverflow: 'wrap',
  },
  render: renderTable,
};

export const Striped: Story = {
  args: {
    striped: true,
    unifiedScroll: false,
    scrollbarMode: 'overlay',
    ariaLabel: '',
    cellOverflow: 'wrap',
  },
  render: renderTable,
};

export const UnifiedNativeViewport: Story = {
  args: {
    striped: true,
    maxHeight: 260,
    columnTemplate: '240px 480px 640px 420px 360px',
    unifiedScroll: true,
    scrollbarMode: 'native',
    scrollResetKey: 'dataset-1',
    ariaLabel: 'Vista previa de movimientos',
    cellOverflow: 'truncate',
  },
  render: renderTable,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole('region', { name: 'Vista previa de movimientos' });
    const root = canvasElement.querySelector('app-scroll-overlay') as HTMLElement;
    const wrappedDescription = canvasElement.querySelector(
      'td.atomic-table-cell-wrap',
    ) as HTMLElement;

    await expect(viewport.getAttribute('data-so-native-scrollbar')).toBe('true');
    await expect(root.classList).toContain('so-native-scrollbars');
    await expect(root.classList).toContain('atomic-table-truncate-cells');
    await expect(wrappedDescription).toBeTruthy();
  },
};

export const UnifiedOverlayViewport: Story = {
  args: {
    striped: true,
    maxHeight: 260,
    columnTemplate: '240px 480px 640px 420px 360px',
    unifiedScroll: true,
    scrollbarMode: 'overlay',
    scrollResetKey: 'dataset-overlay',
    ariaLabel: 'Movimientos con indicadores overlay',
    cellOverflow: 'truncate',
  },
  render: renderTable,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole('region', {
      name: 'Movimientos con indicadores overlay',
    });
    const root = canvasElement.querySelector('app-scroll-overlay') as HTMLElement;

    await expect(viewport.getAttribute('data-so-managed-scrollbar')).toBe('true');
    await expect(viewport.hasAttribute('data-so-native-scrollbar')).toBe(false);
    await expect(root.classList).not.toContain('so-native-scrollbars');
    await expect(root.classList).not.toContain('so-no-vertical');
    await expect(root.classList).not.toContain('so-no-horizontal');
    await expect(root.classList).toContain('so-has-overflow-x');
    await expect(root.classList).toContain('so-has-overflow-y');
  },
};

export const Empty: Story = {
  args: {
    striped: false,
    unifiedScroll: true,
    scrollbarMode: 'overlay',
    maxHeight: 260,
    scrollResetKey: 'empty',
    ariaLabel: 'Tabla sin resultados',
    cellOverflow: 'wrap',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-table
        [striped]="striped"
        [maxHeight]="maxHeight"
        [unifiedScroll]="unifiedScroll"
        [scrollbarMode]="scrollbarMode"
        [scrollResetKey]="scrollResetKey"
        [ariaLabel]="ariaLabel"
        [cellOverflow]="cellOverflow"
      >
        <thead><tr><th scope="col">Estado</th></tr></thead>
        <tbody><tr app-table-row><td app-table-cell>No hay datos para mostrar</td></tr></tbody>
      </app-table>
    `,
  }),
};
