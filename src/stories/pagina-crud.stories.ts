import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideTranslateService } from '@ngx-translate/core';
import { PaginaCrud } from '../app/shared/ui/templates/pagina-crud/pagina-crud';

const meta: Meta<PaginaCrud> = {
  title: 'Catalogos/Pagina canónica',
  component: PaginaCrud,
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
    template: '<app-pagina-crud #pagina [titulo]="titulo" [etiquetaNuevo]="etiquetaNuevo" [columnas]="columnas" [filas]="filas" [estado]="estado" [totalRegistros]="totalRegistros" [opcionesBusqueda]="opcionesBusqueda" [detalle]="detalle" modoCrud="ver" [confirmacionControlada]="true" (alVer)="pagina.abrirDialogo()" (alCrear)="pagina.abrirDialogo()" (alEditar)="pagina.abrirDialogo()" />',
  }),
};
export default meta;
export const Catalogo: StoryObj<PaginaCrud> = {};
export const Vacio: StoryObj<PaginaCrud> = { args: { filas: [], estado: 'empty', totalRegistros: 0 } };
export const Cargando: StoryObj<PaginaCrud> = { args: { estado: 'loading' } };
export const ErrorDeConsulta: StoryObj<PaginaCrud> = { args: { estado: 'error' } };
