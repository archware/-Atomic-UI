import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ChartComponent } from '../app/shared/ui/organisms/chart/chart.component';
import { DataStateComponent } from '../app/shared/ui/molecules/data-state/data-state.component';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';

/*
  TRES REGLAS QUE ESTA ENTRADA DOCUMENTA, Y QUE NO SE VEN LEYENDO LA API.

  1. EL COLOR SE LEE DEL TOKEN EN CADA PINTADO, NO SE ESCRIBE.
     Un `canvas` no interpreta `var(--chart-color-2)`: recibe una cadena de color
     ya resuelta. Escrita a mano en el TypeScript, la grafica se queda con el
     color que tenia al arrancar. Chart.js admite una funcion donde admite un
     color y la evalua en cada pintado; `ChartComponent` recrea el lienzo cuando
     cambia `data-theme`, asi que el token se vuelve a leer solo.

     Ninguna de estas historias lleva color de respaldo. Un respaldo que se usa
     siempre es una mentira: si el token faltara, lo correcto es que se note.

  2. LA PALETA DE SERIES ES LA MISMA EN CLARO Y EN OSCURO, A PROPOSITO.
     `--chart-color-1..10` se declaran una sola vez y ningun tema los redefine:
     identifican al dato, no al fondo. Lo que si cambia con el tema es el MARCO
     —`--chart-text-color`, `--chart-grid-color`, `--chart-tooltip-*`—, y de eso
     se encarga el propio componente. Por eso aqui no hay ningun bloque
     `[data-theme]`: no haria falta y ademas romperia la regla.

  3. EL COMPLEMENTO GLOBAL DE ETIQUETAS ANADE «%» A LAS BARRAS.
     `ChartComponent` registra `chartjs-plugin-datalabels` con un formateador
     global que, cuando el tipo es `bar`, escribe el valor seguido de `%`. Sobre
     barras que no son porcentajes eso es una cifra falsa, asi que hay que
     apagarlo con `plugins.datalabels.display = false`. Esta entrada lo apaga
     donde el dato no es un porcentaje y lo deja donde si lo es.
*/

/** Lee un token del tema ya resuelto. Sin respaldo: si falta, debe notarse. */
function colorDeToken(nombre: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

/** La paleta publicada tiene diez colores; el once vuelve al primero. */
const COLORES_DE_PALETA = 10;

function colorDeSerie(indice: number): string {
  return colorDeToken(`--chart-color-${(indice % COLORES_DE_PALETA) + 1}`);
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

/*
  EL MARCO NO SE TOKENIZA AQUI: YA LO HACE EL COMPONENTE.

  `ChartComponent.applyChartTheme()` vuelca `--chart-text-color`,
  `--chart-grid-color` y `--chart-tooltip-*` sobre los valores por omision de
  Chart.js, y lo repite cada vez que cambia el tema antes de rehacer el lienzo.
  Por eso estas opciones no llevan ni una linea de color: solo dicen lo que es
  decision de la grafica —que el eje horizontal no lleve rejilla, que el
  vertical empiece en cero—.

  Lo que si es trabajo del consumidor es el color de LAS SERIES, porque
  identifica al dato. Ese va como funcion, y esta mas abajo.

  Nota de tipos, por si alguien intenta lo contrario: `legend.labels.color` NO
  es una opcion evaluable en Chart.js —admite un color, no una funcion—, asi que
  ahi no cabe leer el token. No hace falta: la leyenda usa el color por omision,
  que es justo el que el componente acaba de fijar desde el token.
*/
const EJES = {
  x: { grid: { display: false } },
  y: { beginAtZero: true },
};

const LEYENDA_ABAJO = {
  display: true,
  position: 'bottom' as const,
  labels: { boxWidth: 12 },
};

const OPCIONES_CON_EJES = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: LEYENDA_ABAJO,
    // El dato ya esta en el eje: repetirlo encima del punto tapa la serie.
    datalabels: { display: false },
  },
  scales: EJES,
};

