import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TableAction } from '../app/shared/ui/atoms/table-action/table-action';
import { TableCellComponent } from '../app/shared/ui/atoms/table/table-cell.component';
import { TableComponent } from '../app/shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../app/shared/ui/atoms/table/table-head.component';
import { TableHeaderCellComponent } from '../app/shared/ui/atoms/table/table-header-cell.component';
import { TableRowComponent } from '../app/shared/ui/atoms/table/table-row.component';

/*
  UNA ACCION DE FILA ES UN BOTON QUE SOLO DICE SU NOMBRE AL PASAR EL RATON.

  Por eso `label` es obligatorio: es el `aria-label` y el `title`, lo unico que
  separa a un icono de un jeroglifico. Y por eso el catalogo de acciones no es
  una lista de iconos sino de SIGNIFICADOS: cada nombre de `action` trae ya su
  glifo y su tono, para que «eliminar» sea rojo en las trece pantallas donde
  aparece y no en doce.

  Lo que faltaba documentar no es la apariencia -eso se adivina- sino los tres
  estados en los que la accion no responde: cargando, deshabilitada y marcada.
  Los tres cambian lo que el boton anuncia a un lector de pantalla
  (`aria-busy`, `disabled`, `aria-pressed`) y ninguno estaba a la vista.
*/

const ACCIONES = [
  { nombre: 'view', etiqueta: 'Ver detalle' },
  { nombre: 'edit', etiqueta: 'Editar' },
  { nombre: 'print', etiqueta: 'Imprimir' },
  { nombre: 'reverse', etiqueta: 'Reversar' },
  { nombre: 'channels', etiqueta: 'Canales de contacto' },
  { nombre: 'reset-password', etiqueta: 'Restablecer contraseña' },
  { nombre: 'activate', etiqueta: 'Activar' },
  { nombre: 'deactivate', etiqueta: 'Desactivar' },
  { nombre: 'renew', etiqueta: 'Renovar' },
  { nombre: 'select', etiqueta: 'Seleccionar' },
  { nombre: 'late-fee', etiqueta: 'Cobrar mora' },
  { nombre: 'delete', etiqueta: 'Eliminar' },
  { nombre: 'custom', etiqueta: 'Más acciones' },
];

const TONOS = ['neutral', 'primary', 'info', 'success', 'warning', 'danger'];

const CREDITOS = [
  { codigo: 'CR-10412', cliente: 'Rosa Quispe', saldo: 'S/ 1 240,00', estado: 'Vigente' },
  { codigo: 'CR-10418', cliente: 'Luis Mamani', saldo: 'S/ 380,50', estado: 'Atrasado' },
  { codigo: 'CR-10425', cliente: 'Ana Rivera', saldo: 'S/ 2 900,00', estado: 'Vigente' },
  { codigo: 'CR-10431', cliente: 'Carlos Núñez', saldo: 'S/ 0,00', estado: 'Cancelado' },
];

const meta: Meta<TableAction> = {
  title: '1. Atoms/Table Action',
  component: TableAction,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        TableAction,
        TableComponent,
        TableHeadComponent,
        TableHeaderCellComponent,
        TableRowComponent,
        TableCellComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Acción iconográfica de una fila. El nombre de la acción decide glifo y tono; ' +
          '`label` es obligatorio porque es el nombre accesible.',
      },
    },
  },
  argTypes: {
    action: {
      control: 'select',
      options: ACCIONES.map((accion) => accion.nombre),
      description: 'Significado de la acción. Decide el glifo y el tono por omisión.',
    },
    label: { control: 'text', description: 'Obligatorio: es el aria-label y el title.' },
    iconClass: { control: 'text', description: 'Glifo a medida. Admite `print` o `fa-print`.' },
    icon: { control: 'text', description: 'Obsoleto. Se conserva para consumidores anteriores.' },
    tone: { control: 'select', options: TONOS, description: 'Sobreescribe el tono semántico.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Tamaño del botón.' },
    disabled: { control: 'boolean', description: 'La acción no está permitida ahora.' },
    loading: { control: 'boolean', description: 'La acción está en curso; el clic se ignora.' },
    selected: {
      control: 'boolean',
      description: 'Estado de conmutador. Publica aria-pressed; con null no lo publica.',
    },
  },
};

