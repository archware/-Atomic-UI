import { effect, untracked,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { effect, untracked, PageHeader } from '../../organisms/page-header/page-header';
import { effect, untracked, QueryToolbar } from '../../organisms/query-toolbar/query-toolbar';
import { effect, untracked, DataTable, type DataTableColumn, type DataTableStatus } from '../../organisms/data-table/data-table';
import { effect, untracked, CrudDialog } from '../../organisms/crud-dialog/crud-dialog';
import { effect, untracked, TableActionsComponent } from '../../molecules/table-actions/table-actions.component';
import { effect, untracked, ActionGroupComponent } from '../../molecules/action-group/action-group.component';
import { effect, untracked, TableAction } from '../../atoms/table-action/table-action';
import { effect, untracked, ButtonComponent } from '../../atoms/button/button.component';
import { effect, untracked, Input } from '../../atoms/form-input/input';
import { effect, untracked, Select, type SelectOption } from '../../atoms/form-select/select';
import { effect, untracked, IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { effect, untracked, NgTemplateOutlet } from '@angular/common';
import { effect, untracked, FormsModule } from '@angular/forms';
import { effect, untracked, Alert } from '../../molecules/alert/alert.component';
import { effect, untracked,
  type AccionesCrud,
  ACCIONES_CRUD_DEFECTO,
  type ModoCrud,
  type ContextoFormularioCrud,
  type SolicitudPagina,
  type ConfiguracionConfirmacion,
  CONFIRMACION_BAJA_DEFECTO,
} from '../modelos-crud';

/**
 * Chasis A â€” PÃ¡gina CRUD canÃ³nica de entidad Ãºnica.
 *
 * Compone los organismos Atomic (PageHeader, QueryToolbar, DataTable,
 * CrudDialog) en el patrÃ³n estÃ¡ndar definido por ADR-007:
 *   Vista principal = cabecera + barra de bÃºsqueda + grilla + acciones
 *   Operaciones CRUD = diÃ¡logo modal con modos crear/editar/ver
 *
 * El agente consumidor NO escribe HTML ni CSS. Solo:
 *   1. Declara columnas (DataTableColumn[])
 *   2. Proyecta el formulario con `<ng-template #formularioCrud>`
 *   3. Conecta las seÃ±ales de datos y los eventos
 *
 * @ejemplo Uso mÃ­nimo por un agente:
 * ```html
 * <app-pagina-crud
 *   titulo="Clientes"
 *   [columnas]="columnas"
 *   [filas]="facade.elementos()"
 *   [estado]="facade.estado()"
 *   [totalRegistros]="facade.total()"
 *   [paginaActual]="facade.pagina()"
 *   [guardando]="facade.guardando()"
 *   [errorOperacion]="facade.errorOperacion()"
 *   (alSolicitarPagina)="facade.cargar($event)"
 *   (alCrear)="facade.abrirCrear()"
 *   (alEditar)="facade.abrirEditar($event)"
 *   (alVer)="facade.abrirVer($event)"
 *   (alEliminar)="facade.desactivar($event)"
 *   (alGuardar)="facade.guardar()"
 *   (alCerrarDialogo)="facade.cerrarDialogo()"
 * >
 *   <ng-template #formularioCrud let-ctx>
 *     <!-- Campos del formulario segÃºn ctx.modo -->
 *   </ng-template>
 * </app-pagina-crud>
 * ```
 */
export interface FiltroBusqueda {
  label: string;
  value: string;
  tipo?: 'texto' | 'select';
  opcionesSelect?: SelectOption[];
}

@Component({
  selector: 'app-pagina-crud',
  standalone: true,
  imports: [ FormsModule,
    PageHeader,
    QueryToolbar,
    DataTable,
    ButtonComponent,
    Input,
    Select,
    IconButtonComponent,
    NgTemplateOutlet,
    Alert,
    CrudDialog,
    ActionGroupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-crud.html',
  styleUrl: './pagina-crud.scss',
})
export class PaginaCrud<T extends object = any> {
  // â”€â”€â”€ ConfiguraciÃ³n de la pÃ¡gina â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly etiquetaNuevo = input('Crear Nuevo');
  readonly embedded = input(false);
  readonly iconoNuevo = input('fa-solid fa-plus');

  // Opciones para bÃºsqueda en cascada
  readonly opcionesBusqueda = input<readonly FiltroBusqueda[]>([]);
  readonly tipoBusqueda = input<string | null>(null);
  readonly alCambiarTipoBusqueda = output<string>();
  readonly placeholderBusqueda = input('Buscarâ€¦');
  readonly captionTabla = input('');

  // Estado UI interno para la cascada â€” signal puro.
  readonly tipoBusquedaInterno = signal<string | null>(null);

  /** Devuelve 'select' o 'texto' segÃºn la opciÃ³n elegida. */
    constructor() {
    effect(() => {
      const tipo = this.tipoBusqueda();
      if (tipo !== undefined) {
        untracked(() => this.tipoBusquedaInterno.set(tipo));
      }
    });
  }

  protected getTipoFiltro(tipo: string): 'select' | 'texto' {
    const filtro = this.opcionesBusqueda().find(o => o.value === tipo);
    return filtro?.tipo === 'select' ? 'select' : 'texto';
  }

  /** Devuelve las opciones del select secundario. */
  protected getOpcionesFiltro(tipo: string): SelectOption[] {
    const filtro = this.opcionesBusqueda().find(o => o.value === tipo);
    return filtro?.opcionesSelect ?? [];
  }

  // â”€â”€â”€ Datos de la grilla â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly columnas = input.required<readonly DataTableColumn<T>[]>();
  readonly filas = input.required<readonly T[]>();
  readonly estado = input<DataTableStatus>('idle');
  readonly paginaActual = input(1);
  readonly totalRegistros = input<number | null>(null);
  readonly tamanioPagina = input(10);
  readonly totalPaginas = input(1);
  readonly tienePaginaAnterior = input(false);
  readonly tienePaginaSiguiente = input(false);
  readonly incluirInactivos = input(false);

  // â”€â”€â”€ ConfiguraciÃ³n de acciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly acciones = input<AccionesCrud>(ACCIONES_CRUD_DEFECTO);
  readonly confirmacionBaja = input<ConfiguracionConfirmacion>(CONFIRMACION_BAJA_DEFECTO);

  // â”€â”€â”€ Estado del diÃ¡logo CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly modoCrud = input<ModoCrud>('crear');
  readonly entidadActiva = input<T | null>(null);
  readonly guardando = input(false);
  readonly errorOperacion = input<string | null>(null);

  // â”€â”€â”€ ConfiguraciÃ³n del diÃ¡logo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly tamanoDialogo = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  // â”€â”€â”€ Eventos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Se emite cuando la tabla necesita datos (cambio de pÃ¡gina, bÃºsqueda). */
  readonly alSolicitarPagina = output<SolicitudPagina>();
  /** Se emite al pulsar el botÃ³n "Nuevo". */
  readonly alCrear = output<void>();
  /** Se emite al pulsar el botÃ³n "Ver" en una fila. */
  readonly alVer = output<T>();
  /** Se emite al pulsar el botÃ³n "Editar" en una fila. */
  readonly alEditar = output<T>();
  /** Se emite al confirmar la baja lÃ³gica de una fila. */
  readonly alEliminar = output<T>();
  /** Se emite al pulsar "Guardar" en el diÃ¡logo CRUD. */
  readonly alGuardar = output<void>();
  /** Se emite al cerrar el diÃ¡logo CRUD (cancelar o escape). */
  readonly alCerrarDialogo = output<void>();
  /** Se emite al pulsar "Reintentar" en la grilla. */
  readonly alReintentar = output<void>();

  // â”€â”€â”€ Referencias internas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Referencia al CrudDialog nativo para showModal/close. */
  protected readonly dialogoCrud = viewChild<CrudDialog>('dialogoCrud');

  /** Plantilla del formulario proyectada por el consumidor. */
  protected readonly formularioCrud =
    contentChild<TemplateRef<ContextoFormularioCrud<T>>>('formularioCrud');

  // â”€â”€â”€ Estado local â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  protected readonly busqueda = signal('');
  protected readonly mostrarConfirmacion = signal(false);
  protected readonly entidadAEliminar = signal<T | null>(null);

  private static contadorInstancias = 0;
  /** ID para aria-labelledby del diÃ¡logo. */
  protected readonly idTituloDialogo = `pagina-crud-dialogo-${++PaginaCrud.contadorInstancias}`;

  // â”€â”€â”€ TÃ­tulo dinÃ¡mico del diÃ¡logo segÃºn el modo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  protected tituloDialogo(): string {
    const base = this.titulo();
    switch (this.modoCrud()) {
      case 'crear': return `Nuevo ${base}`;
      case 'editar': return `Editar ${base}`;
      case 'ver': return `Detalle de ${base}`;
    }
  }

  // â”€â”€â”€ Contexto del formulario proyectado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  protected contextoFormulario(): ContextoFormularioCrud<T> {
    const entidad = this.entidadActiva();
    return {
      $implicit: entidad,
      entidad,
      modo: this.modoCrud(),
      guardando: this.guardando(),
    };
  }

  // â”€â”€â”€ Acciones de la grilla â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Actualiza la cascada de UI internamente y notifica al padre. */
  protected onTipoBusquedaCambiado(valor: string): void {
    console.log('[CASCADA] onTipoBusquedaCambiado llamado con:', valor);
    this.tipoBusquedaInterno.set(valor);
    this.busqueda.set('');
    this.alCambiarTipoBusqueda.emit(valor);
    this.alSolicitarPagina.emit({
      pagina: 1,
      tamano: this.tamanioPagina(),
      busqueda: '',
    });
    console.log('[CASCADA] tipoBusquedaInterno ahora es:', this.tipoBusquedaInterno());
  }

  protected alBuscar(termino: string): void {
    this.busqueda.set(termino);
    this.alSolicitarPagina.emit({
      pagina: 1,
      tamano: this.tamanioPagina(),
      busqueda: termino,
    });
  }

  protected alCambiarPagina(pagina: number): void {
    this.alSolicitarPagina.emit({
      pagina,
      tamano: this.tamanioPagina(),
      busqueda: this.busqueda(),
    });
  }

  protected alCambiarTamanioPagina(tamano: number): void {
    this.alSolicitarPagina.emit({
      pagina: 1,
      tamano,
      busqueda: this.busqueda(),
    });
  }

  // â”€â”€â”€ GestiÃ³n del diÃ¡logo CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** Abre el diÃ¡logo con foco en el primer campo habilitado. */
  abrirDialogo(): void {
    this.dialogoCrud()?.showModal();
  }

  /** Cierra el diÃ¡logo y devuelve el foco al origen. */
  cerrarDialogo(): void {
    this.dialogoCrud()?.close();
    this.alCerrarDialogo.emit();
  }

  /** Enfoca el primer error visible tras un fallo de guardado. */
  enfocarError(): void {
    this.dialogoCrud()?.focusError();
  }

  // â”€â”€â”€ Baja lÃ³gica con confirmaciÃ³n (Doctrina Â§7 y Â§12) â”€â”€â”€â”€â”€â”€â”€
  protected solicitarBaja(entidad: T): void {
    this.entidadAEliminar.set(entidad);
    this.mostrarConfirmacion.set(true);
  }

  protected confirmarBaja(): void {
    const entidad = this.entidadAEliminar();
    if (entidad) {
      this.alEliminar.emit(entidad);
    }
    this.cancelarBaja();
  }

  protected cancelarBaja(): void {
    this.mostrarConfirmacion.set(false);
    this.entidadAEliminar.set(null);
  }

  // â”€â”€â”€ Utilidades para el template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  protected get accionesResueltas(): Required<AccionesCrud> {
    return { ...ACCIONES_CRUD_DEFECTO, ...this.acciones() };
  }

  protected get confResueltas(): Required<ConfiguracionConfirmacion> {
    return { ...CONFIRMACION_BAJA_DEFECTO, ...this.confirmacionBaja() };
  }

  protected get esModoPrevisualizacion(): boolean {
    return this.modoCrud() === 'ver';
  }

  protected getGridActions(): any[] {
    const acts: any[] = [];
    if (this.accionesResueltas.ver) acts.push({ id: 'ver', action: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalle', variant: 'success' });
    if (this.accionesResueltas.editar) acts.push({ id: 'editar', action: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'info' });
    if (this.accionesResueltas.eliminar) acts.push({ id: 'eliminar', action: 'delete', icon: 'fa-solid fa-trash', label: 'Desactivar', variant: 'danger' });
    return acts;
  }

  protected handleGridAction(actionId: string, fila: T): void {
    if (actionId === 'ver') this.alVer.emit(fila);
    else if (actionId === 'editar') this.alEditar.emit(fila);
    else if (actionId === 'eliminar') this.solicitarBaja(fila);
  }
}



