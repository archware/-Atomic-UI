import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DividerComponent } from '../app/shared/ui/atoms/divider/divider.component';
import { LoaderComponent } from '../app/shared/ui/atoms/loader/loader.component';
import { RowComponent } from '../app/shared/ui/atoms/row/row.component';
import { Select } from '../app/shared/ui/atoms/form-select/select';
import type { SelectOption } from '../app/shared/ui/atoms/form-select/select';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';

/*
  LAS PIEZAS DE ESTRUCTURA SOLO SE ENTIENDEN COMPARADAS.

  Un panel suelto no dice nada: dice algo el panel «elevated» al lado del
  «flat», porque la diferencia entre los dos es la unica informacion que hay.
  Lo mismo con la alineacion de una fila, que no se ve hasta que se pone junto a
  la que no la lleva.

  El catalogo vivo lleva tiempo enseñando estas matrices y Storybook no las
  tenia: de las nueve entradas de Panel se ejercitaban dos, y de las nueve de
  Row, cuatro. Esta entrada las cierra, y de paso recoge dos ausencias mas del
  mismo capitulo -el divisor con `text`, que es la entrada REAL, y las dos
  variantes de Loader que faltaban-.

  Ni un color, ni una sombra, ni un radio escritos a mano: las celdas de las
  matrices pintan con `--surface-*`, `--border-color` y `--radius-*`, para que
  la comparacion siga siendo legible cuando el tema cambia.
*/

const VARIANTES_DE_PANEL = [
  { valor: 'default', explicacion: 'Fondo, borde y sombra media. El contenedor corriente.' },
  { valor: 'elevated', explicacion: 'Sin borde, sombra que crece al pasar el ratón.' },
  { valor: 'card', explicacion: 'Como elevated pero quieto: no reacciona al ratón.' },
  { valor: 'floating', explicacion: 'Cabecera sin línea inferior; flota sobre el fondo.' },
  { valor: 'flat', explicacion: 'Fondo de sección, sin borde ni sombra. Agrupa.' },
  { valor: 'outlined', explicacion: 'Sólo borde: delimita sin añadir peso.' },
  { valor: 'transparent', explicacion: 'Sin caja; conserva la línea de cabecera.' },
  { valor: 'plain', explicacion: 'Sin caja y sin línea. Sólo el título y el contenido.' },
];

const TAMANOS_DE_TITULO = ['sm', 'md', 'lg', 'xl'];
const PESOS_DE_TITULO = ['normal', 'medium', 'semibold', 'bold'];
const ALINEACIONES_DE_TITULO = ['left', 'center', 'right'];
const RELLENOS_DE_PANEL = ['none', 'sm', 'md', 'lg'];

const ALINEACIONES_DE_ROW = ['left', 'center', 'right', 'stretch'];
const REPARTOS_DE_ROW = ['start', 'center', 'end', 'between', 'around'];
const ALINEACIONES_VERTICALES = ['top', 'center', 'bottom', 'stretch', 'baseline'];

const ETIQUETAS = [
  'Vigentes',
  'Atrasados',
  'Cancelados',
  'Castigados',
  'Refinanciados',
  'En cobranza',
  'Judicializados',
  'Prejudiciales',
];

const MONEDAS: readonly SelectOption[] = [
  { value: 'pen', label: 'Soles' },
  { value: 'usd', label: 'Dólares' },
];

const PERIODICIDADES: readonly SelectOption[] = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
];

/*
  La celda de la matriz no es un componente del ADN ni pretende serlo: es el
  papel cuadriculado sobre el que se compara. Existe para no repetir el mismo
  `style` treinta veces y, sobre todo, para que los tokens se escriban UNA vez.
*/
@Component({
  selector: 'app-estructura-celda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="celda" [class.celda--alta]="alta()">
      <ng-content></ng-content>
    </span>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .celda {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: 100%;
        padding: var(--space-3);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--surface-section);
        color: var(--text-color);
        font-size: var(--text-sm);
        white-space: nowrap;
      }

      .celda--alta {
        min-height: 5rem;
      }
    `,
  ],
})
class EstructuraCelda {
  readonly alta = input(false);
}

/** Rótulo sobrio de cada fila o columna de una matriz. */
@Component({
  selector: 'app-estructura-rotulo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="rotulo"><ng-content></ng-content></span>`,
  styles: [
    `
      .rotulo {
        display: block;
        color: var(--text-color-secondary);
        font-size: var(--text-xs);
        letter-spacing: 0.03em;
      }
    `,
  ],
})
class EstructuraRotulo {}