export default meta;
type Story = StoryObj<TableAction>;

/*
  El catalogo completo, cada accion con el glifo y el tono que trae de fabrica.
  Es la historia que responde a «que puedo poner en la columna de acciones» sin
  tener que abrir el TypeScript.
*/
export const AccionesSemanticas: Story = {
  name: 'Catálogo: las trece acciones y su tono de fábrica',
  render: () => ({
    props: { acciones: ACCIONES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5);">
        @for (accion of acciones; track accion.nombre) {
          <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 6rem;">
            <app-table-action [action]="accion.nombre" [label]="accion.etiqueta" />
            <span style="color: var(--text-color-secondary); font-size: var(--text-xs); text-align: center;">
              {{ accion.nombre }}
            </span>
          </div>
        }
      </div>
    `,
  }),
};

/*
  El tono se puede forzar, y conviene saber cuando NO hacerlo: forzar «danger»
  sobre «ver» convierte una consulta inocua en una alarma. La entrada existe
  para los casos en que el significado de la fila cambia el peso de la accion,
  no para decorar.
*/
export const TonoForzado: Story = {
  name: 'Tono forzado: cuando el contexto pesa más que la acción',
  render: () => ({
    props: { tonos: TONOS },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5);">
        @for (tono of tonos; track tono) {
          <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 6rem;">
            <app-table-action action="custom" [tone]="tono" [label]="'Más acciones (' + tono + ')'" />
            <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">{{ tono }}</span>
          </div>
        }
      </div>
    `,
  }),
};

/*
  Los tres tamaños no son el mismo boton escalado: `sm` renuncia al fondo y al
  borde para no ensuciar una fila densa, mientras `md` y `lg` se apoyan en
  `--surface-section` para poder tocarse con el dedo. Verlos juntos es la unica
  forma de elegir bien.
*/
export const Tamanos: Story = {
  name: 'Tamaños: la fila densa y la fila táctil',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5);">
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
          <app-table-action action="edit" size="sm" label="Editar" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">sm · sin fondo</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
          <app-table-action action="edit" size="md" label="Editar" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">md</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2);">
          <app-table-action action="edit" size="lg" label="Editar" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">lg</span>
        </div>
      </div>
    `,
  }),
};

/*
  Cargando sustituye el glifo por un giro y publica `aria-busy`. Importa que el
  boton siga ocupando el mismo sitio: si la accion se encogiera, la fila
  entera bailaria cada vez que alguien pulsa.
*/
export const Cargando: Story = {
  name: 'Cargando: la acción en curso no se puede repetir',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5);">
        <app-table-action action="print" label="Imprimir" />
        <app-table-action action="print" label="Imprimiendo el contrato" [loading]="true" />
        <app-table-action action="delete" size="lg" label="Eliminando el registro" [loading]="true" />
      </div>
    `,
  }),
};

/*
  Deshabilitado se documenta junto a la accion viva porque la comparacion es la
  informacion: sin ella nadie sabe si el boton apagado esta apagado o es asi.
*/
export const Deshabilitado: Story = {
  name: 'Deshabilitado: la acción que ahora no procede',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5);">
        <app-table-action action="reverse" label="Reversar el pago" />
        <app-table-action action="reverse" label="Reversar el pago (fuera de plazo)" [disabled]="true" />
        <app-table-action action="delete" label="Eliminar (sin permiso)" [disabled]="true" />
      </div>
    `,
  }),
};

/*
  `selected` convierte la accion en un conmutador y publica `aria-pressed`. Con
  `null` -el valor por omision- el atributo no se publica, que es lo correcto
  para una accion que no conmuta: anunciar `aria-pressed="false"` en un boton
  que solo dispara es mentirle al lector de pantalla.
*/
export const Seleccionado: Story = {
  name: 'Marcado: la acción que conmuta y la que solo dispara',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5);">
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 8rem;">
          <app-table-action action="select" label="Seleccionar la fila" [selected]="false" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs); text-align: center;">
            conmutador sin marcar
          </span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 8rem;">
          <app-table-action action="select" label="Fila seleccionada" [selected]="true" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs); text-align: center;">
            conmutador marcado
          </span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 8rem;">
          <app-table-action action="view" label="Ver detalle" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs); text-align: center;">
            sin aria-pressed
          </span>
        </div>
      </div>
    `,
  }),
};

