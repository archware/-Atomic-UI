import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { userEvent, within } from 'storybook/test';
import { SettingsPageComponent } from '../blueprints/settings-page/settings-page.component';

/*
QUE DOCUMENTA ESTE FICHERO, Y CON QUE DOBLES

SettingsPageComponent no declara entradas: todo su estado son campos y senales
internas (`successMessage`, `errorMessage`, `saving`, `profileForm`,
`notifEmail`...). Storybook asigna a la instancia del componente cualquier
propiedad de `props` que no sea una entrada declarada, de modo que las historias
sustituyen esas senales por otras equivalentes para aterrizar en un estado
concreto. Es un DOBLE, y se declara en cada historia.

Dos consecuencias que conviene no maquillar:

1. `saving` deriva de `profileApi.loading()` y `passwordApi.loading()`, pero el
   blueprint dejo las llamadas reales comentadas con `@customize`. Es decir: hoy
   `execute()` no se invoca nunca y el estado "guardando" NO SE ALCANZA usando la
   pagina. La historia que lo pinta sustituye la senal; el hilado real es tarea
   del consumidor.

2. Las cuatro pestanas viven dentro del propio componente. Como `defaultIndex`
   es una entrada de `app-tabs` y no de la pagina, las historias que documentan
   Seguridad, Notificaciones y Apariencia llegan alli pulsando la pestana en un
   `play`, igual que lo haria una persona.
*/

/** Formulario de perfil recien creado y sin datos, con los mismos validadores que el blueprint. */
function perfilSinDatos(): FormGroup {
  const formulario = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    bio: new FormControl('', [Validators.maxLength(300)]),
  });
  // El blueprint solo pinta el mensaje de campo obligatorio cuando el control esta tocado.
  formulario.markAllAsTouched();
  return formulario;
}

