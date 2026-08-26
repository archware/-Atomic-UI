import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { ChoiceControl } from '../app/shared/ui/atoms/choice-control/choice-control';
import { Input } from '../app/shared/ui/atoms/form-input/input';
import { PageHeader } from '../app/shared/ui/organisms/page-header/page-header';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';
import { RadioComponent } from '../app/shared/ui/atoms/radio/radio.component';
import type { RadioOption } from '../app/shared/ui/atoms/radio/radio.component';
import { Select } from '../app/shared/ui/atoms/form-select/select';
import type { SelectOption } from '../app/shared/ui/atoms/form-select/select';
import { TextareaComponent } from '../app/shared/ui/atoms/textarea/textarea.component';
import { ThemeSwitcherComponent } from '../app/shared/ui/organisms/theme-switcher/theme-switcher.component';

/*
  FORMULARIO TRANSACCIONAL: EL CASO QUE SE JUEGA EN UNA CIFRA.

  El capitulo 12 de la doctrina separa tres clases de acto. Un cobro cae en la
  segunda: no se confirma con «¿esta seguro?», se REVISA. Por eso esta plantilla
  no lleva dialogo de confirmacion y si lleva un resumen de importes pegado al
  formulario, que es lo unico que permite ver si el importe, la comision y el
  total son los que se van a registrar.

  Los otros dos criterios que gobiernan la disposicion:

  - Ningun error de campo se pinta antes del primer intento de envio. Tenir de
    rojo lo que la persona aun no ha terminado de escribir es ruido (capitulo 5).
  - Al fallar el envio, el foco va al resumen de errores, y cada mensaje termina
    diciendo QUE HACER, no solo que fallo (capitulo 14).
*/

const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

const CUENTAS: readonly SelectOption[] = [
  { value: 'CR-2210-004', label: 'CR-2210-004 · Crédito comercial · S/ 12 400,00' },
  { value: 'CR-2210-011', label: 'CR-2210-011 · Crédito de consumo · S/ 3 150,00' },
  { value: 'AH-8801-002', label: 'AH-8801-002 · Ahorro corriente' },
];

const OPERACIONES: readonly SelectOption[] = [
  { value: 'cuota', label: 'Cobro de cuota' },
  { value: 'parcial', label: 'Pago parcial' },
  { value: 'adelanto', label: 'Adelanto de capital' },
  { value: 'mora', label: 'Cobro de mora', disabled: true },
];

const MONEDAS: readonly SelectOption[] = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dólares (USD)' },
];

const CANALES: RadioOption[] = [
  { value: 'sms', label: 'SMS al número registrado' },
  { value: 'correo', label: 'Correo electrónico' },
  { value: 'ninguno', label: 'Sin aviso' },
];

/** Porcentaje de comisión del producto; vive aquí porque es dato de la demostración. */
const TASA_COMISION = 0.015;