/*
  El glifo admite tres formas de escribirse y las tres aterrizan en el mismo
  sitio: `print`, `fa-print` y la clase completa con estilo. La entrada `icon`
  esta obsoleta y solo sigue viva por el marcado que ya existe en los
  consumidores; se documenta para que se reconozca, no para que se use.
*/
export const IconoAMedida: Story = {
  name: 'Glifo a medida: los tres modos de nombrarlo',
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5);">
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 9rem;">
          <app-table-action action="custom" iconClass="download" label="Descargar el reporte" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">iconClass="download"</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 9rem;">
          <app-table-action action="custom" iconClass="fa-share-nodes" label="Compartir" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">iconClass="fa-share-nodes"</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 9rem;">
          <app-table-action
            action="custom"
            iconClass="fa-regular fa-star"
            tone="warning"
            label="Marcar como favorito"
          />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">clase completa</span>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-2); width: 9rem;">
          <app-table-action action="custom" icon="fa-envelope" label="Enviar por correo" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">icon (obsoleto)</span>
        </div>
      </div>
    `,
  }),
};

/*
  La accion suelta no se parece a la accion en su sitio. Aqui van cuatro filas
  reales con la columna de acciones completa, y cada fila en un estado distinto:
  una corriente, una con la reversion cerrada por plazo, una imprimiendo y una
  cancelada donde casi nada procede. Es el caso que el consumidor copia.
*/
export const EnUnaFilaDeTabla: Story = {
  name: 'En su sitio: la columna de acciones de una cartera',
  render: () => ({
    props: { creditos: CREDITOS },
    template: `
      <app-table ariaLabel="Cartera de créditos">
        <app-table-head>
          <th app-table-header-cell scope="col">Código</th>
          <th app-table-header-cell scope="col">Cliente</th>
          <th app-table-header-cell scope="col">Saldo</th>
          <th app-table-header-cell scope="col">Estado</th>
          <th app-table-header-cell scope="col">Acciones</th>
        </app-table-head>
        <tbody>
          @for (credito of creditos; track credito.codigo) {
            <tr app-table-row [selected]="credito.codigo === 'CR-10418'">
              <td app-table-cell dataLabel="Código">{{ credito.codigo }}</td>
              <td app-table-cell dataLabel="Cliente">{{ credito.cliente }}</td>
              <td app-table-cell dataLabel="Saldo" align="right">{{ credito.saldo }}</td>
              <td app-table-cell dataLabel="Estado">{{ credito.estado }}</td>
              <td app-table-cell dataLabel="Acciones">
                <span style="display: inline-flex; gap: var(--space-1);">
                  <app-table-action
                    action="view"
                    size="sm"
                    [label]="'Ver el detalle de ' + credito.codigo"
                  />
                  <app-table-action
                    action="edit"
                    size="sm"
                    [label]="'Editar ' + credito.codigo"
                    [disabled]="credito.estado === 'Cancelado'"
                  />
                  <app-table-action
                    action="print"
                    size="sm"
                    [label]="'Imprimir el estado de cuenta de ' + credito.codigo"
                    [loading]="credito.codigo === 'CR-10425'"
                  />
                  <app-table-action
                    action="late-fee"
                    size="sm"
                    [label]="'Cobrar la mora de ' + credito.codigo"
                    [disabled]="credito.estado !== 'Atrasado'"
                  />
                  <app-table-action
                    action="reverse"
                    size="sm"
                    [label]="'Reversar el último pago de ' + credito.codigo"
                    [disabled]="credito.estado === 'Cancelado'"
                  />
                </span>
              </td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  }),
};
