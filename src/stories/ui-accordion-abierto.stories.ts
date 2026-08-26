import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import {
  AccordionComponent,
  AccordionItemComponent,
} from '../app/shared/ui/organisms/accordion/accordion.component';

/*
  LA ENTRADA SE LLAMA `open`, Y LA HISTORIA VIEJA ENLAZA `expanded`.

  `ui-accordion.stories.ts` escribe `<app-accordion-item [expanded]="true">` en
  dos de sus cinco historias. `AccordionItemComponent` no declara `expanded`:
  declara `readonly entradaAbierto = input(false, { alias: 'open' })`. El enlace
  no falla, no avisa y no abre nada; el panel se queda cerrado.

  Y hay un segundo problema en el mismo sitio: aquel fichero solo importa
  `AccordionComponent`, asi que el hijo no esta declarado en el modulo de la
  historia. `AccordionItemComponent` es, por eso, una de las clases que no
  aparecen en NINGUNA historia del catalogo, aunque su etiqueta se escriba cinco
  veces.

  Este fichero corrige las dos cosas: le da entrada propia al hijo, declara los
  dos componentes en el modulo y usa `[open]`, que es la API real —la misma que
  el catalogo vivo ya usa en `showcase-navigation`—. No toca el fichero viejo.
*/

const meta: Meta<AccordionItemComponent> = {
  title: '3. Organisms/AccordionItem',
  component: AccordionItemComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [AccordionComponent, AccordionItemComponent] })],
  parameters: {
    docs: {
      description: {
        component: `
\`app-accordion-item\` es el panel; \`app-accordion\` es el organismo que los
coordina. Vale la pena tener claro qué hace cada uno, porque casi todo el
comportamiento interesante está repartido:

| Entrada | Dónde vive | Qué hace |
|---|---|---|
| \`open\` | panel | Abre el panel de entrada. **No es \`expanded\`.** |
| \`disabled\` | panel | Bloquea el encabezado y lo saca de la travesía con flechas. |
| \`title\`, \`description\` | panel | Encabezado en dos líneas. |
| \`headingLevel\` | panel | Nivel del \`role="heading"\`; por omisión 3. |
| \`single\` | organismo | Al abrir uno, cierra los demás. |
| \`flush\` | organismo | Quita el marco y deja los paneles a ras del contenedor. |

Dos detalles de accesibilidad que ya vienen resueltos y conviene no deshacer: el
contenido cerrado lleva \`inert\`, así que no se puede tabular dentro de un panel
plegado, y al cerrar un panel cuyo interior tenía el foco, el foco vuelve al
encabezado en vez de perderse en el documento.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<AccordionItemComponent>;

export const PanelAbiertoDeEntrada: Story = {
  name: 'Un panel abierto de entrada, con [open]',
  render: () => ({
    template: `
      <div style="max-width:44rem; padding:var(--space-4);">
        <app-accordion>
          <app-accordion-item title="¿Qué necesito para abrir una cuenta?">
            Documento de identidad vigente y un recibo de servicios de los últimos tres meses.
          </app-accordion-item>
          <app-accordion-item title="¿Cuánto tarda la aprobación?">
            Entre uno y tres días hábiles desde que el expediente queda completo.
          </app-accordion-item>
          <app-accordion-item
            title="¿Puedo adelantar cuotas?"
            [open]="true"
          >
            Sí. El adelanto se aplica al capital y reduce el número de cuotas pendientes, salvo que
            se pida expresamente reducir el importe de cada una.
          </app-accordion-item>
        </app-accordion>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
El tercer panel abre desplegado porque declara \`[open]="true"\`. Es el patrón que
el catálogo vivo usa: se deja abierto el panel que responde a la pregunta por la
que la mayoría llega a esa pantalla.

El enlace es de **entrada inicial**, no un candado: pulsar el encabezado lo
cierra igual, y el panel emite \`openChange\`. Cambiar el valor de \`open\` más
tarde sí vuelve a mover el panel, porque un efecto sincroniza la señal interna;
lo que no hace es impedir que el usuario lo cierre.

Compárese con \`[expanded]="true"\`, que es lo que escribe la historia antigua:
esa entrada no existe y el panel se queda cerrado sin decir nada.
        `,
      },
    },
  },
};

export const SoloUnPanelALaVez: Story = {
  name: 'single: abrir uno cierra el anterior',
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-8); max-width:44rem; padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Con [single]="true"
          </h3>
          <app-accordion [single]="true">
            <app-accordion-item title="Datos del titular" [open]="true">
              Nombre, documento y estado civil.
            </app-accordion-item>
            <app-accordion-item title="Domicilio">
              Dirección declarada y referencia.
            </app-accordion-item>
            <app-accordion-item title="Referencias personales">
              Dos contactos que no vivan en el mismo domicilio.
            </app-accordion-item>
          </app-accordion>
        </section>

        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Sin single: se acumulan
          </h3>
          <app-accordion>
            <app-accordion-item title="Datos del titular" [open]="true">
              Nombre, documento y estado civil.
            </app-accordion-item>
            <app-accordion-item title="Domicilio">
              Dirección declarada y referencia.
            </app-accordion-item>
            <app-accordion-item title="Referencias personales">
              Dos contactos que no vivan en el mismo domicilio.
            </app-accordion-item>
          </app-accordion>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Abra «Domicilio» en los dos bloques y compare. Arriba, «Datos del titular» se
cierra solo; abajo, los dos quedan abiertos.

