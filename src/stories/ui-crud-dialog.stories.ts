import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { CrudDialog } from '../app/shared/ui/organisms/crud-dialog/crud-dialog';
import { Input } from '../app/shared/ui/atoms/form-input/input';

/*
  EL CICLO CRUD ENTERO, DENTRO DE LA CARCASA QUE LO SOSTIENE.

  `CrudDialog` no dibuja cabecera, cuerpo ni pie: es un `<dialog>` nativo con
  gestion de foco. Todo lo que se ve aqui dentro lo proyecta el consumidor, y por
  eso estas historias montan el contenido a mano en vez de apoyarse en
  `FormDialog`. Lo que se documenta es el CONTRATO de la carcasa, que son cuatro
  cosas y ninguna se ve en el estado por omision:

  1. EL DIALOGO CERRADO NO PINTA NADA. Un `<dialog>` sin `showModal()` es
     invisible, asi que cada historia trae su boton disparador y una funcion
     `play` que lo pulsa. En la pagina de documentacion las `play` no se ejecutan
     solas, de modo que las siete historias conviven sin apilar siete dialogos en
     la capa superior del navegador.

  2. EL FOCO INICIAL LO DECIDE EL ORDEN DEL MARCADO. `showModal()` recorre sus
     selectores en orden -primero `[data-dialog-initial-focus]`, luego los campos,
     y solo despues `button`-. En un formulario cae en el primer campo; en una
     confirmacion de borrado, donde no hay campos, cae en el PRIMER boton. Por eso
     «Cancelar» se escribe antes que «Eliminar»: un Intro por inercia no debe
     borrar nada.

  3. `cancelled` NO CIERRA. La carcasa cancela el evento nativo y delega: el
     consumidor decide si Escape cierra. Durante un guardado en curso, no.

  4. `closed` DEVUELVE EL FOCO al elemento que abrio el dialogo. La historia de
     alta lo comprueba.

  Sobre el guardado: el boton principal usa `[loading]`, no `[disabled]`. Es una
  decision del ADN escrita en `button.component.ts`: deshabilitar de verdad
  expulsa el foco y calla al lector de pantalla justo cuando hay algo que contar.
  `loading` anuncia `aria-busy` y `aria-disabled`, conserva el foco y bloquea la
  activacion. «Cancelar», que si debe salir del recorrido mientras se guarda, usa
  `disabled` de verdad.
*/

type ModoFicha = 'alta' | 'edicion';

const CLIENTE_EXISTENTE = {
  razon: 'Comercial Andina S.A.C.',
  ruc: '20558741023',
  correo: 'cobranzas@comercialandina.pe',
} as const;

const MENSAJE_CERRADO = 'El diálogo está cerrado: sin showModal() no pinta nada.';

let secuenciaDemo = 0;

