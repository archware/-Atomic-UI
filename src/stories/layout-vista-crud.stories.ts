import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { ChoiceControl } from '../app/shared/ui/atoms/choice-control/choice-control';
import { Input } from '../app/shared/ui/atoms/form-input/input';
import { ModalComponent } from '../app/shared/ui/molecules/modal/modal.component';
import { PageHeader } from '../app/shared/ui/organisms/page-header/page-header';
import { PaginationComponent } from '../app/shared/ui/molecules/pagination/pagination.component';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';
import { QueryToolbar } from '../app/shared/ui/organisms/query-toolbar/query-toolbar';
import { Select } from '../app/shared/ui/atoms/form-select/select';
import type { SelectOption } from '../app/shared/ui/atoms/form-select/select';
import { StatusBadgeComponent } from '../app/shared/ui/atoms/status-badge/status-badge.component';
import type { StatusBadgeStatus } from '../app/shared/ui/atoms/status-badge/status-badge.component';
import { TableAction } from '../app/shared/ui/atoms/table-action/table-action';
import { TableCellComponent } from '../app/shared/ui/atoms/table/table-cell.component';
import { TableComponent } from '../app/shared/ui/atoms/table/table.component';
import { TableRowComponent } from '../app/shared/ui/atoms/table/table-row.component';
import { ThemeSwitcherComponent } from '../app/shared/ui/organisms/theme-switcher/theme-switcher.component';
import { ToastComponent } from '../app/shared/ui/molecules/toast/toast.component';
import { ToastService } from '../app/shared/ui/services/toast.service';

/*
  VISTA DE CATALOGO: FILTRAR, ELEGIR Y BORRAR SIN PERDER EL SITIO.

  Se ensambla con `QueryToolbar` para los filtros, la tabla atomica para el
  listado —porque `DataTable` no publica columna de seleccion y aqui hace
  falta—, `Pagination` para el recorrido y `Modal` para la confirmacion.

  Las tres decisiones que la separan de una tabla cualquiera:

  - La seleccion multiple se anuncia con una barra que aparece SOLO cuando hay
    algo elegido, y dice cuantas filas son. Una accion masiva sin cifra delante
    es una accion a ciegas.
  - La confirmacion enumera QUE CAMBIA y que NO cambia, con los nombres del
    caso; el foco inicial va a «Revisar» para que un Intro por inercia no borre
    nada (capitulo 7 de la doctrina).
  - Las acciones de fila van como icono con nombre accesible: comparten ancho
    con las columnas de datos y etiquetarlas tapa la columna de estado, que es
    lo que hay que leer para decidir (capitulo 15).
*/

interface ClienteFila {
  readonly id: string;
  readonly documento: string;
  readonly nombre: string;
  readonly cartera: string;
  readonly saldo: number;
  readonly estado: 'Activo' | 'En mora' | 'Inactivo';
}

const ESTADO_A_INSIGNIA: Readonly<Record<ClienteFila['estado'], StatusBadgeStatus>> = {
  Activo: 'active',
  'En mora': 'degraded',
  Inactivo: 'inactive',
};

