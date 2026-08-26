import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, signal } from '@angular/core';

import { DataTable } from '../app/shared/ui/organisms/data-table/data-table';
import type {
  DataTableColumn,
  DataTableSortChange,
  DataTableStatus,
} from '../app/shared/ui/organisms/data-table/data-table';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';
import type { StatusBadgeStatus } from '../app/shared/ui/atoms/status-badge/status-badge.component';
import { TableAction } from '../app/shared/ui/atoms/table-action/table-action';

/*
  LA TABLA QUE YA TENIA LOS TRES ESTADOS Y NO LOS ENSENABA EN NINGUN SITIO.

  `DataTable` declara `loadingMessage`, `emptyMessage`, `errorMessage` e
  `idleMessage`: los cuatro estados del capitulo 1 estan resueltos EN EL CODIGO
  desde antes de esta entrada, y no habia una sola pantalla donde verlos. Esta
  entrada existe para eso, y por eso cada estado tiene historia propia en vez de
  quedarse como una perilla que hay que saber buscar.

  Dos detalles del componente que estas historias hacen visibles porque no se
  deducen de la lista de entradas:

  - CUANDO NO HAY RESPUESTA, EL RESUMEN NO DICE «0». Con `loading`, `error` o
    `idle`, la barra superior escribe una raya en lugar de «Mostrando 0 - 0 de
    0 registro(s)». Ese cero es lo que alguien lee para decidir si su busqueda
    dio resultado; decirlo antes de tener respuesta es afirmar lo que no consta.
    Comparense «Cargando» y «Vacía»: solo la segunda tiene derecho a la cifra.

  - LAS COLUMNAS ALINEADAS AL FINAL LLEVAN CIFRAS DE ANCHO FIJO. `align: 'end'`
    activa `font-variant-numeric: tabular-nums` en la hoja del componente, que es
    lo que permite comparar dos importes apilados sin leerlos digito a digito.
*/

interface MovimientoFila {
  readonly id: string;
  readonly fecha: string;
  readonly comprobante: string;
  readonly cliente: string;
  readonly cajero: string;
  readonly importe: number;
  readonly estado: 'Aplicada' | 'En revisión' | 'Anulada';
}

const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const ESTADO_A_INSIGNIA: Readonly<Record<MovimientoFila['estado'], StatusBadgeStatus>> = {
  Aplicada: 'active',
  'En revisión': 'degraded',
  Anulada: 'inactive',
};

/*
  `align: 'end'` no es estetica: es lo que enciende `tabular-nums` en la hoja del
  componente. Y `format` recibe el valor crudo, asi que el ordenamiento sigue
  siendo numerico aunque en pantalla se lea «S/ 8 500,00».
*/
const COLUMNAS: readonly DataTableColumn<MovimientoFila>[] = [
  { key: 'fecha', header: 'Fecha', width: '7rem', sortable: true },
  { key: 'comprobante', header: 'Comprobante', width: '10rem' },
  { key: 'cliente', header: 'Cliente', sortable: true },
  { key: 'cajero', header: 'Cajero', width: '9rem' },
  {
    key: 'importe',
    header: 'Importe',
    align: 'end',
    width: '9rem',
    sortable: true,
    format: (valor) => formateadorSoles.format(Number(valor)),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '10rem',
    isBadge: true,
    badgeStatus: (fila) => ESTADO_A_INSIGNIA[fila.estado],
  },
];

