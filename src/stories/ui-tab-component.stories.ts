import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  TabComponent,
  TabsComponent,
} from '../app/shared/ui/organisms/tabs/tabs.component';

/*
  `TabComponent` NO ESTABA DOCUMENTADO, AUNQUE SE ESCRIBIA EN CINCO HISTORIAS.

  `ui-tabs.stories.ts` monta `<app-tab>` en las cinco, pero solo importa
  `TabsComponent`: el hijo nunca entra en el modulo de esa historia. Angular no
  conoce el selector, `<app-tab>` se queda como elemento desconocido y sus
  entradas —`label`, `icon`, `iconClass`, `disabled`— no llegan a existir. Por eso
  la historia `DisabledTab` de aquel fichero no puede enseñar una pestaña
  deshabilitada: no hay pestaña.

  Este fichero le da entrada propia al hijo y declara los dos componentes en el
  modulo. De paso ejercita las tres entradas de `TabsComponent` —`defaultIndex`,
  `ariaLabel` y `orientation`— que aquel fichero deja a cero.
*/

const meta: Meta<TabComponent> = {
  title: '3. Organisms/Tab',
  component: TabComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [TabsComponent, TabComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
\`app-tab\` es el panel; \`app-tabs\` es el contenedor que dibuja los botones
leyendo las entradas de sus hijos. Separarlos importa porque **la etiqueta, el
icono y el estado deshabilitado son del hijo**, no del padre: el contenedor solo
los proyecta.

Tres reglas del componente que estas historias enseñan:

1. \`iconClass\` gana a \`icon\`. La plantilla evalúa \`@if (tab.iconClass())\`
   antes que \`@else if (tab.icon())\`; si se declaran los dos, el emoji no se
   pinta nunca.
2. Una pestaña \`disabled\` sigue en el índice y se ve apagada, pero ni el ratón
   ni las flechas la seleccionan: la travesía la salta y sigue buscando.
3. El panel oculto está realmente oculto (\`:host { display: none }\`), así que su
   contenido no se puede tabular. Lo que no se ve, no recibe foco.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<TabComponent>;

export const IconoDeFuenteFrenteAEmoji: Story = {
  name: 'Icono de fuente frente a emoji',
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-8); padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            iconClass: icono de fuente
          </h3>
          <app-tabs ariaLabel="Ficha del cliente">
            <app-tab label="Datos" iconClass="fa-solid fa-id-card">
              <p style="margin:0;">Nombre, documento y contacto del cliente.</p>
            </app-tab>
            <app-tab label="Créditos" iconClass="fa-solid fa-file-invoice-dollar">
              <p style="margin:0;">Operaciones vigentes y saldo pendiente.</p>
            </app-tab>
            <app-tab label="Historial" iconClass="fa-solid fa-clock-rotate-left">
              <p style="margin:0;">Movimientos de los últimos doce meses.</p>
            </app-tab>
          </app-tabs>
        </section>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            icon: emoji
          </h3>
          <app-tabs ariaLabel="Ficha del cliente, versión con emoji">
            <app-tab label="Datos" icon="🪪">
              <p style="margin:0;">El emoji hereda el tamaño de <code>--text-lg</code>.</p>
            </app-tab>
            <app-tab label="Créditos" icon="💳">
              <p style="margin:0;">Un emoji no cambia con el tema; un icono de fuente sí.</p>
            </app-tab>
          </app-tabs>
        </section>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Los dos declarados a la vez: gana iconClass
          </h3>
          <app-tabs ariaLabel="Demostración de precedencia de iconos">
            <app-tab label="Datos" icon="🪪" iconClass="fa-solid fa-id-card">
              <p style="margin:0;">
                Esta pestaña declara emoji e icono de fuente. Se pinta el de fuente y el emoji se
                descarta en silencio.
              </p>
            </app-tab>
            <app-tab label="Sin icono">
              <p style="margin:0;">Una pestaña sin icono no reserva hueco para él.</p>
            </app-tab>
          </app-tabs>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Las dos entradas de icono no son alternativas de estilo: el icono de fuente toma
el color del texto del botón —y por tanto acompaña al tema y al estado activo—
mientras que el emoji lo pinta la fuente del sistema y se queda igual en claro y
en oscuro.

El tercer bloque documenta la precedencia. Declarar las dos no es un error de
compilación ni deja rastro en consola; simplemente una de las dos no aparece, y
saber cuál ahorra el rato de buscar por qué el emoji «no funciona».
        `,
      },
    },
  },
};