const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const CLIENTES: readonly ClienteFila[] = [
  { id: 'C-001', documento: '41258963', nombre: 'Rosa Quispe Ayala', cartera: 'Ayacucho centro', saldo: 12400, estado: 'Activo' },
  { id: 'C-002', documento: '09871234', nombre: 'Julio Ccahuana Rivas', cartera: 'Ayacucho centro', saldo: 3150.5, estado: 'En mora' },
  { id: 'C-003', documento: '45896321', nombre: 'Elena Barrios Loayza', cartera: 'Huanta', saldo: 0, estado: 'Inactivo' },
  { id: 'C-004', documento: '20558741', nombre: 'Comercial Andina S.A.C.', cartera: 'Corporativa', saldo: 48250.4, estado: 'Activo' },
  { id: 'C-005', documento: '43112907', nombre: 'Marco Huamán Pariona', cartera: 'Huanta', saldo: 890.25, estado: 'Activo' },
  { id: 'C-006', documento: '10254783', nombre: 'Lucía Prado Ochoa', cartera: 'Ayacucho centro', saldo: 5620, estado: 'En mora' },
  { id: 'C-007', documento: '20487561', nombre: 'Transportes Wari E.I.R.L.', cartera: 'Corporativa', saldo: 21740.8, estado: 'Activo' },
  { id: 'C-008', documento: '46337812', nombre: 'Carmen Vega Ríos', cartera: 'Cangallo', saldo: 1280, estado: 'Activo' },
  { id: 'C-009', documento: '08974512', nombre: 'Óscar Palomino Cárdenas', cartera: 'Cangallo', saldo: 0, estado: 'Inactivo' },
  { id: 'C-010', documento: '44125896', nombre: 'Nélida Sulca Quicaño', cartera: 'Huanta', saldo: 7410.6, estado: 'Activo' },
  { id: 'C-011', documento: '42589631', nombre: 'Beatriz Aymara Conde', cartera: 'Ayacucho centro', saldo: 2130.45, estado: 'En mora' },
  { id: 'C-012', documento: '20775412', nombre: 'Distribuidora Pampas S.A.', cartera: 'Corporativa', saldo: 96320, estado: 'Activo' },
  { id: 'C-013', documento: '47001235', nombre: 'Álvaro Gutiérrez Nolasco', cartera: 'Cangallo', saldo: 540, estado: 'Activo' },
  { id: 'C-014', documento: '41889623', nombre: 'Zenaida Berrocal Flores', cartera: 'Huanta', saldo: 3390.9, estado: 'Activo' },
];

const ESTADOS: readonly SelectOption[] = [
  { value: 'Activo', label: 'Activo' },
  { value: 'En mora', label: 'En mora' },
  { value: 'Inactivo', label: 'Inactivo' },
];

const CARTERAS: readonly SelectOption[] = [
  { value: 'Ayacucho centro', label: 'Ayacucho centro' },
  { value: 'Huanta', label: 'Huanta' },
  { value: 'Cangallo', label: 'Cangallo' },
  { value: 'Corporativa', label: 'Corporativa' },
];