const MOVIMIENTOS: readonly MovimientoFila[] = [
  {
    id: 'OP-4821',
    fecha: '12/06/2026',
    comprobante: 'B001-004821',
    cliente: 'Rosa Quispe Ayala',
    cajero: 'M. Huamán',
    importe: 320,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4820',
    fecha: '12/06/2026',
    comprobante: 'B001-004820',
    cliente: 'Comercial Andina S.A.C.',
    cajero: 'L. Prado',
    importe: 8500,
    estado: 'En revisión',
  },
  {
    id: 'OP-4819',
    fecha: '12/06/2026',
    comprobante: 'B001-004819',
    cliente: 'Julio Ccahuana Rivas',
    cajero: 'M. Huamán',
    importe: 145.5,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4818',
    fecha: '11/06/2026',
    comprobante: 'B001-004818',
    cliente: 'Elena Barrios Loayza',
    cajero: 'C. Vega',
    importe: 90,
    estado: 'Anulada',
  },
  {
    id: 'OP-4817',
    fecha: '11/06/2026',
    comprobante: 'B001-004817',
    cliente: 'Transportes Wari E.I.R.L.',
    cajero: 'L. Prado',
    importe: 1240.8,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4816',
    fecha: '11/06/2026',
    comprobante: 'B001-004816',
    cliente: 'Marisol Huamán Tito',
    cajero: 'C. Vega',
    importe: 62.4,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4815',
    fecha: '10/06/2026',
    comprobante: 'B001-004815',
    cliente: 'Inversiones Los Olivos S.R.L.',
    cajero: 'M. Huamán',
    importe: 15300,
    estado: 'En revisión',
  },
];

/*
  UNA FILA A LA QUE LE FALTA UN DATO, A PROPOSITO.

  `emptyValue` solo se ve cuando hay un hueco de verdad. Sin una fila asi, esa
  entrada quedaria documentada como una perilla que nadie ejercita.
*/
const MOVIMIENTOS_CON_HUECO: readonly MovimientoFila[] = [
  ...MOVIMIENTOS.slice(0, 3),
  {
    id: 'OP-4814',
    fecha: '10/06/2026',
    comprobante: 'B001-004814',
    cliente: 'Venta de mostrador',
    cajero: '',
    importe: 45,
    estado: 'Aplicada',
  },
];

const CLIENTES_PARA_VOLUMEN = [
  'Rosa Quispe Ayala',
  'Comercial Andina S.A.C.',
  'Julio Ccahuana Rivas',
  'Elena Barrios Loayza',
  'Transportes Wari E.I.R.L.',
  'Marisol Huamán Tito',
  'Inversiones Los Olivos S.R.L.',
];
const CAJEROS = ['M. Huamán', 'L. Prado', 'C. Vega'];
const ESTADOS: readonly MovimientoFila['estado'][] = ['Aplicada', 'En revisión', 'Anulada'];

/* 240 filas: el volumen en el que la paginación deja de ser decorativa. */
const MOVIMIENTOS_EN_VOLUMEN: readonly MovimientoFila[] = Array.from(
  { length: 240 },
  (_fila, indice) => ({
    id: `OP-${4600 - indice}`,
    fecha: `${String(28 - (indice % 28)).padStart(2, '0')}/05/2026`,
    comprobante: `B001-00${4600 - indice}`,
    cliente: CLIENTES_PARA_VOLUMEN[indice % CLIENTES_PARA_VOLUMEN.length],
    cajero: CAJEROS[indice % CAJEROS.length],
    importe: 35 + ((indice * 977) % 19000) + (indice % 4) / 4,
    estado: ESTADOS[indice % ESTADOS.length],
  }),
);

const identificarMovimiento = (_indice: number, fila: MovimientoFila): string => fila.id;

