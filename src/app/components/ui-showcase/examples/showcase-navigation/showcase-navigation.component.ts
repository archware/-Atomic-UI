import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TabsComponent, TabComponent } from '../../../../shared/ui/organisms/tabs/tabs.component';
import { AccordionComponent, AccordionItemComponent } from '../../../../shared/ui/organisms/accordion/accordion.component';
import { SidebarComponent, SidebarMenuItem } from '../../../../shared/ui/organisms/sidebar/sidebar.component';

@Component({
  selector: 'app-showcase-navigation',
  standalone: true,
  imports: [
    CommonModule,
    PanelComponent,
    TabsComponent,
    TabComponent,
    AccordionComponent,
    AccordionItemComponent,
    SidebarComponent
  ],
  template: `
    <!-- SIDEBAR -->
    <app-panel title="Sidebar (Organism)" variant="flat" padding="md" class="showcase-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
        
        <!-- Variant 1: Dashboard -->
        <div style="height: 500px; border: 1px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
          <app-sidebar [menuItems]="variant1Items" [user]="exampleUser" [collapsed]="false"></app-sidebar>
          <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
            Variant 1: Main App
          </div>
        </div>

        <!-- Variant 2: Settings/Simple -->
        <div style="height: 500px; border: 1px solid var(--border-color); border-radius: 0.5rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
           <app-sidebar [menuItems]="variant2Items" [collapsed]="false"></app-sidebar>
           <div style="position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
            Variant 2: Settings Context
          </div>
        </div>

      </div>
    </app-panel>

    <!-- TABS -->
    <app-panel title="Tabs" variant="flat" padding="md" class="showcase-section">
      <app-tabs>
        <app-tab label="General" icon="⚙️">
          <p>Contenido de la pestaña General</p>
        </app-tab>
        <app-tab label="Perfil" icon="👤">
          <p>Contenido de la pestaña Perfil</p>
        </app-tab>
        <app-tab label="Notificaciones" icon="🔔">
          <p>Contenido de la pestaña Notificaciones</p>
        </app-tab>
      </app-tabs>
    </app-panel>

    <!-- ACCORDION -->
    <app-panel title="Accordion" variant="flat" padding="md" class="showcase-section">
      <app-accordion>
        <app-accordion-item title="¿Qué es este sistema?">
          Este es un sistema de componentes UI reutilizables con soporte para temas claro y oscuro.
        </app-accordion-item>
        <app-accordion-item title="¿Cómo cambio el tema?">
          Usa el componente ThemeSwitcher en la esquina superior derecha para cambiar entre modos.
        </app-accordion-item>
        <app-accordion-item title="¿Puedo personalizar los colores?" [open]="true">
          Sí, todos los colores están definidos como variables CSS en el archivo tokens.css.
        </app-accordion-item>
      </app-accordion>
    </app-panel>
  `,
  styles: [`
    .showcase-section {
      margin-bottom: 2rem;
      display: block;
    }
  `]
})
export class ShowcaseNavigationComponent {
  variant1Items: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true },
    { label: 'Proyectos', icon: 'fa-solid fa-folder', route: '/projects' },
    { label: 'Reportes', icon: 'fa-solid fa-file-alt', route: '/reports', badge: 'New' },
    { label: 'Equipo', icon: 'fa-solid fa-users', route: '/team', badge: 3 }
  ];

  variant2Items: SidebarMenuItem[] = [
    { label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile' },
    { label: 'Seguridad', icon: 'fa-solid fa-shield-alt', route: '/security' },
    { label: 'Notificaciones', icon: 'fa-solid fa-bell', route: '/notifications' },
    { label: 'Ayuda', icon: 'fa-solid fa-circle-question', route: '/help' },
    { label: 'Cerrar Sesión', icon: 'fa-solid fa-right-from-bracket', route: '/logout' }
  ];

  exampleUser = {
    name: 'Demo User',
    role: 'Administrator',
    initials: 'DU'
  };
}
