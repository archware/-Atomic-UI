import { Component, signal, viewChild } from '@angular/core';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { moduleMetadata, applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideTranslateService } from '@ngx-translate/core';
import { PaginaCrud } from '../app/shared/ui/templates/pagina-crud/pagina-crud';

interface FilaFamiliaDemostracion {
  id: string;
  nombre: string;
}

const meta: Meta<PaginaCrud<FilaFamiliaDemostracion>> = {
  title: 'Catalogos/Pagina canónica',
  component: PaginaCrud<FilaFamiliaDemostracion>,
  decorators: [applicationConfig({ providers: [provideTranslateService()] })],
  args: {
    titulo: 'Familias de productos', etiquetaNuevo: 'Nueva familia',
    columnas: [{ key: 'nombre', header: 'Nombre' }],
    filas: [{ id: 'ejemplo', nombre: 'Café Mixto' }], estado: 'success',
    totalRegistros: 1, confirmacionControlada: true,
    opcionesBusqueda: [{ label: 'Nombre', value: 'nombre' }],
    detalle: [{ label: 'Nombre', value: 'Café Mixto' }, { label: 'Descripción', value: 'Datos de demostración, sin conexión HTTP.' }],
  },
  render: args => ({
    props: args,
    template: '<app-pagina-crud #pagina [titulo]="titulo" [etiquetaNuevo]="etiquetaNuevo" [columnas]="columnas" [filas]="filas" [estado]="estado" [totalRegistros]="totalRegistros" [opcionesBusqueda]="opcionesBusqueda" [detalle]="detalle" [accionesPorFila]="accionesPorFila" [accionDirectaContextual]="accionDirectaContextual" modoCrud="ver" [confirmacionControlada]="true" (alVer)="pagina.abrirDialogo()" (alCrear)="pagina.abrirDialogo()" (alEditar)="pagina.abrirDialogo()" />',
  }),
};
export default meta;
export const Catalogo: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = {};
export const Vacio: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = { args: { filas: [], estado: 'empty', totalRegistros: 0 } };
export const Cargando: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = { args: { estado: 'loading' } };
export const ErrorDeConsulta: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = { args: { estado: 'error' } };

/**
 * Excepción demostrable: la acción contextual frecuente ocupa el cuarto
 * control físico solo porque declara justificación y evidencia. Desactivar se
 * conserva dentro de Más acciones.
 */
export const AccionContextualEvidenciada: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = {
  args: {
    accionesPorFila: () => [
      { id: 'ver', action: 'view', label: 'Ver detalle' },
      { id: 'editar', action: 'edit', label: 'Editar' },
      { id: 'politica-credito', action: 'print', label: 'Política de crédito' },
      { id: 'estado', action: 'deactivate', label: 'Desactivar' },
    ],
    accionDirectaContextual: {
      idAccion: 'politica-credito',
      justificacion: 'La consulta de política respalda la atención cotidiana del catálogo.',
      evidencia: 'La frecuencia está documentada en la decisión del consumidor.',
    },
  },
};

@Component({
  selector: 'app-story-pagina-retorno-estable',
  imports: [PaginaCrud, ButtonComponent],
  template: `<app-pagina-crud #pagina titulo="Catalogo sintetico" [columnas]="columnas" [filas]="filas()"
    estado="success" [resolverFocoRetorno]="resolver" [modoCrud]="'editar'"
    (alEditar)="pagina.abrirDialogo()" (alCrear)="pagina.abrirDialogo()" (alGuardar)="recargarYCerrar()">
    <ng-template #formularioCrud>
      <p>Guardar retira las filas y conserva como destino el host publico del catalogo.</p>
    </ng-template>
  </app-pagina-crud>`,
})
class HistoriaPaginaRetornoEstable {
  readonly pagina = viewChild.required(PaginaCrud);
  readonly columnas = [{ key: 'nombre', header: 'Nombre' }];
  readonly filas = signal([{ id: 'sintetico', nombre: 'Fila sintetica' }]);
  readonly resolver = () => this.pagina().obtenerDestinoFocoRetorno();
  recargarYCerrar(): void { this.filas.set([]); this.pagina().cerrarDialogo(); }
}
export const RetornoAlCatalogoTrasRecarga: StoryObj<PaginaCrud<FilaFamiliaDemostracion>> = {
  decorators: [moduleMetadata({ imports: [HistoriaPaginaRetornoEstable] })],
  render: () => ({ template: '<app-story-pagina-retorno-estable />' }),
};
