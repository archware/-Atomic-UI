import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, signal } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnalyticsPageComponent } from '../blueprints/analytics-page/analytics-page.component';

/*
QUE DOCUMENTA ESTE FICHERO

AnalyticsPageComponent no declara ni una sola entrada: sus tres series viven como
campos publicos de la clase (trafficData, deviceData, conversionData) y se
rellenan con datos de demostracion al construirse. No hay, por tanto, forma
honrada de "pasarle datos" desde fuera con un binding.

Lo que si se puede hacer -y es lo que hacen las historias de abajo- es sustituir
esos campos publicos. Storybook asigna a la instancia del componente cualquier
propiedad de `props` que no sea una entrada declarada, asi que el reemplazo llega
a la misma instancia que pinta la pagina. Es un doble deliberado, y queda escrito
aqui para que nadie lo confunda con una API de entrada.

Lo que este blueprint NO tiene, y por eso no se documenta sin tocarlo: estado de
carga y estado de error. La pagina monta las graficas siempre; mientras la
respuesta viaja, o cuando falla, lo que queda en pantalla es exactamente la
historia "Sin series que dibujar".
*/

/** Color de serie del tema activo. Igual que el blueprint: ninguna serie lleva color escrito a mano. */
function colorDeSerie(indice: number): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--chart-color-' + indice).trim();
}

const MESES_DEL_ANIO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Serie larga: tres anios completos de puntos mensuales sobre el mismo eje. */
function serieLarga(): { etiquetas: string[]; visitas: number[]; unicos: number[] } {
  const etiquetas: string[] = [];
  const visitas: number[] = [];
  const unicos: number[] = [];
  for (let indice = 0; indice < 36; indice += 1) {
    const anio = 2024 + Math.floor(indice / 12);
    etiquetas.push(MESES_DEL_ANIO[indice % 12] + ' ' + anio);
    visitas.push(40 + ((indice * 17) % 60));
    unicos.push(20 + ((indice * 29) % 45));
  }
  return { etiquetas, visitas, unicos };
}

const meta: Meta<AnalyticsPageComponent> = {
  title: '5. Blueprints/Analytics Page',
  component: AnalyticsPageComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: '**', children: [] }]),
        importProvidersFrom(BrowserAnimationsModule),
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Blueprint de analiticas

