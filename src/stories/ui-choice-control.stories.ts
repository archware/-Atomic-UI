import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChoiceControl } from '../app/shared/ui/atoms/choice-control/choice-control';

/*
  CHOICE-CONTROL NO GUARDA LA ELECCION: LA MUESTRA.

  `checked` es una entrada, no un modelo. Quien monta el control decide que
  queda marcado y escucha `changed` para actualizarlo. Documentarlo solo en su
  estado por omision -una casilla vacia- deja fuera lo unico que el consumidor
  necesita resolver: como se ve cuando esta elegida, cuando no se puede tocar y
  cuando el formulario la rechaza.

  Los cuatro primeros estados van sueltos y a proposito. El bucle completo
  -marcar, avisar al padre, volver a pintar- se documenta al final, con el grupo
  de radios, que es donde el bucle importa porque las opciones se excluyen.

  El tema oscuro no se toca aqui: el control pinta con `--input-bg`,
  `--input-border`, `--primary-color` y `--danger-color-text`, y esos tokens ya
  cambian solos.
*/

const PERMISOS = [
  { id: 'clientes-ver', etiqueta: 'Ver clientes', concedido: true },
  { id: 'clientes-crear', etiqueta: 'Registrar clientes', concedido: true },
  { id: 'clientes-editar', etiqueta: 'Editar clientes', concedido: false },
  { id: 'clientes-baja', etiqueta: 'Dar de baja clientes', concedido: false },
  { id: 'prestamos-ver', etiqueta: 'Consultar préstamos', concedido: true },
  { id: 'prestamos-aprobar', etiqueta: 'Aprobar préstamos', concedido: false },
  { id: 'prestamos-reversar', etiqueta: 'Reversar desembolsos', concedido: false },
  { id: 'caja-abrir', etiqueta: 'Abrir caja', concedido: true },
  { id: 'caja-cerrar', etiqueta: 'Cerrar caja', concedido: true },
  { id: 'caja-arqueo', etiqueta: 'Arquear caja', concedido: false },
  { id: 'reportes-ver', etiqueta: 'Ver reportes', concedido: true },
  { id: 'reportes-exportar', etiqueta: 'Exportar reportes', concedido: false },
  { id: 'usuarios-ver', etiqueta: 'Ver usuarios', concedido: false },
  { id: 'usuarios-permisos', etiqueta: 'Asignar permisos', concedido: false },
];

const MODALIDADES = [
  { valor: 'diario', etiqueta: 'Cobro diario' },
  { valor: 'semanal', etiqueta: 'Cobro semanal' },
  { valor: 'quincenal', etiqueta: 'Cobro quincenal' },
  { valor: 'mensual', etiqueta: 'Cobro mensual' },
];

