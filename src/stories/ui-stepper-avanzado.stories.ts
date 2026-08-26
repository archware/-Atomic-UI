import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { StepperComponent } from '../app/shared/ui/organisms/stepper/stepper.component';
import type { Step } from '../app/shared/ui/organisms/stepper/stepper.component';

/*
  POR QUE HAY UN SEGUNDO FICHERO DE STEPPER.

  `ui-stepper.stories.ts` tiene ocho historias y ejercita 2 de las 4 entradas del
  componente. Las dos que faltan —`vertical` y `allowSkip`— no son de apariencia:
  una decide la DISPOSICION y la otra decide si el usuario puede adelantarse.
  Tampoco aparece el paso `optional`, que el catalogo vivo si usa.

  Este fichero no repite el recorrido feliz, que ya esta contado. Documenta lo
  que el otro no llega a enseñar: el eje vertical, el paso opcional, un paso que
  se quedo a medias y que pasa cuando hay mas pasos de los que caben en la linea.

  Nada de lo de aqui redefine colores ni sombras: el stepper consume tokens
  semanticos y el tema oscuro lo resuelve `[data-theme]` en `src/styles/themes/`.
*/

const ALTA_DE_CLIENTE: Step[] = [
  { label: 'Identidad', description: 'Documento y contacto', icon: '🪪' },
  { label: 'Domicilio', description: 'Dirección declarada' },
  { label: 'Sustento de ingresos', description: 'Boletas o declaración', optional: true },
  { label: 'Firma', description: 'Aceptación del contrato' },
];

/*
  EL PASO QUE FALLA NO ES UN ESTADO DEL COMPONENTE, Y CONVIENE DECIRLO.

  `Step` declara `label`, `description`, `icon` y `optional`. No hay `error`, y
  el stepper solo pinta tres situaciones: completado (indice menor que el paso
  activo), activo y bloqueado. Un paso que se quedo a medias se comunica, por
  tanto, con lo que hay: se deja como paso ACTIVO —el recorrido se detuvo ahi—,
  se le pone un icono de aviso y la descripcion dice que fallo y que hacer.

  Es una convencion de quien monta la pantalla, no una entrada del ADN. Se
  documenta asi para que nadie la reinvente de otra forma en cada frontal; que el
  componente merezca un estado propio es otra conversacion, y esta anotada.
*/
const VERIFICACION_FALLIDA: Step[] = [
  { label: 'Identidad', description: 'Documento y contacto', icon: '🪪' },
  {
    label: 'Verificación',
    description: 'El documento no coincide con el padrón. Corrija el número y reintente.',
    icon: '⚠️',
  },
  { label: 'Sustento de ingresos', description: 'Boletas o declaración', optional: true },
  { label: 'Firma', description: 'Aceptación del contrato' },
];

const NUEVE_PASOS: Step[] = [
  { label: 'Solicitud', description: 'Registro inicial' },
  { label: 'Documentación', description: 'Carga de archivos' },
  { label: 'Verificación', description: 'Contraste con padrón' },
  { label: 'Evaluación', description: 'Capacidad de pago' },
  { label: 'Comité', description: 'Aprobación colegiada' },
  { label: 'Garantías', description: 'Registro de respaldo' },
  { label: 'Contrato', description: 'Generación y firma' },
  { label: 'Desembolso', description: 'Abono a la cuenta' },
  { label: 'Seguimiento', description: 'Primer vencimiento' },
];

