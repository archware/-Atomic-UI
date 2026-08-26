import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorPagesComponent } from '../blueprints/error-pages/error-pages.component';

/*
QUE DOCUMENTA ESTE FICHERO

A diferencia del resto de blueprints de pagina, ErrorPagesComponent SI tiene API:
nueve entradas. Las historias las ejercitan todas con `args`, sin dobles de
ninguna clase, y recorren los seis codigos que el componente sabe pintar.

Las tres que declara el enrutador -403, 404 y 500- van primero, porque son las
que el consumidor registra en `app.routes.ts`.

Nota sobre el enrutador: el componente lee `route.snapshot.data['code']` en
ngOnInit y, si lo encuentra, PISA la entrada `code`. Aqui se provee un enrutador
sin datos de ruta, asi que manda `[code]`, que es como se usa el componente
incrustado dentro de otra pantalla.
*/

const meta: Meta<ErrorPagesComponent> = {
  title: '5. Blueprints/Error Pages',
  component: ErrorPagesComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: '**', children: [] }]),
        importProvidersFrom(BrowserAnimationsModule),
      ],
    }),
  ],
  argTypes: {
    code: {
      control: 'select',
      options: [400, 401, 403, 404, 500, 503],
      description: 'Codigo HTTP. Decide titulo, descripcion e icono por defecto.',
    },
    title: { control: 'text', description: 'Sustituye el titulo por defecto del codigo.' },
    description: { control: 'text', description: 'Sustituye la explicacion por defecto del codigo.' },
    icon: { control: 'text', description: 'Sustituye el simbolo por defecto del codigo.' },
    primaryActionLabel: { control: 'text', description: 'Etiqueta de la accion principal.' },
    primaryActionRoute: { control: 'text', description: 'Ruta a la que lleva la accion principal.' },
    showSecondaryAction: { control: 'boolean', description: 'Muestra Reintentar; recarga la pagina.' },
    showTechnicalInfo: { control: 'boolean', description: 'Despliega el detalle tecnico plegado.' },
    technicalMessage: { control: 'text', description: 'Texto del detalle tecnico, para quien depura.' },
  },
  args: {
    code: 404,
    primaryActionLabel: 'Ir al inicio',
    primaryActionRoute: '/',
    showSecondaryAction: false,
    showTechnicalInfo: false,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Blueprint de paginas de error

Una sola pagina para los seis codigos que el ADN contempla: **400**, **401**,
**403**, **404**, **500** y **503**. El codigo decide simbolo, titulo y
explicacion; las nueve entradas permiten cambiar cualquiera de los tres y ajustar
las acciones.

### Una pagina de error dice que hacer a continuacion

Este componente **siempre** ofrece salida, y por eso no es una pared:

1. **Accion principal** -\`primaryActionLabel\` sobre \`primaryActionRoute\`-, que
   por defecto lleva al inicio y se cambia por ruta segun el caso.
2. **Volver**, que retrocede en el historial del navegador.
3. **Reintentar**, opcional con \`showSecondaryAction\`, pensado para 500 y 503.
   Ojo: **recarga la pagina entera** (\`window.location.reload()\`). Reintenta de
   verdad -no cierra el panel y ya-, pero pierde el estado en memoria; si tu caso
   admite reintentar solo la peticion, cambia \`onSecondaryAction()\` al copiar el
   blueprint. Dentro de Storybook recarga el marco de la vista previa.

Lo que no ofrece es una via de contacto: el 403 pide contactar al administrador y
no da con quien ni como. Eso se resuelve con \`description\` y una ruta propia en
la accion principal, como hace la historia de *Acceso denegado*.

### Registro de rutas

\`\`\`typescript
{ path: '403', component: ErrorPagesComponent, data: { code: 403 } },
{ path: '500', component: ErrorPagesComponent, data: { code: 500 } },
{ path: '**', component: ErrorPagesComponent, data: { code: 404 } },
\`\`\`

Por ruta manda \`data.code\`; incrustado en otra pantalla manda la entrada
\`[code]\`, que es la forma que ejercitan estas historias.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ErrorPagesComponent>;

export const NoEncontrada: Story = {
  name: '404: la direccion no existe',
  args: {
    code: 404,
  },
  parameters: {
    docs: {
      description: {
        story:
          'El caso de la ruta comodin. Explica que la pagina no existe o se movio y ofrece dos ' +
          'salidas: ir al inicio o volver atras. No hay Reintentar, y es correcto: repetir la ' +
          'misma URL daria el mismo resultado.',
      },
    },
  },
};

export const AccesoDenegado: Story = {
  name: '403: sin permiso, con una salida util',
  args: {
    code: 403,
    description:
      'Tu cuenta no tiene permiso sobre esta seccion. Si crees que deberia tenerlo, pidelo desde ' +
      'tu panel: la solicitud llega al administrador de tu organizacion.',
    primaryActionLabel: 'Volver a mi panel',
    primaryActionRoute: '/dashboard',
  },
  parameters: {
    docs: {
      description: {
        story:
          '"No tienes permiso" no es lo mismo que "no se pudo comprobar": aqui la respuesta llego, ' +
          'fue entendida, y la respuesta es que no. La historia ejercita description, ' +
          'primaryActionLabel y primaryActionRoute para que el texto por defecto -que pide ' +
          'contactar al administrador sin decir como- se convierta en una salida concreta. Sin ese ' +
          'ajuste, la pagina informa y abandona.',
      },
    },
  },
};

export const FalloDelServidor: Story = {
  name: '500: fallo del servidor, con reintento y detalle tecnico',
  args: {
    code: 500,
    showSecondaryAction: true,
    showTechnicalInfo: true,
    technicalMessage: 'GET /api/v1/reportes/mensual - 500 Internal Server Error (traza 9f3c-11ee-8b21)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'El unico caso en el que reintentar tiene sentido: el fallo es del otro lado y puede ser ' +
          'pasajero. Se encienden las dos entradas que solo aplican aqui, showSecondaryAction y ' +
          'showTechnicalInfo, y el detalle tecnico llega plegado para no gritarle una traza a quien ' +
          'no la va a leer. Recuerda que Reintentar recarga la pagina entera.',
      },
    },
  },
};

export const SesionCaducada: Story = {
  name: '401: la sesion caduco',
  args: {
    code: 401,
    primaryActionLabel: 'Iniciar sesion',
    primaryActionRoute: '/login',
  },
  parameters: {
    docs: {
      description: {
        story:
          'La diferencia con el 403 esta en la salida, no en el tono: aqui la accion principal ' +
          'lleva al acceso, porque el problema se arregla identificandose otra vez. Es el destino ' +
          'natural del interceptor cuando el token expira.',
      },
    },
  },
};

export const ServicioEnMantenimiento: Story = {
  name: '503: mantenimiento anunciado',
  args: {
    code: 503,
    showSecondaryAction: true,
    description:
      'Estamos aplicando una actualizacion programada. El servicio vuelve en unos minutos; no hace ' +
      'falta que repitas el pago ni el envio.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Una caida prevista se cuenta distinto de una averia: se dice cuanto dura y que no hay ' +
          'que rehacer nada. La historia cambia description por un texto que quita miedo y deja ' +
          'Reintentar a mano, que aqui si acaba funcionando solo con esperar.',
      },
    },
  },
};

export const TextoALaMedida: Story = {
  name: '400: texto, simbolo y accion a medida',
  args: {
    code: 400,
    icon: '🧾',
    title: 'El comprobante no se pudo emitir',
    description:
      'Los datos del comprobante no pasaron la validacion. Revisa el documento del cliente y el ' +
      'detalle de los articulos antes de reintentar.',
    primaryActionLabel: 'Volver al comprobante',
    primaryActionRoute: '/ventas/comprobantes',
    showTechnicalInfo: true,
    technicalMessage: 'POST /api/v1/comprobantes - 400 Bad Request (campo: cliente.documento)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Las tres entradas de sustitucion -icon, title y description- juntas, que es como se usa ' +
          'el blueprint cuando el error tiene nombre en el dominio y no solo numero HTTP. El codigo ' +
          'sigue viendose de fondo para quien reporta la incidencia, y la accion principal devuelve ' +
          'al sitio exacto del que vino el usuario.',
      },
    },
  },
};
