import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  contentChildren,
  input,
  output,
  signal,
  TemplateRef,
  viewChildren,
} from '@angular/core';
import { PageHeader } from '../../organisms/page-header/page-header';
import { QueryToolbar } from '../../organisms/query-toolbar/query-toolbar';
import {
  DataTable,
  type DataTableColumn,
  type DataTableStatus,
} from '../../organisms/data-table/data-table';
import { CrudDialog } from '../../organisms/crud-dialog/crud-dialog';
import {
  AccordionComponent,
  AccordionItemComponent,
} from '../../organisms/accordion/accordion.component';
import { TableAction } from '../../atoms/table-action/table-action';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Input } from '../../atoms/form-input/input';
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
  type EntidadAccordion,
  type ConfiguracionConfirmacion,
  CONFIRMACION_BAJA_DEFECTO,
} from '../modelos-crud';

/**
 * Evento emitido cuando una entidad del acordeón necesita datos o una acción.
 * Incluye la `clave` de la entidad para que la facade sepa cuál procesar.
 */
export interface EventoEntidadAccordion<T = unknown> {
  readonly clave: string;
  readonly datos: T;
}

/**
 * Chasis B — Página CRUD multi-entidad con acordeón.
 *
 * Agrupa varias entidades relacionadas (ej. Productos + Familias,
 * o Entidades financieras + Cuentas + Cajas) en accordion-items,
 * cada uno con su propia grilla y diálogo CRUD.
 *
 * Patrón definido por ADR-007:
 *   - Se abre la entidad principal, las secundarias arrancan retraídas.
 *   - Cada accordion-item contiene: búsqueda + botón «Nuevo» + grilla.
 *   - Los formularios CRUD viven en diálogos modales, no en la vista.
 *
 * @ejemplo Uso por un agente:
 * ```html
 * <app-pagina-crud-accordion
 *   titulo="Recaudación"
 *   [entidades]="entidades"
 *   [filasPorEntidad]="facade.filasPorEntidad()"
 *   [estadoPorEntidad]="facade.estadoPorEntidad()"
 *   [columnasPorEntidad]="columnasPorEntidad"
 *   (alSolicitarPagina)="facade.cargar($event.clave, $event.datos)"
 *   (alCrear)="facade.abrirCrear($event)"
 *   (alEditar)="facade.abrirEditar($event.clave, $event.datos)"
 *   (alEliminar)="facade.desactivar($event.clave, $event.datos)"
 *   (alGuardar)="facade.guardar()"
 *   (alCerrarDialogo)="facade.cerrarDialogo()"
 * >
 *   <ng-template #formularioCrud let-ctx>
 *     <!-- Formulario que se adapta según ctx.modo y la entidad activa -->
 *   </ng-template>
 * </app-pagina-crud-accordion>
 * ```
 */
