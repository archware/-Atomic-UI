import { effect, untracked } from '@angular/core';
import { 
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { PageHeader } from '../../organisms/page-header/page-header';
import { QueryToolbar } from '../../organisms/query-toolbar/query-toolbar';
import { DataTable, type DataTableColumn, type DataTableStatus } from '../../organisms/data-table/data-table';
import { CrudDialog } from '../../organisms/crud-dialog/crud-dialog';
import { TableActionsComponent } from '../../molecules/table-actions/table-actions.component';
import { ActionGroupComponent } from '../../molecules/action-group/action-group.component';
import { TableAction } from '../../atoms/table-action/table-action';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Input } from '../../atoms/form-input/input';
import { Select, type SelectOption } from '../../atoms/form-select/select';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert } from '../../molecules/alert/alert.component';
import { 
  type AccionesCrud,
  ACCIONES_CRUD_DEFECTO,
  type ModoCrud,
  type ContextoFormularioCrud,
  type SolicitudPagina,
  type ConfiguracionConfirmacion,
  CONFIRMACION_BAJA_DEFECTO,
} from '../modelos-crud';

/**
 * Chasis A — Página CRUD canónica de entidad única.
 *
 * Compone los organismos Atomic (PageHeader, QueryToolbar, DataTable,
 * CrudDialog) en el patrón estándar definido por ADR-007:
 *   Vista principal = cabecera + barra de búsqueda + grilla + acciones
 *   Operaciones CRUD = diálogo modal con modos crear/editar/ver
 *
 * El agente consumidor NO escribe HTML ni CSS. Solo:
 *   1. Declara columnas (DataTableColumn[])
 *   2. Proyecta el formulario con `<ng-template #formularioCrud>`
 *   3. Conecta las señales de datos y los eventos
 *
 * @ejemplo Uso mínimo por un agente:
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
 *     <!-- Campos del formulario según ctx.modo -->
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
  // ─── Configuración de la página ──────────────────────────────
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly etiquetaNuevo = input('Crear Nuevo');
  readonly embedded = input(false);
  readonly iconoNuevo = input('fa-solid fa-plus');

  // Opciones para búsqueda en cascada
  readonly opcionesBusqueda = input<readonly FiltroBusqueda[]>([]);
  readonly tipoBusqueda = input<string | null>(null);
  readonly alCambiarTipoBusqueda = output<string>();
  readonly placeholderBusqueda = input('Buscar…');
  readonly captionTabla = input('');

  // Estado UI interno para la cascada — signal puro.
  readonly tipoBusquedaInterno = signal<string | null>(null);

  /** Devuelve 'select' o 'texto' según la opción elegida. */
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

  // ─── Datos de la grilla ──────────────────────────────────────
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

  // ─── Configuración de acciones ───────────────────────────────
  readonly acciones = input<AccionesCrud>(ACCIONES_CRUD_DEFECTO);
  readonly confirmacionBaja = input<ConfiguracionConfirmacion>(CONFIRMACION_BAJA_DEFECTO);

  // ─── Estado del diálogo CRUD ─────────────────────────────────
  readonly modoCrud = input<ModoCrud>('crear');
  readonly entidadActiva = input<T | null>(null);
  readonly guardando = input(false);
  readonly errorOperacion = input<string | null>(null);

  // ─── Configuración del diálogo ───────────────────────────────
  readonly tamanoDialogo = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  // ─── Eventos ─────────────────────────────────────────────────
  /** Se emite cuando la tabla necesita datos (cambio de página, búsqueda). */
  readonly alSolicitarPagina = output<SolicitudPagina>();
  /** Se emite al pulsar el botón "Nuevo". */
  readonly alCrear = output<void>();
  /** Se emite al pulsar el botón "Ver" en una fila. */
  readonly alVer = output<T>();
  /** Se emite al pulsar el botón "Editar" en una fila. */
  readonly alEditar = output<T>();
  /** Se emite al confirmar la baja lógica de una fila. */
  readonly alEliminar = output<T>();
  /** Se emite al pulsar "Guardar" en el diálogo CRUD. */
  readonly alGuardar = output<void>();
  /** Se emite al cerrar el diálogo CRUD (cancelar o escape). */
  readonly alCerrarDialogo = output<void>();
  /** Se emite al pulsar "Reintentar" en la grilla. */
  readonly alReintentar = output<void>();

  // ─── Referencias internas ────────────────────────────────────
  /** Referencia al CrudDialog nativo para showModal/close. */
  protected readonly dialogoCrud = viewChild<CrudDialog>('dialogoCrud');

  /** Plantilla del formulario proyectada por el consumidor. */
  protected readonly formularioCrud =
    contentChild<TemplateRef<ContextoFormularioCrud<T>>>('formularioCrud');

  // ─── Estado local ────────────────────────────────────────────
  protected readonly busqueda = signal('');
  protected readonly mostrarConfirmacion = signal(false);
  protected readonly entidadAEliminar = signal<T | null>(null);

  private static contadorInstancias = 0;
  /** ID para aria-labelledby del diálogo. */
  protected readonly idTituloDialogo = `pagina-crud-dialogo-${++PaginaCrud.contadorInstancias}`;

  // ─── Título dinámico del diálogo según el modo ───────────────
  protected tituloDialogo(): string {
    const base = this.titulo();
    switch (this.modoCrud()) {
      case 'crear': return `Nuevo ${base}`;
      case 'editar': return `Editar ${base}`;
      case 'ver': return `Detalle de ${base}`;
    }
  }

  // ─── Contexto del formulario proyectado ──────────────────────
  protected contextoFormulario(): ContextoFormularioCrud<T> {
    const entidad = this.entidadActiva();
    return {
      $implicit: entidad,
      entidad,
      modo: this.modoCrud(),
      guardando: this.guardando(),
    };
  }

  // ─── Acciones de la grilla ───────────────────────────────────
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

  // ─── Gesti�n del diálogo CRUD ────────────────────────────────
  /** Abre el diálogo con foco en el primer campo habilitado. */
  abrirDialogo(): void {
    this.dialogoCrud()?.showModal();
  }

  /** Cierra el diálogo y devuelve el foco al origen. */
  cerrarDialogo(): void {
    this.dialogoCrud()?.close();
    this.alCerrarDialogo.emit();
  }

  /** Enfoca el primer error visible tras un fallo de guardado. */
  enfocarError(): void {
    this.dialogoCrud()?.focusError();
  }

  // ─── Baja lógica con confirmación (Doctrina §7 y §12) ───────
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

  // ─── Utilidades para el template ─────────────────────────────
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



