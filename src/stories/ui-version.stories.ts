import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { VersionComponent } from '../app/shared/ui/atoms/version/version.component';

/*
  LA CHAPA DE ENTORNO ES UN AVISO, Y UN AVISO QUE NO SE LEE NO AVISA.

  Este atomo existe para que nadie confunda la pantalla de produccion con la de
  pruebas. Su contraste se acaba de corregir: la chapa pinta fondo tonal suave
  con el texto del tono medido (`--alert-TONO-text` sobre `--TONO-color-lighter`),
  y QA y STAGING usan `--version-qa-*`, cuatro tokens que viven en
  `src/styles/themes/_tokens-components.css` porque exito, aviso, peligro e
  informacion nombran VEREDICTOS y no entornos.

  Por eso estas historias no se conforman con enseñar las formas: la ultima pone
  las cinco chapas en claro y en oscuro, una al lado de la otra, para que la
  correccion se pueda comprobar mirando y no creyendo. Esa comparacion se hace
  con el atributo `data-theme`, que es el interruptor central del tema; no se
  redefine aqui ni un token.
*/

const ENTORNOS = [
  { valor: 'PROD', explicacion: 'Producción · verde de éxito' },
  { valor: 'QA', explicacion: 'QA · violeta local del componente' },
  { valor: 'STAGING', explicacion: 'Staging · comparte el violeta de QA' },
  { valor: 'DEV', explicacion: 'Desarrollo · ámbar de aviso' },
  { valor: 'BETA', explicacion: 'Beta · azul de información' },
];

const meta: Meta<VersionComponent> = {
  title: '1. Atoms/Version',
  component: VersionComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [VersionComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Indicador de versión y entorno para pies de página, barras superiores y paneles ' +
          'de información. El color lo dan los tokens del tema, nunca un valor fijo.',
      },
    },
  },
  argTypes: {
    version: { control: 'text', description: 'Número de versión publicado.' },
    appName: { control: 'text', description: 'Nombre de la aplicación, opcional.' },
    environment: {
      control: 'select',
      options: ['PROD', 'QA', 'STAGING', 'DEV', 'BETA', ''],
      description: 'Entorno. Decide el color del punto y de la chapa. Vacío: sin chapa.',
    },
    variant: {
      control: 'inline-radio',
      options: ['pill', 'badge', 'text', 'compact'],
      description: 'Forma: píldora, placa, texto suelto o compacto.',
    },
    showBuildDate: { control: 'boolean', description: 'Muestra la fecha de compilación.' },
    buildDate: { control: 'text', description: 'Fecha de compilación; sin ella no se pinta nada.' },
  },
};

export default meta;
type Story = StoryObj<VersionComponent>;

/*
  La pildora es la forma redonda: la de la barra superior, donde convive con
  botones y tiene que parecerse a ellos.
*/
export const EntornosEnPildora: Story = {
  name: 'Píldora: los cinco entornos',
  render: () => ({
    props: { entornos: ENTORNOS },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start;">
        @for (entorno of entornos; track entorno.valor) {
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <app-version variant="pill" version="v5.22.0" [environment]="entorno.valor" />
            <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">
              {{ entorno.explicacion }}
            </span>
          </div>
        }
      </div>
    `,
  }),
};

/*
  La placa es la forma cuadrada: la del pie de pagina, donde se alinea con texto
  legal. Comparte superficie y borde con la pildora a proposito -lo unico que
  las distingue es la forma, que es lo que sus nombres prometen-.
*/
export const EntornosEnPlaca: Story = {
  name: 'Placa: los cinco entornos',
  render: () => ({
    props: { entornos: ENTORNOS },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start;">
        @for (entorno of entornos; track entorno.valor) {
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <app-version variant="badge" version="v5.22.0" [environment]="entorno.valor" />
            <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">
              {{ entorno.explicacion }}
            </span>
          </div>
        }
      </div>
    `,
  }),
};