/*
  DEMOSTRACION INTERACTIVA DE `allowSkip`.

  Una perilla booleana no enseña la diferencia: `goToStep` ignora el clic en
  silencio cuando el indice esta por delante y `allowSkip` es falso, y un clic
  que no hace nada es indistinguible de un clic que no llego. Aqui se ponen los
  dos steppers uno al lado del otro con los mismos pasos, y cada uno anuncia el
  ultimo `stepChange` que emitio: lo que se compara es el evento, no el dibujo.
*/
@Component({
  selector: 'app-story-salto-de-paso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StepperComponent, ButtonComponent],
  template: `
    <div
      style="display:grid; grid-template-columns:repeat(auto-fit, minmax(20rem, 1fr)); gap:var(--space-6); padding:var(--space-4);"
    >
      <section style="min-width:0;">
        <h3 style="margin:0 0 var(--space-2); font-size:var(--text-md); color:var(--text-color);">
          Sin allowSkip: el paso 4 no acepta el clic
        </h3>
        <p style="margin:0 0 var(--space-3); font-size:var(--text-sm); color:var(--text-color-secondary);">
          Pulse «Firma». No pasa nada y no se emite ningún evento.
        </p>
        <app-stepper
          #bloqueado
          [steps]="pasos"
          [vertical]="true"
          (stepChange)="ultimoBloqueado.set($event)"
        ></app-stepper>
        <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-top:var(--space-3);">
          <app-button variant="outline" size="sm" (buttonClick)="bloqueado.previous()">
            Anterior
          </app-button>
          <app-button size="sm" (buttonClick)="bloqueado.next()">Siguiente</app-button>
          <app-button variant="ghost" size="sm" (buttonClick)="reiniciar(bloqueado)">
            Volver al inicio
          </app-button>
        </div>
        <p
          aria-live="polite"
          style="margin:var(--space-3) 0 0; font-size:var(--text-sm); color:var(--text-color-secondary);"
        >
          Último stepChange: {{ ultimoBloqueado() ?? 'ninguno todavía' }}
        </p>
      </section>

      <section style="min-width:0;">
        <h3 style="margin:0 0 var(--space-2); font-size:var(--text-md); color:var(--text-color);">
          Con allowSkip: el paso 4 se puede alcanzar de un salto
        </h3>
        <p style="margin:0 0 var(--space-3); font-size:var(--text-sm); color:var(--text-color-secondary);">
          Pulse «Firma». El stepper salta y emite el índice 3.
        </p>
        <app-stepper
          #libre
          [steps]="pasos"
          [vertical]="true"
          [allowSkip]="true"
          (stepChange)="ultimoLibre.set($event)"
        ></app-stepper>
        <div style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-top:var(--space-3);">
          <app-button variant="outline" size="sm" (buttonClick)="libre.previous()">
            Anterior
          </app-button>
          <app-button size="sm" (buttonClick)="libre.next()">Siguiente</app-button>
          <app-button variant="ghost" size="sm" (buttonClick)="reiniciar(libre)">
            Volver al inicio
          </app-button>
        </div>
        <p
          aria-live="polite"
          style="margin:var(--space-3) 0 0; font-size:var(--text-sm); color:var(--text-color-secondary);"
        >
          Último stepChange: {{ ultimoLibre() ?? 'ninguno todavía' }}
        </p>
      </section>
    </div>
  `,
})
class SaltoDePasoStory {
  readonly pasos = ALTA_DE_CLIENTE;
  readonly ultimoBloqueado = signal<number | null>(null);
  readonly ultimoLibre = signal<number | null>(null);

  // `reset()` emite `stepChange` con 0, asi que el rotulo se actualiza solo:
  // el panel deja de anunciar un paso ya abandonado sin tocarlo desde aqui.
  reiniciar(stepper: StepperComponent): void {
    stepper.reset();
  }
}

const meta: Meta<StepperComponent> = {
  title: '3. Organisms/Stepper avanzado',
  component: StepperComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [StepperComponent, ButtonComponent, SaltoDePasoStory] })],
  argTypes: {
    vertical: { control: 'boolean' },
    allowSkip: { control: 'boolean' },
    activeStep: { control: 'number' },
  },
  parameters: {
    docs: {
      description: {
        component: `
Segunda entrada del stepper, dedicada a lo que la primera no cubre: el eje
**vertical**, el paso **opcional**, un paso **que no se pudo completar** y el
**desborde** cuando hay más pasos que sitio.

Tres hechos de la API que conviene tener delante:

1. \`activeStep\` es un alias de entrada; el estado vivo es la señal interna
   \`currentStep\`, que también cambia al pulsar un paso. Pasar \`activeStep\`
   fija el punto de partida, no lo congela.
2. \`goToStep\` **ignora en silencio** cualquier índice por delante del actual
   mientras \`allowSkip\` sea falso. Hacia atrás siempre se puede.
3. \`Step\` no tiene campo de error. El paso fallido de aquí es una convención
   de plantilla —icono de aviso y descripción que dice qué hacer—, no un estado
   del componente.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StepperComponent>;

export const RecorridoVertical: Story = {
  name: 'Recorrido vertical con paso opcional',
  args: { steps: ALTA_DE_CLIENTE, activeStep: 1, vertical: true, allowSkip: false },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:28rem; padding:var(--space-4);">
        <app-stepper
          [steps]="steps"
          [activeStep]="activeStep"
          [vertical]="vertical"
          [allowSkip]="allowSkip"
        ></app-stepper>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
El eje vertical es el que soporta descripciones largas: la etiqueta y su
explicación caben en una línea de texto normal en vez de partirse bajo un
círculo. Es la disposición que pide un formulario en columna, y la que salva al
stepper cuando los pasos pasan de cinco.

Aquí se ve además el rótulo «Opcional», que el componente añade solo cuando el
paso declara \`optional: true\`.
        `,
      },
    },
  },
};

