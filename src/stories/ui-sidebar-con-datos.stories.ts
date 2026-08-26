import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { SidebarComponent } from '../app/shared/ui/organisms/sidebar/sidebar.component';
import type {
  SidebarMenuItem,
  SidebarUser,
} from '../app/shared/ui/organisms/sidebar/sidebar.component';

/*
  LA HISTORIA VIEJA DEL SIDEBAR NO LE PASA DATOS, Y ESO NO DOCUMENTA NADA.

  `ui-sidebar.stories.ts` tiene tres historias y solo cambia `[collapsed]`: 1 de
  las 5 entradas. Un sidebar sin `menuItems` y sin `user` es una columna vacia
  con un logotipo; no se ve el elemento activo, ni el icono coloreado, ni la
  insignia de notificaciones, ni el pie con la persona conectada, que es justo
  lo que alguien viene a buscar cuando abre esta pagina.

  Este fichero le pasa datos de verdad —los mismos que el catalogo vivo usa en
  `showcase-navigation`— y cubre las cinco entradas: `menuItems`, `user`,
  `collapsed`, `logoText` y `logoIcon`.

  Sobre el color de los iconos: `iconColor` se escribe SIEMPRE como token
  (`var(--info-color)` y companeros), nunca como valor fijo. El componente lo
  inyecta con `appVariablesCss` en `--sidebar-icon-color`, asi que un token
  acompana al tema oscuro y un `#3b82f6` se queda clavado en el claro.
*/

const MARCO_ANCHO = '17rem';
const MARCO_ESTRECHO = '5.5rem';

/** Marco con el alto y el ancho que el sidebar no trae por si mismo. */
function marco(contenido: string, ancho = MARCO_ANCHO, alto = '30rem'): string {
  return `
    <div style="width:${ancho}; height:${alto}; overflow:hidden; border:var(--border-width-thin) solid var(--border-color); border-radius:var(--radius-lg); background:var(--sidebar-bg);">
      ${contenido}
    </div>
  `;
}

const OPERACION: SidebarMenuItem[] = [
  {
    id: 'panel',
    label: 'Panel del día',
    icon: 'fa-solid fa-chart-pie',
    iconColor: 'var(--secondary-color)',
    active: true,
  },
  {
    id: 'caja',
    label: 'Caja',
    icon: 'fa-solid fa-cash-register',
    iconColor: 'var(--success-color)',
    badge: 3,
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'fa-solid fa-users',
    iconColor: 'var(--info-color)',
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    icon: 'fa-solid fa-right-left',
    iconColor: 'var(--warning-color)',
    children: [
      { id: 'cobros', label: 'Cobros', icon: 'fa-solid fa-hand-holding-dollar' },
      { id: 'desembolsos', label: 'Desembolsos', icon: 'fa-solid fa-money-bill-transfer', badge: 2 },
      { id: 'reversos', label: 'Reversos', icon: 'fa-solid fa-rotate-left' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'fa-solid fa-file-lines',
    iconColor: 'var(--info-color)',
    badge: 'Nuevo',
  },
  {
    id: 'salir',
    label: 'Cerrar sesión',
    icon: 'fa-solid fa-right-from-bracket',
    iconColor: 'var(--danger-color)',
  },
];

const JEFA_DE_AGENCIA: SidebarUser = {
  name: 'Juana Delgado Ramírez',
  role: 'Jefa de agencia',
  initials: 'JD',
};

/*
  MENU LARGO: DIECISEIS ENTRADAS EN UNA COLUMNA QUE NO CRECE.

  No es un capricho de volumen. El sidebar mete su navegacion dentro de
  `app-scroll-overlay`, y ese comportamiento —que la lista se desplace sola y el
  pie con el usuario se quede fijo— no se ve con cuatro elementos. Se ve cuando
  no caben.
*/
const CATALOGO_LARGO: SidebarMenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'fa-solid fa-house' },
  { id: 'clientes', label: 'Clientes', icon: 'fa-solid fa-users', active: true },
  { id: 'creditos', label: 'Créditos', icon: 'fa-solid fa-file-invoice-dollar', badge: 12 },
  { id: 'garantias', label: 'Garantías', icon: 'fa-solid fa-shield-halved' },
  { id: 'cobranza', label: 'Cobranza', icon: 'fa-solid fa-hand-holding-dollar', badge: 5 },
  { id: 'caja', label: 'Caja y arqueo', icon: 'fa-solid fa-cash-register' },
  { id: 'bancos', label: 'Bancos', icon: 'fa-solid fa-building-columns' },
  { id: 'proveedores', label: 'Proveedores', icon: 'fa-solid fa-truck-field' },
  { id: 'compras', label: 'Compras', icon: 'fa-solid fa-basket-shopping' },
  { id: 'inventario', label: 'Inventario', icon: 'fa-solid fa-boxes-stacked' },
  { id: 'personal', label: 'Personal', icon: 'fa-solid fa-id-badge' },
  { id: 'planillas', label: 'Planillas', icon: 'fa-solid fa-money-check-dollar' },
  { id: 'contabilidad', label: 'Contabilidad', icon: 'fa-solid fa-calculator' },
  { id: 'reportes', label: 'Reportes', icon: 'fa-solid fa-chart-column' },
  { id: 'auditoria', label: 'Auditoría', icon: 'fa-solid fa-clipboard-check' },
  { id: 'configuracion', label: 'Configuración', icon: 'fa-solid fa-gear' },
];

