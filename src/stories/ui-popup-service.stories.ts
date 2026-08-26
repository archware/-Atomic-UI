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
import { PopupContainerComponent } from '../app/shared/ui/molecules/popup/popup-container.component';
import { PopupService } from '../app/shared/ui/services/popup.service';
import type { PopupSize, PopupType } from '../app/shared/ui/services/popup.service';

/*
  LO QUE SE INVOCA NO SE DECLARA.

  `PopupService` se inyecta y se llama; `app-popup-container` es la contraparte
  que hay que montar UNA vez en el layout raiz para que lo invocado se vea.
  Sin contenedor, el servicio apila avisos en su senal y no aparece nada.

  POR QUE ESTA ENTRADA EXISTE HABIENDO YA UNA DE POPUP.

  La entrada anterior (`3. Organisms/Popup`) declara su anfitrion con
  `selector: 'app-popup-demo'` y luego lo invoca en la plantilla como
  `<sb-popup-demo>`. Angular no conoce esa etiqueta, no la resuelve contra
  ningun componente y no da error: la deja como elemento desconocido y pinta un
  hueco. La unica historia de Popup del catalogo lleva desde entonces sin pintar
  nada, y con ella se perdio el ejemplo de confirmacion redactado segun la
  doctrina.

  La leccion es corta y vale para cualquier historia con anfitrion propio: la
  etiqueta de la plantilla y el `selector` del `@Component` son el mismo dato
  escrito dos veces, y nada comprueba que coincidan. Aqui el anfitrion se
  declara `app-story-popup-service` y se invoca `app-story-popup-service`.
*/

/*
  EL ESCENARIO ACOTA UN SUPERPUESTO QUE EN PRODUCCION CUBRE LA VENTANA.

  `.popup-overlay` es `position: fixed`. Un `transform` distinto de `none`
  convierte al ancestro en bloque contenedor de sus descendientes fijos, asi que
  el aviso se queda dentro del recuadro y varias historias pueden convivir en la
  misma pagina. El componente no se toca: se acota su contexto. Los lanzadores y
  la bitacora quedan FUERA del recuadro para que el fondo no los tape.
*/

type CasoPopup =
  | 'sin-avisos'
  | 'promocion'
  | 'confirmacion'
  | 'confirmacion-en-el-acto'
  | 'tonos'
  | 'sin-salida'
  | 'contenido'
  | 'tamanos'
  | 'apilados';

const REPOSO =
  'El contenedor esta montado y no pinta nada: mientras la senal de avisos este vacia, ' +
  'no ocupa ni un pixel. Es su estado durante casi toda la sesion.';

const TITULOS_POR_TONO: Readonly<Record<PopupType, string>> = {
  info: 'El corte de caja se hace a las 22:00',
  success: 'La factura F001-000318 se envio a SUNAT',
  warning: 'Quedan 3 comprobantes por numerar',
  error: 'SUNAT rechazo la factura F001-000318',
  confirm: 'Confirmacion',
};

const MENSAJES_POR_TONO: Readonly<Record<PopupType, string>> = {
  info: 'Las ventas registradas despues de esa hora entran en el reporte del dia siguiente.',
  success: 'La constancia llego con el CDR 0. Ya se puede entregar al cliente.',
  warning:
    'La serie llega a su ultimo numero autorizado. Solicite un rango nuevo antes del proximo turno.',
  error:
    'Codigo 2335: el importe total no coincide con la suma de los items. El comprobante quedo en la bandeja de rechazados.',
  confirm: 'Los atajos no piden decision; para eso esta confirm().',
};

const ETIQUETAS_POR_TAMANO: Readonly<Record<PopupSize, string>> = {
  sm: 'sm · hasta 360 px',
  md: 'md · hasta 450 px',
  lg: 'lg · hasta 600 px',
};

const MENSAJES_POR_TAMANO: Readonly<Record<PopupSize, string>> = {
  sm: 'Una frase y un boton. Es el ancho que corresponde a un aviso que se lee de un vistazo.',
  md: 'El ancho por omision: dos o tres lineas, una decision.',
  lg: 'Solo si el aviso trae una lista o un detalle que no se puede resumir mas.',
};