export const PestanaDeshabilitada: Story = {
  name: 'Una pestaña deshabilitada, esta vez de verdad',
  render: () => ({
    template: `
      <div style="padding:var(--space-4);">
        <app-tabs ariaLabel="Cierre de caja">
          <app-tab label="Conteo" iconClass="fa-solid fa-coins">
            <p style="margin:0;">Arqueo de efectivo por denominación.</p>
          </app-tab>
          <app-tab label="Diferencias" iconClass="fa-solid fa-scale-unbalanced">
            <p style="margin:0;">Sobrantes y faltantes frente a lo esperado.</p>
          </app-tab>
          <app-tab
            label="Cierre contable"
            iconClass="fa-solid fa-lock"
            [disabled]="true"
          >
            <p style="margin:0;">
              Este panel no es alcanzable: la pestaña está deshabilitada.
            </p>
          </app-tab>
          <app-tab label="Comprobante" iconClass="fa-solid fa-receipt">
            <p style="margin:0;">Documento que se entrega al cajero.</p>
          </app-tab>
        </app-tabs>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
«Cierre contable» está deshabilitada porque el arqueo aún no cuadra. Comprobación
con teclado: pulse Tab hasta llegar a la barra y recorra con las flechas
izquierda y derecha. La travesía pasa de «Diferencias» a «Comprobante» **sin
detenerse** en la deshabilitada, y desde el final vuelve al principio.

Detalle que conviene no perder: la pestaña deshabilitada sigue **visible**. Una
opción que existe pero hoy no se puede usar informa —hay un paso más, y falta
algo para llegar a él—; esconderla haría que el usuario no supiera que existe.

Lo que la pantalla no dice es **por qué** está bloqueada. El componente no tiene
entrada para ese motivo, así que si la razón no es evidente hay que escribirla
cerca, fuera del componente.
        `,
      },
    },
  },
};

export const PestanaInicialDistintaDeLaPrimera: Story = {
  name: 'Abrir en una pestaña que no es la primera',
  render: () => ({
    template: `
      <div style="padding:var(--space-4);">
        <app-tabs [defaultIndex]="2" ariaLabel="Detalle de la operación">
          <app-tab label="Resumen" iconClass="fa-solid fa-list">
            <p style="margin:0;">Datos generales de la operación.</p>
          </app-tab>
          <app-tab label="Cronograma" iconClass="fa-solid fa-calendar-days">
            <p style="margin:0;">Cuotas pactadas y fechas de vencimiento.</p>
          </app-tab>
          <app-tab label="Pagos" iconClass="fa-solid fa-hand-holding-dollar">
            <p style="margin:0;">
              Esta es la pestaña que abre por omisión: es a la que se llega desde el aviso de
              vencimiento, y abrir en «Resumen» obligaría a un clic de más siempre.
            </p>
          </app-tab>
          <app-tab label="Documentos" iconClass="fa-solid fa-paperclip">
            <p style="margin:0;">Contrato, pagaré y anexos.</p>
          </app-tab>
        </app-tabs>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
\`defaultIndex\` se lee **una sola vez**, en \`ngAfterContentInit\`. No es un
enlace vivo: cambiarlo después no mueve la pestaña activa, porque a partir de ese
momento manda la señal interna \`activeIndex\`, que es la que responde al usuario.
Sirve para decidir por dónde se entra, no para controlar la pestaña desde fuera.

\`ariaLabel\` es el nombre de la barra para quien usa lector de pantalla; por
omisión vale «Tabs», en inglés y sin decir de qué. Cada frontal debe traducirlo y
concretarlo, como aquí: «Detalle de la operación».
        `,
      },
    },
  },
};