const CON_INSIGNIAS: SidebarMenuItem[] = [
  {
    id: 'bandeja',
    label: 'Bandeja de entrada',
    icon: 'fa-solid fa-inbox',
    iconColor: 'var(--info-color)',
    badge: 8,
    active: true,
  },
  {
    id: 'aprobaciones',
    label: 'Aprobaciones pendientes',
    icon: 'fa-solid fa-circle-check',
    iconColor: 'var(--warning-color)',
    badge: 137,
  },
  {
    id: 'incidencias',
    label: 'Incidencias',
    icon: 'fa-solid fa-triangle-exclamation',
    iconColor: 'var(--danger-color)',
    badge: '99+',
  },
  {
    id: 'novedades',
    label: 'Novedades',
    icon: 'fa-solid fa-bullhorn',
    iconColor: 'var(--secondary-color)',
    badge: 'Nuevo',
  },
  {
    id: 'archivo',
    label: 'Archivo',
    icon: 'fa-solid fa-box-archive',
    iconColor: 'var(--text-color-secondary)',
  },
];

const SECCIONES_ANIDADAS: SidebarMenuItem[] = [
  { id: 'inicio', label: 'Inicio', icon: 'fa-solid fa-house' },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'fa-solid fa-receipt',
    expanded: true,
    children: [
      { id: 'boletas', label: 'Boletas', icon: 'fa-solid fa-file-lines' },
      { id: 'facturas', label: 'Facturas', icon: 'fa-solid fa-file-invoice', badge: 4 },
      { id: 'notas', label: 'Notas de crédito', icon: 'fa-solid fa-file-circle-minus' },
    ],
  },
  {
    id: 'almacen',
    label: 'Almacén',
    icon: 'fa-solid fa-warehouse',
    children: [
      { id: 'kardex', label: 'Kárdex', icon: 'fa-solid fa-table-list', active: true },
      { id: 'traslados', label: 'Traslados', icon: 'fa-solid fa-dolly' },
    ],
  },
  {
    id: 'ajustes',
    label: 'Ajustes',
    icon: 'fa-solid fa-sliders',
    children: [{ id: 'usuarios', label: 'Usuarios', icon: 'fa-solid fa-user-gear' }],
  },
];

const meta: Meta<SidebarComponent> = {
  title: '3. Organisms/Sidebar con datos',
  component: SidebarComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SidebarComponent] })],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
El sidebar **con datos dentro**: elemento activo, iconos coloreados por token,
insignias, submenús y el pie con la persona conectada.

Cuatro hechos de la API que estas historias dejan a la vista:

1. \`iconColor\` se ignora en el elemento **activo**. La plantilla pasa
   \`item.active ? null : item.iconColor\`, porque el estado activo ya tiene su
   propio color y dos señales compitiendo no son dos señales.
2. Un elemento con \`children\` **no navega**: el clic despliega o pliega la rama
   y \`navigate\` no emite. Solo emiten las hojas.
3. La rama que contiene al elemento activo se abre sola aunque no declare
   \`expanded\`; \`expanded\` solo hace falta para abrir una rama sin activo dentro.
4. Colapsado (\`collapsed\`) se pierden la etiqueta **y la insignia**: ambas viven
   dentro del mismo bloque \`nav-label\`. Está documentado abajo porque es la
   diferencia entre «hay 8 pendientes» y no saberlo.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const NavegacionDeTrabajo: Story = {
  name: 'Navegación real, con marca y usuario',
  render: () => ({
    props: { menu: OPERACION, usuaria: JEFA_DE_AGENCIA },
    template: marco(`
      <app-sidebar
        [menuItems]="menu"
        [user]="usuaria"
        [collapsed]="false"
        logoText="Agencia Centro"
        logoIcon="fa-solid fa-building-columns"
      ></app-sidebar>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story: `
Las cinco entradas del componente, todas a la vez: seis opciones con icono y
color propio, «Panel del día» marcado como activo, «Caja» con tres pendientes,
«Reportes» con la insignia de texto «Nuevo», una rama desplegable y el pie con
la jefa de agencia.

\`logoText\` y \`logoIcon\` son lo que convierte el ADN en la marca del frontal
que lo consume; por omisión valen «Atomic UI» y el átomo, que es un valor de
demostración y no debería llegar a producción.
        `,
      },
    },
  },
};

export const MenuLargoQueDesborda: Story = {
  name: 'Dieciséis opciones que no caben',
  render: () => ({
    props: { menu: CATALOGO_LARGO, usuaria: JEFA_DE_AGENCIA },
    template: marco(
      `
      <app-sidebar
        [menuItems]="menu"
        [user]="usuaria"
        [collapsed]="false"
        logoText="Mini ERP"
        logoIcon="fa-solid fa-cubes"
      ></app-sidebar>
    `,
      MARCO_ANCHO,
      '24rem',
    ),
  }),
  parameters: {
    docs: {
      description: {
        story: `
Dieciséis opciones en una columna de 24 rem: no caben, y ahí se ve el reparto
que hace el componente. El logotipo arriba y el pie con el usuario se quedan
**fijos**; lo único que se desplaza es la lista, dentro de
\`app-scroll-overlay\`.

Es el motivo por el que el sidebar no debe crecer con la ventana: el nombre de
quien está conectado tiene que seguir visible cuando la navegación llega a la
opción número dieciséis.
        `,
      },
    },
  },
};

export const InsigniasDeNotificacion: Story = {
  name: 'Insignias: número, número largo y texto',
  render: () => ({
    props: { menu: CON_INSIGNIAS, usuaria: JEFA_DE_AGENCIA },
    template: marco(`
      <app-sidebar [menuItems]="menu" [user]="usuaria" [collapsed]="false" logoText="Bandeja"></app-sidebar>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story: `
\`badge\` admite número o texto, y las cuatro formas se comportan distinto en el
mismo ancho: \`8\` cabe de sobra, \`137\` empuja la etiqueta, \`'99+'\` es el
recorte que evita ese empujón y \`'Nuevo'\` es una insignia de estado, no de
recuento.

La etiqueta se recorta antes que la insignia —\`nav-badge\` lleva
\`flex-shrink: 0\`—, así que el número nunca se parte. Conviene aprovecharlo:
por encima de dos cifras, un tope como «99+» dice lo mismo y no roba sitio al
nombre de la opción.

La insignia usa \`--danger-color\` con texto sobre color, sea cual sea el tema;
no hay nada que ajustar para el modo oscuro.
        `,
      },
    },
  },
};