/*
  UN «REINTENTAR» REINTENTA.

  La salida `retry` existe para esto y en el catalogo no habia ninguna historia
  que la cableara: se pintaba el boton y no pasaba nada. Aqui el boton pasa la
  tabla a «cargando» y trae las filas, que es lo unico que justifica ofrecerlo.
  El primer intento falla —es el estado que hay que poder ver— y el segundo
  funciona.
*/
@Component({
  selector: 'app-story-data-table-recuperable',
  standalone: true,
  imports: [DataTable, TableAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-table
      caption="Movimientos de caja del día"
      errorMessage="No se pudo consultar la caja: el servicio de operaciones no respondió."
      retryLabel="Reintentar la consulta"
      loadingMessage="Consultando los movimientos de caja…"
      [columns]="columnas"
      [rows]="filas()"
      [status]="estado()"
      [trackBy]="identificar"
      (retry)="reintentar()"
    >
      <ng-template #actions>
        <app-table-action action="view" size="sm" label="Ver detalle de la operación" />
      </ng-template>
    </app-data-table>

    <p class="pista">
      Estado actual: <strong>{{ estado() }}</strong
      >. El primer intento falla; el botón lo repite y esta vez responde.
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .pista {
        margin: var(--space-4) 0 0;
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
      }
    `,
  ],
})
class DataTableRecuperableStory implements OnDestroy {
  protected readonly columnas = COLUMNAS;
  protected readonly identificar = identificarMovimiento;

  protected readonly estado = signal<DataTableStatus>('error');
  private readonly respondio = signal(false);
  protected readonly filas = computed<readonly MovimientoFila[]>(() =>
    this.respondio() ? MOVIMIENTOS : [],
  );

  private temporizador: ReturnType<typeof setTimeout> | null = null;

  protected reintentar(): void {
    this.estado.set('loading');
    this.temporizador = setTimeout(() => {
      this.respondio.set(true);
      this.estado.set('success');
      this.temporizador = null;
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.temporizador !== null) {
      clearTimeout(this.temporizador);
    }
  }
}

/*
  PAGINACION DE SERVIDOR: LA TABLA NO SABE CUANTAS FILAS HAY.

  Con `pagination="server"` la tabla deja de recortar y de contar: el consumidor
  le pasa la pagina que trajo, el total confirmado y si hay anterior o
  siguiente. Es el modo que usan las pantallas reales sobre un procedimiento
  almacenado, y el que no se veia en ninguna parte.
*/
@Component({
  selector: 'app-story-data-table-servidor',
  standalone: true,
  imports: [DataTable, TableAction],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-data-table
      caption="Movimientos del mes (paginados por el servicio)"
      actionsHeader="Acciones"
      actionsWidth="8rem"
      pagination="server"
      [columns]="columnas"
      [rows]="filas()"
      [totalRecords]="total"
      [page]="pagina()"
      [pageSize]="tamano()"
      [totalPages]="totalPaginas()"
      [pageSizeOptions]="opcionesDeTamano"
      [hasPreviousPage]="pagina() > 1"
      [hasNextPage]="pagina() < totalPaginas()"
      [trackBy]="identificar"
      (pageChange)="pagina.set($event)"
      (pageSizeChange)="cambiarTamano($event)"
      (sortChange)="ordenar($event)"
    >
      <ng-template #actions let-fila>
        <app-table-action
          action="view"
          size="sm"
          [label]="'Ver detalle de ' + fila.comprobante"
        />
        <app-table-action
          action="print"
          size="sm"
          [label]="'Imprimir ' + fila.comprobante"
        />
      </ng-template>
    </app-data-table>

    <p class="pista">
      El servicio devolvió la página {{ pagina() }} de {{ totalPaginas() }} y confirmó
      {{ total }} registros. Orden pedido al servicio:
      <strong>{{ descripcionDelOrden() }}</strong
      >.
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .pista {
        margin: var(--space-4) 0 0;
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
      }
    `,
  ],
})
class DataTableServidorStory {
  protected readonly columnas = COLUMNAS;
  protected readonly identificar = identificarMovimiento;
  protected readonly opcionesDeTamano = [15, 30, 60];
  protected readonly total = MOVIMIENTOS_EN_VOLUMEN.length;

  protected readonly pagina = signal(1);
  protected readonly tamano = signal(15);
  private readonly orden = signal<DataTableSortChange<MovimientoFila> | null>(null);

  protected readonly totalPaginas = computed(() =>
    Math.max(Math.ceil(this.total / this.tamano()), 1),
  );

  /* Lo que en producción hace el procedimiento almacenado: ordenar y recortar. */
  protected readonly filas = computed<readonly MovimientoFila[]>(() => {
    const orden = this.orden();
    const ordenadas = !orden?.direction
      ? MOVIMIENTOS_EN_VOLUMEN
      : [...MOVIMIENTOS_EN_VOLUMEN].sort((izquierda, derecha) => {
          const signo = orden.direction === 'asc' ? 1 : -1;
          const valorIzquierda = izquierda[orden.key];
          const valorDerecha = derecha[orden.key];
          if (typeof valorIzquierda === 'number' && typeof valorDerecha === 'number') {
            return (valorIzquierda - valorDerecha) * signo;
          }
          return String(valorIzquierda).localeCompare(String(valorDerecha), 'es-PE') * signo;
        });

    const desde = (this.pagina() - 1) * this.tamano();
    return ordenadas.slice(desde, desde + this.tamano());
  });

