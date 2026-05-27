import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TableComponent } from '../app/shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../app/shared/ui/atoms/table/table-head.component';
import { TableRowComponent } from '../app/shared/ui/atoms/table/table-row.component';
import { TableCellComponent } from '../app/shared/ui/atoms/table/table-cell.component';

const meta: Meta<TableComponent> = {
  title: '1. Atoms/Table',
  component: TableComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [TableComponent, TableHeadComponent, TableRowComponent, TableCellComponent],
    }),
  ],
  argTypes: {
    striped: { control: 'boolean', description: 'Filas alternadas con fondo diferente' },
    maxHeight: { control: 'number', description: 'Altura máxima en px (activa scroll vertical)' },
  },
};

export default meta;
type Story = StoryObj<TableComponent>;

const SAMPLE_DATA = [
  { id: '001', name: 'Ana García', email: 'ana@email.com', role: 'Admin', status: 'Activo' },
  { id: '002', name: 'Carlos López', email: 'carlos@email.com', role: 'Editor', status: 'Activo' },
  { id: '003', name: 'María Torres', email: 'maria@email.com', role: 'Viewer', status: 'Inactivo' },
  { id: '004', name: 'Juan Pérez', email: 'juan@email.com', role: 'Editor', status: 'Pendiente' },
];

export const Default: Story = {
  args: { striped: false },
  render: (args) => ({
    props: { ...args, data: SAMPLE_DATA },
    template: `
      <app-table [striped]="striped">
        <app-table-head>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </app-table-head>
        <tbody>
          @for (row of data; track row.id) {
            <app-table-row>
              <app-table-cell>{{ row.id }}</app-table-cell>
              <app-table-cell>{{ row.name }}</app-table-cell>
              <app-table-cell>{{ row.email }}</app-table-cell>
              <app-table-cell>{{ row.role }}</app-table-cell>
              <app-table-cell>{{ row.status }}</app-table-cell>
            </app-table-row>
          }
        </tbody>
      </app-table>
    `,
  }),
};

export const Striped: Story = {
  args: { striped: true },
  render: (args) => ({
    props: { ...args, data: SAMPLE_DATA },
    template: `
      <app-table [striped]="striped">
        <app-table-head>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr>
        </app-table-head>
        <tbody>
          @for (row of data; track row.id) {
            <app-table-row>
              <app-table-cell>{{ row.id }}</app-table-cell>
              <app-table-cell>{{ row.name }}</app-table-cell>
              <app-table-cell>{{ row.email }}</app-table-cell>
              <app-table-cell>{{ row.role }}</app-table-cell>
              <app-table-cell>{{ row.status }}</app-table-cell>
            </app-table-row>
          }
        </tbody>
      </app-table>
    `,
  }),
};

export const WithScrollHeight: Story = {
  args: { striped: true, maxHeight: 200 },
  render: (args) => ({
    props: {
      ...args,
      data: [
        ...SAMPLE_DATA,
        { id: '005', name: 'Laura Ruiz', email: 'laura@email.com', role: 'Admin', status: 'Activo' },
        { id: '006', name: 'Pedro Ríos', email: 'pedro@email.com', role: 'Viewer', status: 'Activo' },
        { id: '007', name: 'Sofía Mora', email: 'sofia@email.com', role: 'Editor', status: 'Inactivo' },
      ],
    },
    template: `
      <app-table [striped]="striped" [maxHeight]="maxHeight">
        <app-table-head>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr>
        </app-table-head>
        <tbody>
          @for (row of data; track row.id) {
            <app-table-row>
              <app-table-cell>{{ row.id }}</app-table-cell>
              <app-table-cell>{{ row.name }}</app-table-cell>
              <app-table-cell>{{ row.email }}</app-table-cell>
              <app-table-cell>{{ row.role }}</app-table-cell>
              <app-table-cell>{{ row.status }}</app-table-cell>
            </app-table-row>
          }
        </tbody>
      </app-table>
    `,
  }),
};

export const Empty: Story = {
  args: { striped: false },
  render: (args) => ({
    props: args,
    template: `
      <app-table [striped]="striped">
        <app-table-head>
          <tr><th>ID</th><th>Nombre</th><th>Estado</th></tr>
        </app-table-head>
        <tbody>
          <app-table-row>
            <app-table-cell [colspan]="3" style="text-align:center; color:#888; padding:2rem;">
              No hay datos para mostrar
            </app-table-cell>
          </app-table-row>
        </tbody>
      </app-table>
    `,
  }),
};