const DETALLE_DEL_RECHAZO = [
  '<p>El comprobante quedo en la bandeja de rechazados con estos hallazgos:</p>',
  '<ul>',
  '<li>Item 3: el precio unitario incluye IGV y la cabecera lo declara aparte.</li>',
  '<li>Item 7: cantidad 0. SUNAT no admite lineas sin cantidad.</li>',
  '<li>Total declarado <strong>S/ 1 480.00</strong> frente a <strong>S/ 1 462.40</strong> calculado.</li>',
  '</ul>',
  '<p>Corregir y reenviar conserva la numeracion; anular obliga a emitir una serie nueva.</p>',
].join('');

@Component({
  selector: 'app-story-popup-service',
  standalone: true,
  imports: [Alert, ButtonComponent, PopupContainerComponent],
  // Cada escenario provee SU instancia del servicio. En una aplicacion real es
  // unico (`providedIn: 'root'`) y el contenedor se monta una vez; aqui se
  // acota para que los avisos de una historia no salgan en el recuadro de otra.
  providers: [PopupService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="demo">
      <div class="demo__acciones">
        @switch (caso()) {
          @case ('sin-avisos') {
            <app-button variant="outline" (buttonClick)="mostrarTono()">
              Comprobar que el contenedor responde
            </app-button>
          }
          @case ('promocion') {
            <app-button variant="success" (buttonClick)="mostrarPromocion()">
              Ofrecer el plan anual
            </app-button>
          }
          @case ('confirmacion') {
            <app-button variant="danger" (buttonClick)="confirmarLaBaja()">
              Dar de baja la serie
            </app-button>
          }
          @case ('confirmacion-en-el-acto') {
            <app-button variant="primary" (buttonClick)="confirmarElReenvio()">
              Reenviar a SUNAT
            </app-button>
          }
          @case ('tonos') {
            <app-button variant="outline" size="sm" (buttonClick)="mostrarTono()">
              Volver a abrir {{ tipo() }}
            </app-button>
          }
          @case ('sin-salida') {
            <app-button variant="warning" (buttonClick)="exigirRespuesta()">
              Continuar sin certificado
            </app-button>
          }
          @case ('contenido') {
            <app-button variant="danger" (buttonClick)="mostrarDetalleDelRechazo()">
              Ver el detalle del rechazo
            </app-button>
          }
          @case ('tamanos') {
            <app-button variant="outline" size="sm" (buttonClick)="mostrarTamano()">
              Volver a abrir {{ tamano() }}
            </app-button>
          }
          @case ('apilados') {
            <app-button variant="secondary" (buttonClick)="apilarTres()">
              Apilar tres avisos
            </app-button>
            <app-button variant="ghost" (buttonClick)="vaciar()">Vaciar (clear)</app-button>
          }
        }
        @if (registro().length > 0) {
          <app-button variant="link" size="sm" (buttonClick)="registro.set([])">
            Limpiar la bitacora
          </app-button>
        }
      </div>

      <!--
        La bitacora se pinta con <app-alert>, no con un recuadro dibujado a mano.
        Un aviso imperativo se juzga por lo que devuelve al llamador, y esta es
        la unica forma de verlo en una historia.
      -->
      <app-alert kind="info" title="Que devolvio el aviso" spacing="compact">
        @if (registro().length === 0) {
          <p class="demo__linea">Todavia no se ha resuelto ningun aviso.</p>
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
        <app-popup-container />
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
        El recuadro solo acota. Ni un color, ni una sombra, ni un peso de letra
        se redefinen aqui: el aviso pinta con sus tokens y por eso acompana al
        tema oscuro sin que esta historia declare nada.
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
        min-height: 26rem;
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
class PopupServiceStory {
  private readonly popup = inject(PopupService);
  private readonly destroyRef = inject(DestroyRef);

  readonly caso = input<CasoPopup>('promocion');
  readonly tipo = input<PopupType>('info');
  readonly tamano = input<PopupSize>('md');
  readonly holgado = input(false);
  readonly autoAbrir = input(true);

  protected readonly registro = signal<string[]>([]);
  protected readonly reposo = REPOSO;

  private readonly escenario = viewChild<ElementRef<HTMLElement>>('escenario');

  constructor() {
    afterNextRender(() => this.abrirCuandoSeVea());
  }

  /*
    SE ABRE AL ENTRAR EN PANTALLA, NO AL CARGAR LA PAGINA.

    El contenedor mueve el foco al boton seguro del aviso recien abierto, y
    enfocar algo lo desplaza a la vista. Si las nueve historias se abrieran a la
    vez, la pagina saltaria a la ultima antes de que nadie leyera la primera.
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
      case 'promocion':
        this.mostrarPromocion();
        break;
      case 'confirmacion':
        this.confirmarLaBaja();
        break;
      case 'confirmacion-en-el-acto':
        this.confirmarElReenvio();
        break;
      case 'tonos':
        this.mostrarTono();
        break;
      case 'sin-salida':
        this.exigirRespuesta();
        break;
      case 'contenido':
        this.mostrarDetalleDelRechazo();
        break;
      case 'tamanos':
        this.mostrarTamano();
        break;
      case 'apilados':
        this.apilarTres();
        break;
      default:
        break;
    }
  }

  /*
    DOS ACCIONES A MEDIDA CON `show()`.

    Es el unico caso en que hay que armar los botones a mano: los atajos
    (`info`, `success`, `warning`, `error`) traen uno solo y `confirm()` trae la
    pareja cancelar/actuar. Aqui las dos acciones son del negocio, no del
    dialogo, asi que se declaran.

    Tres detalles que el ejemplo del showcase no tiene y esta historia si:

    - Se cierra con el `id` QUE DEVUELVE `show()`. El showcase cierra
      `popups()[0]`, que es el primero de la pila y no tiene por que ser este:
      con dos avisos encima, cierra el que no es.
    - `cancels: true` en la salida barata: Escape y el aspa ejecutan ESA accion
      en vez de un cierre mudo, de modo que el llamador siempre se entera de que
      la persona dijo que no.
    - `autofocus: true` en la accion que ofrece, porque aqui la accion no
      destruye nada. En un `confirm` el foco empieza en cancelar.
  */
  protected mostrarPromocion(): void {
    let id = 0;
    id = this.popup.show({
      title: 'El plan anual sale 20 % mas barato',
      message:
        'Cambiar ahora acredita los 4 meses que quedan del plan mensual y renueva el 12/03 del ano que viene.',
      type: 'success',
      size: 'md',
      icon: 'fa-solid fa-gift',
      buttons: [
        {
          label: 'Seguir con el plan mensual',
          variant: 'ghost',
          cancels: true,
          action: () => {
            this.anotar('Promocion -> se rechazo; corrio la accion marcada cancels.');
            this.popup.close(id);
          },
        },
        {
          label: 'Cambiar al plan anual',
          variant: 'primary',
          autofocus: true,
          action: () => {
            this.anotar('Promocion -> se acepto el cambio de plan.');
            this.popup.close(id);
          },
        },
      ],
    });
  }

  /*
    `PopupService.confirm` EXIGE `confirmLabel`; el de Modal no.

    Es la diferencia deliberada entre los dos servicios: aqui no hay valor por
    omision que permita un boton que diga «Confirmar». El verbo del acto va en
    el boton porque quien despacha cuarenta avisos al dia ya no lee el titulo.
  */
  protected confirmarLaBaja(): void {
    this.popup.confirm({
      title: 'Dar de baja la serie F001',
      message:
        'Los 42 numeros que quedan sin usar se comunican a SUNAT como anulados y la serie deja de admitir emisiones. No se puede reactivar.',
      confirmLabel: 'Dar de baja la serie',
      cancelLabel: 'Cancelar',
      tone: 'danger',
      onConfirm: () => this.anotar('confirm() -> onConfirm: la serie quedo de baja.'),
      onCancel: () => this.anotar('confirm() -> onCancel: no se toco la serie.'),
    });
  }

  /*
    `initialFocus: 'confirm'` ES LA EXCEPCION, NO EL ATAJO.

    Solo se justifica cuando el acto es reversible y repetitivo —reenviar,
    reintentar— y quien lo usa lo hace en serie. Ponerlo en un acto destructivo
    devuelve el problema que `initialFocus` vino a resolver: un Intro por
    inercia, arrastrado del formulario anterior, ejecutando lo irreversible.
  */
  protected confirmarElReenvio(): void {
    this.popup.confirm({
      title: 'Reenviar la factura F001-000318 a SUNAT',
      message:
        'Se envia otra vez con las correcciones guardadas. El comprobante conserva su numero y el reenvio se puede repetir.',
      confirmLabel: 'Reenviar ahora',
      cancelLabel: 'Revisar antes',
      initialFocus: 'confirm',
      onConfirm: () => this.anotar('confirm(initialFocus: confirm) -> onConfirm: reenviado.'),
      onCancel: () => this.anotar('confirm(initialFocus: confirm) -> onCancel: sin reenviar.'),
    });
  }

  /** Los cuatro atajos: mismo dialogo, distinto icono, color y etiqueta de salida. */
  protected mostrarTono(): void {
    const tipo = this.tipo();
    const titulo = TITULOS_POR_TONO[tipo];
    const mensaje = MENSAJES_POR_TONO[tipo];

    switch (tipo) {
      case 'success':
        this.popup.success(titulo, mensaje);
        break;
      case 'warning':
        this.popup.warning(titulo, mensaje);
        break;
      case 'error':
        this.popup.error(titulo, mensaje);
        break;
      default:
        this.popup.info(titulo, mensaje);
        break;
    }
  }

  /*
    UN AVISO SIN SALIDA POR FUERA.

    `closable: false` retira el aspa y `closeOnBackdrop: false` desarma el clic
    en el fondo. Y como ningun boton lleva `cancels`, Escape tampoco hace nada:
    `onDismiss` no encuentra a quien delegar y el aviso no es cerrable.

    Reservelo para cuando seguir sin responder deja el sistema en un estado que
    habra que deshacer despues. Un aviso trivial encerrado asi ensena a pulsar
    el boton primario sin leer, y ese habito se lleva puesto al siguiente.
  */
  protected exigirRespuesta(): void {
    let id = 0;
    id = this.popup.show({
      title: 'El certificado digital vence hoy',
      message:
        'Sin certificado vigente los comprobantes se emiten pero no se envian a SUNAT, y quedan en la bandeja de pendientes hasta que se renueve. Elija como seguir.',
      type: 'warning',
      size: 'md',
      icon: 'fa-solid fa-triangle-exclamation',
      closable: false,
      closeOnBackdrop: false,
      buttons: [
        {
          label: 'Emitir igual y enviar despues',
          variant: 'secondary',
          action: () => {
            this.anotar('Sin salida -> se emitira sin enviar; quedan pendientes.');
            this.popup.close(id);
          },
        },
        {
          label: 'Ir a renovar el certificado',
          variant: 'primary',
          autofocus: true,
          action: () => {
            this.anotar('Sin salida -> se fue a renovar el certificado.');
            this.popup.close(id);
          },
        },
      ],
    });
  }

  /*
    `htmlContent` se pinta con `[innerHTML]`, que Angular sanea. Vale para dar
    forma a un detalle —una lista, un enfasis— y no para inyectar marcado ajeno.
    `icon` acepta cualquier clase de Font Awesome y sustituye a la del tipo.
  */
  protected mostrarDetalleDelRechazo(): void {
    let id = 0;
    id = this.popup.show({
      title: 'SUNAT rechazo la factura F001-000318',
      type: 'error',
      size: 'lg',
      icon: 'fa-solid fa-file-circle-exclamation',
      htmlContent: DETALLE_DEL_RECHAZO,
      buttons: [
        {
          label: 'Anular y emitir de nuevo',
          variant: 'danger',
          cancels: true,
          action: () => {
            this.anotar('Rechazo -> se anulo el comprobante.');
            this.popup.close(id);
          },
        },
        {
          label: 'Corregir y reenviar',
          variant: 'primary',
          autofocus: true,
          action: () => {
            this.anotar('Rechazo -> se corrigio y se reenvio.');
            this.popup.close(id);
          },
        },
      ],
    });
  }

  protected mostrarTamano(): void {
    const tamano = this.tamano();
    let id = 0;
    id = this.popup.show({
      title: ETIQUETAS_POR_TAMANO[tamano],
      message: MENSAJES_POR_TAMANO[tamano],
      type: 'info',
      size: tamano,
      icon: 'fa-solid fa-circle-info',
      buttons: [{ label: 'Aceptar', variant: 'primary', action: () => this.popup.close(id) }],
    });
  }

  /*
    EL CONTENEDOR PINTA LA PILA ENTERA.

    Que se pueda no quiere decir que convenga: tres avisos encima del otro
    significan que el primero no se leyo. Se documenta porque ocurre solo —tres
    respuestas de red que fallan a la vez— y hay que saber que se ve.
  */
  protected apilarTres(): void {
    this.popup.info(
      TITULOS_POR_TONO.info,
      'Este quedo debajo del todo: el contenedor los pinta en el orden en que se pidieron.',
    );
    this.popup.warning(TITULOS_POR_TONO.warning, MENSAJES_POR_TONO.warning);
    this.popup.error(TITULOS_POR_TONO.error, MENSAJES_POR_TONO.error);
    this.anotar('Se apilaron tres avisos; el ultimo pedido queda encima.');
  }

  /*
    `clear()` vacia la senal de golpe y sin animacion de salida. Es la salida de
    emergencia para un cambio de ruta o un cierre de sesion; el cierre corriente
    es `close(id)`, que marca el aviso y lo retira 200 ms despues.
  */
  protected vaciar(): void {
    this.popup.clear();
    this.anotar('clear() -> la pila se vacia sin animacion de salida.');
  }

  private anotar(linea: string): void {
    this.registro.update((lineas) => [...lineas, linea]);
  }
}

/*
  UNA PRUEBA QUE AFIRMA «NO SE CERRO» TIENE QUE ESPERAR.

  `close()` marca el aviso y lo retira 200 ms despues. Comprobar de inmediato
  que sigue en el DOM daria verde aunque el cierre estuviera en curso.
*/
const ESPERA_DE_CIERRE_MS = 400;

function esperarAlCierre(): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ESPERA_DE_CIERRE_MS));
}

const meta: Meta<PopupContainerComponent> = {
  id: 'molecules-popup-service',
  title: '2. Molecules/PopupService',
  component: PopupContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [PopupServiceStory],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [
          '`PopupService` abre avisos sin marcado: se inyecta, se llama y devuelve un `id`.',
          '`PopupContainerComponent` es la contraparte obligatoria: se monta **una vez** en el',
          'layout raiz (`<app-popup-container />` junto al `router-outlet`) y pinta todo lo que',
          'haya en la senal `popups()`.',
          '',
          'Cuatro atajos (`info`, `success`, `warning`, `error`) resuelven el aviso de un boton;',
          '`confirm()` resuelve la pareja cancelar/actuar con el foco en la salida segura; y',
          '`show()` queda para cuando las acciones son del negocio y hay que declararlas.',
          '',
          'Cada historia inyecta el servicio en un anfitrion propio y anota que callback corrio:',
          'un aviso que se pinta bien y no devuelve nada al llamador es un aviso roto que parece',
          'sano. El recuadro punteado acota el fondo, que en produccion cubre la ventana entera.',
        ].join('\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<PopupContainerComponent>;

export const ContenedorMontadoSinAvisos: Story = {
  name: 'El contenedor montado y en reposo',
  parameters: {
    docs: {
      description: {
        story: [
          'El estado en el que vive el contenedor casi toda la sesion: montado y sin pintar nada.',
          'Se documenta porque es el que hace dudar —«no se ve, ¿estara puesto?»— y porque el',
          'boton demuestra que la pieza responde. Montarlo dos veces pinta cada aviso dos veces;',
          'no montarlo no da error, solo silencio.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="sin-avisos" [autoAbrir]="false" />`,
  }),
};

export const PromocionConDosAccionesAMedida: Story = {
  name: 'Promocion con dos acciones a medida',
  parameters: {
    docs: {
      description: {
        story: [
          'El patron del showcase que Storybook no tenia: `show()` con dos botones del negocio,',
          'no del dialogo.',
          '',
          'Con tres correcciones sobre aquel ejemplo. Se cierra con el `id` que devolvio `show()`',
          'y no con `popups()[0]`, que es el primero de la pila y con dos avisos abiertos cierra',
          'el que no es. La salida barata lleva `cancels: true`, asi que Escape y el aspa ejecutan',
          'esa accion en vez de un cierre mudo que dejaria al llamador esperando. Y `autofocus`',
          'esta en la accion que ofrece, que aqui no destruye nada; en un `confirm` el foco',
          'empieza siempre en cancelar.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="promocion" />`,
  }),
};

export const ElFocoEmpiezaEnLaSalidaSegura: Story = {
  name: 'El foco empieza en la salida segura',
  parameters: {
    docs: {
      description: {
        story: [
          '`confirm()` con `tone: "danger"`. La prueba comprueba las dos promesas del capitulo 7',
          'que ninguna otra historia del catalogo verifica:',
          '',
          '1. El foco arranca en «Cancelar», no en el acto. Un Intro por inercia, arrastrado del',
          'formulario anterior, no da de baja la serie.',
          '2. Escape no es un cierre mudo: ejecuta la MISMA cancelacion que el boton, y la',
          'bitacora lo prueba. Un aviso que se cierra sin avisar al llamador deja la fila',
          'bloqueada y el boton en «Anulando…» para siempre.',
          '',
          '`confirm()` fija ademas `closeOnBackdrop: false`: el clic fuera no responde por la',
          'persona.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="confirmacion" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const aviso = await canvas.findByRole('dialog');

    await step('El foco arranca en la salida segura', async () => {
      await waitFor(() =>
        expect(within(aviso).getByRole('button', { name: 'Cancelar' })).toHaveFocus(),
      );
    });

    await step('El clic en el fondo no responde por la persona', async () => {
      await userEvent.click(aviso);
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(aviso);
    });

    await step('Escape ejecuta la cancelacion, no un cierre mudo', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
        timeout: 2000,
      });
      expect(canvas.getByText(/onCancel/i)).toBeInTheDocument();
    });

    await step('Y se vuelve a abrir con el mismo lanzador', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Dar de baja la serie' }));
      await canvas.findByRole('dialog');
    });
  },
};

export const CuandoElFocoEmpiezaEnElActo: Story = {
  name: 'Cuando el foco empieza en el acto',
  parameters: {
    docs: {
      description: {
        story: [
          '`initialFocus: "confirm"` mueve el foco al boton que actua. Es la excepcion, y esta',
          'historia existe para acotar cuando se justifica: el acto es reversible y repetitivo',
          '—reenviar, reintentar— y quien lo usa lo hace en serie, de modo que pedirle que tabule',
          'cuarenta veces al dia es el verdadero riesgo.',
          'Puesto en un acto destructivo devuelve exactamente el problema que `initialFocus` vino',
          'a resolver.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="confirmacion-en-el-acto" />`,
  }),
};

export const TonosQueCambianElIcono: Story = {
  name: 'Los cuatro tonos, uno debajo de otro',
  parameters: {
    docs: {
      description: {
        story: [
          'Los cuatro atajos, cada uno en su escenario, para leerlos juntos en vez de por turnos.',
          'Comparten estructura y cambian tres cosas: el icono, el color de su medallon y la',
          'etiqueta de salida —«Aceptar» en `info` y `success`, «Entendido» en `warning`,',
          '«Cerrar» en `error`—.',
          '',
          'Ninguno de los cuatro admite decision: los cuatro traen un solo boton. Si el aviso',
          'necesita que la persona elija, el atajo no es el sitio: es `confirm()` o `show()`.',
          'Y el tono se elige por lo que paso, no por como se quiere que suene: un `error` que',
          'informa de algo recuperable ensena a ignorar los rojos de verdad.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `
      <div class="pila">
        <app-story-popup-service caso="tonos" tipo="info" />
        <app-story-popup-service caso="tonos" tipo="success" />
        <app-story-popup-service caso="tonos" tipo="warning" />
        <app-story-popup-service caso="tonos" tipo="error" />
      </div>
    `,
    styles: [
      `
        .pila {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
      `,
    ],
  }),
};

export const AvisoQueExigeRespuesta: Story = {
  name: 'Aviso que exige respuesta',
  parameters: {
    docs: {
      description: {
        story: [
          '`closable: false` mas `closeOnBackdrop: false`, y ningun boton marcado `cancels`.',
          'Las tres salidas de fuera quedan desarmadas a la vez: no hay aspa, el fondo no cierra',
          'y Escape no encuentra a quien delegar. Lo unico que saca de aqui son las dos',
          'respuestas.',
          '',
          'Es la version imperativa del dialogo bloqueante y merece el mismo cuidado: se reserva',
          'para cuando seguir sin responder deja el sistema en un estado que habra que deshacer',
          'despues. Para un aviso corriente basta con el aspa.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="sin-salida" />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const aviso = await canvas.findByRole('dialog');

    await step('No hay aspa en el encabezado', async () => {
      expect(within(aviso).queryByRole('button', { name: 'Cerrar' })).toBeNull();
    });

    await step('El clic en el fondo no cierra', async () => {
      await userEvent.click(aviso);
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(aviso);
    });

    await step('Escape tampoco: ningun boton se declara cancels', async () => {
      await userEvent.keyboard('{Escape}');
      await esperarAlCierre();
      expect(canvas.getByRole('dialog')).toBe(aviso);
    });

    await step('Solo las dos respuestas sacan de aqui', async () => {
      await userEvent.click(
        within(aviso).getByRole('button', { name: 'Emitir igual y enviar despues' }),
      );
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
        timeout: 2000,
      });
      expect(canvas.getByText(/quedan pendientes/i)).toBeInTheDocument();
    });
  },
};

export const ContenidoPropioConIconoAMedida: Story = {
  name: 'Contenido propio con icono a medida',
  parameters: {
    docs: {
      description: {
        story: [
          'Un aviso `lg` con `htmlContent` —que Angular sanea— y un `icon` que sustituye al del',
          'tipo. Sirve cuando el detalle es una lista que no se puede resumir en una frase sin',
          'perder lo que hay que corregir.',
          '',
          'Los dos botones ejercitan `danger` y `primary`, y el destructivo lleva `cancels: true`',
          'a proposito: en este caso la salida barata ES anular, porque abandonar el aviso sin',
          'decidir dejaria el comprobante en la bandeja de rechazados igualmente.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="contenido" [holgado]="true" />`,
  }),
};

export const AnchoSegunLoQueSeLee: Story = {
  name: 'Los tres anchos, uno debajo de otro',
  parameters: {
    docs: {
      description: {
        story: [
          'Tres escenarios independientes para comparar `sm` (360 px), `md` (450 px) y `lg`',
          '(600 px) sin abrirlos por turnos. Son maximos: el aviso ocupa el 90 % del ancho',
          'disponible y se detiene ahi, asi que en una ventana estrecha los tres se parecen.',
          'El ancho mide cuanto hay que leer para responder, no cuanta importancia se le quiere',
          'dar al aviso.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `
      <div class="pila">
        <app-story-popup-service caso="tamanos" tamano="sm" />
        <app-story-popup-service caso="tamanos" tamano="md" />
        <app-story-popup-service caso="tamanos" tamano="lg" />
      </div>
    `,
    styles: [
      `
        .pila {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
      `,
    ],
  }),
};

export const AvisosApiladosYVaciadoDeGolpe: Story = {
  name: 'Avisos apilados y vaciado de golpe',
  parameters: {
    docs: {
      description: {
        story: [
          'La senal `popups()` es una pila y el contenedor la pinta entera: el ultimo pedido',
          'queda encima y el foco va a el. Cerrar el de arriba descubre el siguiente.',
          '',
          'Se documenta porque ocurre solo —tres respuestas de red que fallan a la vez— y hay que',
          'saber que se ve. Tambien porque tres avisos apilados son un sintoma: el primero no se',
          'leyo. `clear()` los retira todos de golpe y sin animacion; sirve para un cambio de ruta',
          'o un cierre de sesion, no para el cierre corriente, que es `close(id)`.',
        ].join(' '),
      },
    },
  },
  render: () => ({
    template: `<app-story-popup-service caso="apilados" [holgado]="true" />`,
  }),
};