  protected cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    // Volver a la primera pagina: la 8 de 16 no existe cuando se pasa a 60 por
    // pagina, y quedarse ahi devuelve una tabla vacia con paginador lleno.
    this.pagina.set(1);
  }

  protected ordenar(cambio: DataTableSortChange<MovimientoFila>): void {
    this.orden.set(cambio.direction ? cambio : null);
    this.pagina.set(1);
  }

  protected descripcionDelOrden(): string {
    const orden = this.orden();
    if (!orden?.direction) {
      return 'ninguno';
    }
    return `${orden.key}, ${orden.direction === 'asc' ? 'ascendente' : 'descendente'}`;
  }
}

const meta: Meta<DataTable<MovimientoFila>> = {
  title: '3. Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [DataTable, PanelComponent, TableAction, DataTableRecuperableStory, DataTableServidorStory] }),
  ],
  /*
    Los valores publicados por el componente se repiten aqui a proposito. La
    plantilla compartida enlaza TODAS las entradas que documenta, y un enlace sin
    valor no cae en el valor por omision: lo pisa con `undefined`. Sin esta base,
    la historia de «Cargando» —que no habla de paginacion— acabaria escribiendo
    «Pagina NaN de NaN» en la barra.
  */
  args: {
    columns: COLUMNAS,
    rows: MOVIMIENTOS,
    caption: 'Movimientos de caja del día',
    captionVisible: false,
    status: 'success',
    density: 'comfortable',
    pagination: 'client',
    pageSize: 10,
    showRowNumber: true,
    rowNumberHeader: 'N.º',
    rowNumberWidth: '4.5rem',
    actionsHeader: 'Acciones',
    actionsWidth: '8rem',
    emptyValue: '—',
    loadingMessage: 'Consultando los movimientos de caja…',
    idleMessage: 'Elija una fecha y pulse «Buscar» para ver los movimientos.',
    emptyMessage: 'Ningún movimiento coincide con el filtro.',
    errorMessage: 'No se pudo consultar la caja: el servicio de operaciones no respondió.',
    trackBy: identificarMovimiento,
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'loading', 'success', 'empty', 'error'],
      description: 'Estado de la consulta. Con `success` y cero filas, la tabla pasa a vacío sola.',
    },
    density: { control: 'radio', options: ['comfortable', 'compact'] },
    pagination: { control: 'radio', options: ['none', 'client', 'server'] },
    captionVisible: { control: 'boolean', description: 'La leyenda existe siempre; esto la muestra.' },
    showRowNumber: { control: 'boolean' },
    emptyValue: { control: 'text', description: 'Qué se escribe donde el dato falta.' },
  },
  parameters: {
    docs: {
      description: {
        component: `
Organismo de tabla completo: cabecera, ordenamiento, paginación, acciones por
fila y **los cuatro estados de la consulta** —sin cargar, cargando, con
resultado (o vacío) y con error—, cada uno con su historia.

Tres decisiones del componente que conviene conocer antes de usarlo:

1. **El resumen no dice «0» cuando no hay respuesta.** Con \`loading\`, \`error\` o
   \`idle\`, la barra escribe «—» en lugar de «Mostrando 0 - 0 de 0 registro(s)».
   Ese cero es lo que alguien lee para decidir si su búsqueda dio resultado.
2. **\`align: 'end'\` enciende \`tabular-nums\`.** Los importes quedan en columna y
   se pueden comparar de un vistazo, que es la única razón para alinearlos a la
   derecha.
3. **\`status: 'success'\` con cero filas se convierte en \`empty\`.** No hay que
   calcular el vacío fuera: basta con no mentir sobre el estado.

Y una obligación del consumidor: si se pinta el botón de reintentar, hay que
cablear \`(retry)\`. Ver «Error recuperable».
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DataTable<MovimientoFila>>;

const conAcciones: NonNullable<Story['render']> = (args) => ({
  props: args,
  template: `
    <app-data-table
      [caption]="caption"
      [captionVisible]="captionVisible"
      [columns]="columns"
      [rows]="rows"
      [status]="status"
      [density]="density"
      [pagination]="pagination"
      [pageSize]="pageSize"
      [showRowNumber]="showRowNumber"
      [rowNumberHeader]="rowNumberHeader"
      [rowNumberWidth]="rowNumberWidth"
      [emptyValue]="emptyValue"
      [emptyMessage]="emptyMessage"
      [loadingMessage]="loadingMessage"
      [idleMessage]="idleMessage"
      [errorMessage]="errorMessage"
      [actionsHeader]="actionsHeader"
      [actionsWidth]="actionsWidth"
      [trackBy]="trackBy"
    >
      <ng-template #actions let-fila>
        <app-table-action action="view" size="sm" [label]="'Ver detalle de ' + fila.comprobante" />
        <app-table-action action="print" size="sm" [label]="'Imprimir ' + fila.comprobante" />
      </ng-template>
    </app-data-table>
  `,
});

export const ListadoConImportes: Story = {
  name: 'Listado con importes comparables',
  args: {
    status: 'success',
    density: 'comfortable',
    pagination: 'client',
    pageSize: 10,
    showRowNumber: true,
    rowNumberHeader: 'N.º',
    rowNumberWidth: '4.5rem',
    actionsHeader: 'Acciones',
    actionsWidth: '8rem',
    emptyValue: '—',
    trackBy: identificarMovimiento,
  },
  render: conAcciones,
  parameters: {
    docs: {
      description: {
        story:
          'El caso corriente. La columna «Importe» va con `align: "end"`, que además de alinear enciende `tabular-nums`: los soles quedan en columna y se comparan sin leerlos dígito a dígito. «Estado» se declara `isBadge` con su propia función `badgeStatus`, de modo que el tono lo decide el dato y no el texto. `trackBy` va por identificador de operación, no por índice: sin eso, reordenar rehace todas las filas.',
      },
    },
  },
};

export const Cargando: Story = {
  name: 'Cargando: aún no hay cifra que dar',
  args: {
    status: 'loading',
    loadingMessage: 'Consultando los movimientos de caja…',
    pagination: 'client',
    showRowNumber: true,
  },
  render: conAcciones,
  parameters: {
    docs: {
      description: {
        story:
          'La cabecera se mantiene —las columnas de la consulta ya se conocen— y el cuerpo cede su sitio a un aviso con `role="status"`, mientras la tabla queda marcada con `aria-busy`. Obsérvese la barra superior: escribe **«—»**, no «Mostrando 0 - 0 de 0 registro(s)». Todavía no hay respuesta, así que no hay cifra que dar. Los botones de paginar quedan deshabilitados mientras dura la carga.',
      },
    },
  },
};

export const SinResultados: Story = {
  name: 'Vacío: la consulta respondió y no hay nada',
  args: {
    status: 'success',
    rows: [],
    emptyMessage: 'Ningún movimiento coincide con el filtro. Pruebe con otra fecha o quite el estado.',
    pagination: 'client',
    showRowNumber: true,
  },
  render: conAcciones,
  parameters: {
    docs: {
      description: {
        story:
          'Con `status: "success"` y cero filas, la tabla pasa a vacío por su cuenta: no hay que calcularlo fuera. Aquí el resumen **sí** dice «0 registro(s)», y puede decirlo porque hay respuesta confirmada; compárese con «Cargando». El mensaje no se queda en «No hay datos»: dice qué se puede hacer para que sí los haya.',
      },
    },
  },
};

export const AntesDeLaPrimeraConsulta: Story = {
  name: 'Sin consultar todavía: no es lo mismo que vacío',
  args: {
    status: 'idle',
    idleMessage: 'Elija una fecha y pulse «Buscar» para ver los movimientos.',
    pagination: 'client',
    showRowNumber: true,
  },
  render: conAcciones,
  parameters: {
    docs: {
      description: {
        story:
          'El estado que casi ningún catálogo documenta y que toda pantalla con filtros tiene al abrirse. «No hay resultados» sería falso: nadie ha preguntado nada aún. El resumen vuelve a escribir «—» por la misma razón que en «Cargando».',
      },
    },
  },
};

export const ErrorRecuperable: Story = {
  name: 'Error con un «Reintentar» que reintenta',
  render: () => ({ template: `<app-story-data-table-recuperable />` }),
  parameters: {
    docs: {
      description: {
        story:
          'El error se presenta dentro de un `app-alert` de tono peligro, con el mensaje y el botón. Lo que documenta esta historia no es el dibujo, sino el cable: `(retry)` está conectado, así que el botón pasa la tabla a «cargando» y trae las filas. Un «Reintentar» que no reintenta es un botón que miente, y el catálogo no debería enseñar ese contraejemplo.',
      },
    },
  },
};

export const VolumenPaginadoEnCliente: Story = {
  name: 'Volumen: 240 registros y un tamaño de página fuera de la lista',
  args: {
    status: 'success',
    rows: MOVIMIENTOS_EN_VOLUMEN,
    caption: 'Movimientos del mes',
    pagination: 'client',
    pageSize: 25,
    showRowNumber: true,
    rowNumberHeader: 'Ítem',
    rowNumberWidth: '5.5rem',
    trackBy: identificarMovimiento,
  },
  render: conAcciones,
  parameters: {
    docs: {
      description: {
        story:
          'Con `pagination: "client"` la tabla ordena y recorta ella misma; los controles funcionan sin escribir una línea. Dos cosas que sólo se ven con volumen: la numeración de fila **continúa entre páginas** (la fila 1 de la página 2 es la 26), y el desplegable «POR PÁGINA» ofrece **25** aunque no esté entre las opciones publicadas —10, 20, 30, 40, 50—, insertado en orden. Sin eso, una tabla que pagina de 25 en 25 mostraría un desplegable en blanco: el paginador contradiciendo a su propia tabla.',
      },
    },
  },
};

export const PaginacionDeServidor: Story = {
  name: 'Paginación de servidor: la tabla no inventa el total',
  render: () => ({ template: `<app-story-data-table-servidor />` }),
  parameters: {
    docs: {
      description: {
        story:
          'Con `pagination="server"` la tabla deja de recortar y de contar: recibe la página que trajo el servicio, el total confirmado y si hay anterior o siguiente, y se limita a pedir cambios por `(pageChange)`, `(pageSizeChange)` y `(sortChange)`. Es el modo de las pantallas reales sobre un procedimiento almacenado. Aquí `pageSizeOptions` también se cambia —15, 30, 60— porque los tamaños los decide quien sirve los datos. Al cambiar de tamaño se vuelve a la primera página: la página 8 de 16 no existe cuando se pasa a 60 por página.',
      },
    },
  },
};

export const CompactaDentroDeUnPanel: Story = {
  name: 'Compacta, sin paginar y con un hueco en los datos',
  args: {
    status: 'success',
    rows: MOVIMIENTOS_CON_HUECO,
    caption: 'Últimas operaciones del turno',
    captionVisible: true,
    density: 'compact',
    pagination: 'none',
    showRowNumber: false,
    emptyValue: 'Sin registrar',
    trackBy: identificarMovimiento,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-panel variant="elevated" padding="sm" [showHeader]="false">
        <app-data-table
          [caption]="caption"
          [captionVisible]="captionVisible"
          [columns]="columns"
          [rows]="rows"
          [status]="status"
          [density]="density"
          [pagination]="pagination"
          [showRowNumber]="showRowNumber"
          [emptyValue]="emptyValue"
          [trackBy]="trackBy"
        ></app-data-table>
      </app-panel>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Cuatro filas dentro de un panel, que es como se incrusta la tabla en un tablero: `density="compact"` para que quepa, `pagination="none"` porque paginar cuatro filas es ruido, y `showRowNumber` en falso porque la numeración no aporta nada en una lista corta. `captionVisible` saca la leyenda a la vista y le da título a la tabla sin añadir un encabezado suelto. La cuarta fila no tiene cajero —fue venta de mostrador—: ahí se lee `emptyValue`, «Sin registrar», que es una afirmación, mientras que dejar la celda en blanco parece un fallo de pintado.',
      },
    },
  },
};