export const PasoOpcionalEnCurso: Story = {
  name: 'El paso opcional, en curso y ya rebasado',
  render: () => ({
    props: { pasos: ALTA_DE_CLIENTE },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-8); padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Detenido en el paso opcional
          </h3>
          <app-stepper [steps]="pasos" [activeStep]="2"></app-stepper>
        </section>
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Rebasado sin rellenarlo: se marca completado igual
          </h3>
          <app-stepper [steps]="pasos" [activeStep]="3"></app-stepper>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
\`optional\` es **solo un rótulo**: el stepper lo pinta bajo la etiqueta y no
cambia ninguna regla de avance. Al pasar de largo, el paso opcional recibe el
mismo aspa de completado que los obligatorios, porque el componente decide el
aspecto comparando índices y no sabe si el usuario rellenó algo.

Quien monte la pantalla es el responsable de que «omitido» y «completado» no se
confundan, si la diferencia importa en su proceso.
        `,
      },
    },
  },
};

export const PasoQueNoSePudoCompletar: Story = {
  name: 'Un paso que no se pudo completar',
  render: () => ({
    props: { pasos: VERIFICACION_FALLIDA },
    template: `
      <div style="max-width:28rem; padding:var(--space-4);">
        <app-stepper [steps]="pasos" [activeStep]="1" [vertical]="true"></app-stepper>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
El recorrido se detuvo en la verificación. El paso sigue siendo el **activo**
—que es lo cierto: no se ha avanzado— y los siguientes quedan deshabilitados
porque \`allowSkip\` es falso, así que la pantalla no invita a saltárselo.

El aviso no vive en el círculo, sino en la descripción, y dice **qué pasó y qué
hacer**: «El documento no coincide con el padrón. Corrija el número y reintente».
Un icono de advertencia sin frase no es un error comunicado, es un adorno.
        `,
      },
    },
  },
};

export const NuevePasosEnElMismoCarril: Story = {
  name: 'Nueve pasos: dónde desborda el horizontal',
  render: () => ({
    props: { pasos: NUEVE_PASOS },
    template: `
      <div style="display:flex; flex-direction:column; gap:var(--space-8); padding:var(--space-4);">
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Horizontal en 44 rem: las etiquetas se parten
          </h3>
          <div style="max-width:44rem; border:var(--border-width-thin) solid var(--border-color); border-radius:var(--radius-lg); background:var(--surface-background);">
            <app-stepper [steps]="pasos" [activeStep]="4"></app-stepper>
          </div>
        </section>
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Horizontal en 24 rem: el mismo stepper, ya ilegible
          </h3>
          <div style="max-width:24rem; border:var(--border-width-thin) solid var(--border-color); border-radius:var(--radius-lg); background:var(--surface-background);">
            <app-stepper [steps]="pasos" [activeStep]="4"></app-stepper>
          </div>
        </section>
        <section>
          <h3 style="margin:0 0 var(--space-3); font-size:var(--text-md); color:var(--text-color);">
            Vertical en 24 rem: nueve pasos siguen leyéndose
          </h3>
          <div style="max-width:24rem; border:var(--border-width-thin) solid var(--border-color); border-radius:var(--radius-lg); background:var(--surface-background);">
            <app-stepper [steps]="pasos" [activeStep]="4" [vertical]="true"></app-stepper>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
El stepper horizontal reparte el ancho entre los pasos (\`flex: 1 1 0\`) y no
tiene barra de desplazamiento propia: no se sale del contenedor, se **comprime**
dentro de él. Las etiquetas se parten palabra a palabra y las descripciones
apilan tres líneas cada una.

Los tres bloques son el mismo componente con los mismos nueve pasos. La
conclusión de comparar el segundo con el tercero es la regla práctica: por
encima de cinco o seis pasos, o en un contenedor estrecho, el eje correcto es
\`vertical\`. Por debajo de 48 rem de **ventana** el componente ya lo hace por su
cuenta, pero un contenedor estrecho dentro de una ventana ancha no dispara esa
media query: hay que pedirlo.
        `,
      },
    },
  },
};

export const SaltoAdelanteSoloConAllowSkip: Story = {
  name: 'Saltar adelante: qué cambia allowSkip',
  render: () => ({ template: `<app-story-salto-de-paso />` }),
  parameters: {
    docs: {
      description: {
        story: `
Los dos steppers tienen los mismos pasos y el mismo punto de partida; el de la
derecha añade \`allowSkip\`. Al pulsar «Firma» en el izquierdo no ocurre nada y
el rótulo de \`stepChange\` sigue vacío: **el clic se descarta en silencio**, sin
foco, sin aviso y sin evento.

Ese silencio es la razón de documentarlo con un evento a la vista. Un paso que
no acepta el clic se pinta como deshabilitado —el atributo \`disabled\` de la
clase CSS—, pero sigue teniendo \`role="button"\` y \`tabindex="0"\`, así que con
teclado se alcanza igual y tampoco responde.

Los botones inferiores usan \`next()\`, \`previous()\` y \`reset()\`, que son la
API imperativa del componente: \`next()\` respeta el límite superior y \`reset()\`
vuelve al primer paso emitiendo el índice 0.
        `,
      },
    },
  },
};
