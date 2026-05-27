import type { Meta, StoryObj } from '@storybook/angular';
import { FiltersComponent } from '../app/shared/ui/organisms/filters/filters.component';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';
import { Select2Component } from '../app/shared/ui/molecules/select2/select2.component';

const meta: Meta<FiltersComponent> = {
  title: '3. Organisms/Filters',
  component: FiltersComponent,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<FiltersComponent>;

export const Default: Story = {
  render: () => ({
    props: {
      dateStart: '',
      dateEnd:   '',
      status:    '',
      statusOptions: [
        { value: '',         label: 'Todos' },
        { value: 'active',   label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
      onFilter: () => alert('Filtrar'),
    },
    template: `
      <app-filters
        [(dateStart)]="dateStart"
        [(dateEnd)]="dateEnd"
        [(status)]="status"
        (filter)="onFilter()"
      ></app-filters>
    `,
    imports: [FiltersComponent, FormsModule],
  }),
};

export const ConContenidoPersonalizado: Story = {
  render: () => ({
    props: {
      texto:  '',
      estado: '',
      statusOptions: [
        { value: '',         label: 'Todos' },
        { value: 'active',   label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
    },
    template: `
      <app-filters>
        <app-floating-input
          label="Buscar"
          variant="outline"
          [(ngModel)]="texto"
          name="texto"
        ></app-floating-input>
        <app-select2
          label="Estado"
          [options]="statusOptions"
          [(ngModel)]="estado"
          name="estado"
          [searchable]="false"
        ></app-select2>
        <app-button variant="primary">Filtrar</app-button>
      </app-filters>
    `,
    imports: [FiltersComponent, FormsModule, FloatingInputComponent, Select2Component, ButtonComponent],
  }),
};