@Component({
  selector: 'app-pagina-crud-accordion',
  imports: [
    PageHeader,
    QueryToolbar,
    DataTable,
    CrudDialog,
    AccordionComponent,
    AccordionItemComponent,
    TableAction,
    ButtonComponent,
    Input,
    IconButtonComponent,
    NgTemplateOutlet,
    FormsModule,
    Alert,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-crud-accordion.html',
  styleUrl: './pagina-crud-accordion.scss',
})
export class PaginaCrudAccordion<T extends object = Record<string, unknown>> {
  // ─── Configuración de la página ──────────────────────────────
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);

  /**
   * Array de configuraciones de entidad. Cada una genera un accordion-item.
   * La primera con `abiertoInicial: true` arranca expandida.
   */
  readonly entidades = input.required<readonly EntidadAccordion[]>();

  // ─── Datos por entidad (mapas clave → valor) ────────────────
  /** Mapa clave → columnas de la grilla. */
  readonly columnasPorEntidad = input.required<
    Readonly<Record<string, readonly DataTableColumn<T>[]>>
  >();
  /** Mapa clave → filas de datos. */
  readonly filasPorEntidad = input.required<
    Readonly<Record<string, readonly T[]>>
  >();
  /** Mapa clave → estado de carga. */
  readonly estadoPorEntidad = input<
    Readonly<Record<string, DataTableStatus>>
  >({});
  /** Mapa clave → total de registros para paginación server. */
  readonly totalPorEntidad = input<Readonly<Record<string, number>>>({});
  /** Mapa clave → página actual. */
  readonly paginaPorEntidad = input<Readonly<Record<string, number>>>({});

  // ─── Configuración de acciones ───────────────────────────────
  readonly acciones = input<AccionesCrud>(ACCIONES_CRUD_DEFECTO);
  readonly confirmacionBaja = input<ConfiguracionConfirmacion>(CONFIRMACION_BAJA_DEFECTO);

  // ─── Estado del diálogo CRUD ─────────────────────────────────
  readonly claveEntidadActiva = input<string | null>(null);
  readonly modoCrud = input<ModoCrud>('crear');
  readonly entidadActiva = input<T | null>(null);
  readonly guardando = input(false);
  readonly errorOperacion = input<string | null>(null);

  // ─── Eventos (incluyen la clave de entidad) ──────────────────
  readonly alSolicitarPagina = output<EventoEntidadAccordion<SolicitudPagina>>();
  readonly alCrear = output<string>();
  readonly alVer = output<EventoEntidadAccordion<T>>();
  readonly alEditar = output<EventoEntidadAccordion<T>>();
  readonly alEliminar = output<EventoEntidadAccordion<T>>();
  readonly alGuardar = output<void>();
  readonly alCerrarDialogo = output<void>();
  readonly alReintentar = output<string>();

  // ─── Referencias internas ────────────────────────────────────
  protected readonly dialogoCrud = viewChildren<CrudDialog>('dialogoCrud');
  protected readonly formularioCrud =
    contentChild<TemplateRef<ContextoFormularioCrud<T>>>('formularioCrud');

  // ─── Estado local ────────────────────────────────────────────
  protected readonly busquedaPorEntidad = signal<Record<string, string>>({});
  protected readonly mostrarConfirmacion = signal(false);
  protected readonly entidadAEliminar = signal<T | null>(null);
  protected readonly claveConfirmacion = signal<string | null>(null);

  private static contadorInstancias = 0;
  protected readonly idTituloDialogo = `accordion-crud-dialogo-${++PaginaCrudAccordion.contadorInstancias}`;

  // ─── Utilidades ──────────────────────────────────────────────
  protected tituloDialogo(): string {
    const clave = this.claveEntidadActiva();
    const entConf = this.entidades().find(e => e.clave === clave);
    const nombre = entConf?.titulo ?? '';
    const modo = this.modoCrud();
    if (entConf?.titulosDialogo?.[modo]) {
      return entConf.titulosDialogo[modo]!;
    }
    switch (modo) {
      case 'crear': return `Nuevo ${nombre}`;
      case 'editar': return `Editar ${nombre}`;
      case 'ver': return `Detalle de ${nombre}`;
    }
  }

  protected contextoFormulario(): ContextoFormularioCrud<T> {
    const entidad = this.entidadActiva();
    return {
      $implicit: entidad,
      entidad,
      modo: this.modoCrud(),
      guardando: this.guardando(),
    };
  }

  protected filasDeEntidad(clave: string): readonly T[] {
    return this.filasPorEntidad()[clave] ?? [];
  }

  protected estadoDeEntidad(clave: string): DataTableStatus {
    return this.estadoPorEntidad()[clave] ?? 'idle';
  }

  protected columnasDeEntidad(clave: string): readonly DataTableColumn<T>[] {
    return this.columnasPorEntidad()[clave] ?? [];
  }

  protected busquedaDeEntidad(clave: string): string {
    return this.busquedaPorEntidad()[clave] ?? '';
  }

  protected alBuscarEntidad(clave: string, termino: string): void {
    this.busquedaPorEntidad.update(m => ({ ...m, [clave]: termino }));
    this.alSolicitarPagina.emit({
      clave,
      datos: { pagina: 1, tamano: 10, busqueda: termino },
    });
  }

  protected alCambiarPaginaEntidad(clave: string, pagina: number): void {
    this.alSolicitarPagina.emit({
      clave,
      datos: {
        pagina,
        tamano: 10,
        busqueda: this.busquedaDeEntidad(clave),
      },
    });
  }

  protected solicitarBaja(clave: string, entidad: T): void {
    this.claveConfirmacion.set(clave);
    this.entidadAEliminar.set(entidad);
    this.mostrarConfirmacion.set(true);
  }

  protected confirmarBaja(): void {
    const entidad = this.entidadAEliminar();
    const clave = this.claveConfirmacion();
    if (entidad && clave) {
      this.alEliminar.emit({ clave, datos: entidad });
    }
    this.cancelarBaja();
  }

  protected cancelarBaja(): void {
    this.mostrarConfirmacion.set(false);
    this.entidadAEliminar.set(null);
    this.claveConfirmacion.set(null);
  }

  protected get accionesResueltas(): Required<AccionesCrud> {
    return { ...ACCIONES_CRUD_DEFECTO, ...this.acciones() };
  }

  protected get confResueltas(): Required<ConfiguracionConfirmacion> {
    return { ...CONFIRMACION_BAJA_DEFECTO, ...this.confirmacionBaja() };
  }

  protected get esModoPrevisualizacion(): boolean {
    return this.modoCrud() === 'ver';
  }

  /** Abre el diálogo CRUD del accordion. */
  abrirDialogo(): void {
    const dialogos = this.dialogoCrud();
    if (dialogos.length > 0) {
      dialogos[0].showModal();
    }
  }

  cerrarDialogo(): void {
    const dialogos = this.dialogoCrud();
    if (dialogos.length > 0) {
      dialogos[0].close();
    }
    this.alCerrarDialogo.emit();
  }

  enfocarError(): void {
    const dialogos = this.dialogoCrud();
    if (dialogos.length > 0) {
      dialogos[0].focusError();
    }
  }
}
