import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { Select } from '../app/shared/ui/atoms/form-select/select';
import type { SelectOption } from '../app/shared/ui/atoms/form-select/select';

/*
  DOS SELECTS CONVIVEN EN EL ADN Y NO SON EL MISMO.

  `atoms/select` es el sencillo y ya tiene entrada propia. Este es
  `atoms/form-select`: el que implementa `ControlValueAccessor`, el que sabe
  deshabilitarse desde el formulario, el que distingue pista de error y el que
  admite ser gobernado por señal con `[selected]` + `(selectionChange)`. Comparte
  el selector `app-select` con el otro, asi que aqui se monta SIEMPRE como
  `app-form-select` para que no haya duda de cual se esta viendo.

  Los estados que faltaban -vacio, elegido, deshabilitado, rechazado y con la
  lista larga- van primero. Detras van los dos casos que solo tiene este:
  el formulario reactivo y el valor heredado que no esta en la lista.

  Ni un color escrito: el campo pinta con `--input-*` y `--danger-color-text`,
  que el tema redefine solo.
*/

const ESTADOS: readonly SelectOption[] = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'castigado', label: 'Castigado (requiere jefatura)', disabled: true },
];

const DEPARTAMENTOS: readonly SelectOption[] = [
  { value: 'amazonas', label: 'Amazonas' },
  { value: 'ancash', label: 'Áncash' },
  { value: 'apurimac', label: 'Apurímac' },
  { value: 'arequipa', label: 'Arequipa' },
  { value: 'ayacucho', label: 'Ayacucho' },
  { value: 'cajamarca', label: 'Cajamarca' },
  { value: 'callao', label: 'Callao' },
  { value: 'cusco', label: 'Cusco' },
  { value: 'huancavelica', label: 'Huancavelica' },
  { value: 'huanuco', label: 'Huánuco' },
  { value: 'ica', label: 'Ica' },
  { value: 'junin', label: 'Junín' },
  { value: 'la-libertad', label: 'La Libertad' },
  { value: 'lambayeque', label: 'Lambayeque' },
  { value: 'lima', label: 'Lima' },
  { value: 'loreto', label: 'Loreto' },
  { value: 'madre-de-dios', label: 'Madre de Dios' },
  { value: 'moquegua', label: 'Moquegua' },
  { value: 'pasco', label: 'Pasco' },
  { value: 'piura', label: 'Piura' },
  { value: 'puno', label: 'Puno' },
  { value: 'san-martin', label: 'San Martín' },
  { value: 'tacna', label: 'Tacna' },
  { value: 'tumbes', label: 'Tumbes' },
  { value: 'ucayali', label: 'Ucayali' },
];

const AGENCIAS: readonly SelectOption[] = [
  { value: 'lima-centro', label: 'Lima Centro' },
  { value: 'lima-norte', label: 'Lima Norte' },
  { value: 'trujillo', label: 'Trujillo' },
  { value: 'arequipa', label: 'Arequipa' },
];