const OPCIONES_ANILLO = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { ...LEYENDA_ABAJO, position: 'right' as const },
    // Aqui si: son cuatro segmentos, el valor es un porcentaje y cabe dentro.
    datalabels: { display: true },
  },
};

const COLOCADO_Y_RECUPERADO = {
  labels: MESES,
  datasets: [
    {
      label: 'Colocado',
      data: [412000, 438500, 401200, 476900, 512300, 498100],
      borderColor: () => colorDeSerie(1),
      backgroundColor: () => colorDeSerie(1),
      pointBackgroundColor: () => colorDeSerie(1),
      tension: 0.35,
    },
    {
      label: 'Recuperado',
      data: [388400, 402100, 396800, 441500, 468200, 471900],
      borderColor: () => colorDeSerie(3),
      backgroundColor: () => colorDeSerie(3),
      pointBackgroundColor: () => colorDeSerie(3),
      tension: 0.35,
    },
  ],
};

const CARTERA_POR_PRODUCTO = {
  labels: ['Capital de trabajo', 'Consumo', 'Vivienda', 'Agropecuario'],
  datasets: [
    {
      label: 'Participación',
      data: [46, 27, 18, 9],
      backgroundColor: (contexto: { dataIndex: number }) => colorDeSerie(contexto.dataIndex),
      borderWidth: 0,
    },
  ],
};

const DESEMBOLSOS_POR_AGENCIA = {
  labels: ['Centro', 'Norte', 'Sur', 'Este', 'Valle'],
  datasets: [
    {
      label: 'Desembolsos del mes',
      data: [124, 98, 76, 61, 43],
      backgroundColor: () => colorDeSerie(5),
      borderRadius: 6,
      barPercentage: 0.6,
    },
  ],
};

/*
  SIN DATOS: EL MARCO SIGUE AHI Y NO DICE NADA.

  Con `datasets: []` la grafica no falla; dibuja el marco vacio. Un marco vacio
  se lee igual que «todo en cero» y que «no se pudo preguntar», que son tres
  cosas distintas. La historia lo enfrenta con el tratamiento correcto.
*/
const SIN_DATOS = { labels: [], datasets: [] };

const UNA_SOLA_MEDICION = {
  labels: ['Jun'],
  datasets: [
    {
      label: 'Colocado',
      data: [498100],
      borderColor: () => colorDeSerie(1),
      backgroundColor: () => colorDeSerie(1),
      pointBackgroundColor: () => colorDeSerie(1),
      pointRadius: 7,
    },
  ],
};

const AGENCIAS = [
  'Centro',
  'Norte',
  'Sur',
  'Este',
  'Valle',
  'Puerto',
  'Alameda',
  'Mercado',
  'Terminal',
  'Aeropuerto',
  'Ribera',
  'Colina',
];

/*
  DOCE SERIES SOBRE UNA PALETA DE DIEZ. Las dos ultimas —Ribera y Colina—
  repiten el color de las dos primeras. No es un defecto que se arregle
  eligiendo mejor los colores: es el limite de la paleta, y verlo aqui es lo que
  evita descubrirlo en produccion con una leyenda de doce entradas.
*/
const DOCE_SERIES = {
  labels: MESES,
  datasets: AGENCIAS.map((agencia, indice) => ({
    label: agencia,
    data: MESES.map((_mes, posicion) => 40 + ((indice * 7 + posicion * 5) % 55)),
    borderColor: () => colorDeSerie(indice),
    backgroundColor: () => colorDeSerie(indice),
    pointBackgroundColor: () => colorDeSerie(indice),
    tension: 0.3,
  })),
};