export const OrientacionVerticalCambiaLasFlechas: Story = {
  name: 'orientation: qué cambia y qué no',
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-6); padding:var(--space-4);">
        <p style="margin:0; font-size:var(--text-sm); color:var(--text-color-secondary); max-width:44rem;">
          Las dos barras se dibujan igual. La diferencia solo se nota con el teclado.
        </p>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            horizontal: recorre con ← y →
          </h3>
          <app-tabs ariaLabel="Configuración, recorrido horizontal">
            <app-tab label="Perfil"><p style="margin:0;">Nombre y foto.</p></app-tab>
            <app-tab label="Seguridad"><p style="margin:0;">Contraseña y segundo factor.</p></app-tab>
            <app-tab label="Avisos"><p style="margin:0;">Correo y notificaciones.</p></app-tab>
          </app-tabs>
        </section>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            vertical: recorre con ↑ y ↓
          </h3>
          <app-tabs orientation="vertical" ariaLabel="Configuración, recorrido vertical">
            <app-tab label="Perfil"><p style="margin:0;">Nombre y foto.</p></app-tab>
            <app-tab label="Seguridad"><p style="margin:0;">Contraseña y segundo factor.</p></app-tab>
            <app-tab label="Avisos"><p style="margin:0;">Correo y notificaciones.</p></app-tab>
          </app-tabs>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
\`orientation\` decide **qué par de flechas** recorre las pestañas y qué anuncia
\`aria-orientation\`, siguiendo las prácticas ARIA: horizontal se recorre con ← y
→, vertical con ↑ y ↓. El par que no le toca se deja al navegador, para no
robarle el desplazamiento de la página.

Y aquí está el aviso, que es la mitad del valor de esta historia: **la hoja de
estilos no cambia**. \`orientation="vertical"\` no apila los botones ni los pone
en columna; la barra se sigue dibujando en fila. Declarar «vertical» sobre una
barra que se ve horizontal contradice a quien usa lector de pantalla, así que
hoy esta entrada solo debería usarse si la disposición vertical se resuelve por
fuera.
        `,
      },
    },
  },
};

export const SietePestanasEnLaMismaBarra: Story = {
  name: 'Siete pestañas: cómo se reparte el ancho',
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-6); padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Ancho completo
          </h3>
          <app-tabs ariaLabel="Expediente completo">
            <app-tab label="Resumen">Contenido del resumen.</app-tab>
            <app-tab label="Titular">Datos del titular.</app-tab>
            <app-tab label="Cónyuge">Datos del cónyuge.</app-tab>
            <app-tab label="Garantías">Bienes en respaldo.</app-tab>
            <app-tab label="Cronograma">Cuotas pactadas.</app-tab>
            <app-tab label="Documentos adjuntos">Archivos cargados.</app-tab>
            <app-tab label="Bitácora de cambios">Quién cambió qué y cuándo.</app-tab>
          </app-tabs>
        </section>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Las mismas siete en 30 rem
          </h3>
          <div style="max-width:30rem;">
            <app-tabs ariaLabel="Expediente completo, contenedor estrecho">
              <app-tab label="Resumen">Contenido del resumen.</app-tab>
              <app-tab label="Titular">Datos del titular.</app-tab>
              <app-tab label="Cónyuge">Datos del cónyuge.</app-tab>
              <app-tab label="Garantías">Bienes en respaldo.</app-tab>
              <app-tab label="Cronograma">Cuotas pactadas.</app-tab>
              <app-tab label="Documentos adjuntos">Archivos cargados.</app-tab>
              <app-tab label="Bitácora de cambios">Quién cambió qué y cuándo.</app-tab>
            </app-tabs>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Los botones se reparten el ancho a partes iguales (\`flex: 1\`), así que siete
pestañas con etiquetas desiguales terminan con «Bitácora de cambios» partida en
dos líneas mientras «Titular» sobra sitio.

El segundo bloque es el mismo marcado en 30 rem y responde a la pregunta que
suele venir después: **no aparece barra de desplazamiento**. El carril
desplazable existe, pero está bajo una media query de **ventana** (48 rem), no
de contenedor: un panel estrecho dentro de una ventana ancha se comprime en vez
de desplazarse.

Regla práctica mientras eso siga así: etiquetas cortas, y por encima de cinco o
seis pestañas conviene otra forma de navegar.
        `,
      },
    },
  },
};
