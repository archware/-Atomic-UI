import { Component, signal } from '@angular/core';
import { PaginaCrud, FiltroBusqueda } from '../../../../shared/ui/templates/pagina-crud/pagina-crud';
import { PaginaCrudAccordion } from '../../../../shared/ui/templates/pagina-crud-accordion/pagina-crud-accordion';
import { PaginaWizardComponent } from '../../../../shared/ui/templates/pagina-wizard/pagina-wizard';
import { EntidadAccordion, SolicitudPagina } from '../../../../shared/ui/templates/modelos-crud';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { DataTableColumn } from '../../../../shared/ui/organisms/data-table/data-table';
import { InputComponent } from '../../../../shared/ui/atoms/input/input.component';
import { Step } from '../../../../shared/ui/organisms/stepper/stepper.component';

interface FilaProductoDemostracion {
  id: number;
  nombre: string;
  categoria: string;
  codigoCategoria: string;
}

@Component({
  selector: 'app-showcase-templates',
  standalone: true,
  imports: [PaginaCrud, PaginaCrudAccordion, PaginaWizardComponent, PanelComponent, InputComponent],
  template: `
    <app-panel title="Templates (Pagina CRUD y Variantes)" variant="flat" padding="md" class="showcase-section">
      <p style="color: var(--text-color-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
        Demostración de los templates de alto nivel, incluyendo Búsqueda en Cascada y variantes de CRUD.
      </p>

      <div style="margin-bottom: 2rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
        <app-pagina-crud
          titulo="Búsqueda en Cascada (Pagina CRUD)"
          [columnas]="columnasCrud"
          [filas]="filasCrud()"
          [embedded]="true"
          [opcionesBusqueda]="opcionesBusqueda"
          [tipoBusqueda]="tipoBusquedaActual()"
          (alCambiarTipoBusqueda)="onCambiarTipoBusqueda($event)"
          (alSolicitarPagina)="onSolicitarPagina($event)"
        >
          <ng-template #formularioCrud let-ctx>
            <div style="display: grid; gap: 1rem;">
              <app-input label="Nombre"></app-input>
              <app-input label="Categoría"></app-input>
            </div>
          </ng-template>
        </app-pagina-crud>
      </div>

      <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
        <app-pagina-crud-accordion
          titulo="Variante: CRUD Accordion"
          varianteAccordion="single"
          [entidades]="entidadesAccordion"
          [columnasPorEntidad]="columnasAccordion"
          [filasPorEntidad]="filasAccordion"
        >
          <ng-template #formularioCrud let-ctx>
            <div style="display: grid; gap: 1rem;">
              <app-input label="Dato"></app-input>
            </div>
          </ng-template>
        </app-pagina-crud-accordion>
      </div>
      <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; margin-top: 2rem;">
        <app-pagina-wizard
          titulo="Variante: CRUD Wizard"
          subtitulo="Paso a paso"
          [steps]="wizardSteps"
          [activeStep]="wizardActiveStep()"
          (stepChange)="wizardActiveStep.set($event)"
          (cancelled)="wizardActiveStep.set(0)"
          (backClicked)="wizardActiveStep.set(wizardActiveStep() - 1)"
          (nextClicked)="wizardActiveStep.set(wizardActiveStep() + 1)"
          (finished)="wizardActiveStep.set(0)"
        >
          <div style="padding: 1rem;">
            <p>Contenido del paso {{ wizardActiveStep() + 1 }}</p>
          </div>
        </app-pagina-wizard>
      </div>
    </app-panel>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
  `]
})
export class ShowcaseTemplatesComponent {
  // --- Búsqueda en Cascada (Pagina CRUD) ---
  opcionesBusqueda: FiltroBusqueda[] = [
    { label: 'Categoría', value: 'categoria', tipo: 'select', opcionesSelect: [
      { label: 'Electrónica', value: 'electro' },
      { label: 'Ropa', value: 'ropa' }
    ]},
    { label: 'Nombre', value: 'nombre', tipo: 'texto' }
  ];

  columnasCrud: DataTableColumn<FilaProductoDemostracion>[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'categoria', header: 'Categoría' }
  ];

  private readonly catalogoInicialCrud: FilaProductoDemostracion[] = [
    { id: 1, nombre: 'Laptop', categoria: 'Electrónica', codigoCategoria: 'electro' },
    { id: 2, nombre: 'Camisa', categoria: 'Ropa', codigoCategoria: 'ropa' }
  ];

  tipoBusquedaActual = signal<string | null>(null);
  filasCrud = signal<FilaProductoDemostracion[]>(this.catalogoInicialCrud);

  onCambiarTipoBusqueda(tipo: string | null): void {
    this.tipoBusquedaActual.set(tipo);
    this.filasCrud.set(this.catalogoInicialCrud);
  }

  onSolicitarPagina(solicitud: SolicitudPagina): void {
    const termino = (solicitud.busqueda ?? '').trim().toLowerCase();
    const tipo = this.tipoBusquedaActual();
    if (!termino || !tipo) {
      this.filasCrud.set(this.catalogoInicialCrud);
      return;
    }
    this.filasCrud.set(
      this.catalogoInicialCrud.filter(fila =>
        tipo === 'categoria'
          ? fila.codigoCategoria === termino
          : fila.nombre.toLowerCase().includes(termino),
      ),
    );
  }

  // --- Variante Accordion ---
  entidadesAccordion: EntidadAccordion[] = [
    { clave: 'familias', titulo: 'Familias de Productos', abiertoInicial: true },
    { clave: 'marcas', titulo: 'Marcas', abiertoInicial: false }
  ];

  columnasAccordion: Record<string, DataTableColumn<Record<string, unknown>>[]> = {
    familias: [
      { key: 'id', header: 'ID', width: '80px' },
      { key: 'descripcion', header: 'Descripción Familia' }
    ],
    marcas: [
      { key: 'id', header: 'ID', width: '80px' },
      { key: 'nombre', header: 'Nombre Marca' }
    ]
  };

  filasAccordion: Record<string, Record<string, unknown>[]> = {
    familias: [
      { id: 1, descripcion: 'Línea Blanca' },
      { id: 2, descripcion: 'Audio y Video' }
    ],
    marcas: [
      { id: 10, nombre: 'Samsung' },
      { id: 11, nombre: 'LG' }
    ]
  };

  // --- Variante Wizard ---
  wizardSteps: Step[] = [
    { label: 'Paso 1' },
    { label: 'Paso 2' },
    { label: 'Paso 3' }
  ];
  wizardActiveStep = signal(0);
}