Pagina completa de exploracion de datos: \`LayoutShell\` con \`Sidebar\` y
\`Topbar\`, tres \`Panel\` y tres \`Chart\` -linea, anillo y barras- que leen los
tokens \`--chart-color-N\` del tema activo.

### Que ejercitan estas historias

La clase **no declara entradas**. Las series son campos publicos
(\`trafficData\`, \`deviceData\`, \`conversionData\`), el estado de la navegacion es
la senal \`sidebarVisible\` y el menu es el campo \`menuItems\`. Las historias
sustituyen esos campos para llevar la pagina a un estado concreto: es un
**doble**, no una API de entrada, y por eso el codigo de cada historia lo dice.

### Estados que este blueprint no sabe pintar

No hay \`loading\` ni \`error\` en ninguna parte del componente: las graficas se
montan siempre con lo que haya en el campo. Mientras la peticion viaja -o si
falla- el usuario ve el armazon con las graficas vacias, que es lo que muestra la
historia *Sin series que dibujar*. Documentarlo de otra forma exigiria modificar
el blueprint.

### Uso

Copia \`src/blueprints/analytics-page\` a tu proyecto, sustituye los campos de
datos por la respuesta de tu API y ajusta \`menuItems\` a tu navegacion.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<AnalyticsPageComponent>;

export const ConDatos: Story = {
  name: 'Las tres graficas con datos',
  parameters: {
    docs: {
      description: {
        story:
          'Estado nominal, tal y como sale el blueprint recien copiado: linea con dos series, ' +
          'anillo con tres cortes y barras semanales. Los colores salen de --chart-color-N, asi ' +
          'que el mismo dibujo vale en claro y en oscuro sin tocar nada.',
      },
    },
  },
  render: () => ({
    template: '<app-analytics-page></app-analytics-page>',
  }),
};

export const SinSeriesQueDibujar: Story = {
  name: 'Sin series que dibujar (y sin aviso de carga)',
  parameters: {
    docs: {
      description: {
        story:
          'Las tres series llegan vacias. Los paneles y sus titulos siguen ahi, pero dentro no ' +
          'queda mas que la rejilla: ni un texto que diga que no hay datos, ni una accion para ' +
          'volver a intentarlo. Esta misma pantalla es la que se ve mientras la respuesta viaja y ' +
          'la que se ve cuando la peticion falla, porque el componente no distingue los tres ' +
          'casos. Es el hueco a cubrir al adoptar el blueprint.',
      },
    },
  },
  render: () => ({
    props: {
      trafficData: { labels: [], datasets: [] },
      deviceData: { labels: [], datasets: [] },
      conversionData: { labels: [], datasets: [] },
    },
    template: '<app-analytics-page></app-analytics-page>',
  }),
};

export const VolumenDeTresAnios: Story = {
  name: 'Volumen: tres anios de puntos en el mismo eje',
  parameters: {
    docs: {
      description: {
        story:
          'Treinta y seis puntos por serie en el eje de linea, cinco cortes en el anillo y doce ' +
          'barras con etiqueta de mes. Sirve para ver que ocurre cuando el rango deja de ser una ' +
          'semana: las etiquetas del eje se apinan y la leyenda no ofrece forma de aislar una ' +
          'serie. El blueprint no agrega ni recorta el rango; quien lo adopte decide esa parte.',
      },
    },
  },
  render: () => {
    const { etiquetas, visitas, unicos } = serieLarga();
    return {
      props: {
        trafficData: {
          labels: etiquetas,
          datasets: [
            { data: visitas, label: 'Visitas', borderColor: colorDeSerie(2), tension: 0.4 },
            { data: unicos, label: 'Visitantes unicos', borderColor: colorDeSerie(6), tension: 0.4 },
          ],
        },
        deviceData: {
          labels: ['Movil', 'Escritorio', 'Tableta', 'Television', 'Otros'],
          datasets: [
            {
              data: [4210, 3980, 1120, 240, 95],
              backgroundColor: [
                colorDeSerie(2),
                colorDeSerie(3),
                colorDeSerie(4),
                colorDeSerie(5),
                colorDeSerie(10),
              ],
            },
          ],
        },
        conversionData: {
          labels: MESES_DEL_ANIO,
          datasets: [
            {
              data: [120, 190, 30, 50, 20, 30, 100, 145, 88, 64, 210, 175],
              label: 'Conversiones cerradas por mes',
              backgroundColor: colorDeSerie(3),
              borderRadius: 6,
            },
          ],
        },
      },
      template: '<app-analytics-page></app-analytics-page>',
    };
  },
};

export const NavegacionReplegada: Story = {
  name: 'Contenido a ancho completo con la navegacion replegada',
  parameters: {
    docs: {
      description: {
        story:
          'La senal sidebarVisible arranca en false, que es el estado al que llega la pagina ' +
          'cuando el usuario pulsa el boton de menu del Topbar o cuando el LayoutShell entra en su ' +
          'consulta compacta. Las graficas ocupan todo el ancho: es la comprobacion de que los ' +
          'lienzos se redimensionan y no se quedan recortados.',
      },
    },
  },
  render: () => ({
    props: {
      sidebarVisible: signal(false),
    },
    template: '<app-analytics-page></app-analytics-page>',
  }),
};

export const MenuSinEntradas: Story = {
  name: 'Navegacion sin entradas que mostrar',
  parameters: {
    docs: {
      description: {
        story:
          'menuItems llega vacio, que es lo que ocurre cuando el menu se calcula a partir de los ' +
          'permisos del usuario y no se concede ninguno. El Sidebar conserva la marca y la ficha ' +
          'de usuario, y deja el hueco de la lista en blanco sin explicar por que. Conviene verlo ' +
          'antes de cablear un menu por permisos.',
      },
    },
  },
  render: () => ({
    props: {
      menuItems: [],
    },
    template: '<app-analytics-page></app-analytics-page>',
  }),
};