@Component({
  selector: 'app-story-formulario-transaccional',
  standalone: true,
  imports: [
    Alert,
    ButtonComponent,
    ChoiceControl,
    FormsModule,
    Input,
    PageHeader,
    PanelComponent,
    RadioComponent,
    Select,
    TextareaComponent,
    ThemeSwitcherComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tx">
      <app-page-header
        eyebrow="Operaciones"
        title="Registro de cobro"
        subtitle="Los importes se aplican en el momento en que se registra la operación. Revise el resumen antes de confirmar."
      >
        <!--
          El conmutador de tema no forma parte de la pantalla real: está aquí
          para poder revisar la plantilla en claro y en oscuro sin salir de la
          historia.
        -->
        <app-theme-switcher page-header-actions />
        <app-button page-header-actions variant="outline" iconClass="fa-clock-rotate-left">
          Últimos movimientos
        </app-button>
      </app-page-header>

      <form class="tx__cuerpo" novalidate (ngSubmit)="registrar()">
        <div class="tx__principal">
          @if (comprobante(); as numero) {
            <!--
              El veredicto va en el TITULO del aviso, no enterrado en el cuerpo,
              y solo se escribe después de que la operación devolvió su número.
            -->
            <app-alert kind="success" title="Cobro registrado">
              La operación quedó con el número <strong>{{ numero }}</strong
              >. El comprobante ya está disponible en «Últimos movimientos».
            </app-alert>
          }

          @if (mostrarErrores() && errores().length > 0) {
            <div #resumenErrores class="tx__resumen-errores" tabindex="-1">
              <app-alert kind="danger" title="No se pudo registrar el cobro">
                <ul class="tx__lista-errores">
                  @for (error of errores(); track error) {
                    <li>{{ error }}</li>
                  }
                </ul>
              </app-alert>
            </div>
          }

          <section class="tx__seccion" aria-labelledby="tx-cliente">
            <h2 class="tx__titulo" id="tx-cliente">Cliente y cuenta</h2>
            <div class="tx__rejilla">
              <app-input
                label="Documento de identidad"
                inputMode="numeric"
                [maxLength]="8"
                hint="8 dígitos, sin guiones ni espacios."
                [required]="true"
                [error]="errorDocumento()"
                (valueChange)="documento.set($event)"
              />
              <app-input
                label="Nombre del titular"
                hint="Se completa al validar el documento."
                [readonly]="true"
                (valueChange)="titular.set($event)"
              />
              <app-select
                class="tx__campo-ancho"
                label="Cuenta a la que se aplica"
                placeholder="Seleccione la cuenta"
                [options]="cuentas"
                [required]="true"
                [error]="errorCuenta()"
                (selectionChange)="cuenta.set($event)"
              />
            </div>
          </section>

          <section class="tx__seccion" aria-labelledby="tx-detalle">
            <h2 class="tx__titulo" id="tx-detalle">Detalle de la operación</h2>
            <div class="tx__rejilla">
              <app-select
                label="Tipo de operación"
                [options]="operaciones"
                [selected]="'cuota'"
                (selectionChange)="operacion.set($event)"
              />
              <app-input
                label="Fecha valor"
                type="date"
                hint="No puede ser posterior a hoy."
              />
              <app-input
                label="Importe recibido"
                inputMode="decimal"
                placeholder="0,00"
                hint="Importe en efectivo entregado en ventanilla."
                [required]="true"
                [error]="errorImporte()"
                (valueChange)="importeEscrito.set($event)"
              />
              <app-select
                label="Moneda"
                [options]="monedas"
                [selected]="'PEN'"
                (selectionChange)="moneda.set($event)"
              />
              <app-input
                class="tx__campo-ancho"
                label="Referencia externa"
                hint="Número de voucher o depósito, si lo hubiera."
              />
            </div>
          </section>

          <section class="tx__seccion" aria-labelledby="tx-condiciones">
            <h2 class="tx__titulo" id="tx-condiciones">Comprobante y avisos</h2>

            <!--
              Un grupo de casillas necesita un nombre común: «fieldset» y
              «legend» lo dan sin añadir un cuarto nivel de encabezado, que es
              justo lo que el capítulo 13 desaconseja.
            -->
            <fieldset class="tx__grupo">
              <legend class="tx__leyenda">Documentos a emitir</legend>
              <app-choice-control
                label="Imprimir comprobante en ventanilla"
                [checked]="imprimir()"
                (changed)="imprimir.set($event)"
              />
              <app-choice-control
                label="Adjuntar el detalle de cuotas al comprobante"
                [checked]="adjuntarDetalle()"
                (changed)="adjuntarDetalle.set($event)"
              />
              <app-choice-control
                label="Confirmo que el importe recibido coincide con el efectivo contado"
                [checked]="conforme()"
                [error]="errorConformidad()"
                (changed)="conforme.set($event)"
              />
            </fieldset>

            <app-radio
              class="tx__grupo"
              name="canal"
              label="Canal de aviso al cliente"
              direction="horizontal"
              [options]="canales"
              [ngModel]="canal()"
              (valueChange)="canal.set($event)"
            />
          </section>

          <section class="tx__seccion" aria-labelledby="tx-observaciones">
            <h2 class="tx__titulo" id="tx-observaciones">Observaciones</h2>
            <app-textarea
              name="observaciones"
              label="Anotaciones para el expediente"
              variant="outline"
              [rows]="3"
              [maxlength]="240"
              [(ngModel)]="observaciones"
            />
          </section>
        </div>

        <!--
          El resumen acompaña al formulario mientras se rellena: es lo que se
          revisa antes del «sí», y por eso queda pegado al borde superior en
          pantallas anchas en vez de esperar al final del recorrido.
        -->
        <aside class="tx__lateral" aria-labelledby="tx-resumen">
          <app-panel variant="elevated" [showHeader]="false">
            <h2 class="tx__titulo" id="tx-resumen">Resumen de importes</h2>
            <dl class="tx__importes">
              <div class="tx__importe">
                <dt>Importe recibido</dt>
                <dd class="tx__cifra">{{ importeFormateado() }}</dd>
              </div>
              <div class="tx__importe">
                <dt>Comisión ({{ comisionPorcentaje }})</dt>
                <dd class="tx__cifra">− {{ comisionFormateada() }}</dd>
              </div>
              <div class="tx__importe tx__importe--total">
                <dt>Se aplica a la cuenta</dt>
                <dd class="tx__cifra">{{ totalFormateado() }}</dd>
              </div>
            </dl>
            <p class="tx__aviso">
              Las cifras salen de lo escrito arriba. Si el importe recibido está vacío, aquí se
              lee cero: nunca el último valor conocido.
            </p>
          </app-panel>
        </aside>

        <!--
          La barra de acciones queda fija al pie porque el formulario es más
          alto que la pantalla: sin ella, «Registrar cobro» solo existe para
          quien llegó al final desplazándose.
        -->
        <div class="tx__acciones">
          <p class="tx__acciones-nota">
            Se aplicará <span class="tx__cifra">{{ totalFormateado() }}</span> a la cuenta
            seleccionada.
          </p>
          <div class="tx__acciones-botones">
            <app-button variant="outline" type="button">Cancelar</app-button>
            <app-button variant="primary" type="submit" iconClass="fa-check">
              Registrar cobro
            </app-button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      /*
        El anfitrion de una historia es un elemento a medida y por omision es
        «inline»: sin esto, la plantilla no ocupa el ancho del lienzo y lo que se
        revisa no es la disposicion real.
      */
      :host {
        display: block;
      }

      .tx {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
        min-height: 100dvh;
        padding: var(--space-6) var(--space-6) 0;
        box-sizing: border-box;
        background-color: var(--surface-background);
      }

      .tx__cuerpo {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(18rem, 1fr);
        gap: var(--space-6);
        align-items: start;
      }

      /*
        Por debajo de 64rem el resumen deja de caber al lado y pasa debajo del
        formulario. El corte va en rem para que llegue antes a quien agranda la
        letra del navegador, que es quien lo necesita antes (capitulo 11).
      */
      @media (max-width: 64rem) {
        .tx__cuerpo {
          grid-template-columns: 1fr;
        }
      }

      .tx__principal {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
        min-width: 0;
      }

      .tx__seccion {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        min-width: 0;
      }

      .tx__titulo {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--font-weight-title);
      }

      .tx__rejilla {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: var(--space-4) var(--space-5);
      }

      .tx__campo-ancho {
      }

      .tx__grupo {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        margin: 0;
        padding: 0;
        border: 0;
      }

      .tx__leyenda {
        padding: 0;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-emphasis);
      }

      .tx__lista-errores {
        margin: 0;
        padding-inline-start: var(--space-5);
      }

      /*
        El resumen recibe el foco al fallar el envio, asi que tiene que poder
        ensenarlo: --focus-ring es una sombra, no un contorno, y el token del
        color del anillo es el que sirve aqui.
      */
      .tx__resumen-errores:focus-visible {
        outline: var(--border-width-medium) solid var(--focus-ring-color);
        outline-offset: var(--space-1);
      }

      .tx__lateral {
        position: sticky;
        top: var(--space-6);
        min-width: 0;
      }

      .tx__importes {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        margin: var(--space-4) 0 0;
      }

      .tx__importe {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-4);
      }

      .tx__importe dt,
      .tx__importe dd {
        margin: 0;
        font-size: var(--text-sm);
      }

      .tx__importe--total {
        padding-top: var(--space-3);
        border-top: var(--border-width-thin) solid var(--border-color);
      }

      .tx__importe--total dt,
      .tx__importe--total dd {
        font-size: var(--text-md);
        font-weight: var(--font-weight-title);
      }

      /*
        Cifras de ancho fijo: es lo que permite comparar el importe recibido con
        el total sin leerlos digito a digito.
      */
      .tx__cifra {
        font-variant-numeric: tabular-nums;
      }

      .tx__aviso {
        margin: var(--space-4) 0 0;
        font-size: var(--text-xs);
      }

      /*
      LA BARRA SE PEGA AL FORMULARIO, NO A SU REJILLA.

      Vivia dentro de .tx__cuerpo, que es un grid con align-items: start: cada
      area mide lo que mide su contenido, asi que el bloque de posicionamiento
      de la barra era exactamente su propia altura y no le quedaba recorrido
      para pegarse. Sacada de la rejilla, su contenedor pasa a ser el
      formulario entero y ya tiene contra que anclarse.
      */
      .tx__acciones {
        position: sticky;
        bottom: 0;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        grid-column: 1 / -1;
        margin-inline: calc(-1 * var(--space-6));
        padding: var(--space-4) var(--space-6);
        border-top: var(--border-width-thin) solid var(--border-color);
        background-color: var(--surface-elevated);
        box-shadow: var(--shadow-md);
      }

      .tx__acciones-nota {
        margin: 0;
        font-size: var(--text-sm);
      }

      .tx__acciones-botones {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
      }
    `,
  ],
})
class FormularioTransaccionalStory {
  private readonly resumenErrores = viewChild<ElementRef<HTMLElement>>('resumenErrores');

  protected readonly cuentas = CUENTAS;
  protected readonly operaciones = OPERACIONES;
  protected readonly monedas = MONEDAS;
  protected readonly canales = CANALES;
  protected readonly comisionPorcentaje = `${(TASA_COMISION * 100).toLocaleString('es-PE')} %`;

  protected readonly documento = signal('');
  protected readonly titular = signal('');
  protected readonly cuenta = signal('');
  protected readonly operacion = signal('cuota');
  protected readonly moneda = signal('PEN');
  protected readonly importeEscrito = signal('');
  protected readonly imprimir = signal(true);
  protected readonly adjuntarDetalle = signal(false);
  protected readonly conforme = signal(false);
  protected readonly canal = signal<string | number>('sms');
  protected observaciones = '';

  /*
    NADA SE PINTA EN ROJO HASTA QUE HUBO UN PRIMER INTENTO DE ENVIO.

    Mientras esta en falso, los mensajes de error existen —se calculan— pero no
    se entregan a ningun campo. Asi el formulario no acusa a nadie de dejar
    vacio lo que todavia esta escribiendo.
  */
  protected readonly mostrarErrores = signal(false);
  protected readonly comprobante = signal<string | null>(null);

  /*
    El importe se lee de lo ESCRITO, admitiendo coma decimal porque es lo que
    teclea quien trabaja en castellano. Lo que no se interpreta se trata como
    cero y el formulario lo dice; nunca se conserva el ultimo valor valido.
  */
  private readonly importe = computed(() => {
    const normalizado = this.importeEscrito().trim().replace(/\s/g, '').replace(',', '.');
    const valor = Number(normalizado);
    return Number.isFinite(valor) && valor > 0 ? valor : 0;
  });

  private readonly comision = computed(() => Math.round(this.importe() * TASA_COMISION * 100) / 100);
  private readonly total = computed(() => Math.round((this.importe() - this.comision()) * 100) / 100);

  protected readonly importeFormateado = computed(() => formateadorSoles.format(this.importe()));
  protected readonly comisionFormateada = computed(() => formateadorSoles.format(this.comision()));
  protected readonly totalFormateado = computed(() => formateadorSoles.format(this.total()));

  private readonly documentoInvalido = computed(() => !/^\d{8}$/.test(this.documento().trim()));
  private readonly cuentaInvalida = computed(() => this.cuenta().trim() === '');
  private readonly importeInvalido = computed(() => this.importe() <= 0);
  private readonly conformidadInvalida = computed(() => !this.conforme());

  /*
    Cada mensaje termina en lo que la persona puede hacer a continuacion. «El
    documento es obligatorio» es cierto y deja a quien lo lee igual de parado
    que antes (capitulo 14).
  */
  protected readonly errores = computed(() => {
    const encontrados: string[] = [];
    if (this.documentoInvalido()) {
      encontrados.push('Escriba el documento del titular: ocho dígitos, sin guiones ni espacios.');
    }
    if (this.cuentaInvalida()) {
      encontrados.push('Elija la cuenta a la que se aplica el cobro en la lista de arriba.');
    }
    if (this.importeInvalido()) {
      encontrados.push('Escriba el importe recibido con una cifra mayor que cero.');
    }
    if (this.conformidadInvalida()) {
      encontrados.push('Marque la conformidad del efectivo contado antes de registrar el cobro.');
    }
    return encontrados;
  });

  protected readonly errorDocumento = computed(() =>
    this.mostrarErrores() && this.documentoInvalido()
      ? 'Ocho dígitos, sin guiones ni espacios.'
      : null,
  );
  protected readonly errorCuenta = computed(() =>
    this.mostrarErrores() && this.cuentaInvalida() ? 'Elija una cuenta de la lista.' : null,
  );
  protected readonly errorImporte = computed(() =>
    this.mostrarErrores() && this.importeInvalido()
      ? 'Escriba una cifra mayor que cero.'
      : null,
  );
  protected readonly errorConformidad = computed(() =>
    this.mostrarErrores() && this.conformidadInvalida()
      ? 'Marque esta casilla para poder registrar el cobro.'
      : null,
  );

  protected registrar(): void {
    this.mostrarErrores.set(true);

    if (this.errores().length > 0) {
      this.comprobante.set(null);
      /*
        El foco va al resumen, no al primer campo: con cuatro defectos a la vez,
        saltar al primero esconde los otros tres. El aviso todavia no esta en el
        DOM cuando esto se ejecuta, asi que se espera al render siguiente.
      */
      setTimeout(() => this.resumenErrores()?.nativeElement.focus());
      return;
    }

    // La demostracion no habla con ningun servicio: el numero se compone aqui
    // para que el aviso de exito tenga algo concreto que decir.
    this.comprobante.set(`OP-${Math.floor(4800 + this.importe() % 100)}`);
  }
}

const meta: Meta<FormularioTransaccionalStory> = {
  title: '5. Templates/Formulario Transaccional',
  component: FormularioTransaccionalStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Formulario largo de operación con dinero de por medio, ensamblado con
\`PageHeader\`, \`Input\`, \`Select\`, \`ChoiceControl\`, \`Radio\`, \`Textarea\`,
\`Alert\`, \`Panel\` y \`Button\`.

Lo que esta plantilla resuelve, y que un formulario cualquiera no resuelve:

1. **No hay diálogo de confirmación, hay resumen.** Lo que puede estar mal es el
   importe o la cuenta, y «¿está seguro?» no enseña ninguno de los dos.
2. **Ningún campo se pinta en rojo antes del primer envío.** Los mensajes se
   calculan siempre, pero solo se entregan cuando alguien pulsó «Registrar cobro».
3. **Al fallar, el foco va al resumen de errores**, no al primer campo: con
   cuatro defectos a la vez, saltar al primero esconde los otros tres.
4. **La barra de acciones queda fija al pie**, porque el formulario es más alto
   que la pantalla.
        `,
      },
    },
  },
  decorators: [moduleMetadata({ imports: [FormularioTransaccionalStory] })],
};

export default meta;
type Story = StoryObj<FormularioTransaccionalStory>;

export const Transaccional: Story = {
  name: 'Registro de cobro',
  render: () => ({ template: `<app-story-formulario-transaccional />` }),
};