export const ColapsadoPierdeLaInsignia: Story = {
  name: 'Colapsado: qué información se pierde',
  render: () => ({
    props: { menu: CON_INSIGNIAS, usuaria: JEFA_DE_AGENCIA },
    template: `
      <div style="display:flex; gap:var(--space-6); align-items:flex-start;">
        <div>
          <p style="margin:0 0 var(--space-2); font-size:var(--text-sm); color:var(--text-color-secondary);">
            Expandido
          </p>
          ${marco(
            `<app-sidebar [menuItems]="menu" [user]="usuaria" [collapsed]="false" logoText="Bandeja"></app-sidebar>`,
            MARCO_ANCHO,
            '26rem',
          )}
        </div>
        <div>
          <p style="margin:0 0 var(--space-2); font-size:var(--text-sm); color:var(--text-color-secondary);">
            Colapsado
          </p>
          ${marco(
            `<app-sidebar [menuItems]="menu" [user]="usuaria" [collapsed]="true" logoText="Bandeja"></app-sidebar>`,
            MARCO_ESTRECHO,
            '26rem',
          )}
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Los dos sidebars tienen exactamente los mismos datos. Al colapsar desaparecen la
etiqueta, la insignia, el nombre del usuario y el galón para desplegar ramas:
todo eso vive dentro del bloque que la plantilla condiciona con
\`@if (!collapsed())\`.

Lo que sobrevive es el icono —con su \`iconColor\`— y el avatar. Por eso el
icono de cada opción tiene que ser reconocible por sí solo: en modo colapsado es
la **única** pista, y no hay tooltip que lo acompañe.

Se documenta como pérdida y no como decisión de diseño porque una insignia es un
aviso: si el modo colapsado es el habitual en una pantalla, los pendientes hay
que contarlos en otra parte.
        `,
      },
    },
  },
};

export const RamasYElementoActivo: Story = {
  name: 'Ramas: la que contiene al activo se abre sola',
  render: () => ({
    props: { menu: SECCIONES_ANIDADAS, usuaria: JEFA_DE_AGENCIA },
    template: marco(
      `
      <app-sidebar
        [menuItems]="menu"
        [user]="usuaria"
        [collapsed]="false"
        logoText="Mini ERP"
        logoIcon="fa-solid fa-cubes"
      ></app-sidebar>
    `,
      MARCO_ANCHO,
      '28rem',
    ),
  }),
  parameters: {
    docs: {
      description: {
        story: `
Tres ramas y tres comportamientos distintos, sin una línea de código de quien lo
monta:

- **Ventas** está abierta porque lo pide con \`expanded: true\`.
- **Almacén** está abierta sin pedirlo, porque «Kárdex» —su hijo— es el elemento
  activo. Es lo correcto: una pantalla activa que estuviera escondida detrás de
  una rama cerrada dejaría al usuario sin saber dónde está.
- **Ajustes** está cerrada, que es lo que ocurre por omisión.

Pulsar sobre una rama la abre o la cierra y **no emite \`navigate\`**; el evento
solo lo lanzan las hojas. Una vez que el usuario abre o cierra a mano, su
decisión manda sobre la automática mientras el componente viva.
        `,
      },
    },
  },
};

export const SinOpcionesDisponibles: Story = {
  name: 'Sin opciones y sin usuario',
  render: () => ({
    props: { menu: [] as SidebarMenuItem[] },
    template: marco(
      `
      <app-sidebar [menuItems]="menu" [collapsed]="false" logoText="Sin permisos"></app-sidebar>
    `,
      MARCO_ANCHO,
      '20rem',
    ),
  }),
  parameters: {
    docs: {
      description: {
        story: `
Es el sidebar que ve un usuario cuyo rol no habilita ninguna sección, y es
también lo que renderiza hoy la historia antigua de este componente: logotipo,
una lista vacía y ningún pie, porque \`user\` sin valor no pinta el bloque.

Queda aquí como advertencia, no como ejemplo a copiar. **El componente no tiene
mensaje de vacío**: no dice «no hay secciones disponibles» ni «solicite acceso»,
así que una columna en blanco se lee igual que un fallo de carga. Quien monte la
pantalla tiene que resolverlo por fuera hasta que el ADN lo cubra.
        `,
      },
    },
  },
};