\`single\` es del **organismo**, no del panel: los paneles no se conocen entre
ellos, se registran en el acordeón al crearse y es él quien cierra a los demás.
De ahí que un \`app-accordion-item\` suelto, fuera de un \`app-accordion\`,
funcione como interruptor independiente y nadie lo cierre nunca.

Elegir uno u otro es decidir si el usuario necesita **comparar** dos secciones a
la vez. Para preguntas frecuentes, \`single\` mantiene la lista corta; para
rellenar un formulario por bloques, cerrar lo ya rellenado suele estorbar.
        `,
      },
    },
  },
};

export const PanelBloqueado: Story = {
  name: 'Un panel que hoy no se puede abrir',
  render: () => ({
    template: `
      <div style="max-width:44rem; padding:var(--space-4);">
        <app-accordion>
          <app-accordion-item
            title="Conteo de efectivo"
            description="Completado a las 18:05"
            [open]="true"
          >
            Arqueo cerrado y firmado por el cajero.
          </app-accordion-item>
          <app-accordion-item
            title="Diferencias"
            description="Sin sobrantes ni faltantes"
          >
            El conteo cuadra con lo esperado.
          </app-accordion-item>
          <app-accordion-item
            title="Cierre contable"
            description="Disponible cuando el supervisor apruebe el arqueo"
            [disabled]="true"
          >
            Este contenido no es alcanzable mientras el panel esté bloqueado.
          </app-accordion-item>
        </app-accordion>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
«Cierre contable» está deshabilitado: el encabezado es un \`<button disabled>\`,
no responde al clic, no recibe foco y la travesía con flechas lo salta —el
organismo filtra los deshabilitados antes de mover el foco—.

Lo que hace útil a este ejemplo no es el color apagado, sino la
\`description\`: **dice de qué depende**. Un panel bloqueado sin explicación
obliga al usuario a adivinar si es un permiso que le falta, un paso previo o un
fallo. Con «Disponible cuando el supervisor apruebe el arqueo» ya sabe qué
esperar y a quién buscar.

La misma \`description\` sirve en el panel abierto para dar el dato que ahorra
abrirlo: «Completado a las 18:05».
        `,
      },
    },
  },
};

export const SinMarcoEntreSecciones: Story = {
  name: 'flush: el acordeón sin marco propio',
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-8); max-width:44rem; padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Por omisión: el acordeón trae su marco
          </h3>
          <app-accordion>
            <app-accordion-item title="Condiciones del crédito" [open]="true">
              Tasa, plazo y comisiones aplicables.
            </app-accordion-item>
            <app-accordion-item title="Requisitos">
              Documentos que hay que presentar.
            </app-accordion-item>
          </app-accordion>
        </section>

        <section
          style="border:var(--border-width-thin) solid var(--border-color); border-radius:var(--radius-lg); padding:var(--space-5); background:var(--surface-background);"
        >
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Con [flush]="true", dentro de una tarjeta que ya tiene el suyo
          </h3>
          <app-accordion [flush]="true">
            <app-accordion-item title="Condiciones del crédito" [open]="true">
              Tasa, plazo y comisiones aplicables.
            </app-accordion-item>
            <app-accordion-item title="Requisitos">
              Documentos que hay que presentar.
            </app-accordion-item>
          </app-accordion>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
\`flush\` existe para el caso de abajo: un acordeón **dentro** de una superficie
que ya tiene borde y fondo propios. Sin él se ven dos marcos concéntricos
separados por unos milímetros, que es el ruido visual más fácil de producir y el
más difícil de justificar.

Fuera de un contenedor con marco, \`flush\` deja los paneles flotando sin límite
lateral; ahí lo correcto es no usarlo. La entrada no es una variante de estilo
que se elija por gusto, sino la respuesta a una pregunta concreta: ¿hay ya un
borde alrededor?
        `,
      },
    },
  },
};

export const EncabezadoConNivelPropio: Story = {
  name: 'headingLevel: encajar en el índice de la página',
  render: () => ({
    template: `
      <div style="max-width:44rem; padding:var(--space-4);">
        <h2 style="margin:0 0 var(--space-4); font-size:var(--text-xl); color:var(--text-color);">
          Ayuda de la sección Caja
        </h2>
        <app-accordion>
          <app-accordion-item
            title="Cómo iniciar un turno"
            description="Antes de la primera operación del día"
            [headingLevel]="3"
            [open]="true"
          >
            El turno se abre declarando el fondo fijo recibido. Hasta entonces la caja no acepta
            cobros.
          </app-accordion-item>
          <app-accordion-item
            title="Cómo corregir un cobro mal registrado"
            description="Solo dentro del mismo turno"
            [headingLevel]="3"
          >
            Se registra un reverso, que deja rastro en la bitácora. Un cobro no se borra nunca.
          </app-accordion-item>
          <app-accordion-item
            title="Qué hacer si la caja no cuadra"
            description="Diferencias por encima de S/ 10"
            [headingLevel]="3"
          >
            Se cuenta de nuevo, se registra la diferencia y se avisa al supervisor antes de cerrar.
          </app-accordion-item>
        </app-accordion>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
El título de cada panel es un encabezado de verdad: el botón va envuelto en un
elemento con \`role="heading"\`, así que los tres paneles aparecen en el índice
con el que se recorre una pantalla usando lector de pantalla. Sin eso, quien
navega saltando por títulos pasaría del \`<h2>\` de la sección directamente al
contenido del panel abierto, sin enterarse de que hay otros dos ni de cómo se
llaman.

El **nivel** no puede decidirlo el componente, porque solo quien monta la
pantalla sabe qué hay por encima. Aquí el acordeón cuelga de un \`<h2>\`, así que
los paneles son nivel 3 —que además es el valor por omisión—. Bajo un \`<h3>\`
habría que declarar 4: saltar de 2 a 4 o repetir el 2 rompe el índice tanto como
no tenerlo.
        `,
      },
    },
  },
};