/** Alta y edicion comparten formulario: cambian los rotulos y si llega relleno. */
@Component({
  selector: 'app-story-crud-dialog-ficha',
  standalone: true,
  imports: [Alert, ButtonComponent, CrudDialog, FormsModule, Input],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <app-button variant="primary" (buttonClick)="abrir()">{{ rotuloDisparador() }}</app-button>
      <p class="demo__rastro" role="status">{{ rastro() }}</p>

      <app-crud-dialog
        [size]="tamano()"
        [panelClass]="clasePanel()"
        [labelledBy]="idTitulo"
        [describedBy]="idDescripcion"
        (cancelled)="intentarCerrar()"
        (closed)="registrarCierre()"
      >
        <article class="ficha" [attr.aria-busy]="ocupado()">
          <header>
            <p class="ficha__antetitulo">Catálogo · Clientes</p>
            <h2 class="ficha__titulo" [id]="idTitulo">{{ titulo() }}</h2>
            <p class="ficha__descripcion" [id]="idDescripcion">{{ descripcion() }}</p>
          </header>

          @if (resumen()) {
            <app-alert kind="danger" title="No se pudo guardar" data-dialog-error>
              {{ resumen() }}
            </app-alert>
          }

          <div class="ficha__campos">
            <app-input
              label="Razón social"
              autocomplete="organization"
              [required]="true"
              [disabled]="ocupado()"
              [error]="errorRazon()"
              [ngModel]="razon()"
              (ngModelChange)="razon.set($event)"
            />
            <app-input
              label="RUC"
              inputMode="numeric"
              [required]="true"
              [maxLength]="11"
              [disabled]="ocupado()"
              [error]="errorRuc()"
              [hint]="errorRuc() ? null : 'Once dígitos, sin espacios.'"
              [ngModel]="ruc()"
              (ngModelChange)="ruc.set($event)"
            />
            <app-input
              label="Correo de cobranzas"
              type="email"
              autocomplete="email"
              [disabled]="ocupado()"
              [ngModel]="correo()"
              (ngModelChange)="correo.set($event)"
            />
          </div>

          <footer class="ficha__acciones">
            <app-button variant="outline" [disabled]="ocupado()" (buttonClick)="intentarCerrar()">
              Cancelar
            </app-button>
            <app-button variant="primary" [loading]="ocupado()" (buttonClick)="guardar()">
              {{ rotuloAccion() }}
            </app-button>
          </footer>
        </article>
      </app-crud-dialog>
    </div>
  `,
  styles: [
    `
      .demo {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .demo__rastro {
        margin: 0;
        min-height: var(--space-5);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .ficha {
        display: grid;
        gap: var(--space-4);
        padding: var(--space-5);
      }

      .ficha h2,
      .ficha header p {
        margin: 0;
      }

      .ficha__antetitulo {
        color: var(--text-color-muted);
        font-size: var(--text-xs);
        text-transform: uppercase;
      }

      .ficha__titulo {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-title);
      }

      .ficha__descripcion {
        padding-top: var(--space-1);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .ficha__campos {
        display: grid;
        gap: var(--space-3);
      }

      .ficha__acciones {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--space-2);
        padding-top: var(--space-3);
        border-top: 1px solid var(--border-color);
      }
    `,
  ],
})
class CrudDialogFichaStory {
  private readonly sufijo = `crud-dialog-ficha-${++secuenciaDemo}`;
  protected readonly idTitulo = `${this.sufijo}-titulo`;
  protected readonly idDescripcion = `${this.sufijo}-descripcion`;

  readonly modo = input<ModoFicha>('alta');
  readonly tamano = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly clasePanel = input('');
  /** Arranca con el guardado en curso, para que el estado se vea sin esperar. */
  readonly guardando = input(false);
  /** Arranca con el formulario rechazado por el servidor. */
  readonly rechazado = input(false);

  private readonly dialogo = viewChild.required(CrudDialog);

  protected readonly razon = signal('');
  protected readonly ruc = signal('');
  protected readonly correo = signal('');
  protected readonly ocupado = signal(false);
  protected readonly errorRazon = signal<string | null>(null);
  protected readonly errorRuc = signal<string | null>(null);
  protected readonly resumen = signal('');
  protected readonly rastro = signal(MENSAJE_CERRADO);

  protected readonly titulo = computed(() =>
    this.modo() === 'alta' ? 'Nuevo cliente' : `Editar ${CLIENTE_EXISTENTE.razon}`,
  );

  protected readonly descripcion = computed(() =>
    this.modo() === 'alta'
      ? 'El cliente queda disponible para emitir comprobantes en cuanto se registre.'
      : 'Los cambios rigen para los comprobantes que se emitan a partir de ahora; los ya emitidos conservan los datos con los que salieron.',
  );

  protected readonly rotuloAccion = computed(() =>
    this.modo() === 'alta' ? 'Crear cliente' : 'Guardar cambios',
  );

  protected readonly rotuloDisparador = computed(() =>
    this.modo() === 'alta' ? 'Nuevo cliente' : 'Editar cliente',
  );

  protected abrir(): void {
    const edicion = this.modo() === 'edicion';
    this.razon.set(edicion ? CLIENTE_EXISTENTE.razon : '');
    this.ruc.set(edicion ? CLIENTE_EXISTENTE.ruc : '');
    this.correo.set(edicion ? CLIENTE_EXISTENTE.correo : '');
    this.ocupado.set(this.guardando());
    this.rastro.set(
      this.guardando()
        ? 'Guardando: Escape no cierra y el envío repetido no llega al servidor.'
        : 'Diálogo abierto. El foco entró en el primer campo del formulario.',
    );

    if (this.rechazado()) {
      this.marcarRechazo();
    } else {
      this.limpiarErrores();
    }

    this.dialogo().showModal();

    if (this.rechazado()) {
      this.dialogo().focusError();
    }
  }

  protected guardar(): void {
    if (this.ocupado()) {
      return;
    }
    if (!this.validar()) {
      this.dialogo().focusError();
      return;
    }
    this.ocupado.set(true);
    this.rastro.set('Guardando: Escape no cierra y el envío repetido no llega al servidor.');
    setTimeout(() => {
      this.ocupado.set(false);
      this.dialogo().close('guardado');
    }, 900);
  }

  /** Escape y «Cancelar» pasan por aqui: mientras se guarda, no cierran. */
  protected intentarCerrar(): void {
    if (this.ocupado()) {
      this.rastro.set('Cancelación ignorada: hay un guardado en curso.');
      return;
    }
    this.dialogo().close('cancelado');
  }

  protected registrarCierre(): void {
    this.rastro.set('Diálogo cerrado. El foco volvió al botón que lo abrió.');
  }

  private validar(): boolean {
    const razonVacia = this.razon().trim().length === 0;
    const rucInvalido = !/^\d{11}$/.test(this.ruc().trim());
    this.errorRazon.set(razonVacia ? 'Indique la razón social tal como figura en RUC.' : null);
    this.errorRuc.set(rucInvalido ? 'El RUC debe tener once dígitos.' : null);
    const invalido = razonVacia || rucInvalido;
    this.resumen.set(
      invalido ? 'Hay campos obligatorios sin completar. Nada se envió al servidor.' : '',
    );
    return !invalido;
  }

  private marcarRechazo(): void {
    this.razon.set(CLIENTE_EXISTENTE.razon);
    this.ruc.set('2055874');
    this.errorRazon.set('Ya existe un cliente con esta razón social en la sede Ayacucho.');
    this.errorRuc.set('El RUC debe tener once dígitos.');
    this.resumen.set(
      'El servidor rechazó dos campos. Nada se guardó: corrija lo marcado y vuelva a enviar.',
    );
  }

  private limpiarErrores(): void {
    this.errorRazon.set(null);
    this.errorRuc.set(null);
    this.resumen.set('');
  }
}

/** El borrado no es un guardado con otro rotulo: se confirma aparte y nombra lo que se pierde. */
@Component({
  selector: 'app-story-crud-dialog-borrado',
  standalone: true,
  imports: [Alert, ButtonComponent, CrudDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <app-button variant="outline" tone="danger" (buttonClick)="abrir()">
        Eliminar cliente…
      </app-button>
      <p class="demo__rastro" role="status">{{ rastro() }}</p>

      <app-crud-dialog
        size="sm"
        [labelledBy]="idTitulo"
        [describedBy]="idDescripcion"
        (cancelled)="intentarCerrar()"
        (closed)="registrarCierre()"
      >
        <article class="borrado" [attr.aria-busy]="ocupado()">
          <h2 class="borrado__titulo" [id]="idTitulo">¿Eliminar a {{ nombre }}?</h2>
          <p class="borrado__cuerpo" [id]="idDescripcion">
            Se eliminan también sus 3 contactos y sus 12 direcciones de entrega. Los 48
            comprobantes ya emitidos se conservan. La acción no se puede deshacer.
          </p>

          @if (fallo()) {
            <app-alert kind="danger" title="No se pudo eliminar" data-dialog-error>
              {{ fallo() }}
            </app-alert>
          }

          <!--
            «Cancelar» va primero A PROPOSITO: sin campos en el dialogo, el primer
            boton del marcado es el que recibe el foco al abrir.
          -->
          <footer class="borrado__acciones">
            <app-button variant="outline" [disabled]="ocupado()" (buttonClick)="intentarCerrar()">
              Cancelar
            </app-button>
            <app-button variant="danger" [loading]="ocupado()" (buttonClick)="eliminar()">
              Eliminar cliente
            </app-button>
          </footer>
        </article>
      </app-crud-dialog>
    </div>
  `,
  styles: [
    `
      .demo {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .demo__rastro {
        margin: 0;
        min-height: var(--space-5);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .borrado {
        display: grid;
        gap: var(--space-3);
        padding: var(--space-5);
      }

      .borrado__titulo {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--font-weight-title);
      }

      .borrado__cuerpo {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: var(--text-sm);
      }

      .borrado__acciones {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--space-2);
        padding-top: var(--space-2);
      }
    `,
  ],
})
class CrudDialogBorradoStory {
  private readonly sufijo = `crud-dialog-borrado-${++secuenciaDemo}`;
  protected readonly idTitulo = `${this.sufijo}-titulo`;
  protected readonly idDescripcion = `${this.sufijo}-descripcion`;
  protected readonly nombre = CLIENTE_EXISTENTE.razon;

  /** Con `true`, el servidor rechaza el borrado y el dialogo se queda con el motivo. */
  readonly rechazaElServidor = input(false);

  private readonly dialogo = viewChild.required(CrudDialog);

  protected readonly ocupado = signal(false);
  protected readonly fallo = signal('');
  protected readonly rastro = signal(MENSAJE_CERRADO);

  protected abrir(): void {
    this.ocupado.set(false);
    this.fallo.set('');
    this.rastro.set('Diálogo abierto. El foco entró en «Cancelar», no en la acción destructiva.');
    this.dialogo().showModal();
  }

  protected eliminar(): void {
    if (this.ocupado()) {
      return;
    }
    this.ocupado.set(true);
    this.rastro.set('Eliminando…');
    setTimeout(() => {
      this.ocupado.set(false);
      if (this.rechazaElServidor()) {
        this.fallo.set(
          'El cliente tiene 2 comprobantes en proceso de anulación. Espere a que terminen y vuelva a intentarlo.',
        );
        this.rastro.set('El borrado falló: el diálogo se conserva y el foco fue al motivo.');
        this.dialogo().focusError();
        return;
      }
      this.rastro.set('Cliente eliminado.');
      this.dialogo().close('eliminado');
    }, 900);
  }

  protected intentarCerrar(): void {
    if (this.ocupado()) {
      return;
    }
    this.dialogo().close('cancelado');
  }

  protected registrarCierre(): void {
    if (!this.fallo()) {
      this.rastro.set('Diálogo cerrado. El foco volvió al botón que lo abrió.');
    }
  }
}

/** Contenido que no cabe: la carcasa monta ScrollOverlay sobre su propia superficie. */
@Component({
  selector: 'app-story-crud-dialog-desborde',
  standalone: true,
  imports: [ButtonComponent, CrudDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <app-button variant="primary" (buttonClick)="abrir()">Revisar liquidación</app-button>

      <app-crud-dialog
        size="xl"
        panelClass="crud-dialog--demo-liquidacion"
        [labelledBy]="idTitulo"
        [describedBy]="idDescripcion"
        (cancelled)="cerrar()"
      >
        <article class="liquidacion">
          <header>
            <h2 class="liquidacion__titulo" [id]="idTitulo">Liquidación de cartera · agosto</h2>
            <p class="liquidacion__descripcion" [id]="idDescripcion">
              {{ cuotas.length }} cuotas conciliadas. El panel no crece más allá de la altura de la
              ventana: la superficie interna desplaza y el diálogo conserva sus márgenes.
            </p>
          </header>

          <ul class="liquidacion__lista">
            @for (cuota of cuotas; track cuota.id) {
              <li class="liquidacion__fila">
                <span class="liquidacion__id">{{ cuota.id }}</span>
                <span>{{ cuota.cliente }}</span>
                <span class="liquidacion__importe">{{ cuota.importe }}</span>
              </li>
            }
          </ul>

          <footer class="liquidacion__acciones">
            <app-button variant="outline" (buttonClick)="cerrar()">Cerrar</app-button>
          </footer>
        </article>
      </app-crud-dialog>
    </div>
  `,
  styles: [
    `
      .demo {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .liquidacion {
        display: grid;
        gap: var(--space-4);
        padding: var(--space-5);
      }

      .liquidacion__titulo {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: var(--font-weight-title);
      }

      .liquidacion__descripcion {
        margin: 0;
        padding-top: var(--space-1);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .liquidacion__lista {
        display: grid;
        gap: var(--space-1);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .liquidacion__fila {
        display: grid;
        grid-template-columns: 6rem 1fr auto;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        background: var(--surface-section);
        font-size: var(--text-sm);
      }

      .liquidacion__id {
        color: var(--text-color-muted);
      }

      .liquidacion__importe {
        font-variant-numeric: tabular-nums;
        font-weight: var(--font-weight-emphasis);
      }

      .liquidacion__acciones {
        display: flex;
        justify-content: flex-end;
        padding-top: var(--space-3);
        border-top: 1px solid var(--border-color);
      }
    `,
  ],
})
class CrudDialogDesbordeStory {
  private readonly sufijo = `crud-dialog-desborde-${++secuenciaDemo}`;
  protected readonly idTitulo = `${this.sufijo}-titulo`;
  protected readonly idDescripcion = `${this.sufijo}-descripcion`;

  private readonly dialogo = viewChild.required(CrudDialog);

  protected readonly cuotas = Array.from({ length: 40 }, (_, indice) => ({
    id: `CU-${String(indice + 1).padStart(4, '0')}`,
    cliente: `Cliente ${indice + 1} de la cartera Ayacucho centro`,
    importe: `S/ ${(320 + indice * 47.5).toFixed(2)}`,
  }));

  protected abrir(): void {
    this.dialogo().showModal();
  }

  protected cerrar(): void {
    this.dialogo().close();
  }
}

const meta: Meta<CrudDialog> = {
  title: '3. Organisms/CrudDialog',
  component: CrudDialog,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [CrudDialogBorradoStory, CrudDialogDesbordeStory, CrudDialogFichaStory],
    }),
  ],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    panelClass: { control: 'text' },
    labelledBy: { control: 'text' },
    describedBy: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Carcasa modal del ciclo CRUD. Cada historia trae su botón disparador porque un ' +
          'diálogo cerrado no pinta nada; en el canvas se abre solo.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<CrudDialog>;

export const AltaDeRegistro: Story = {
  name: 'Alta: el foco entra en el primer campo y vuelve al salir',
  render: () => ({
    template: `<app-story-crud-dialog-ficha modo="alta" tamano="md" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Al abrir, el foco aterriza en el primer campo del formulario', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Nuevo cliente' }));
      const dialogo = await canvas.findByRole('dialog');
      const razonSocial = within(dialogo).getByLabelText(/Razón social/);
      await waitFor(() => expect(razonSocial).toHaveFocus());
    });

    await step('Al cerrar, el foco vuelve al disparador', async () => {
      const dialogo = canvas.getByRole('dialog');
      await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
      await waitFor(() =>
        expect(canvas.getByRole('button', { name: 'Nuevo cliente' })).toHaveFocus(),
      );
    });
  },
};

