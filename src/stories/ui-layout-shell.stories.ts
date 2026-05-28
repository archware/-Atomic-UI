import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { LayoutShellComponent } from '../app/shared/ui/templates/layout-shell/layout-shell.component';
import { SidebarComponent, SidebarMenuItem, SidebarUser } from '../app/shared/ui/organisms/sidebar/sidebar.component';
import { TopbarComponent } from '../app/shared/ui/organisms/topbar/topbar.component';

const mockMenuItems: SidebarMenuItem[] = [
  { id: 'home',     label: 'Dashboard',     icon: 'fa-solid fa-house',       active: true  },
  { id: 'users',    label: 'Usuarios',      icon: 'fa-solid fa-users'                      },
  { id: 'reports',  label: 'Reportes',      icon: 'fa-solid fa-chart-bar',   badge: '3'    },
  { id: 'settings', label: 'Configuración', icon: 'fa-solid fa-gear'                       },
  { id: 'logout',   label: 'Cerrar sesión', icon: 'fa-solid fa-arrow-right-from-bracket'   },
];

const mockUser: SidebarUser = {
  name: 'Juan Díaz',
  role: 'Administrador',
  initials: 'JD',
};

const meta: Meta<LayoutShellComponent> = {
  title: '5. Templates/LayoutShell',
  component: LayoutShellComponent,
  decorators: [
    moduleMetadata({
      imports: [LayoutShellComponent, SidebarComponent, TopbarComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**LayoutShellComponent** — Shell principal de la aplicación (Atomic Design: Template).

Combina sidebar + topbar + área de contenido en un grid CSS responsive.
En móvil (< 768px) el sidebar se convierte en un panel deslizable con overlay.

### Slots (ng-content)
| Slot | Selector | Descripción |
|---|---|---|
| Sidebar | \`slot="sidebar"\` | Panel lateral de navegación |
| Topbar | \`slot="topbar"\` | Barra superior |
| Contenido | *(default)* | Área principal scrollable |

### Ejemplo de uso
\`\`\`html
<app-layout-shell [sidebarVisible]="sidebarOpen" (closeSidebar)="sidebarOpen = false">
  <app-sidebar slot="sidebar" [menuItems]="items" [user]="user"></app-sidebar>
  <app-topbar slot="topbar" title="Mi App" (toggleSidebar)="sidebarOpen = !sidebarOpen"></app-topbar>
  <router-outlet></router-outlet>
</app-layout-shell>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    sidebarVisible: { control: 'boolean',  description: 'Muestra u oculta el sidebar' },
    sidebarWidth:   { control: 'text',     description: 'Ancho del sidebar (cualquier valor CSS: px, %, clamp…)' },
  },
};

export default meta;
type Story = StoryObj<LayoutShellComponent>;

/* ─── Default ──────────────────────────────────────────────────── */
export const Default: Story = {
  name: 'Sidebar visible',
  args: {
    sidebarVisible: true,
    sidebarWidth: '260px',
  },
  render: (args) => ({
    props: { ...args, mockMenuItems, mockUser },
    template: `
      <app-layout-shell
        [sidebarVisible]="sidebarVisible"
        [sidebarWidth]="sidebarWidth"
        style="height: 100vh;"
      >
        <app-sidebar
          slot="sidebar"
          [menuItems]="mockMenuItems"
          [user]="mockUser"
        ></app-sidebar>

        <app-topbar
          slot="topbar"
          title="Dashboard"
          userInitials="JD"
          userName="Juan Díaz"
          userEmail="juan@empresa.com"
          [notificationCount]="3"
        ></app-topbar>

        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          <h2 style="margin:0; font-size:1.5rem; font-weight:600; color:var(--text-color);">
            Bienvenido, Juan
          </h2>
          <p style="color:var(--text-color-secondary); margin:0;">
            Área de contenido principal — scrollable gracias al <code>ScrollOverlayComponent</code> interno.
            Agrega aquí <code>&lt;router-outlet&gt;</code> o el contenido de la página activa.
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem;">
            <div style="background:var(--surface-background);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">KPI 1</div>
            <div style="background:var(--surface-background);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">KPI 2</div>
            <div style="background:var(--surface-background);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">KPI 3</div>
            <div style="background:var(--surface-background);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;">KPI 4</div>
          </div>
        </div>
      </app-layout-shell>
    `,
  }),
};

/* ─── Sidebar oculto ────────────────────────────────────────────── */
export const SidebarHidden: Story = {
  name: 'Sidebar oculto',
  args: {
    sidebarVisible: false,
    sidebarWidth: '260px',
  },
  render: (args) => ({
    props: { ...args, mockMenuItems, mockUser },
    template: `
      <app-layout-shell
        [sidebarVisible]="sidebarVisible"
        [sidebarWidth]="sidebarWidth"
        style="height: 100vh;"
      >
        <app-sidebar slot="sidebar" [menuItems]="mockMenuItems" [user]="mockUser"></app-sidebar>
        <app-topbar slot="topbar" title="Sin sidebar" userInitials="JD" userName="Juan Díaz"></app-topbar>
        <p style="color:var(--text-color-secondary);">
          Con <code>sidebarVisible = false</code> el sidebar se oculta y el contenido
          ocupa todo el ancho disponible. El topbar incluye el botón de toggle.
        </p>
      </app-layout-shell>
    `,
  }),
};

/* ─── Sidebar ancho personalizado ──────────────────────────────── */
export const WideSidebar: Story = {
  name: 'Sidebar ancho personalizado',
  args: {
    sidebarVisible: true,
    sidebarWidth: '320px',
  },
  render: (args) => ({
    props: { ...args, mockMenuItems, mockUser },
    template: `
      <app-layout-shell
        [sidebarVisible]="sidebarVisible"
        [sidebarWidth]="sidebarWidth"
        style="height: 100vh;"
      >
        <app-sidebar slot="sidebar" [menuItems]="mockMenuItems" [user]="mockUser"></app-sidebar>
        <app-topbar slot="topbar" title="Sidebar 320px" userInitials="JD" userName="Juan Díaz"></app-topbar>
        <p style="color:var(--text-color-secondary);">
          <code>sidebarWidth</code> acepta cualquier valor CSS válido: <code>'260px'</code>,
          <code>'25%'</code>, <code>'clamp(200px, 20%, 300px)'</code>, etc.
        </p>
      </app-layout-shell>
    `,
  }),
};
