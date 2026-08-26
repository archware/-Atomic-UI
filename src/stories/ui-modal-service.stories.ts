import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { ModalContainerComponent } from '../app/shared/ui/molecules/modal/modal-container.component';
import { ModalService } from '../app/shared/ui/services/modal.service';
import type { ModalSize } from '../app/shared/ui/services/modal.service';

/*
  LO QUE SE INVOCA NO SE DECLARA.

  `ModalService` no tiene marcado. No se escribe en una plantilla: se inyecta y
  se llama. Por eso la entrada declarativa de Modal —la que monta `<app-modal>`
  a mano— no puede documentarlo, y por eso aqui cada historia monta un anfitrion
  que inyecta el servicio, dispara la llamada y deja constancia de la decision
  que devolvio.

  Tres cosas se documentan aqui y en ningun otro sitio del catalogo:

  1. `app-modal-container` es la pieza que hay que montar UNA vez en el layout
     raiz. Sin ella el servicio acumula dialogos en su senal y nadie los pinta:
     el fallo se ve como «el boton no hace nada».
  2. El dialogo BLOQUEANTE —`closable: false` mas `closeOnBackdrop: false`— es
     la unica forma de exigir una decision. Justo por eso es el mas facil de
     usar mal: quien lo copia para un aviso trivial deja al usuario encerrado en
     una pantalla que no le importa.
  3. Una decision que no vuelve al llamador no es una decision. La bitacora de
     cada escenario existe para que se vea QUE callback corrio, no solo que el
     dialogo se pinto bonito.
*/

/*
  EL ESCENARIO ACOTA UN SUPERPUESTO QUE EN PRODUCCION CUBRE LA VENTANA.

  `.modal-overlay` es `position: fixed`, asi que en una aplicacion real tapa la
  pantalla entera —que es lo correcto—. En la pagina de documentacion, donde
  conviven varias historias, eso dejaria ver solo la ultima.

  Un `transform` distinto de `none` convierte al elemento en bloque contenedor
  de sus descendientes `position: fixed`. El componente no se toca: se acota su
  contexto. Los lanzadores y la bitacora viven FUERA del escenario para que el
  fondo oscurecido no los tape.
*/

type CasoModal =
  | 'sin-dialogos'
  | 'confirmacion'
  | 'aviso'
  | 'bloqueante'
  | 'cierre-libre'
  | 'contenido'
  | 'apilados'
  | 'tamanos';

const REPOSO =
  'El contenedor esta montado y no pinta nada: mientras la senal de modales este vacia, ' +
  'no ocupa ni un pixel. Es lo que se ve el 99 % del tiempo en una aplicacion real.';

const TITULOS_POR_TAMANO: Readonly<Record<ModalSize, string>> = {
  sm: 'sm · hasta 400 px',
  md: 'md · hasta 550 px',
  lg: 'lg · hasta 800 px',
  xl: 'xl · hasta 1000 px',
};

const MENSAJES_POR_TAMANO: Readonly<Record<ModalSize, string>> = {
  sm: 'Una pregunta de una linea y dos botones. Si cabe aqui, no use nada mas grande.',
  md: 'El tamano por omision. Un formulario corto o un mensaje de tres o cuatro lineas.',
  lg: 'Un resumen con lista o una tabla estrecha. A partir de aqui conviene preguntarse si no es una pantalla.',
  xl: 'Casi el ancho de un portatil. Si necesita esto, probablemente necesitaba una ruta propia.',
};

const RESUMEN_DEL_CIERRE = [
  '<p>Turno de la cajera Rosa Quispe, del 12/03 08:00 al 12/03 16:00.</p>',
  '<ul>',
  '<li>Ventas en efectivo: <strong>S/ 4 820.00</strong> en 63 comprobantes.</li>',
  '<li>Ventas con tarjeta: <strong>S/ 2 105.50</strong> en 18 comprobantes.</li>',
  '<li>Egresos autorizados: <strong>S/ 240.00</strong> en 2 vales.</li>',
  '<li>Diferencia contra el arqueo fisico: <strong>S/ 1.50 de sobrante</strong>.</li>',
  '</ul>',
  '<p>El sobrante queda registrado a nombre del turno, no de la persona.</p>',
].join('');

