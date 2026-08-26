import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { DataStateComponent } from '../app/shared/ui/molecules/data-state/data-state.component';
import { TableCellComponent } from '../app/shared/ui/atoms/table/table-cell.component';
import { TableComponent } from '../app/shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../app/shared/ui/atoms/table/table-head.component';
import { TableHeaderCellComponent } from '../app/shared/ui/atoms/table/table-header-cell.component';
import type { SortDirection } from '../app/shared/ui/atoms/table/table-header-cell.component';
import { TableRowComponent } from '../app/shared/ui/atoms/table/table-row.component';

/*
  POR QUE ESTA ENTRADA EXISTE.

  `app-table-head` y `th[app-table-header-cell]` son los dos atomos de cabecera
  del ADN y no aparecian en ninguna historia: la entrada de `Table` monta
  `<thead>` y `<th>` NATIVOS, asi que quien copiaba de Storybook se llevaba el
  marcado a mano y se dejaba la cabecera fija, el indicador de orden y el radio
  de las esquinas, que son justo lo que estos dos atomos aportan.

  LA FORMA DE MONTARLOS, QUE NO ES OBVIA.

  `app-table-head` ya emite `<thead>` Y la `<tr>` de la cabecera; su contenido se
  proyecta DENTRO de esa fila. Por eso las celdas van sueltas:

      <app-table-head>
        <th app-table-header-cell>Cliente</th>
      </app-table-head>

  Envolverlas ademas en un `<tr app-table-row>` —como hace el showcase— mete una
  fila dentro de otra fila, que no es marcado valido de tabla.
*/

interface ClienteFila {
  readonly id: string;
  readonly nombre: string;
  readonly cartera: string;
  readonly saldo: number;
  readonly estado: 'Al día' | 'En mora' | 'Refinanciado';
}

const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const CLIENTES: readonly ClienteFila[] = [
  {
    id: 'C-1042',
    nombre: 'Rosa Quispe Ayala',
    cartera: 'Capital de trabajo',
    saldo: 4820.5,
    estado: 'Al día',
  },
  {
    id: 'C-1043',
    nombre: 'Comercial Andina S.A.C.',
    cartera: 'Capital de trabajo',
    saldo: 18400,
    estado: 'En mora',
  },
  {
    id: 'C-1044',
    nombre: 'Julio Ccahuana Rivas',
    cartera: 'Consumo',
    saldo: 1290.75,
    estado: 'Al día',
  },
  {
    id: 'C-1045',
    nombre: 'Elena Barrios Loayza',
    cartera: 'Vivienda',
    saldo: 63250,
    estado: 'Refinanciado',
  },
  {
    id: 'C-1046',
    nombre: 'Transportes Wari E.I.R.L.',
    cartera: 'Agropecuario',
    saldo: 9740.2,
    estado: 'Al día',
  },
  {
    id: 'C-1047',
    nombre: 'Marisol Huamán Tito',
    cartera: 'Consumo',
    saldo: 640,
    estado: 'En mora',
  },
];

/* Volumen suficiente para que el viewport desborde y la cabecera tenga que
   quedarse fija: con seis filas no se demuestra nada. */
const CARTERAS = ['Capital de trabajo', 'Consumo', 'Vivienda', 'Agropecuario'];
const ESTADOS: readonly ClienteFila['estado'][] = ['Al día', 'En mora', 'Refinanciado'];

const CLIENTES_EN_VOLUMEN: readonly ClienteFila[] = Array.from({ length: 28 }, (_fila, indice) => ({
  id: `C-2${String(indice).padStart(3, '0')}`,
  nombre: `${CLIENTES[indice % CLIENTES.length].nombre} · sucursal ${indice + 1}`,
  cartera: CARTERAS[indice % CARTERAS.length],
  saldo: 500 + ((indice * 1373) % 48000),
  estado: ESTADOS[indice % ESTADOS.length],
}));

type ClaveOrden = 'nombre' | 'cartera' | 'saldo';