/*
  EL FORMULARIO MANDA, Y MANDA EN LAS DOS DIRECCIONES.

  Este anfitrion existe para enseñar lo que ninguna perilla puede: que
  `writeValue` pinta lo que el formulario trae, que `control.disable()` apaga el
  campo sin que nadie le pase `[disabled]`, y que al tocar y salir el control
  queda `touched`. Son las tres piezas del `ControlValueAccessor`, y las tres
  estaban sin documentar.
*/
@Component({
  selector: 'app-form-select-reactivo-demo',
  standalone: true,
  imports: [ReactiveFormsModule, Select, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="demo" [formGroup]="formulario">
      <app-form-select
        formControlName="agencia"
        label="Agencia de atención"
        placeholder="Seleccione una agencia"
        hint="El formulario es el dueño del valor; el campo solo lo refleja."
        [options]="agencias"
      />

      <div class="demo__acciones">
        <app-button
          variant="outline"
          size="sm"
          (buttonClick)="alternarBloqueo()"
        >{{ agencia.disabled ? 'Habilitar desde el formulario' : 'Bloquear desde el formulario' }}</app-button>
        <app-button variant="ghost" size="sm" (buttonClick)="asignarTrujillo()"
          >Escribir «Trujillo» desde el formulario</app-button
        >
        <app-button variant="ghost" size="sm" (buttonClick)="limpiar()">Limpiar</app-button>
      </div>

      <dl class="demo__estado">
        <dt>Valor del control</dt>
        <dd>{{ agencia.value || '(vacío)' }}</dd>
        <dt>Estado</dt>
        <dd>{{ agencia.disabled ? 'deshabilitado' : 'habilitado' }}</dd>
        <dt>Tocado</dt>
        <dd>{{ agencia.touched ? 'sí' : 'no' }}</dd>
      </dl>
    </form>
  `,
  styles: [
    `
      .demo {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        max-width: 26rem;
        padding: var(--space-4);
        border: var(--border-width-thin) solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--surface-background);
      }

      .demo__acciones {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .demo__estado {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--space-1) var(--space-3);
        margin: 0;
        color: var(--text-color-secondary);
        font-size: var(--text-xs);
      }

      .demo__estado dt {
        font-weight: var(--font-weight-emphasis);
      }

      .demo__estado dd {
        margin: 0;
        color: var(--text-color);
      }
    `,
  ],
})
class FormSelectReactivoDemo {
  protected readonly agencias = AGENCIAS;
  protected readonly formulario = new FormGroup({
    agencia: new FormControl('lima-centro'),
  });

  protected get agencia(): FormControl<string | null> {
    return this.formulario.controls.agencia;
  }

  protected alternarBloqueo(): void {
    if (this.agencia.disabled) {
      this.agencia.enable();
      return;
    }
    this.agencia.disable();
  }

  protected asignarTrujillo(): void {
    this.agencia.setValue('trujillo');
  }

  protected limpiar(): void {
    this.agencia.setValue('');
  }
}

const meta: Meta<Select> = {
  title: '1. Atoms/Form Select',
  component: Select,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [Select, FormSelectReactivoDemo],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Selección con ControlValueAccessor. Se monta como `app-form-select` para no ' +
          'confundirlo con `atoms/select`, que comparte el alias `app-select`.',
      },
    },
  },
  argTypes: {
    options: { description: 'Opciones disponibles; cada una admite `disabled`.' },
    selected: {
      control: 'text',
      description: 'Valor gobernado desde el padre. Con `null` manda el formulario.',
    },
    label: { control: 'text', description: 'Etiqueta visible enlazada al campo.' },
    ariaLabel: { control: 'text', description: 'Nombre accesible si no hay etiqueta visible.' },
    placeholder: { control: 'text', description: 'Opción inicial del campo vacío.' },
    hint: { control: 'text', description: 'Pista permanente; el error la sustituye.' },
    error: { control: 'text', description: 'Mensaje de rechazo; enciende aria-invalid.' },
    disabled: { control: 'boolean', description: 'Bloqueo declarado por quien lo monta.' },
    required: { control: 'boolean', description: 'Marca el asterisco y bloquea el placeholder.' },
    controlId: { control: 'text', description: 'Identificador estable del campo.' },
  },
};

export default meta;
type Story = StoryObj<Select>;

/*
  El campo vacio es el estado inicial real: el placeholder ocupa el sitio de la
  eleccion y la pista explica que se espera. La pista es la entrada que la otra
  historia de select no tiene.
*/
export const ValorVacio: Story = {
  name: 'Vacío: el placeholder y la pista',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Estado del crédito"
          placeholder="Seleccione un estado"
          hint="Se filtrará la cartera por el estado elegido."
          [options]="opciones"
        />
      </div>
    `,
  }),
};

/** Con una elección hecha: `selected` gobierna el valor desde fuera. */
export const ValorElegido: Story = {
  name: 'Elegido: el valor gobernado desde fuera',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Estado del crédito"
          placeholder="Seleccione un estado"
          hint="Se filtrará la cartera por el estado elegido."
          [options]="opciones"
          [selected]="'atrasado'"
        />
      </div>
    `,
  }),
};

/*
  Deshabilitado con valor y deshabilitado vacio dicen cosas distintas: el
  primero conserva el dato para poder leerlo, el segundo solo cierra el campo.
  Los dos aparecen aqui porque el consumidor se encuentra con los dos.
*/
export const Deshabilitado: Story = {
  name: 'Deshabilitado: el dato sigue siendo legible',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 22rem;">
        <app-form-select
          label="Estado del crédito (fijado por el proceso de cierre)"
          [options]="opciones"
          [selected]="'cancelado'"
          [disabled]="true"
        />
        <app-form-select
          label="Motivo de castigo"
          placeholder="Disponible al castigar el crédito"
          [options]="opciones"
          [disabled]="true"
        />
      </div>
    `,
  }),
};