/*
  La eleccion unica necesita un dueño. Este anfitrion es ese dueño: guarda la
  modalidad elegida, la reparte como `checked` y la actualiza al recibir
  `changed`. Sin el, cuatro radios con el mismo `name` se dejarian marcar por el
  navegador pero el marcado volveria al valor de la entrada en el siguiente
  pintado, que es justo el fallo que el consumidor reporta como «no se guarda».
*/
@Component({
  selector: 'app-choice-control-grupo-demo',
  standalone: true,
  imports: [ChoiceControl],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="grupo">
      <legend class="grupo__titulo">Modalidad de cobro</legend>
      @for (modalidad of modalidades; track modalidad.valor) {
        <app-choice-control
          type="radio"
          name="modalidad-cobro"
          [value]="modalidad.valor"
          [label]="modalidad.etiqueta"
          [checked]="elegida() === modalidad.valor"
          (changed)="elegir(modalidad.valor)"
        />
      }
      <p class="grupo__eco">Modalidad enviada al servidor: {{ elegida() }}</p>
    </fieldset>
  `,
  styles: [
    `
      .grupo {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
        margin: 0;
        padding: var(--space-4);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--surface-background);
      }

      .grupo__titulo {
        padding: 0 var(--space-1);
        color: var(--text-color);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-emphasis);
      }

      .grupo__eco {
        margin: var(--space-2) 0 0;
        color: var(--text-color-secondary);
        font-size: var(--text-xs);
      }
    `,
  ],
})
class ChoiceControlGrupoDemo {
  protected readonly modalidades = MODALIDADES;
  protected readonly elegida = signal('semanal');

  protected elegir(valor: string): void {
    this.elegida.set(valor);
  }
}

const meta: Meta<ChoiceControl> = {
  title: '1. Atoms/Choice Control',
  component: ChoiceControl,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ChoiceControl, ChoiceControlGrupoDemo],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Casilla o radio gobernado desde fuera. Documenta los cuatro estados que el ' +
          'consumidor debe saber pintar (vacío, elegido, deshabilitado y rechazado por ' +
          'validación) y el bucle completo de una elección única.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['checkbox', 'radio'],
      description: 'Forma del control: casilla múltiple o elección única.',
    },
    label: { control: 'text', description: 'Etiqueta visible junto al indicador.' },
    ariaLabel: {
      control: 'text',
      description: 'Nombre accesible cuando no hay etiqueta visible.',
    },
    name: { control: 'text', description: 'Agrupa varios radios bajo la misma elección.' },
    value: { control: 'text', description: 'Valor que viaja al servidor cuando está marcado.' },
    checked: { control: 'boolean', description: 'Estado marcado; lo gobierna el padre.' },
    disabled: { control: 'boolean', description: 'Impide la interacción sin ocultar el dato.' },
    error: {
      control: 'text',
      description: 'Mensaje de rechazo. Enciende aria-invalid y se anuncia con role="alert".',
    },
    controlId: {
      control: 'text',
      description: 'Identificador estable para enlazar el foco desde un resumen de errores.',
    },
  },
};

export default meta;
type Story = StoryObj<ChoiceControl>;

/** Nada elegido todavía: el estado con el que abre cualquier formulario. */
export const SinMarcar: Story = {
  name: 'Vacío: nada elegido todavía',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start;">
        <app-choice-control label="Acepto recibir avisos de vencimiento" value="avisos" />
        <app-choice-control type="radio" name="canal-vacio" value="sms" label="Avisar por SMS" />
      </div>
    `,
  }),
};

/** La marca puesta, en las dos formas: el tilde de la casilla y el punto del radio. */
export const Elegido: Story = {
  name: 'Elegido: la marca puesta',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start;">
        <app-choice-control
          label="Acepto recibir avisos de vencimiento"
          value="avisos"
          [checked]="true"
        />
        <app-choice-control
          type="radio"
          name="canal-elegido"
          value="sms"
          label="Avisar por SMS"
          [checked]="true"
        />
      </div>
    `,
  }),
};

/*
  Deshabilitado se documenta en sus DOS combinaciones. La vacia y la marcada no
  se parecen: la marcada es la que dice «esto ya esta concedido y no lo puedes
  quitar desde aqui», y es la que se olvida al documentar solo `disabled: true`.
*/
export const Deshabilitado: Story = {
  name: 'Deshabilitado: se lee, no se cambia',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); align-items: flex-start;">
        <app-choice-control
          label="Exonerar mora (requiere perfil de jefatura)"
          value="exonerar"
          [disabled]="true"
        />
        <app-choice-control
          label="Acceso de solo lectura (concedido por el plan)"
          value="lectura"
          [checked]="true"
          [disabled]="true"
        />
        <app-choice-control
          type="radio"
          name="canal-bloqueado"
          value="correo"
          label="Avisar por correo (canal no contratado)"
          [disabled]="true"
        />
      </div>
    `,
  }),
};