/*
  El tratamiento correcto del conjunto vacio no lo resuelve la grafica: lo
  resuelve quien decide si hay algo que dibujar. `DataState` es la pieza del ADN
  que publica ese reparto, asi que se monta aqui en vez de escribir un mensaje
  suelto a mano.
*/
@Component({
  selector: 'app-story-chart-sin-datos',
  standalone: true,
  imports: [ChartComponent, DataStateComponent, PanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="comparacion">
      <app-panel title="Lo que dibuja la gráfica sola" variant="outlined" padding="md">
        <p class="comparacion__nota">
          Sin series, el lienzo pinta el marco y nada más. Quien lo mire no puede
          distinguir «no hubo operaciones» de «no se pudo consultar».
        </p>
        <app-chart type="line" height="12rem" [data]="sinDatos" [options]="opciones" />
      </app-panel>

      <app-panel title="Lo que debe verse" variant="outlined" padding="md">
        <p class="comparacion__nota">
          El vacío se resuelve antes de dibujar: si no hay filas, no hay gráfica,
          y en su lugar va un bloque que dice qué pasó.
        </p>
        <app-data-state
          [isEmpty]="true"
          emptyText="No hubo desembolsos en el rango consultado."
        />
      </app-panel>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .comparacion {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-5);
        align-items: start;
      }

      @media (max-width: 56rem) {
        .comparacion {
          grid-template-columns: 1fr;
        }
      }

      .comparacion__nota {
        margin: 0 0 var(--space-4);
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
      }
    `,
  ],
})
class ChartSinDatosStory {
  protected readonly sinDatos = SIN_DATOS;
  protected readonly opciones = OPCIONES_CON_EJES;
}

const meta: Meta<ChartComponent> = {
  title: '3. Organisms/Chart',
  component: ChartComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ChartComponent, PanelComponent, ChartSinDatosStory] })],
  argTypes: {
    type: {
      control: 'select',
      options: ['line', 'bar', 'doughnut', 'pie', 'radar', 'polarArea'],
      description: 'Tipo de gráfica de Chart.js. Cambia el formateador de etiquetas.',
    },
    data: { control: false, description: 'Series y etiquetas, en el formato de Chart.js.' },
    options: { control: false, description: 'Opciones de Chart.js. El marco (ejes, rejilla, tooltip) ya lo tokeniza el componente.' },
    height: {
      control: 'text',
      description:
        'Alto del contenedor. Se aplica como --chart-container-height; sin él, el lienzo colapsa.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Envoltura de Chart.js que se encarga de **lo que un lienzo no sabe hacer solo**:
leer los tokens del tema, rehacer el dibujo cuando cambia \`data-theme\` y
reajustarse cuando su contenedor cambia de tamaño.

Tres cosas que conviene copiar de estas historias:

1. **Los colores se pasan como función, no como cadena.** Un \`canvas\` no
   interpreta \`var(--chart-color-2)\`. Con una función, el color se relee en cada
   pintado y acompaña al cambio de tema.
2. **La paleta de series no cambia con el tema.** \`--chart-color-1..10\` son los
   mismos en claro y en oscuro porque identifican al dato; lo que se adapta es el
   marco (rejilla, ejes, tooltip).
3. **En barras hay que apagar las etiquetas del complemento global**, que añade
   \`%\` al valor. Sobre importes o conteos, eso es una cifra falsa.

Y una que conviene no copiar: la gráfica **no resuelve el conjunto vacío**. Ver
«Sin datos».
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ChartComponent>;

const enPanel =
  (titulo: string): NonNullable<Story['render']> =>
  (args) => ({
    props: args,
    template: `
      <app-panel title="${titulo}" variant="elevated" padding="md">
        <app-chart [type]="type" [data]="data" [options]="options" [height]="height"></app-chart>
      </app-panel>
    `,
  });

export const EvolucionDeDosSeries: Story = {
  name: 'Evolución de dos series en el tiempo',
  args: {
    type: 'line',
    data: COLOCADO_Y_RECUPERADO,
    options: OPCIONES_CON_EJES,
    height: '18rem',
  },
  render: enPanel('Colocación y recuperación del semestre'),
  parameters: {
    docs: {
      description: {
        story:
          'Dos series comparables sobre el mismo eje. Los colores salen de `--chart-color-2` y `--chart-color-4` leídos en cada pintado, y las etiquetas sobre el punto se apagan porque el eje ya dice la cifra.',
      },
    },
  },
};

export const RepartoDeUnTotal: Story = {
  name: 'Reparto de un total (anillo)',
  args: {
    type: 'doughnut',
    data: CARTERA_POR_PRODUCTO,
    options: OPCIONES_ANILLO,
    height: '18rem',
  },
  render: enPanel('Participación de la cartera por producto'),
  parameters: {
    docs: {
      description: {
        story:
          'El color por segmento se resuelve con el índice del dato, así que la paleta se recorre en orden y no hay que escribirla. Aquí las etiquetas del complemento sí se dejan: son porcentajes y caben dentro del segmento.',
      },
    },
  },
};

export const ComparacionEntreCategorias: Story = {
  name: 'Comparación entre categorías (barras)',
  args: {
    type: 'bar',
    data: DESEMBOLSOS_POR_AGENCIA,
    options: OPCIONES_CON_EJES,
    height: '18rem',
  },
  render: enPanel('Desembolsos del mes por agencia'),
  parameters: {
    docs: {
      description: {
        story:
          'Cinco categorías sin orden temporal: barras, no línea. Las etiquetas del complemento van apagadas **porque en `bar` el formateador global añade `%`**, y estos son conteos de operaciones, no porcentajes.',
      },
    },
  },
};

export const SinDatos: Story = {
  name: 'Sin datos: el marco vacío no es un estado vacío',
  render: () => ({ template: `<app-story-chart-sin-datos />` }),
  parameters: {
    docs: {
      description: {
        story:
          'Con `datasets: []` la gráfica no falla: dibuja el marco y nada más, y un marco vacío se lee igual que «todo en cero» que como «no se pudo consultar». El vacío se decide antes de dibujar y se dice con un bloque —aquí `DataState`—, no con un lienzo en blanco.',
      },
    },
  },
};

export const UnaSolaMedicion: Story = {
  name: 'Un solo punto no es una tendencia',
  args: {
    type: 'line',
    data: UNA_SOLA_MEDICION,
    options: OPCIONES_CON_EJES,
    height: '18rem',
  },
  render: enPanel('Colocación de junio (único mes cerrado)'),
  parameters: {
    docs: {
      description: {
        story:
          'Con una sola medición no hay línea que trazar: queda el punto y un eje horizontal con una única marca. Se documenta porque es el resultado real de un filtro estrecho, y porque una gráfica de líneas con un punto invita a leer una evolución que nadie ha medido. El radio del punto se sube para que la medición se vea; con el radio por omisión pasa desapercibida.',
      },
    },
  },
};

export const MasSeriesQueColores: Story = {
  name: 'Más series que colores en la paleta',
  args: {
    type: 'line',
    data: DOCE_SERIES,
    options: OPCIONES_CON_EJES,
    height: '22rem',
  },
  render: enPanel('Doce agencias sobre una paleta de diez'),
  parameters: {
    docs: {
      description: {
        story:
          'La paleta publicada tiene diez colores. Con doce series, la undécima y la duodécima repiten el color de la primera y la segunda: en la leyenda se ve que «Ribera» y «Centro» comparten color. No se arregla eligiendo mejor los colores; se arregla agrupando el dato o cambiando de representación.',
      },
    },
  },
};

export const AlturaEnContenedorEstrecho: Story = {
  name: 'La altura la fija el consumidor',
  args: {
    type: 'bar',
    data: DESEMBOLSOS_POR_AGENCIA,
    options: OPCIONES_CON_EJES,
    height: '9rem',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-panel title="Tarjeta lateral" variant="outlined" padding="sm">
        <app-chart [type]="type" [data]="data" [options]="options" [height]="height"></app-chart>
      </app-panel>
    `,
  }),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          '`height` no es decoración: el lienzo no tiene alto propio y sin ese valor colapsa. Aquí va a 9rem dentro de una tarjeta estrecha, que es el caso de la gráfica de apoyo en una columna lateral. El componente observa el tamaño de su contenedor y vuelve a dibujar, así que el cambio de ancho no deja el lienzo estirado.',
      },
    },
  },
};