export const EdicionDeRegistroExistente: Story = {
  name: 'Edición: llega relleno y avisa de qué no cambia',
  render: () => ({
    template: `<app-story-crud-dialog-ficha modo="edicion" tamano="lg" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Editar cliente' }));
    const dialogo = await canvas.findByRole('dialog');
    expect(within(dialogo).getByLabelText(/Razón social/)).toHaveValue('Comercial Andina S.A.C.');
    expect(within(dialogo).getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  },
};

export const GuardadoEnCurso: Story = {
  name: 'Guardando: ni doble envío ni cierre por Escape',
  render: () => ({
    template: `<app-story-crud-dialog-ficha modo="edicion" [guardando]="true" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Editar cliente' }));
    const dialogo = await canvas.findByRole('dialog');

    await step('El botón principal se anuncia ocupado sin perder el foco', async () => {
      const guardar = within(dialogo).getByRole('button', { name: 'Guardar cambios' });
      expect(guardar).toHaveAttribute('aria-busy', 'true');
      expect(guardar).toHaveAttribute('aria-disabled', 'true');
      expect(guardar).not.toBeDisabled();
    });

    await step('«Cancelar» sí sale del recorrido del tabulador', async () => {
      expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });

    await step('Escape no cierra un diálogo con guardado en curso', async () => {
      dialogo.focus();
      await userEvent.keyboard('{Escape}');
      expect(canvas.getByRole('dialog')).toBe(dialogo);
    });
  },
};

export const ErroresDeValidacion: Story = {
  name: 'Validación rechazada: el motivo se ve y recibe el foco',
  render: () => ({
    template: `<app-story-crud-dialog-ficha modo="edicion" [rechazado]="true" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Editar cliente' }));
    const dialogo = await canvas.findByRole('dialog');

    await step('El resumen del rechazo es una alerta, no un texto suelto', async () => {
      const resumen = await within(dialogo).findByRole('alert');
      expect(resumen).toHaveTextContent('El servidor rechazó dos campos');
    });

    await step('Cada campo rechazado dice qué le pasa', async () => {
      expect(within(dialogo).getByLabelText(/RUC/)).toHaveAttribute('aria-invalid', 'true');
      expect(within(dialogo).getByText('El RUC debe tener once dígitos.')).toBeInTheDocument();
    });
  },
};

export const ConfirmacionDeBorrado: Story = {
  name: 'Borrado: nombra lo que elimina y no enfoca el botón destructivo',
  render: () => ({
    template: `<app-story-crud-dialog-borrado />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Eliminar cliente…' }));
    const dialogo = await canvas.findByRole('dialog');

    await step('El foco inicial es «Cancelar»: un Intro por inercia no borra', async () => {
      await waitFor(() =>
        expect(within(dialogo).getByRole('button', { name: 'Cancelar' })).toHaveFocus(),
      );
    });

    await step('La acción destructiva dice qué elimina, no «Aceptar»', async () => {
      expect(within(dialogo).getByRole('button', { name: 'Eliminar cliente' })).toBeInTheDocument();
      expect(dialogo).toHaveTextContent('La acción no se puede deshacer');
    });
  },
};

export const BorradoRechazado: Story = {
  name: 'Borrado que falla: el diálogo se queda con el motivo',
  render: () => ({
    template: `<app-story-crud-dialog-borrado [rechazaElServidor]="true" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Eliminar cliente…' }));
    const dialogo = await canvas.findByRole('dialog');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Eliminar cliente' }));

    const motivo = await within(dialogo).findByRole('alert', undefined, { timeout: 2000 });
    expect(motivo).toHaveTextContent('comprobantes en proceso de anulación');
    expect(canvas.getByRole('dialog')).toBe(dialogo);
  },
};

export const ContenidoQueDesborda: Story = {
  name: 'Contenido largo: desplaza por dentro y respeta la ventana',
  render: () => ({
    template: `<app-story-crud-dialog-desborde />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Revisar liquidación' }));
    const dialogo = await canvas.findByRole('dialog');
    expect(dialogo).toHaveClass('crud-dialog--xl');
    expect(dialogo).toHaveClass('crud-dialog--demo-liquidacion');
  },
};