@Component({
  selector: 'app-story-modal-service',
  standalone: true,
  imports: [Alert, ButtonComponent, ModalContainerComponent],
  // Cada escenario provee SU instancia del servicio. En una aplicacion real el
  // servicio es unico (`providedIn: 'root'`) y el contenedor se monta una vez;
  // aqui se acota para que varias historias convivan en la misma pagina sin
  // que los dialogos de una aparezcan dentro del recuadro de otra.
  providers: [ModalService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <div class="demo__acciones">
        @switch (caso()) {
          @case ('sin-dialogos') {
            <app-button variant="outline" (buttonClick)="avisarConEtiquetaPropia()">
              Comprobar que el contenedor responde
            </app-button>
          }
          @case ('confirmacion') {
            <app-button variant="danger" (buttonClick)="confirmarAnulacion()">
              Anular la boleta
            </app-button>
          }
          @case ('aviso') {
            <app-button variant="outline" (buttonClick)="avisarConEtiquetaPropia()">
              Aviso con etiqueta propia
            </app-button>
            <app-button variant="ghost" (buttonClick)="avisarConEtiquetaPorOmision()">
              Aviso con la etiqueta por omision
            </app-button>
          }
          @case ('bloqueante') {
            <app-button variant="danger" (buttonClick)="exigirDecision()">
              Abrir el turno de hoy
            </app-button>
          }
          @case ('cierre-libre') {
            <app-button variant="secondary" (buttonClick)="abrirConsulta()">
              Consultar el movimiento
            </app-button>
          }
          @case ('contenido') {
            <app-button variant="primary" (buttonClick)="abrirResumen()">
              Revisar el cierre de caja
            </app-button>
            <app-button variant="warning" (buttonClick)="abrirSinPie()">
              El mismo, con hasFooter en false
            </app-button>
          }
          @case ('apilados') {
            <app-button variant="primary" (buttonClick)="abrirEdicion()">
              Editar el cliente
            </app-button>
            <app-button variant="ghost" (buttonClick)="vaciarLaPila()">
              Vaciar la pila (closeAll)
            </app-button>
          }
          @case ('tamanos') {
            <app-button variant="secondary" size="sm" (buttonClick)="abrirTamano()">
              Volver a abrir {{ tamano() }}
            </app-button>
          }
        }
        @if (registro().length > 0) {
          <app-button variant="link" size="sm" (buttonClick)="registro.set([])">
            Limpiar la bitacora
          </app-button>
        }
      </div>

      <!--
        La bitacora usa <app-alert> en vez de un recuadro dibujado a mano: es
        exactamente el reproche que el inventario le hace al showcase, que pinta
        .alert-info con CSS suelto teniendo el componente gobernado al lado.
      -->
      <app-alert kind="info" title="Que devolvio el dialogo" spacing="compact">
        @if (registro().length === 0) {
          <p class="demo__linea">Todavia no se ha resuelto ningun dialogo.</p>
        } @else {
          <ol class="demo__registro">
            @for (linea of registro(); track $index) {
              <li>{{ linea }}</li>
            }
          </ol>
        }
      </app-alert>

      <div #escenario class="demo__escenario" [class.demo__escenario--holgado]="holgado()">
        <p class="demo__reposo">{{ reposo }}</p>
        <app-modal-container />
      </div>
    </div>
  `,
  styles: [
    `
      .demo {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .demo__acciones {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-3);
      }

      .demo__linea {
        margin: 0;
      }

      .demo__registro {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        margin: 0;
        padding-inline-start: var(--space-5);
      }

      /*
        transform es lo unico que hace este recuadro: acotar el superpuesto.
        Ni un color, ni una sombra, ni una tipografia se redefinen aqui —el
        dialogo pinta con sus propios tokens y por eso acompana al tema oscuro
        sin que esta historia declare nada—.
      */
      .demo__escenario {
        display: grid;
        place-items: center;
        min-height: 20rem;
        padding: var(--space-5);
        border: var(--border-width-thin) dashed var(--border-color);
        border-radius: var(--radius-lg);
        background: var(--surface-sunken);
        transform: translateZ(0);
      }

      .demo__escenario--holgado {
        min-height: 28rem;
      }

      .demo__reposo {
        max-width: 34rem;
        margin: 0;
        color: var(--text-color-muted);
        font-size: var(--text-sm);
        text-align: center;
      }
    `,
  ],
})
class ModalServiceStory {
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  readonly caso = input<CasoModal>('confirmacion');
  readonly tamano = input<ModalSize>('md');
  readonly holgado = input(false);
  /** Un escenario que no se abre solo obliga a pulsar para ver el estado. */
  readonly autoAbrir = input(true);

  protected readonly registro = signal<string[]>([]);
  protected readonly reposo = REPOSO;

  private readonly escenario = viewChild<ElementRef<HTMLElement>>('escenario');

  constructor() {
    afterNextRender(() => this.abrirCuandoSeVea());
  }

  /*
    SE ABRE AL ENTRAR EN PANTALLA, NO AL CARGAR LA PAGINA.

    `ModalContainerComponent` mueve el foco al dialogo recien abierto, y enfocar
    algo lo desplaza a la vista. Si las ocho historias se abrieran a la vez al
    cargar la documentacion, la pagina daria un salto al ultimo dialogo antes de
    que nadie hubiera leido la primera linea. Abriendo al entrar en pantalla, el
    dialogo ya esta a la vista cuando recibe el foco y no hay salto.
  */
  private abrirCuandoSeVea(): void {
    if (!this.autoAbrir()) return;

    const nodo = this.escenario()?.nativeElement;
    if (!nodo || typeof IntersectionObserver === 'undefined') {
      this.abrir();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        observador.disconnect();
        this.abrir();
      },
      { threshold: 0.4 },
    );
    observador.observe(nodo);
    this.destroyRef.onDestroy(() => observador.disconnect());
  }

  private abrir(): void {
    switch (this.caso()) {
      case 'confirmacion':
        this.confirmarAnulacion();
        break;
      case 'aviso':
        this.avisarConEtiquetaPropia();
        break;
      case 'bloqueante':
        this.exigirDecision();
        break;
      case 'cierre-libre':
        this.abrirConsulta();
        break;
      case 'contenido':
        this.abrirResumen();
        break;
      case 'apilados':
        this.abrirEdicion();
        break;
      case 'tamanos':
        this.abrirTamano();
        break;
      default:
        break;
    }
  }

  /*
    `confirm()` ADMITE UNA ETIQUETA POR OMISION Y NO CONVIENE ACEPTARLA.

    `confirmLabel` es opcional y cae en «Confirmar». Un boton que dice
    «Confirmar» obliga a releer el titulo para saber que se confirma, y quien
    despacha cuarenta dialogos al dia ya no lee el titulo. `PopupService.confirm`
    hizo esa entrada obligatoria; aqui todavia no lo es, asi que pasarla es
    disciplina de quien llama.
  */
  protected confirmarAnulacion(): void {
    this.modal.confirm({
      title: 'Anular la boleta B001-000142',
      message:
        'Se retira del reporte de ventas del dia y se emite la nota de credito correspondiente. No se puede deshacer.',
      confirmLabel: 'Anular la boleta',
      cancelLabel: 'Volver',
      confirmVariant: 'danger',
      onConfirm: () => this.anotar('confirm() -> onConfirm: la boleta se anulo.'),
      onCancel: () => this.anotar('confirm() -> onCancel: no se toco nada.'),
    });
  }

  /** El tercer argumento de `alert()` es la etiqueta del unico boton. */
  protected avisarConEtiquetaPropia(): void {
    this.modal.alert(
      'No se pudo comprobar el RUC',
      'El servicio de SUNAT no respondio en 30 segundos. El comprobante quedo guardado como borrador; vuelva a intentarlo desde la bandeja de pendientes.',
      'Entendido',
    );
    this.anotar('alert(titulo, mensaje, "Entendido") -> un solo boton, etiqueta propia.');
  }

  protected avisarConEtiquetaPorOmision(): void {
    this.modal.alert(
      'Sesion actualizada',
      'Se aplicaron los permisos nuevos. No hace falta volver a entrar.',
    );
    this.anotar('alert(titulo, mensaje) -> la etiqueta cae en "Aceptar".');
  }

  /*
    EL DIALOGO DEL QUE NO SE SALE SIN RESPONDER.

    `closable: false` retira el aspa y `closeOnBackdrop: false` desarma el clic
    en el fondo. Lo que queda es un dialogo con dos salidas, y las dos son
    decisiones registrables.

    CUANDO SI: el estado del sistema es incoherente y cualquier otra accion
    empeoraria el problema —una caja abierta de ayer, un pago a medio confirmar—.
    CUANDO NO: un aviso, una promocion, un «sabias que». Encerrar a alguien en
    una pantalla que no le importa es la forma mas rapida de que aprenda a
    pulsar el boton primario sin leer, y ese habito se lleva puesto al dialogo
    siguiente, que si importaba.
  */
  protected exigirDecision(): void {
    let id = 0;
    id = this.modal.open({
      title: 'La caja quedo abierta desde ayer',
      message:
        'No se puede registrar ninguna venta hasta cerrar el turno anterior. Decida que hacer con los S/ 1 240.00 que quedaron en caja.',
      size: 'md',
      closable: false,
      closeOnBackdrop: false,
      buttons: [
        {
          label: 'Arrastrar el saldo al turno de hoy',
          variant: 'primary',
          action: () => {
            this.anotar('Bloqueante -> el saldo se arrastro al turno de hoy.');
            this.modal.close(id);
          },
        },
        {
          label: 'Registrar un faltante y cerrar',
          variant: 'danger',
          action: () => {
            this.anotar('Bloqueante -> se registro el faltante y se cerro el turno.');
            this.modal.close(id);
          },
        },
      ],
    });
  }

  /** Lo contrario del anterior: se puede abandonar porque no hay nada que decidir. */
  protected abrirConsulta(): void {
    let id = 0;
    id = this.modal.open({
      title: 'Detalle del movimiento OP-4821',
      message:
        'Consulta de solo lectura. Como no hay nada que decidir, el aspa y el clic en el fondo son salidas legitimas: quitarlas no protegeria nada y estorbaria a todo el mundo.',
      size: 'md',
      closable: true,
      closeOnBackdrop: true,
      buttons: [
        { label: 'Cerrar la consulta', variant: 'secondary', action: () => this.modal.close(id) },
      ],
    });
  }

  /*
    `htmlContent` se pinta con `[innerHTML]`, que Angular sanea: sirve para dar
    forma a un resumen —listas, enfasis— y no para inyectar marcado de terceros.
    Los cuatro botones ejercitan las cuatro variantes que declara `ModalButton`.
  */
  protected abrirResumen(): void {
    let id = 0;
    id = this.modal.open({
      title: 'Resumen del cierre de caja',
      htmlContent: RESUMEN_DEL_CIERRE,
      size: 'lg',
      hasFooter: true,
      buttons: [
        {
          label: 'Descartar',
          variant: 'ghost',
          action: () => {
            this.anotar('Resumen -> descartado.');
            this.modal.close(id);
          },
        },
        {
          label: 'Guardar como borrador',
          variant: 'secondary',
          action: () => {
            this.anotar('Resumen -> guardado como borrador.');
            this.modal.close(id);
          },
        },
        {
          label: 'Anular el cierre',
          variant: 'danger',
          action: () => {
            this.anotar('Resumen -> cierre anulado.');
            this.modal.close(id);
          },
        },
        {
          label: 'Confirmar el cierre',
          variant: 'primary',
          action: () => {
            this.anotar('Resumen -> cierre confirmado.');
            this.modal.close(id);
          },
        },
      ],
    });
  }

  /*
    LA TRAMPA DE `hasFooter`.

    Por omision vale «hay botones», asi que casi nadie la escribe. Escrita en
    `false` con botones declarados, el pie NO se pinta: los botones existen en la
    configuracion y no existen en la pantalla. Aqui se ve inofensivo porque el
    aspa sigue estando; combinelo con `closable: false` y el dialogo no tiene
    salida ninguna.
  */
  protected abrirSinPie(): void {
    this.modal.open({
      title: 'Resumen del cierre de caja',
      htmlContent: RESUMEN_DEL_CIERRE,
      size: 'lg',
      hasFooter: false,
      buttons: [{ label: 'Confirmar el cierre', variant: 'primary', action: () => undefined }],
    });
    this.anotar('hasFooter: false -> los cuatro botones no llegan a pintarse.');
  }

  /** El contenedor pinta la pila entera; el ultimo abierto queda encima. */
  protected abrirEdicion(): void {
    let base = 0;
    base = this.modal.open({
      title: 'Editar el cliente ACME S.A.C.',
      message:
        'Guardar abre una confirmacion ENCIMA de este dialogo. Los dialogos se apilan y el contenedor los pinta todos, el ultimo arriba.',
      size: 'lg',
      buttons: [
        {
          label: 'Cerrar sin guardar',
          variant: 'ghost',
          action: () => {
            this.anotar('Apilados -> se cerro el dialogo de fondo sin guardar.');
            this.modal.close(base);
          },
        },
        {
          label: 'Guardar',
          variant: 'primary',
          action: () => this.confirmarSobreLaPila(base),
        },
      ],
    });
  }

  private confirmarSobreLaPila(base: number): void {
    this.modal.confirm({
      title: 'El RUC ya esta registrado en otro cliente',
      message:
        'Guardar fusiona los dos registros y traslada las 14 facturas del cliente anterior. No se puede deshacer.',
      confirmLabel: 'Fusionar los dos clientes',
      cancelLabel: 'Seguir editando',
      confirmVariant: 'danger',
      onConfirm: () => {
        this.anotar('Apilados -> fusion confirmada; el de fondo se cierra a mano con close().');
        this.modal.close(base);
      },
      onCancel: () =>
        this.anotar('Apilados -> se vuelve al dialogo de fondo, que nunca se cerro.'),
    });
  }

  /*
    `closeAll()` NO ANIMA: vacia la senal de golpe. Es la salida de emergencia
    para un cambio de ruta o un cierre de sesion, no el cierre corriente. Para
    eso esta `close(id)`, que marca el dialogo y lo retira 200 ms despues.
  */
  protected vaciarLaPila(): void {
    this.modal.closeAll();
    this.anotar('closeAll() -> la pila se vacia sin animacion de salida.');
  }

  protected abrirTamano(): void {
    const tamano = this.tamano();
    let id = 0;
    id = this.modal.open({
      title: TITULOS_POR_TAMANO[tamano],
      message: MENSAJES_POR_TAMANO[tamano],
      size: tamano,
      buttons: [{ label: 'Cerrar', variant: 'secondary', action: () => this.modal.close(id) }],
    });
  }

  private anotar(linea: string): void {
    this.registro.update((lineas) => [...lineas, linea]);
  }
}

/*
  UNA PRUEBA QUE AFIRMA «NO SE CERRO» TIENE QUE ESPERAR.

  `close()` marca el dialogo y lo retira 200 ms despues. Comprobar de inmediato
  que el dialogo sigue en el DOM daria verde aunque el cierre estuviera en curso.
*/
const ESPERA_DE_CIERRE_MS = 400;

function esperarAlCierre(): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ESPERA_DE_CIERRE_MS));
}

const meta: Meta<ModalContainerComponent> = {
  id: 'molecules-modal-service',
  title: '2. Molecules/ModalService',
  component: ModalContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ModalServiceStory],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [
          '`ModalService` abre dialogos sin marcado: se inyecta, se llama y devuelve un `id`.',
          '`ModalContainerComponent` es la contraparte obligatoria: se monta **una vez** en el',
          'layout raiz (`<app-modal-container />` junto al `router-outlet`) y pinta todo lo que',
          'haya en la senal `modals()`. Sin el contenedor el servicio funciona, acumula dialogos',
          'y no se ve nada; el sintoma que llega al soporte es «el boton no hace nada».',
          '',
          'Cada historia inyecta el servicio en un anfitrion propio, dispara la llamada y anota',
          'que callback corrio. El dialogo se pinta dentro de un recuadro acotado: en produccion',
          'el fondo cubre la ventana entera.',
        ].join('\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<ModalContainerComponent>;

export const ContenedorMontadoSinDialogos: Story = {
  name: 'El contenedor montado y en reposo',
  parameters: {
    docs: {
      description: {
        story: [
          'El estado en el que vive el contenedor casi todo el tiempo: montado y sin pintar nada.',
          'Se documenta porque es el que hace dudar —«no se ve, ¿estara puesto?»— y porque el',
          'boton demuestra que la pieza responde. Montarlo dos veces pinta cada dialogo dos veces;',
          'no montarlo no da error, solo silencio.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="sin-dialogos" [autoAbrir]="false" />`,
  }),
};