const meta: Meta<PanelComponent> = {
  title: '4. Surfaces/Matriz de estructura',
  component: PanelComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        PanelComponent,
        RowComponent,
        DividerComponent,
        LoaderComponent,
        Select,
        EstructuraCelda,
        EstructuraRotulo,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Las matrices de Panel y Row que el catálogo vivo ya pintaba y Storybook no tenía, ' +
          'más el divisor con su entrada real `text` y las dos variantes de Loader que faltaban.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<PanelComponent>;

/*
  Las ocho variantes juntas, con el mismo contenido en todas para que lo unico
  que cambie sea la caja. Puestas asi se ve lo que una lista de nombres no
  cuenta: que `card` y `elevated` se distinguen por la sombra, y que
  `transparent` y `plain` solo se distinguen por la linea de la cabecera.
*/
export const VariantesDePanel: Story = {
  name: 'Panel · las ocho variantes comparadas',
  render: () => ({
    props: { variantes: VARIANTES_DE_PANEL },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: var(--space-5);">
        @for (variante of variantes; track variante.valor) {
          <app-panel [variant]="variante.valor" [title]="variante.valor" padding="md">
            <app-estructura-rotulo>{{ variante.explicacion }}</app-estructura-rotulo>
          </app-panel>
        }
      </div>
    `,
  }),
};

/*
  Cuatro tamaños por cuatro pesos: dieciseis titulos que el consumidor puede
  comparar de un vistazo. Merece decirse en voz alta lo que la matriz deja ver:
  `normal` y `medium` aterrizan en el MISMO trazo, porque los dos resuelven a
  `--font-weight-body`. La escala tipografica tiene cuatro pesos, no seis, y
  esta pantalla lo demuestra en vez de repetir la promesa.
*/
export const MatrizDeTitulo: Story = {
  name: 'Panel · tamaño por peso del título (y los dos pesos que coinciden)',
  render: () => ({
    props: { tamanos: TAMANOS_DE_TITULO, pesos: PESOS_DE_TITULO },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        @for (tamano of tamanos; track tamano) {
          <div>
            <app-estructura-rotulo>titleSize = {{ tamano }}</app-estructura-rotulo>
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
                     gap: var(--space-4); margin-top: var(--space-2);"
            >
              @for (peso of pesos; track peso) {
                <app-panel
                  variant="outlined"
                  padding="sm"
                  [title]="'Resumen de cartera'"
                  [titleSize]="tamano"
                  [titleWeight]="peso"
                >
                  <app-estructura-rotulo>titleWeight = {{ peso }}</app-estructura-rotulo>
                </app-panel>
              }
            </div>
          </div>
        }
      </div>
    `,
  }),
};

/*
  La alineacion del titulo solo se aprecia cuando el panel es ancho: en una caja
  estrecha, «centro» y «izquierda» caen casi en el mismo sitio. Por eso las tres
  van apiladas a lo ancho y no en columnas.
*/
export const AlineacionDelTitulo: Story = {
  name: 'Panel · las tres alineaciones del título',
  render: () => ({
    props: { alineaciones: ALINEACIONES_DE_TITULO },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        @for (alineacion of alineaciones; track alineacion) {
          <app-panel
            variant="outlined"
            padding="sm"
            titleSize="lg"
            titleWeight="bold"
            [title]="'titleAlign = ' + alineacion"
            [titleAlign]="alineacion"
          >
            <app-estructura-rotulo>
              El cuerpo no se mueve: la entrada alinea el título, no el contenido.
            </app-estructura-rotulo>
          </app-panel>
        }
      </div>
    `,
  }),
};

/*
  Tres entradas que solo se entienden por lo que QUITAN: `showHeader` apaga la
  cabecera aunque haya titulo, `padding` decide cuanto respira el cuerpo y
  `fullWidth` deja de estirar el panel a lo ancho de su hueco. El icono es la
  cuarta: aparece antes del titulo y sostiene la cabecera cuando no hay titulo.
*/
export const CabeceraRellenoYAnchura: Story = {
  name: 'Panel · cabecera, icono, relleno y anchura',
  render: () => ({
    props: { rellenos: RELLENOS_DE_PANEL },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        <div>
          <app-estructura-rotulo>showHeader e icon</app-estructura-rotulo>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
                   gap: var(--space-4); margin-top: var(--space-2);"
          >
            <app-panel variant="card" padding="sm" title="Con cabecera" icon="📁">
              <app-estructura-rotulo>icon + title</app-estructura-rotulo>
            </app-panel>
            <app-panel variant="card" padding="sm" title="Sin cabecera" [showHeader]="false">
              <app-estructura-rotulo>
                El título sigue declarado; showHeader lo esconde entero.
              </app-estructura-rotulo>
            </app-panel>
            <app-panel variant="card" padding="sm" icon="🔔">
              <app-estructura-rotulo>Sólo icono, sin título</app-estructura-rotulo>
            </app-panel>
          </div>
        </div>

        <div>
          <app-estructura-rotulo>padding</app-estructura-rotulo>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
                   gap: var(--space-4); margin-top: var(--space-2);"
          >
            @for (relleno of rellenos; track relleno) {
              <app-panel variant="outlined" [title]="'padding = ' + relleno" [padding]="relleno">
                <app-estructura-celda>Cuerpo</app-estructura-celda>
              </app-panel>
            }
          </div>
        </div>

        <!--
          fullWidth SE DECLARA Y NO SE USA. Esta escrito en el TypeScript del
          panel y no aparece ni en su plantilla ni en su hoja de estilos: el
          host es width 100 % siempre. Las dos cajas de abajo se ven iguales
          porque LO SON, y esta historia esta puesta para que se vea, no para
          disimularlo. Es el mismo hallazgo que el inventario recogio con
          «app-divider align», y arreglarlo es tocar el componente.
        -->
        <div>
          <app-estructura-rotulo>fullWidth · la entrada declarada que no hace nada</app-estructura-rotulo>
          <div style="display: flex; flex-direction: column; gap: var(--space-4); margin-top: var(--space-2);">
            <app-panel variant="outlined" padding="sm" title="fullWidth = true (por omisión)">
              <app-estructura-rotulo>Ocupa todo el ancho disponible.</app-estructura-rotulo>
            </app-panel>
            <app-panel variant="outlined" padding="sm" title="fullWidth = false" [fullWidth]="false">
              <app-estructura-rotulo>
                Ocupa exactamente lo mismo: la entrada no llega a la plantilla. Quien necesite un
                panel estrecho tiene que estrechar su hueco.
              </app-estructura-rotulo>
            </app-panel>
          </div>
        </div>
      </div>
    `,
  }),
};

/*
  DOS ENTRADAS QUE SUENAN IGUAL Y HACEN COSAS DISTINTAS.

  `align` coloca a cada hijo DENTRO de su columna; `justify` reparte las
  columnas dentro de la fila. La primera solo se nota si la columna sobra sobre
  el contenido; la segunda, solo si las columnas no llenan la fila. Por eso el
  bloque de arriba usa columnas elasticas y el de abajo columnas al tamaño del
  contenido: cada mitad esta montada para que su entrada se vea.
*/
export const MatrizDeRow: Story = {
  name: 'Row · align coloca al hijo, justify reparte las columnas',
  render: () => ({
    props: { alineaciones: ALINEACIONES_DE_ROW, repartos: REPARTOS_DE_ROW },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          @for (alineacion of alineaciones; track alineacion) {
            <div>
              <app-estructura-rotulo>align = {{ alineacion }} · columnas elásticas (1fr 1fr 1fr)</app-estructura-rotulo>
              <app-row columns="1fr 1fr 1fr" gap="var(--space-4)" [align]="alineacion">
                <app-estructura-celda>Uno</app-estructura-celda>
                <app-estructura-celda>Dos</app-estructura-celda>
                <app-estructura-celda>Tres</app-estructura-celda>
              </app-row>
            </div>
          }
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          @for (reparto of repartos; track reparto) {
            <div>
              <app-estructura-rotulo>justify = {{ reparto }} · columnas al tamaño del contenido</app-estructura-rotulo>
              <app-row columns="auto auto auto" gap="var(--space-4)" [justify]="reparto">
                <app-estructura-celda>Uno</app-estructura-celda>
                <app-estructura-celda>Dos</app-estructura-celda>
                <app-estructura-celda>Tres</app-estructura-celda>
              </app-row>
            </div>
          }
        </div>
      </div>
    `,
  }),
};

/*
  La alineacion vertical necesita hijos de distinta altura para significar algo:
  con todos iguales, las cinco opciones se ven identicas. Aqui la segunda celda
  es mas alta a proposito, y `baseline` se distingue porque alinea el TEXTO, no
  la caja.
*/
export const AlineacionVerticalDeRow: Story = {
  name: 'Row · las cinco alineaciones verticales, con alturas desiguales',
  render: () => ({
    props: { verticales: ALINEACIONES_VERTICALES },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        @for (vertical of verticales; track vertical) {
          <div>
            <app-estructura-rotulo>verticalAlign = {{ vertical }}</app-estructura-rotulo>
            <app-row columns="1fr 1fr 1fr" gap="var(--space-4)" [verticalAlign]="vertical">
              <app-estructura-celda>Bajo</app-estructura-celda>
              <app-estructura-celda [alta]="true">Alto</app-estructura-celda>
              <app-estructura-celda>Bajo</app-estructura-celda>
            </app-row>
          </div>
        }
      </div>
    `,
  }),
};

/*
  `wrap` cambia el motor: deja la rejilla y pasa a caja flexible, que es la
  unica forma de que ocho etiquetas de ancho desigual se repartan solas en
  varias lineas. `responsive` + `minColumnWidth` hacen lo contrario: mantienen
  la rejilla y dejan que el navegador decida cuantas columnas caben.
*/
export const RowQueSeAdapta: Story = {
  name: 'Row · envolver en varias líneas y adaptarse al ancho',
  render: () => ({
    props: { etiquetas: ETIQUETAS },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <div>
          <app-estructura-rotulo>wrap = "wrap" · caja flexible, ocho etiquetas desiguales</app-estructura-rotulo>
          <app-row wrap="wrap" gap="var(--space-3)">
            @for (etiqueta of etiquetas; track etiqueta) {
              <app-estructura-celda>{{ etiqueta }}</app-estructura-celda>
            }
          </app-row>
        </div>

        <div>
          <app-estructura-rotulo>
            responsive = true · minColumnWidth = "12rem" · reduzca el ancho del lienzo para verlo
          </app-estructura-rotulo>
          <app-row [responsive]="true" minColumnWidth="12rem" gap="var(--space-4)">
            @for (etiqueta of etiquetas; track etiqueta) {
              <app-estructura-celda>{{ etiqueta }}</app-estructura-celda>
            }
          </app-row>
        </div>
      </div>
    `,
  }),
};

/*
  `variant="form"` no es un estilo: es una decision de reparto. Cambia las
  columnas a dos, cambia el hueco a uno vertical y otro horizontal, alinea los
  campos ARRIBA -para que el mensaje de error empuje solo a su campo- y añade
  margen inferior para que dos filas seguidas no se toquen. Compararlo con la
  fila corriente es la unica manera de ver las cuatro cosas a la vez.
*/
export const RowDeFormulario: Story = {
  name: 'Row · la fila de formulario frente a la fila corriente',
  render: () => ({
    props: { monedas: MONEDAS, periodicidades: PERIODICIDADES },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-6); max-width: 44rem;">
        <div>
          <app-estructura-rotulo>variant = "form" · dos columnas y alineación superior</app-estructura-rotulo>
          <app-row variant="form">
            <app-form-select
              label="Moneda"
              placeholder="Seleccione la moneda"
              [options]="monedas"
              [selected]="'pen'"
            />
            <app-form-select
              label="Periodicidad de cobro"
              placeholder="Seleccione la periodicidad"
              error="Elija la periodicidad antes de continuar."
              [options]="periodicidades"
              [required]="true"
            />
          </app-row>
          <app-row variant="form">
            <app-form-select
              label="Agencia"
              placeholder="Seleccione la agencia"
              hint="El error del campo vecino no desplaza a este."
              [options]="monedas"
            />
            <app-form-select label="Asesor" placeholder="Seleccione el asesor" [options]="monedas" />
          </app-row>
        </div>

        <div>
          <app-estructura-rotulo>variant = "default" · una columna y sin margen inferior</app-estructura-rotulo>
          <app-row>
            <app-form-select label="Moneda" placeholder="Seleccione la moneda" [options]="monedas" />
          </app-row>
        </div>
      </div>
    `,
  }),
};

/*
  LA ENTRADA REAL DEL DIVISOR SE LLAMA `text`.

  `label` existe como alias y es lo unico que la historia anterior ejercitaba,
  asi que la entrada que el catalogo vivo usa de verdad no aparecia en ningun
  sitio. Van las dos, una al lado de la otra, y con las cuatro variantes: el
  texto se comporta igual porque la plantilla resuelve `label() || text()`.

  Nota de un hallazgo del inventario: `align` NO es una entrada del divisor. Si
  aparece escrito en algun consumidor, se ignora en silencio.
*/
export const DividerConTexto: Story = {
  name: 'Divider · la entrada text, y las cuatro variantes con y sin texto',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-5);">
        <div>
          <app-estructura-rotulo>text = "Continuar" · la entrada real</app-estructura-rotulo>
          <app-divider text="Continuar" />
        </div>
        <div>
          <app-estructura-rotulo>label = "Continuar" · alias, mismo resultado</app-estructura-rotulo>
          <app-divider label="Continuar" />
        </div>
        <div>
          <app-estructura-rotulo>variant = "light" con texto</app-estructura-rotulo>
          <app-divider text="Datos del titular" variant="light" />
        </div>
        <div>
          <app-estructura-rotulo>variant = "strong" con texto</app-estructura-rotulo>
          <app-divider text="Datos del titular" variant="strong" />
        </div>
        <div>
          <app-estructura-rotulo>variant = "dashed" con texto</app-estructura-rotulo>
          <app-divider text="Datos del titular" variant="dashed" />
        </div>
        <div>
          <app-estructura-rotulo>orientation = "vertical" con texto</app-estructura-rotulo>
          <!--
            La clase divider-vertical no es decoracion: es el gancho que el
            propio componente publica con :host(.divider-vertical) para dejar de
            ocupar todo el ancho cuando vive en una fila. Sin ella el divisor
            sigue siendo un bloque del 100 % y se come el hueco de los vecinos.
          -->
          <div style="display: flex; align-items: stretch; height: 6rem; gap: var(--space-3);">
            <app-estructura-celda>Solicitud</app-estructura-celda>
            <app-divider class="divider-vertical" text="y" orientation="vertical" />
            <app-estructura-celda>Desembolso</app-estructura-celda>
          </div>
        </div>
      </div>
    `,
  }),
};

/*
  Faltaban dos de las seis variantes de Loader, y no son dos adornos: `gradient`
  es el anillo abierto que gira -el que se usa cuando la espera es corta- y
  `orbit` es el planeta con su orbita, para esperas largas donde el movimiento
  tiene que seguir siendo interesante sin marear. Las dos leen los tokens de
  degradado, asi que cambian de color con el tema sin tocar nada.
*/
export const LoaderGradienteYOrbita: Story = {
  name: 'Loader · las dos variantes que faltaban, en sus tres tamaños',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <div>
          <app-estructura-rotulo>variant = "gradient"</app-estructura-rotulo>
          <div style="display: flex; align-items: center; gap: var(--space-6); margin-top: var(--space-3);">
            <app-loader variant="gradient" size="sm" />
            <app-loader variant="gradient" size="md" />
            <app-loader variant="gradient" size="lg" />
          </div>
        </div>

        <div>
          <app-estructura-rotulo>variant = "orbit"</app-estructura-rotulo>
          <div style="display: flex; align-items: center; gap: var(--space-6); margin-top: var(--space-3);">
            <app-loader variant="orbit" size="sm" />
            <app-loader variant="orbit" size="md" />
            <app-loader variant="orbit" size="lg" />
          </div>
        </div>

        <div>
          <app-estructura-rotulo>En su sitio: el panel que todavía no tiene datos</app-estructura-rotulo>
          <app-panel variant="flat" padding="lg" title="Cartera por asesor" titleSize="lg">
            <div
              style="display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
                     padding: var(--space-6) 0;"
            >
              <app-loader variant="gradient" size="lg" />
              <app-estructura-rotulo>Consultando la cartera…</app-estructura-rotulo>
            </div>
          </app-panel>
        </div>
      </div>
    `,
  }),
};