/*
  El error sustituye a la pista, no se suma: el campo tiene un solo renglon de
  mensaje y quien valida se lo queda. Con `required` ademas se marca el
  asterisco y el placeholder deja de ser elegible.
*/
export const ConError: Story = {
  name: 'Error de validación: el rechazo sustituye a la pista',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Estado del crédito"
          placeholder="Seleccione un estado"
          hint="Esta pista no se ve: el error ocupa su sitio."
          error="Elija un estado para poder guardar."
          [options]="opciones"
          [required]="true"
        />
      </div>
    `,
  }),
};

/*
  Veinticinco opciones es el volumen con el que el consumidor trabaja de verdad
  -los departamentos del pais- y es donde se ve que la lista nativa se hace
  cargo del desplazamiento sin que el campo cambie de alto.
*/
export const MuchasOpciones: Story = {
  name: 'Volumen: veinticinco opciones en la lista',
  render: () => ({
    props: { opciones: DEPARTAMENTOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Departamento"
          placeholder="Seleccione un departamento"
          hint="La lista nativa se desplaza sola; el campo no crece."
          [options]="opciones"
          [selected]="'la-libertad'"
        />
      </div>
    `,
  }),
};

/** Una opción puede venir vetada: se ve, se lee y no se puede elegir. */
export const ConOpcionVetada: Story = {
  name: 'Opción no elegible: visible pero cerrada',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Estado del crédito"
          placeholder="Seleccione un estado"
          hint="«Castigado» aparece en la lista pero no se puede elegir sin perfil de jefatura."
          [options]="opciones"
        />
      </div>
    `,
  }),
};

/*
  Sin etiqueta visible el campo sigue teniendo nombre: `ariaLabel`. Es el filtro
  que vive en una barra de herramientas, donde el rotulo lo da el contexto.
  `controlId` fija el identificador para que el resumen de errores pueda
  apuntarle.
*/
export const SinEtiquetaVisible: Story = {
  name: 'Sin etiqueta visible: filtro de barra de herramientas',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div
        style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3);
               border: var(--border-width-thin) solid var(--border-color);
               border-radius: var(--radius-md); background: var(--surface-section);"
      >
        <span style="color: var(--text-color-secondary); font-size: var(--text-sm);">Cartera</span>
        <app-form-select
          controlId="filtro-estado"
          ariaLabel="Filtrar cartera por estado"
          placeholder="Todos los estados"
          [options]="opciones"
        />
      </div>
    `,
  }),
};

/*
  UN VALOR QUE NO ESTA EN LA LISTA NO SE BORRA: SE MUESTRA.

  Cuando el registro guardado trae un codigo que el catalogo ya no ofrece, el
  campo fabrica una opcion con ese valor en vez de quedarse vacio. Vaciarlo
  seria perder el dato en silencio la primera vez que alguien abre la ficha.
*/
export const ValorHeredado: Story = {
  name: 'Valor heredado: el código que ya no está en el catálogo',
  render: () => ({
    props: { opciones: ESTADOS },
    template: `
      <div style="max-width: 22rem;">
        <app-form-select
          label="Estado del crédito"
          placeholder="Seleccione un estado"
          hint="«refinanciado» ya no existe en el catálogo: el campo lo conserva en vez de vaciarse."
          [options]="opciones"
          [selected]="'refinanciado'"
        />
      </div>
    `,
  }),
};

/** El formulario reactivo escribe, bloquea y marca como tocado; el campo obedece. */
export const EnFormularioReactivo: Story = {
  name: 'Formulario reactivo: escribir, bloquear y tocar',
  render: () => ({
    template: `<app-form-select-reactivo-demo />`,
  }),
};