const meta: Meta<SettingsPageComponent> = {
  title: '5. Blueprints/Settings Page',
  component: SettingsPageComponent,
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
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Blueprint de configuracion

Cuatro secciones dentro de un \`LayoutShell\`: **Perfil** (datos personales y
avatar), **Seguridad** (cambio de contrasena), **Notificaciones** (cuatro
interruptores) y **Apariencia** (tema e idioma). El contenido se reparte con
\`app-tabs\` y cada seccion vive en un \`Panel\`.

### Dobles usados en estas historias

La clase **no declara entradas**: su estado son senales internas. Las historias
las sustituyen en la instancia para aterrizar en un estado concreto -guardando,
guardado, error, formulario vacio, notificaciones apagadas-. Donde no basta con
un dato, la historia pulsa la pestana en un \`play\`, como lo haria una persona.

### Lo que hay que cablear antes de usarlo

- **El guardado no llama a nadie.** \`saveProfile()\`, \`savePassword()\` y
  \`saveNotifications()\` tienen la llamada a la API comentada (\`@customize\`) y
  ponen el mensaje de exito directamente. Por eso \`saving\` -que deriva de
  \`profileApi.loading()\`- nunca se pone a \`true\` usando la pagina: el estado
  existe en la plantilla y no se alcanza.
- **El exito se anuncia sin haber guardado nada.** Tal cual esta, la pagina
  confirma un cambio que no ha viajado a ningun sitio.
- **Los datos del perfil son de demostracion**: \`ngOnInit\` rellena el
  formulario con valores fijos en vez de leerlos de la sesion.

### Uso

Copia \`src/blueprints/settings-page\`, sustituye los tres metodos \`save*()\` por
las llamadas reales y registra la ruta detras de tu guarda de sesion.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SettingsPageComponent>;

export const PerfilConDatos: Story = {
  name: 'Perfil con los datos del usuario',
  parameters: {
    docs: {
      description: {
        story:
          'Estado nominal: la pestana Perfil con el formulario relleno, el avatar con indicador de ' +
          'conexion y el boton de guardar habilitado. Es lo que ve el usuario al entrar en la ' +
          'pagina recien copiada, con los valores de demostracion que pone ngOnInit.',
      },
    },
  },
  render: () => ({
    template: '<app-settings-page></app-settings-page>',
  }),
};

export const PerfilSinDatosYGuardadoBloqueado: Story = {
  name: 'Perfil vacio: obligatorios en rojo y guardado bloqueado',
  parameters: {
    docs: {
      description: {
        story:
          'Doble: se sustituye el formulario por uno vacio y ya tocado, que es el estado de una ' +
          'cuenta recien creada a la que nadie ha puesto nombre. Nombre, apellido y email marcan ' +
          'su error, y el boton de guardar queda deshabilitado porque el formulario es invalido. ' +
          'Aqui se ven a la vez el vacio, el error de validacion y la accion deshabilitada.',
      },
    },
  },
  render: () => ({
    props: {
      profileForm: perfilSinDatos(),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
};

export const GuardandoCambios: Story = {
  name: 'Guardando: la accion se bloquea mientras viaja',
  parameters: {
    docs: {
      description: {
        story:
          'Doble: se sustituye la senal saving por una que devuelve true. El boton cambia el icono ' +
          'de disquete por el de espera y se deshabilita, de modo que no se puede enviar dos veces ' +
          'el mismo cambio. Importa saber que ESTE ESTADO NO SE ALCANZA usando el blueprint: la ' +
          'llamada a la API esta comentada, asi que profileApi.loading() nunca se pone a true. La ' +
          'plantilla ya lo resuelve; falta enchufar la peticion.',
      },
    },
  },
  render: () => ({
    props: {
      saving: signal(true),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
};

export const GuardadoConfirmado: Story = {
  name: 'Confirmacion de guardado sobre el formulario',
  parameters: {
    docs: {
      description: {
        story:
          'Doble: se rellena la senal successMessage. El aviso aparece encima de las pestanas, se ' +
          'puede cerrar y el formulario sigue accesible debajo; el blueprint ademas lo retira solo ' +
          'a los cuatro segundos. Conviene mirarlo junto a la nota de arriba: hoy la pagina ' +
          'confirma el guardado sin haber llamado a ninguna API.',
      },
    },
  },
  render: () => ({
    props: {
      successMessage: signal('Perfil actualizado correctamente.'),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
};

export const SeguridadConErrorDeContrasena: Story = {
  name: 'Seguridad: las contrasenas no coinciden',
  parameters: {
    docs: {
      description: {
        story:
          'La historia abre la pestana Seguridad pulsandola, como haria una persona, y sustituye ' +
          'la senal errorMessage por el mensaje que produce savePassword() cuando la confirmacion ' +
          'no coincide. Se ve el unico error de la pagina que no es de validacion de campo: vive ' +
          'arriba, es cerrable, y no dice cual de los dos campos hay que corregir.',
      },
    },
  },
  render: () => ({
    props: {
      errorMessage: signal('Las contrasenas no coinciden.'),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Seguridad/ }));
  },
};

export const NotificacionesTodasApagadas: Story = {
  name: 'Notificaciones apagadas por completo',
  parameters: {
    docs: {
      description: {
        story:
          'Doble: los cuatro interruptores llegan en false, el estado de quien ha renunciado a ' +
          'todos los avisos. Es el reverso del valor por defecto -tres de cuatro encendidos- y ' +
          'sirve para comprobar que la fila sigue siendo legible sin el color de acento del ' +
          'interruptor activo. La historia abre la pestana Notificaciones pulsandola.',
      },
    },
  },
  render: () => ({
    props: {
      notifEmail: signal(false),
      notifPush: signal(false),
      notifWeekly: signal(false),
      notifSystem: signal(false),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Notificaciones/ }));
  },
};

export const AparienciaSinIdiomasQueOfrecer: Story = {
  name: 'Apariencia con el catalogo de idiomas vacio',
  parameters: {
    docs: {
      description: {
        story:
          'Doble: languageOptions llega vacio, que es lo que ocurre cuando el catalogo de idiomas ' +
          'lo sirve el backend y la respuesta viene sin nada. El selector se pinta igual, sin ' +
          'opciones y sin explicar por que, mientras el conmutador de tema de al lado sigue ' +
          'funcionando. La historia abre la pestana Apariencia pulsandola.',
      },
    },
  },
  render: () => ({
    props: {
      languageOptions: [],
      selectedLanguage: signal(''),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: /Apariencia/ }));
  },
};

export const NavegacionReplegada: Story = {
  name: 'Configuracion con la navegacion replegada',
  parameters: {
    docs: {
      description: {
        story:
          'sidebarVisible arranca en false: el estado al que llega la pagina al pulsar el boton de ' +
          'menu del Topbar y el que muestra el LayoutShell en pantalla estrecha. El contenido de ' +
          'configuracion esta limitado a 800 px y centrado, asi que al replegar la navegacion no ' +
          'se estira: se queda centrado en el hueco.',
      },
    },
  },
  render: () => ({
    props: {
      sidebarVisible: signal(false),
    },
    template: '<app-settings-page></app-settings-page>',
  }),
};