/*
  UN CONTROL QUE NO PUEDE DECIR QUE ESTA MAL DEJA A LA PERSONA ADIVINANDO.

  Con `error` el control enciende `aria-invalid`, enlaza el mensaje por
  `aria-describedby` y lo anuncia con `role="alert"`. Sin esta historia el
  estado existia en el codigo y no habia donde verlo.
*/
export const ConError: Story = {
  name: 'Error de validación: la casilla obligatoria sin marcar',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start;">
        <app-choice-control
          label="Acepto los términos del contrato"
          value="terminos"
          error="Debe aceptar los términos para continuar."
        />
        <app-choice-control
          type="radio"
          name="modalidad-error"
          value="diario"
          label="Cobro diario"
          error="Elija una modalidad de cobro."
        />
      </div>
    `,
  }),
};

/** Catorce permisos en un mismo bloque: el caso en el que la lista deja de caber. */
export const MuchasOpciones: Story = {
  name: 'Volumen: catorce permisos en un solo grupo',
  render: () => ({
    props: { permisos: PERMISOS },
    template: `
      <fieldset
        style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2);
               max-height: 16rem; overflow-y: auto; margin: 0; padding: var(--space-4);
               border: var(--border-width-thin) solid var(--border-color);
               border-radius: var(--radius-md); background: var(--surface-background);"
      >
        <legend
          style="padding: 0 var(--space-1); color: var(--text-color); font-size: var(--text-sm);
                 font-weight: var(--font-weight-emphasis);"
        >
          Permisos del perfil «Cajera»
        </legend>
        @for (permiso of permisos; track permiso.id) {
          <app-choice-control
            [controlId]="permiso.id"
            [value]="permiso.id"
            [label]="permiso.etiqueta"
            [checked]="permiso.concedido"
          />
        }
      </fieldset>
    `,
  }),
};

/*
  El grupo de radios es donde `name`, `value` y `changed` se ven trabajar
  juntos: el navegador desmarca al hermano, pero quien decide que queda marcado
  es la señal del padre.
*/
export const GrupoDeRadios: Story = {
  name: 'Elección única: el grupo gobernado desde fuera',
  render: () => ({
    template: `<app-choice-control-grupo-demo />`,
  }),
};

/*
  Sin etiqueta visible el control sigue teniendo nombre: `ariaLabel`. Es el caso
  de la casilla de seleccion en la cabecera de una tabla, donde no cabe texto
  pero un lector de pantalla necesita saber que hace.
*/
export const SinEtiquetaVisible: Story = {
  name: 'Sin etiqueta visible: el nombre lo da ariaLabel',
  render: () => ({
    template: `
      <div
        style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3);
               border: var(--border-width-thin) solid var(--border-color);
               border-radius: var(--radius-md); background: var(--surface-section);"
      >
        <app-choice-control ariaLabel="Seleccionar todas las filas" value="todas" />
        <span style="color: var(--text-color-secondary); font-size: var(--text-sm);">
          Cabecera de tabla: la casilla no lleva texto, pero se anuncia como «Seleccionar todas las filas».
        </span>
      </div>
    `,
  }),
};

/*
  `controlId` existe para que otra pieza pueda apuntar al control. Las rutinas
  que llevan el foco al primer campo invalido buscan `[aria-invalid="true"]`, y
  el resumen de errores necesita un ancla estable: sin id fijo, el generado
  cambia en cada montaje y el enlace deja de apuntar a nada.
*/
export const IdentidadParaElResumenDeErrores: Story = {
  name: 'controlId: el ancla del resumen de errores',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start;">
        <p style="margin: 0; color: var(--danger-color-text); font-size: var(--text-sm);">
          Hay 1 error en el formulario:
          <a href="#acepta-terminos" style="color: inherit; text-decoration: underline;"
            >Acepto los términos del contrato</a
          >
        </p>
        <app-choice-control
          controlId="acepta-terminos"
          label="Acepto los términos del contrato"
          value="terminos"
          error="Debe aceptar los términos para continuar."
        />
      </div>
    `,
  }),
};
