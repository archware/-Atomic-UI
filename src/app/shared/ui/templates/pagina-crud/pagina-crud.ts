import { effect, untracked } from '@angular/core';
import { 
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  signal,
  computed,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { PageHeader } from '../../organisms/page-header/page-header';
import { QueryToolbar } from '../../organisms/query-toolbar/query-toolbar';
import { DataTable, type DataTableColumn, type DataTableStatus } from '../../organisms/data-table/data-table';
import { StepperComponent, type Step } from '../../organisms/stepper/stepper.component';
import { CrudDialog } from '../../organisms/crud-dialog/crud-dialog';
import { ActionGroupComponent, type ActionItem } from '../../molecules/action-group/action-group.component';
import { resolveTableActionIcon, resolveTableActionTone, type TableActionName } from '../../atoms/table-action/table-action';
import { SummaryListComponent, type SummaryListItem } from '../../molecules/summary-list/summary-list.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Input } from '../../atoms/form-input/input';
import { Select2Component, type Select2Option } from '../../molecules/select2/select2.component';
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
 * El consumidor NO recompone el diseño de tabla, acciones o ventanas. Solo:
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
  opcionesSelect?: Select2Option[];
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
    Select2Component,
    IconButtonComponent,
    NgTemplateOutlet,
    Alert,
    CrudDialog,
    StepperComponent,
    ActionGroupComponent,
    SummaryListComponent,
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

  readonly labelFiltroSecundario = computed(() => {
    const seleccion = this.tipoBusquedaInterno();
    return this.opcionesBusqueda().find(x => x.value === seleccion)?.label ?? 'Valor de Búsqueda';
  });

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
  protected getOpcionesFiltro(tipo: string): Select2Option[] {
    const filtro = this.opcionesBusqueda().find(o => o.value === tipo);
    return filtro?.opcionesSelect ?? [];
  }

  protected getOpcionesFiltroConVacio(tipo: string): Select2Option[] {
    const opciones = this.getOpcionesFiltro(tipo);
    return [
      { label: 'Seleccionar...', value: null },
      ...opciones
    ];
  }

  protected readonly opcionesBusquedaParaSelect = computed<Select2Option[]>(() => {
    const opciones = this.opcionesBusqueda();
    if (opciones.length === 0) return [];
    return [
      { label: 'Seleccionar...', value: null },
      ...opciones.map(o => ({ label: o.label, value: o.value, icon: undefined, disabled: false }))
    ];
  });

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
  /** El consumidor decide permisos y acciones disponibles, nunca el ADN. */
  readonly accionesPorFila = input<((fila: T) => ActionItem[]) | null>(null);
  /** Opt-in compatible. Finalizar con resolverConfirmacion tras la respuesta real. */
  readonly confirmacionControlada = input(false);
  readonly alAccionFila = output<{ accion: string; entidad: T }>();
  readonly alConfirmarAccion = output<{ accion: string; entidad: T }>();
  /** Detalle semántico; null conserva la proyección histórica. */
  readonly detalle = input<readonly SummaryListItem[] | null>(null);

  // ─── Estado del diálogo CRUD ─────────────────────────────────
  readonly modoCrud = input<ModoCrud>('crear');
  readonly entidadActiva = input<T | null>(null);
  readonly guardando = input(false);
  /** Guarda visual explícita para adopciones parciales; no conoce la operación. */
  readonly bloquearCierre = input(false);
  /** El consumidor decide validez y cambios reales; true conserva compatibilidad. */
  readonly guardarHabilitado = input(true);
  readonly errorOperacion = input<string | null>(null);

  
  // ─── Configuración de Interacción (Wizard/Browser/Popup) ──────
  readonly interaccionCrear = input<'popup' | 'stepper' | 'browser'>('popup');
  readonly interaccionEditar = input<'popup' | 'stepper' | 'browser'>('popup');
  readonly interaccionVer = input<'popup' | 'stepper' | 'browser'>('popup');
  readonly interaccionEliminar = input<'popup' | 'stepper' | 'browser'>('popup');

  protected interaccionActual(): 'popup' | 'stepper' | 'browser' {
    const modo = this.modoCrud();
    if (modo === 'crear') return this.interaccionCrear();
    if (modo === 'editar') return this.interaccionEditar();
    if (modo === 'ver') return this.interaccionVer();
    return 'popup';
  }
  readonly wizardSteps = input<Step[]>([]);
  readonly wizardActiveStep = input<number>(0);
  readonly wizardAllowSkip = input<boolean>(false);
  readonly alCambiarPasoWizard = output<number>();

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
  protected readonly dialogoConfirmacion = viewChild<CrudDialog>('dialogoConfirmacion');

  /** Plantilla del formulario proyectada por el consumidor. */
  protected readonly formularioCrud =
    contentChild<TemplateRef<ContextoFormularioCrud<T>>>('formularioCrud');

  // ─── Estado local ────────────────────────────────────────────
  protected readonly busqueda = signal('');
  protected readonly mostrarConfirmacion = signal(false);
  protected readonly entidadAEliminar = signal<T | null>(null);
  protected readonly confirmacionEnviada = signal(false);
  private readonly configuracionAccion = signal<ConfiguracionConfirmacion | null>(null);
  private accionConfirmada = 'eliminar';

  private static contadorInstancias = 0;
  /** ID para aria-labelledby del diálogo. */
  protected readonly idTituloDialogo = `pagina-crud-dialogo-${++PaginaCrud.contadorInstancias}`;
  protected readonly idTituloConfirmacion = `${this.idTituloDialogo}-confirmacion`;
  protected readonly idMensajeConfirmacion = `${this.idTituloDialogo}-mensaje`;
  protected readonly bloqueadaConfirmacion = computed(() => this.guardando() || this.confirmacionEnviada());

  // ─── Título dinámico del diálogo según el modo ───────────────
  protected tituloDialogo(): string {
    const base = this.titulo();
    switch (this.modoCrud()) {
      case 'crear': return `Nuevo ${base}`;
      case 'editar': return `Editar`;
      case 'ver': return `Visualización`;
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
  protected onTipoBusquedaCambiado(valor: string | null): void {
    this.tipoBusquedaInterno.set(valor);
    this.busqueda.set('');
    if (valor !== null) {
      this.alCambiarTipoBusqueda.emit(valor);
    }
    this.alSolicitarPagina.emit({
      pagina: 1,
      tamano: this.tamanioPagina(),
      busqueda: '',
    });
  }

  protected alBuscar(termino: string | null): void {
    const term = termino || '';
    this.busqueda.set(term);
    this.alSolicitarPagina.emit({
      pagina: 1,
      tamano: this.tamanioPagina(),
      busqueda: term,
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

  // ─── Gestión del diálogo CRUD ────────────────────────────────
  protected solicitarGuardar(): void {
    if (this.guardando() || !this.guardarHabilitado() || this.modoCrud() === 'ver') return;
    this.alGuardar.emit();
  }

  /** Abre el diálogo con foco en el primer campo habilitado. */
  abrirDialogo(): void {
    this.dialogoCrud()?.showModal();
  }

  /** Cierra el diálogo y devuelve el foco al origen. */
  cerrarDialogo(): void {
    if (this.guardando() || this.bloquearCierre() || !this.dialogoCrud()?.open) return;
    this.dialogoCrud()?.close();
    this.alCerrarDialogo.emit();
  }

  /** Enfoca el primer error visible tras un fallo de guardado. */
  enfocarError(): void {
    this.dialogoCrud()?.focusError();
  }

  // ─── Baja lógica con confirmación (Doctrina §7 y §12) ───────
  protected solicitarBaja(entidad: T): void {
    if (this.interaccionEliminar() === 'browser') {
      // Si el modo es browser, omitimos el popup de confirmación interno 
      // y delegamos la acción al consumidor (quien debe hacer la navegación o confirmación)
      this.alEliminar.emit(entidad);
    } else {
      this.abrirConfirmacion(entidad, this.confirmacionBaja());
    }
  }

  /** Configuración declarada por el consumidor; no deduce activar/baja del DTO. */
  abrirConfirmacion(entidad: T, configuracion: ConfiguracionConfirmacion, accion = 'eliminar'): void {
    if (this.bloqueadaConfirmacion()) return;
    this.accionConfirmada = accion;
    this.configuracionAccion.set(configuracion);
    this.entidadAEliminar.set(entidad);
    this.mostrarConfirmacion.set(true);
    this.dialogoConfirmacion()?.showModal('[data-dialog-initial-focus] button');
  }

  protected confirmarBaja(): void {
    if (this.bloqueadaConfirmacion()) return;
    const entidad = this.entidadAEliminar();
    if (entidad) {
      // El opt-in conserva contexto hasta la respuesta y bloquea doble emisión.
      this.confirmacionEnviada.set(this.confirmacionControlada());
      if (this.accionConfirmada === 'eliminar') this.alEliminar.emit(entidad);
      else this.alConfirmarAccion.emit({ accion: this.accionConfirmada, entidad });
    }
    if (!this.confirmacionControlada()) this.cancelarBaja();
  }

  /** El consumidor llama tras el resultado; un error conserva la confirmación. */
  resolverConfirmacion(exito: boolean): void {
    this.confirmacionEnviada.set(false);
    if (exito) this.cerrarConfirmacion();
    else this.dialogoConfirmacion()?.focusError();
  }

  protected cancelarBaja(): void {
    if (this.bloqueadaConfirmacion()) return;
    this.cerrarConfirmacion();
  }

  private cerrarConfirmacion(): void {
    this.dialogoConfirmacion()?.close();
    this.mostrarConfirmacion.set(false);
    this.entidadAEliminar.set(null);
    this.configuracionAccion.set(null);
  }

  // ─── Utilidades para el template ─────────────────────────────
  protected get accionesResueltas(): Required<AccionesCrud> {
    return { ...ACCIONES_CRUD_DEFECTO, ...this.acciones() };
  }

  protected get confResueltas(): Required<ConfiguracionConfirmacion> {
    return { ...CONFIRMACION_BAJA_DEFECTO, ...(this.configuracionAccion() ?? this.confirmacionBaja()) };
  }

  protected get esModoPrevisualizacion(): boolean {
    return this.modoCrud() === 'ver';
  }

  protected getGridActions(fila: T): ActionItem[] {
    const declaradas = this.accionesPorFila();
    if (declaradas) return declaradas(fila).map(accion => this.accionCatalogo(accion));
    const acts: ActionItem[] = [];
    if (this.accionesResueltas.ver) acts.push(this.accionCatalogo({ id: 'ver', action: 'view', label: 'Ver detalle' }));
    if (this.accionesResueltas.editar) acts.push(this.accionCatalogo({ id: 'editar', action: 'edit', label: 'Editar' }));
    if (this.accionesResueltas.eliminar) acts.push(this.accionCatalogo({ id: 'eliminar', action: 'deactivate', label: 'Desactivar' }));
    return acts;
  }

  private accionCatalogo(accion: ActionItem): ActionItem {
    const tipo: TableActionName = accion.action ?? 'custom';
    const tono = resolveTableActionTone(tipo, 'catalog');
    return {
      ...accion,
      icon: resolveTableActionIcon(tipo, accion.icon, 'catalog'),
      variant: accion.variant ?? (tono === 'neutral' ? 'default' : tono),
      disabled: accion.disabled || this.guardando(),
    };
  }

  protected handleGridAction(actionId: string, fila: T): void {
    const accion = this.getGridActions(fila).find(item => item.id === actionId);
    if (!accion || accion.disabled || accion.loading) return;
    if (actionId === 'ver') this.alVer.emit(fila);
    else if (actionId === 'editar') this.alEditar.emit(fila);
    else if (actionId === 'eliminar') this.solicitarBaja(fila);
    else this.alAccionFila.emit({ accion: actionId, entidad: fila });
  }
}