/*
  LA COMPROBACION QUE JUSTIFICA ESTA ENTRADA.

  Las diez chapas -cinco entornos por dos temas- una encima de otra. Si alguna
  volviera a pintar texto claro sobre relleno saturado, se veria aqui sin tener
  que cambiar el tema de Storybook. Los dos paneles no declaran ningun token:
  solo encienden `data-theme`, que es donde el ADN ya los tiene declarados.
*/
export const LegibleEnAmbosTemas: Story = {
  name: 'Contraste: las mismas chapas en claro y en oscuro',
  render: () => ({
    props: { entornos: ENTORNOS },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: var(--space-4);">
        <div
          data-theme="light"
          style="display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4);
                 background: var(--surface-background); color: var(--text-color);
                 border: var(--border-width-thin) solid var(--border-color);
                 border-radius: var(--radius-md);"
        >
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">Tema claro</span>
          @for (entorno of entornos; track entorno.valor) {
            <app-version variant="badge" appName="Mini-ERP" version="v5.22.0" [environment]="entorno.valor" />
          }
        </div>
        <div
          data-theme="dark"
          style="display: flex; flex-direction: column; gap: var(--space-3); padding: var(--space-4);
                 background: var(--surface-background); color: var(--text-color);
                 border: var(--border-width-thin) solid var(--border-color);
                 border-radius: var(--radius-md);"
        >
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">Tema oscuro</span>
          @for (entorno of entornos; track entorno.valor) {
            <app-version variant="badge" appName="Mini-ERP" version="v5.22.0" [environment]="entorno.valor" />
          }
        </div>
      </div>
    `,
  }),
};

/*
  Texto y compacto renuncian al punto de color: no son avisos, son datos. Se
  usan donde el entorno ya se sabe -un panel «Acerca de»- y lo unico que hace
  falta es el numero.
*/
export const TextoYCompacto: Story = {
  name: 'Texto y compacto: cuando el entorno ya no es noticia',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <app-version variant="text" version="v5.22.0" environment="PROD" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">text · sin punto ni caja</span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <app-version variant="compact" version="v5.22.0" environment="PROD" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">compact · letra menor</span>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <app-version variant="text" version="v5.22.0" environment="" />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">
            sin entorno · solo el número
          </span>
        </div>
      </div>
    `,
  }),
};

/*
  La ficha completa: nombre, numero, entorno y fecha de compilacion. La fecha
  solo aparece si se piden LAS DOS entradas -`showBuildDate` y `buildDate`-, asi
  que la tercera fila enseña el caso en que se pide mostrarla y no hay ninguna,
  que es el que pasa cuando la compilacion no inyecto el dato.
*/
export const ConNombreYFecha: Story = {
  name: 'Ficha completa: nombre, número, entorno y compilación',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start;">
        <app-version
          variant="pill"
          appName="Mini-ERP"
          version="v5.22.0"
          environment="PROD"
          buildDate="2026-08-26"
          [showBuildDate]="true"
        />
        <app-version
          variant="badge"
          appName="Mini-ERP"
          version="v5.23.0-rc.1"
          environment="QA"
          buildDate="2026-08-25 18:40"
          [showBuildDate]="true"
        />
        <div style="display: flex; align-items: center; gap: var(--space-4);">
          <app-version
            variant="badge"
            appName="Mini-ERP"
            version="v5.23.0-rc.1"
            environment="QA"
            [showBuildDate]="true"
          />
          <span style="color: var(--text-color-secondary); font-size: var(--text-xs);">
            se pidió la fecha y no la hay: no se inventa un paréntesis vacío
          </span>
        </div>
      </div>
    `,
  }),
};

/*
  El sitio real del componente. Puesto en un pie, se ve lo que importa: que la
  chapa no compite con el texto legal y que el numero sigue siendo lo primero
  que se lee.
*/
export const EnUnPieDePagina: Story = {
  name: 'En su sitio: el pie de una aplicación',
  render: () => ({
    template: `
      <footer
        style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
               gap: var(--space-3); padding: var(--space-4) var(--space-5);
               background: var(--surface-section); color: var(--text-color-secondary);
               border-top: var(--border-width-thin) solid var(--border-color);
               border-radius: var(--radius-md); font-size: var(--text-sm);"
      >
        <span>© 2026 COTAHA · Todos los derechos reservados</span>
        <app-version
          variant="pill"
          appName="Mini-ERP"
          version="v5.22.0"
          environment="PROD"
          buildDate="2026-08-26"
          [showBuildDate]="true"
        />
      </footer>
    `,
  }),
};