/*
  ORDENAR DE VERDAD, NO PINTAR LA FLECHITA.

  El atomo no ordena: emite `sortChange` con la direccion siguiente del ciclo
  —ninguna, ascendente, descendente— y espera que el consumidor reordene y le
  devuelva `sortDirection`. Documentarlo con una flecha estatica dejaria fuera
  la mitad del contrato, asi que esta historia cierra el ciclo: la tabla se
  reordena y al tercer clic vuelve al orden original.
*/
@Component({
  selector: 'app-story-tabla-ordenable',
  standalone: true,
  imports: [
    TableCellComponent,
    TableComponent,
    TableHeadComponent,
    TableHeaderCellComponent,
    TableRowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-table
      ariaLabel="Clientes con saldo vigente"
      columnTemplate="minmax(14rem, 2fr) 12rem 9rem 10rem"
      [striped]="true"
    >
      <app-table-head>
        <th
          app-table-header-cell
          [sortable]="true"
          [sortDirection]="direccionDe('nombre')"
          (sortChange)="ordenarPor('nombre', $event)"
        >
          Cliente
        </th>
        <th
          app-table-header-cell
          [sortable]="true"
          [sortDirection]="direccionDe('cartera')"
          (sortChange)="ordenarPor('cartera', $event)"
        >
          Cartera
        </th>
        <th
          app-table-header-cell
          class="text-right"
          [sortable]="true"
          [sortDirection]="direccionDe('saldo')"
          (sortChange)="ordenarPor('saldo', $event)"
        >
          Saldo
        </th>
        <!-- Sin sortable: no hay indicador, y el encabezado no invita a pulsar
             algo que no responde. -->
        <th app-table-header-cell>Estado</th>
      </app-table-head>

      <tbody>
        @for (fila of filas(); track fila.id) {
          <tr app-table-row>
            <td app-table-cell dataLabel="Cliente" [wrap]="true">{{ fila.nombre }}</td>
            <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
            <td app-table-cell dataLabel="Saldo" align="right">{{ importe(fila.saldo) }}</td>
            <td app-table-cell dataLabel="Estado">{{ fila.estado }}</td>
          </tr>
        }
      </tbody>
    </app-table>

    <p class="pista">
      Orden actual:
      <strong>{{ descripcionDelOrden() }}</strong>
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
class TablaOrdenableStory {
  private readonly clave = signal<ClaveOrden | null>('saldo');
  private readonly direccion = signal<SortDirection>('desc');

  protected readonly filas = computed<readonly ClienteFila[]>(() => {
    const clave = this.clave();
    const direccion = this.direccion();
    if (!clave || direccion === null) {
      return CLIENTES;
    }

    const signo = direccion === 'asc' ? 1 : -1;
    return [...CLIENTES].sort((izquierda, derecha) => {
      const valorIzquierda = izquierda[clave];
      const valorDerecha = derecha[clave];
      if (typeof valorIzquierda === 'number' && typeof valorDerecha === 'number') {
        return (valorIzquierda - valorDerecha) * signo;
      }
      return String(valorIzquierda).localeCompare(String(valorDerecha), 'es-PE') * signo;
    });
  });

  protected direccionDe(clave: ClaveOrden): SortDirection {
    return this.clave() === clave ? this.direccion() : null;
  }

  protected ordenarPor(clave: ClaveOrden, direccion: SortDirection): void {
    this.clave.set(direccion === null ? null : clave);
    this.direccion.set(direccion);
  }

  protected descripcionDelOrden(): string {
    const clave = this.clave();
    const direccion = this.direccion();
    if (!clave || direccion === null) {
      return 'el de la consulta, sin reordenar';
    }
    return `${clave}, ${direccion === 'asc' ? 'ascendente' : 'descendente'}`;
  }

  protected importe(valor: number): string {
    return formateadorSoles.format(valor);
  }
}

const meta: Meta<TableHeadComponent> = {
  title: '1. Atoms/TableHead',
  component: TableHeadComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        DataStateComponent,
        TableCellComponent,
        TableComponent,
        TableHeadComponent,
        TableHeaderCellComponent,
        TableRowComponent,
        TablaOrdenableStory,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Cabecera de tabla del ADN. **No tiene entradas**: emite \`<thead>\` y la \`<tr>\`
de cabecera, y su contenido se proyecta dentro de esa fila, así que las celdas
van sueltas:

\`\`\`html
<app-table-head>
  <th app-table-header-cell>Cliente</th>
</app-table-head>
\`\`\`

Lo que aporta frente a un \`<thead>\` escrito a mano: queda **fija al desplazar**
(\`position: sticky\`), redondea las esquinas con \`--table-header-radius\` y toma
fondo, color y peso de los tokens \`--table-header-*\`, que sí cambian con el tema.

### La celda que la acompaña: \`th[app-table-header-cell]\`

Este es el único sitio del catálogo donde aparece, así que su API se documenta
aquí:

| Miembro | Tipo | Qué hace |
|---|---|---|
| \`sortable\` | \`boolean\` (por omisión \`false\`) | Dibuja el indicador de orden y hace pulsable la celda. |
| \`sortDirection\` | \`'asc' \\| 'desc' \\| null\` | Estado que se **devuelve** a la celda tras reordenar. |
| \`sortChange\` | salida \`SortDirection\` | Emite la siguiente dirección del ciclo: ninguna → asc → desc → ninguna. |

La celda **no ordena nada**: pide el cambio y espera el dato ya ordenado. La
historia «Ordenar de verdad» cierra ese ciclo.

**Limitación conocida**, y se escribe porque copiarla a ciegas la propaga: la
celda ordenable responde al clic mediante un \`HostListener\` sobre el \`<th>\`, sin
\`tabindex\`, sin \`role\` ni tecla asociada. Con teclado, el orden no se alcanza.
Repararlo exige tocar el componente, no la historia.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<TableHeadComponent>;

export const CabeceraDelAdn: Story = {
  name: 'Los dos átomos, montados como toca',
  render: () => ({
    props: { filas: CLIENTES, importe: (valor: number) => formateadorSoles.format(valor) },
    template: `
      <app-table ariaLabel="Clientes con saldo vigente">
        <app-table-head>
          <th app-table-header-cell>Cliente</th>
          <th app-table-header-cell>Cartera</th>
          <th app-table-header-cell class="text-right">Saldo</th>
          <th app-table-header-cell>Estado</th>
        </app-table-head>
        <tbody>
          @for (fila of filas; track fila.id) {
            <tr app-table-row>
              <td app-table-cell dataLabel="Cliente" [wrap]="true">{{ fila.nombre }}</td>
              <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
              <td app-table-cell dataLabel="Saldo" align="right">{{ importe(fila.saldo) }}</td>
              <td app-table-cell dataLabel="Estado">{{ fila.estado }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'La composición mínima correcta: `app-table` → `app-table-head` con las celdas sueltas → `tbody` con `tr[app-table-row]` y `td[app-table-cell]`. El fondo, el color y las esquinas de la cabecera vienen de los tokens `--table-header-*`, así que cambian con el tema sin que la historia declare nada.',
      },
    },
  },
};

export const FilaSeleccionada: Story = {
  name: 'Una fila seleccionada, sin perder de vista el resto',
  render: () => ({
    props: {
      filas: CLIENTES,
      seleccionada: 'C-1045',
      importe: (valor: number) => formateadorSoles.format(valor),
    },
    template: `
      <app-table ariaLabel="Clientes con saldo vigente" [striped]="true">
        <app-table-head>
          <th app-table-header-cell>Cliente</th>
          <th app-table-header-cell>Cartera</th>
          <th app-table-header-cell class="text-right">Saldo</th>
          <th app-table-header-cell>Estado</th>
        </app-table-head>
        <tbody>
          @for (fila of filas; track fila.id) {
            <tr app-table-row [selected]="fila.id === seleccionada">
              <td app-table-cell dataLabel="Cliente" [wrap]="true">{{ fila.nombre }}</td>
              <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
              <td app-table-cell dataLabel="Saldo" align="right">{{ importe(fila.saldo) }}</td>
              <td app-table-cell dataLabel="Estado">{{ fila.estado }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`[selected]` sobre `tr[app-table-row]` pinta la fila con `--selected-background`, un token distinto del de `:hover`. Se documenta sobre una tabla con bandas (`striped`) a propósito: es donde de verdad se comprueba que la fila elegida sigue distinguiéndose de la banda alterna, en claro y en oscuro.',
      },
    },
  },
};

export const CabeceraFijaAlDesplazar: Story = {
  name: 'La cabecera se queda mientras las filas pasan',
  render: () => ({
    props: {
      filas: CLIENTES_EN_VOLUMEN,
      importe: (valor: number) => formateadorSoles.format(valor),
    },
    template: `
      <app-table
        ariaLabel="Cartera completa de la agencia"
        [maxHeight]="320"
        [striped]="true"
        [unifiedScroll]="true"
      >
        <app-table-head>
          <th app-table-header-cell>Cliente</th>
          <th app-table-header-cell>Cartera</th>
          <th app-table-header-cell class="text-right">Saldo</th>
          <th app-table-header-cell>Estado</th>
        </app-table-head>
        <tbody>
          @for (fila of filas; track fila.id) {
            <tr app-table-row>
              <td app-table-cell dataLabel="Cliente" [wrap]="true">{{ fila.nombre }}</td>
              <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
              <td app-table-cell dataLabel="Saldo" align="right">{{ importe(fila.saldo) }}</td>
              <td app-table-cell dataLabel="Estado">{{ fila.estado }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Veintiocho filas dentro de un viewport de 320 px. Aquí se ve para qué sirve el átomo: `.atomic-thead` es `position: sticky`, así que los encabezados siguen visibles cuando el contenido pasa por debajo. Con `<thead>` nativo eso hay que volver a escribirlo. `ariaLabel` da nombre a la región desplazable, que es lo que anuncia un lector de pantalla al entrar en ella.',
      },
    },
  },
};

export const ColumnasDeAnchoEstable: Story = {
  name: 'Columnas que no bailan al cambiar los datos',
  render: () => ({
    props: {
      filas: CLIENTES_EN_VOLUMEN,
      importe: (valor: number) => formateadorSoles.format(valor),
    },
    template: `
      <app-table
        ariaLabel="Cartera con columnas fijadas"
        columnTemplate="minmax(16rem, 2fr) 14rem 10rem 12rem"
        cellOverflow="truncate"
        [maxHeight]="280"
        [unifiedScroll]="true"
        [striped]="true"
      >
        <app-table-head>
          <th app-table-header-cell>Cliente</th>
          <th app-table-header-cell>Cartera</th>
          <th app-table-header-cell class="text-right">Saldo</th>
          <th app-table-header-cell>Estado</th>
        </app-table-head>
        <tbody>
          @for (fila of filas; track fila.id) {
            <tr app-table-row>
              <td app-table-cell dataLabel="Cliente">{{ fila.nombre }}</td>
              <td app-table-cell dataLabel="Cartera">{{ fila.cartera }}</td>
              <td app-table-cell dataLabel="Saldo" align="right">{{ importe(fila.saldo) }}</td>
              <td app-table-cell dataLabel="Estado">{{ fila.estado }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`columnTemplate` fija el reparto de anchos en vez de dejarlo al contenido: sin él, cargar la página siguiente puede mover todas las columnas porque un nombre es más largo. Va acompañado de `cellOverflow="truncate"` —el nombre largo se recorta en vez de crecer— y de un viewport acotado, que es la combinación real de una tabla paginada.',
      },
    },
  },
};

export const OrdenarDeVerdad: Story = {
  name: 'Ordenar de verdad: los tres pasos del ciclo',
  render: () => ({ template: `<app-story-tabla-ordenable />` }),
  parameters: {
    docs: {
      description: {
        story:
          'Tres encabezados ordenables y uno que no lo es. Al pulsar, la celda emite la **siguiente** dirección del ciclo (ninguna → ascendente → descendente → ninguna) y la historia reordena de verdad y le devuelve `sortDirection`: al tercer clic la tabla vuelve al orden de la consulta. Un indicador de orden que no reordena es la misma clase de mentira que un «Reintentar» que no reintenta. Recuérdese la limitación de la ficha: con teclado no se llega a pulsar.',
      },
    },
  },
};

export const SinResultados: Story = {
  name: 'Sin resultados: el mensaje no es una fila',
  render: () => ({
    template: `
      <app-table ariaLabel="Clientes con saldo vigente">
        <app-table-head>
          <th app-table-header-cell>Cliente</th>
          <th app-table-header-cell>Cartera</th>
          <th app-table-header-cell class="text-right">Saldo</th>
          <th app-table-header-cell>Estado</th>
        </app-table-head>
        <tbody></tbody>
      </app-table>

      <app-data-state
        [isEmpty]="true"
        emptyText="Ningún cliente coincide con el filtro. Pruebe con otra cartera o amplíe el rango de fechas."
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'La cabecera sigue puesta —dice qué columnas tiene la consulta— y el aviso va **fuera** de la tabla, como bloque. Meterlo dentro de un `<tr>` con un `<td>` lo presenta como si fuera un registro más, y no lo es: no hay ningún registro. El mensaje dice además qué hacer, que es la diferencia entre informar y quedarse callado.',
      },
    },
  },
};