@Component({
  selector: 'app-story-vista-crud',
  standalone: true,
  imports: [
    ButtonComponent,
    ChoiceControl,
    Input,
    ModalComponent,
    PageHeader,
    PaginationComponent,
    PanelComponent,
    QueryToolbar,
    Select,
    StatusBadgeComponent,
    TableAction,
    TableCellComponent,
    TableComponent,
    TableRowComponent,
    ThemeSwitcherComponent,
    ToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="crud">
      <app-page-header
        eyebrow="Catálogos"
        title="Clientes"
        subtitle="Cartera de la agencia. Los saldos corresponden al último cierre confirmado."
      >
        <!--
          El conmutador de tema no forma parte de la pantalla real: está aquí
          para revisar la plantilla en claro y en oscuro sin salir de la historia.
        -->
        <app-theme-switcher page-header-actions />
        <app-button page-header-actions variant="outline" iconClass="fa-file-export">
          Exportar
        </app-button>
        <!--
          Un botón de alta lleva su verbo Y su icono: el texto se lee, el icono
          se reconoce, y es lo que hace que se encuentre igual de rápido en una
          pantalla que nunca se ha visto.
        -->
        <app-button page-header-actions iconClass="fa-plus">Nuevo cliente</app-button>
      </app-page-header>

      <app-query-toolbar accessibleLabel="Filtros de la cartera de clientes">
        <app-input
          query-filters
          class="crud__filtro"
          label="Buscar"
          type="search"
          placeholder="Nombre o documento"
          (valueChange)="cambiarBusqueda($event)"
        />
        <app-select
          query-filters
          class="crud__filtro"
          label="Estado"
          placeholder="Todos"
          [options]="estados"
          [selected]="estado()"
          (selectionChange)="cambiarEstado($event)"
        />
        <app-select
          query-filters
          class="crud__filtro"
          label="Cartera"
          placeholder="Todas"
          [options]="carteras"
          [selected]="cartera()"
          (selectionChange)="cambiarCartera($event)"
        />
        <app-button query-actions variant="ghost" (buttonClick)="limpiarFiltros()">
          Limpiar
        </app-button>
      </app-query-toolbar>

      <!--
        La barra de selección aparece solo cuando hay algo elegido: ocupar sitio
        permanentemente para una acción que casi nunca se usa empuja la tabla
        hacia abajo en todas las visitas.
      -->
      @if (seleccionadas().length > 0) {
        <div class="crud__seleccion" role="status">
          <p class="crud__seleccion-texto">
            <span class="crud__cifra">{{ seleccionadasVisibles().length }}</span>
            de <span class="crud__cifra">{{ filtradas().length }}</span> clientes seleccionados
            @if (seleccionadasOcultas() > 0) {
              <span class="crud__seleccion-oculta">
                (+{{ seleccionadasOcultas() }} fuera del filtro actual)
              </span>
            }
          </p>
          <div class="crud__seleccion-acciones">
            <app-button variant="ghost" (buttonClick)="limpiarSeleccion()">
              Quitar selección
            </app-button>
            <app-button
              variant="outline"
              tone="danger"
              iconClass="fa-trash"
              (buttonClick)="pedirBorrado()"
            >
              Eliminar seleccionados
            </app-button>
          </div>
        </div>
      }

      <app-panel variant="elevated" padding="sm" [showHeader]="false">
        <app-table ariaLabel="Clientes de la cartera" [striped]="true">
          <caption class="crud__caption">
            Clientes de la cartera, página {{ paginaVigente() }} de {{ totalPaginas() }}
          </caption>
          <thead>
            <tr>
              <th scope="col">
                <app-choice-control
                  ariaLabel="Seleccionar todos los clientes de esta página"
                  [checked]="paginaEntera()"
                  (changed)="alternarPagina($event)"
                />
              </th>
              <th scope="col">Documento</th>
              <th scope="col">Nombre</th>
              <th scope="col">Cartera</th>
              <th scope="col" class="crud__col-cifra">Saldo</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (fila of paginadas(); track fila.id) {
              <tr app-table-row [selected]="estaSeleccionada(fila.id)">
                <td app-table-cell dataLabel="Seleccionar">
                  <app-choice-control
                    [ariaLabel]="'Seleccionar a ' + fila.nombre"
                    [checked]="estaSeleccionada(fila.id)"
                    (changed)="alternarFila(fila.id, $event)"
                  />
                </td>
                <td app-table-cell dataLabel="Documento" class="crud__cifra">
                  {{ fila.documento }}
                </td>
                <td app-table-cell dataLabel="Nombre" [wrap]="true">{{ fila.nombre }}</td>
                <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
                <td app-table-cell dataLabel="Saldo" align="right" class="crud__cifra">
                  {{ formatearSoles(fila.saldo) }}
                </td>
                <td app-table-cell dataLabel="Estado">
                  <app-status-badge [status]="insignia(fila.estado)" [label]="fila.estado" />
                </td>
                <td app-table-cell dataLabel="Acciones">
                  <div class="crud__acciones-fila">
                    <app-table-action action="view" size="sm" [label]="'Ver ficha de ' + fila.nombre" />
                    <app-table-action action="edit" size="sm" [label]="'Editar a ' + fila.nombre" />
                    <app-table-action
                      action="delete"
                      size="sm"
                      [label]="'Eliminar a ' + fila.nombre"
                      (triggered)="pedirBorradoDeFila(fila.id)"
                    />
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </app-table>

        @if (filtradas().length === 0) {
          <!--
            Vacio y error son estados distintos, y este es el vacio: la consulta
            SI respondio y no encontro nada. Un fallo de consulta llevaria otro
            texto y un boton de reintentar.
          -->
          <p class="crud__vacio" role="status">
            Ningún cliente coincide con los filtros aplicados. Quite un filtro para ampliar la
            búsqueda.
          </p>
        }
      </app-panel>

      @if (filtradas().length > 0) {
        <app-pagination
          [total]="filtradas().length"
          [pageSize]="tamanoPagina()"
          [page]="paginaVigente()"
          (pageChange)="pagina.set($event)"
          (pageSizeChange)="cambiarTamano($event)"
        />
      }

      @if (borrandoIds().length > 0) {
        <!--
          El titulo lleva el VERBO DEL ACTO y la cifra concreta; el cuerpo dice
          que cambia y que no. «¿Esta seguro?» no informa de ninguna de las dos.
        -->
        <app-modal
          [title]="tituloConfirmacion()"
          size="sm"
          (closed)="cancelarBorrado()"
        >
          <p class="crud__confirmacion-texto">Se dará de baja a:</p>
          <ul class="crud__confirmacion-lista">
            @for (nombre of nombresABorrar(); track nombre) {
              <li>{{ nombre }}</li>
            }
          </ul>
          <p class="crud__confirmacion-texto">
            <strong>No cambia:</strong> las operaciones ya registradas se conservan y siguen
            apareciendo en los reportes. Desde esta pantalla la baja no se deshace.
          </p>

          <div slot="footer" class="crud__confirmacion-acciones">
            <!--
              El foco inicial va a «Revisar», no a «Eliminar»: un Intro por
              inercia sobre el boton destructivo es exactamente lo que hay que
              impedir.
            -->
            <app-button data-modal-initial-focus variant="outline" (buttonClick)="cancelarBorrado()">
              Revisar
            </app-button>
            <app-button variant="danger" iconClass="fa-trash" (buttonClick)="confirmarBorrado()">
              {{ tituloConfirmacion() }}
            </app-button>
          </div>
        </app-modal>
      }

      <app-toast />
    </div>
  `,
  styles: [
    `
      /*
        El anfitrion de una historia es un elemento a medida y por omision es
        «inline»: sin esto, la plantilla no ocupa el ancho del lienzo y lo que se
        revisa no es la disposicion real.
      */
      :host {
        display: block;
      }

      .crud {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
        min-height: 100dvh;
        padding: var(--space-6);
        box-sizing: border-box;
        background-color: var(--surface-background);
      }

      .crud__filtro {
        flex: 1 1 14rem;
        min-width: 0;
      }

      .crud__seleccion {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-3) var(--space-4);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-md);
        background-color: var(--surface-section);
      }

      .crud__seleccion-texto {
        margin: 0;
        font-size: var(--text-sm);
      }

      .crud__seleccion-acciones {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
      }

      /*
        Cifras de ancho fijo: documentos y saldos apilados solo se comparan de un
        vistazo si cada digito ocupa lo mismo.
      */
      .crud__cifra,
      .crud__col-cifra {
        font-variant-numeric: tabular-nums;
      }

      .crud__col-cifra {
        text-align: right;
      }

      .crud__caption {
        padding-block-end: var(--space-3);
        font-size: var(--text-sm);
        text-align: left;
      }

      .crud__acciones-fila {
        display: flex;
        flex-wrap: nowrap;
        gap: var(--space-1);
      }

      .crud__vacio {
        margin: 0;
        padding: var(--space-6) var(--space-4);
        font-size: var(--text-sm);
        text-align: center;
      }

      .crud__confirmacion-texto {
        margin: 0 0 var(--space-3);
        font-size: var(--text-sm);
      }

      .crud__confirmacion-lista {
        margin: 0 0 var(--space-4);
        padding-inline-start: var(--space-5);
        font-size: var(--text-sm);
      }

      .crud__confirmacion-acciones {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--space-3);
      }
    `,
  ],
})
class VistaCrudStory {
  private readonly avisos = inject(ToastService);

  protected readonly estados = ESTADOS;
  protected readonly carteras = CARTERAS;

  private readonly registros = signal<readonly ClienteFila[]>(CLIENTES);
  protected readonly busqueda = signal('');
  protected readonly estado = signal('');
  protected readonly cartera = signal('');
  protected readonly pagina = signal(1);
  protected readonly tamanoPagina = signal(10);
  protected readonly seleccionadas = signal<readonly string[]>([]);
  protected readonly borrandoIds = signal<readonly string[]>([]);

  protected readonly filtradas = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.estado();
    const cartera = this.cartera();
    return this.registros().filter((fila) => {
      if (estado !== '' && fila.estado !== estado) return false;
      if (cartera !== '' && fila.cartera !== cartera) return false;
      if (texto === '') return true;
      return (
        fila.nombre.toLowerCase().includes(texto) || fila.documento.includes(texto)
      );
    });
  });

  /*
  «N de M» SOLO ES CIERTO SI AMBAS CIFRAS MIRAN AL MISMO CONJUNTO.

  La seleccion sobrevive al filtro a proposito -quien marco una fila no quiere
  perderla por teclear en la busqueda-, pero entonces N contaba TODO lo marcado
  mientras M contaba solo lo visible, y bastaba filtrar para leer «5 de 3». Se
  separan las dos cifras: la comparable, que es la interseccion con lo visible,
  y la que queda fuera del filtro, que se nombra aparte en vez de ocultarse.
  */
  protected readonly seleccionadasVisibles = computed(() => {
    const visibles = new Set(this.filtradas().map(fila => fila.id));
    return this.seleccionadas().filter(id => visibles.has(id));
  });

  protected readonly seleccionadasOcultas = computed(
    () => this.seleccionadas().length - this.seleccionadasVisibles().length,
  );

  protected readonly totalPaginas = computed(() =>
    Math.max(Math.ceil(this.filtradas().length / this.tamanoPagina()), 1),
  );

  /*
    La pagina vigente se acota al total: al filtrar o al borrar, la que estaba
    seleccionada puede dejar de existir, y una tabla en blanco sin explicacion
    se lee como «no hay datos».
  */
  protected readonly paginaVigente = computed(() => Math.min(this.pagina(), this.totalPaginas()));

  protected readonly paginadas = computed(() => {
    const inicio = (this.paginaVigente() - 1) * this.tamanoPagina();
    return this.filtradas().slice(inicio, inicio + this.tamanoPagina());
  });

  protected readonly paginaEntera = computed(() => {
    const visibles = this.paginadas();
    return visibles.length > 0 && visibles.every((fila) => this.estaSeleccionada(fila.id));
  });

  protected readonly nombresABorrar = computed(() => {
    const ids = new Set(this.borrandoIds());
    return this.registros()
      .filter((fila) => ids.has(fila.id))
      .map((fila) => fila.nombre);
  });

  protected readonly tituloConfirmacion = computed(() => {
    const cuantos = this.borrandoIds().length;
    return cuantos === 1 ? 'Eliminar 1 cliente' : `Eliminar ${cuantos} clientes`;
  });

  protected formatearSoles(valor: number): string {
    return formateadorSoles.format(valor);
  }

  protected insignia(estado: ClienteFila['estado']): StatusBadgeStatus {
    return ESTADO_A_INSIGNIA[estado];
  }

  protected estaSeleccionada(id: string): boolean {
    return this.seleccionadas().includes(id);
  }

  /*
    CAMBIAR UN FILTRO VUELVE A LA PRIMERA PAGINA.

    Sin esto, quien esta en la pagina cuatro y escribe una busqueda que devuelve
    seis resultados ve una tabla vacia y concluye que su busqueda no encontro
    nada. El filtro no reinicia la SELECCION a proposito: lo elegido sigue
    elegido aunque deje de verse, y la barra de seleccion lo sigue diciendo.
  */
  protected cambiarBusqueda(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  protected cambiarEstado(valor: string): void {
    this.estado.set(valor);
    this.pagina.set(1);
  }

  protected cambiarCartera(valor: string): void {
    this.cartera.set(valor);
    this.pagina.set(1);
  }

  protected cambiarTamano(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(1);
  }

  protected limpiarFiltros(): void {
    this.busqueda.set('');
    this.estado.set('');
    this.cartera.set('');
    this.pagina.set(1);
  }

  protected limpiarSeleccion(): void {
    this.seleccionadas.set([]);
  }

  protected alternarFila(id: string, marcada: boolean): void {
    this.seleccionadas.update((actuales) =>
      marcada ? [...actuales, id] : actuales.filter((candidato) => candidato !== id),
    );
  }

  protected alternarPagina(marcada: boolean): void {
    const visibles = this.paginadas().map((fila) => fila.id);
    this.seleccionadas.update((actuales) => {
      if (!marcada) {
        return actuales.filter((id) => !visibles.includes(id));
      }
      const restantes = visibles.filter((id) => !actuales.includes(id));
      return [...actuales, ...restantes];
    });
  }

  protected pedirBorrado(): void {
    this.borrandoIds.set(this.seleccionadas());
  }

  protected pedirBorradoDeFila(id: string): void {
    this.borrandoIds.set([id]);
  }

  protected cancelarBorrado(): void {
    this.borrandoIds.set([]);
  }

  protected confirmarBorrado(): void {
    const ids = new Set(this.borrandoIds());
    const cuantos = ids.size;
    if (cuantos === 0) return;

    this.registros.update((actuales) => actuales.filter((fila) => !ids.has(fila.id)));
    this.seleccionadas.update((actuales) => actuales.filter((id) => !ids.has(id)));
    this.borrandoIds.set([]);

    /*
      El veredicto va delante, y el aviso sale por UN solo canal: si ya se dice
      con el aviso flotante, no se repite como cartel en la pagina. La misma
      novedad anunciada dos veces se lee como dos cosas distintas.
    */
    this.avisos.success(
      cuantos === 1
        ? 'Cliente dado de baja. Sus operaciones registradas se conservan.'
        : `${cuantos} clientes dados de baja. Sus operaciones registradas se conservan.`,
    );
  }
}

const meta: Meta<VistaCrudStory> = {
  title: '5. Templates/Vista CRUD',
  component: VistaCrudStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Listado de catálogo completo: \`PageHeader\`, \`QueryToolbar\` con filtros,
tabla atómica con selección múltiple y acciones por fila, \`Pagination\` y un
\`Modal\` de confirmación de baja.

Lo que esta plantilla resuelve:

1. **La barra de selección aparece solo cuando hay algo elegido**, y dice cuántas
   filas son sobre cuántas.
2. **La confirmación enumera qué cambia y qué no**, con los nombres del caso, y
   pone el foco inicial en «Revisar».
3. **Cambiar un filtro vuelve a la primera página.** Sin eso, quien estaba en la
   página cuatro ve una tabla vacía y concluye que su búsqueda no encontró nada.
4. **Vacío no es error.** El texto de «ningún resultado» dice qué hacer para
   ampliar la búsqueda; un fallo de consulta llevaría otro texto y un botón de
   reintentar.
        `,
      },
    },
  },
  decorators: [moduleMetadata({ imports: [VistaCrudStory] })],
};

export default meta;
type Story = StoryObj<VistaCrudStory>;

export const Crud: Story = {
  name: 'Listado de clientes',
  render: () => ({ template: `<app-story-vista-crud />` }),
};