export const ConfirmacionQueNombraElActo: Story = {
  name: 'Confirmacion que nombra el acto',
  parameters: {
    docs: {
      description: {
        story: [
          '`confirm()` monta un dialogo `sm` con `closeOnBackdrop: false` y dos botones: cancelar',
          'en `ghost` y confirmar en la variante que se pida. El boton lleva el verbo del acto',
          '—«Anular la boleta»— porque `confirmLabel` es opcional y su valor por omision,',
          '«Confirmar», obliga a releer el titulo para saber que se esta aceptando.',
          'La bitacora prueba cual de los dos callbacks corrio: un dialogo que se pinta bien y no',
          'devuelve nada es un dialogo roto que parece sano.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="confirmacion" />`,
  }),
};

export const AvisoDeUnSoloBoton: Story = {
  name: 'Aviso de un solo boton',
  parameters: {
    docs: {
      description: {
        story: [
          '`alert(titulo, mensaje, etiqueta)` es el caso sin decision: informa y se cierra.',
          'El tercer argumento cae en «Aceptar» si no se pasa; los dos botones de arriba abren la',
          'misma pieza con etiqueta propia y con la de omision para que se vea la diferencia.',
          'Si el aviso cuenta algo que salio mal, la etiqueta util es la que reconoce el hecho',
          '(«Entendido»), no la que finge un permiso que nadie pidio.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="aviso" />`,
  }),
};

export const DecisionSinSalidaPorFuera: Story = {
  name: 'Decision obligatoria: sin aspa y sin fondo',
  parameters: {
    docs: {
      description: {
        story: [
          '`closable: false` y `closeOnBackdrop: false`. Es la unica forma de exigir una decision',
          'y la mas facil de usar mal: reservelo para cuando el estado del sistema es incoherente',
          'y seguir empeoraria el problema. Para un aviso, una promocion o un «sabias que», esto',
          'no protege nada y ensena a pulsar el boton primario sin leer.',
          'La prueba comprueba las tres salidas que no existen: fondo, Escape y aspa.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="bloqueante" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialogo = await canvas.findByRole('dialog');
    const fondo = dialogo.parentElement as HTMLElement;

    await step('El clic en el fondo no cierra nada', async () => {
      await userEvent.click(fondo);
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(dialogo);
    });

    await step('Escape tampoco', async () => {
      fondo.focus();
      await userEvent.keyboard('{Escape}');
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(dialogo);
    });

    await step('Y el encabezado no tiene aspa', async () => {
      expect(within(dialogo).queryByRole('button', { name: 'Cerrar' })).toBeNull();
    });

    await step('Solo las dos decisiones sacan de aqui', async () => {
      await userEvent.click(
        within(dialogo).getByRole('button', { name: 'Arrastrar el saldo al turno de hoy' }),
      );
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
        timeout: 2000,
      });
      expect(canvas.getByText(/el saldo se arrastro/i)).toBeInTheDocument();
    });
  },
};

export const ConsultaQueSePuedeAbandonar: Story = {
  name: 'Consulta que se puede abandonar',
  parameters: {
    docs: {
      description: {
        story: [
          'El reverso del anterior: no hay nada que decidir, asi que el aspa y el fondo son',
          'salidas legitimas.',
          '',
          'La prueba documenta ademas una diferencia real del contenedor que conviene saber antes',
          'de prometerla: `.modal` detiene la propagacion de `keydown`, de modo que **Escape',
          'pulsado dentro del dialogo no llega al manejador del fondo y no cierra**. Solo cierra',
          'con el foco puesto en el fondo. El contenedor de Popup, que registra el manejador de',
          'Escape tambien en la caja, si lo cierra desde dentro.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="cierre-libre" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialogo = await canvas.findByRole('dialog');
    const fondo = dialogo.parentElement as HTMLElement;

    await step('Escape desde dentro del dialogo no cierra', async () => {
      within(dialogo).getByRole('button', { name: 'Cerrar' }).focus();
      await userEvent.keyboard('{Escape}');
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(dialogo);
    });

    await step('El clic en el fondo si cierra', async () => {
      await userEvent.click(fondo);
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
        timeout: 2000,
      });
    });

    await step('Y se vuelve a abrir con el mismo lanzador', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Consultar el movimiento' }));
      await canvas.findByRole('dialog');
    });
  },
};

export const ContenidoPropioYPieDeBotones: Story = {
  name: 'Contenido propio y las cuatro variantes de boton',
  parameters: {
    docs: {
      description: {
        story: [
          'Un dialogo `lg` con `htmlContent` —que Angular sanea— y las cuatro variantes que',
          'declara `ModalButton`: `ghost`, `secondary`, `danger` y `primary`.',
          'El segundo lanzador abre el mismo dialogo con `hasFooter: false`: los cuatro botones',
          'siguen en la configuracion y no llegan a pintarse. La entrada casi nunca se escribe',
          'porque su valor por omision ya es «hay botones»; escribirla en falso es una forma',
          'silenciosa de dejar un dialogo sin acciones.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="contenido" [holgado]="true" />`,
  }),
};

export const DialogoSobreDialogo: Story = {
  name: 'Un dialogo sobre otro, y el vaciado de golpe',
  parameters: {
    docs: {
      description: {
        story: [
          'La senal `modals()` es una pila y el contenedor la pinta entera: pulsar «Guardar» abre',
          'una confirmacion encima sin cerrar la de abajo, que sigue viva y con sus datos.',
          'Cerrar la de arriba no cierra la de abajo: hay que llamar a `close(id)` con el `id` que',
          'devolvio `open()`. `closeAll()` vacia la pila de golpe y sin animacion; es para un',
          'cambio de ruta o un cierre de sesion, no para el cierre corriente.',
          '',
          'Que se pueda apilar no quiere decir que convenga: dos dialogos encima del otro suelen',
          'ser un flujo que pedia una pantalla.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-modal-service caso="apilados" [holgado]="true" />`,
  }),
};

export const AnchoSegunLoQueSeDecide: Story = {
  name: 'Los cuatro anchos, uno debajo de otro',
  parameters: {
    docs: {
      description: {
        story: [
          'Cuatro escenarios independientes, cada uno con su instancia del servicio, para poder',
          'comparar `sm` (400 px), `md` (550 px), `lg` (800 px) y `xl` (1000 px) sin abrirlos por',
          'turnos. Son maximos: el dialogo ocupa el 90 % del ancho disponible y se detiene ahi,',
          'asi que en una ventana estrecha los cuatro se parecen.',
          'El ancho no es una preferencia estetica: mide cuanto hay que leer para decidir. Si un',
          '`xl` se queda corto, lo que hacia falta era una ruta.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `
      <div class="anchos">
        <app-story-modal-service caso="tamanos" tamano="sm" />
        <app-story-modal-service caso="tamanos" tamano="md" />
        <app-story-modal-service caso="tamanos" tamano="lg" />
        <app-story-modal-service caso="tamanos" tamano="xl" />
      </div>
    `,
    styles: [
      `
        .anchos {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
      `,
    ],
  }),
};
