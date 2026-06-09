import { Component } from '@angular/core';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TabsComponent, TabComponent } from '../../../../shared/ui/organisms/tabs/tabs.component';
import { AccordionComponent, AccordionItemComponent } from '../../../../shared/ui/organisms/accordion/accordion.component';
import { SidebarComponent, SidebarMenuItem } from '../../../../shared/ui/organisms/sidebar/sidebar.component';
import { StepperComponent, Step } from '../../../../shared/ui/organisms/stepper/stepper.component';

@Component({
  selector: 'app-showcase-navigation',
  standalone: true,
  imports: [
    PanelComponent,
    TabsComponent,
    TabComponent,
    AccordionComponent,
    AccordionItemComponent,
    SidebarComponent,
    StepperComponent
],
  template: `
    <!-- SIDEBAR -->
    <app-panel title="Sidebar (Organism)" variant="flat" padding="md" class="showcase-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; width: 100%; box-sizing: border-box;">

        <!-- Variant 1: Dashboard -->
        <div style="height: 500px; min-width: 0; border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
          <app-sidebar [menuItems]="variant1Items" [user]="exampleUser" [collapsed]="false"></app-sidebar>
          <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #e5e7eb; letter-spacing: 0.02em;">
            Variant 1: Main App
          </div>
        </div>

        <!-- Variant 2: Settings/Simple -->
        <div style="height: 500px; min-width: 0; border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
          <app-sidebar [menuItems]="variant2Items" [collapsed]="false"></app-sidebar>
          <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #e5e7eb; letter-spacing: 0.02em;">
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

    <!-- STEPPER -->
    <app-panel title="Stepper" variant="flat" padding="md" class="showcase-section">
      <p style="margin-bottom: 1rem; color: var(--text-color-secondary);">Horizontal Stepper:</p>
      <app-stepper [steps]="stepperSteps" [activeStep]="1"></app-stepper>

      <div style="margin-top: 2rem;">
        <p style="margin-bottom: 1rem; color: var(--text-color-secondary);">Vertical Stepper:</p>
        <app-stepper [steps]="stepperSteps" [activeStep]="1" [vertical]="true"></app-stepper>
      </div>
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
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard', active: true, iconColor: 'var(--secondary-color)' },
    { label: 'Proyectos', icon: 'fa-solid fa-folder', route: '/projects', iconColor: 'var(--warning-color)' },
    { label: 'Reportes', icon: 'fa-solid fa-file-alt', route: '/reports', badge: 'New', iconColor: 'var(--info-color)' },
    { label: 'Equipo', icon: 'fa-solid fa-users', route: '/team', badge: 3, iconColor: 'var(--success-color)' }
  ];

  variant2Items: SidebarMenuItem[] = [
    { label: 'Mi Perfil', icon: 'fa-solid fa-user', route: '/profile', iconColor: 'var(--info-color)' },
    { label: 'Seguridad', icon: 'fa-solid fa-shield-alt', route: '/security', iconColor: 'var(--success-color)' },
    { label: 'Notificaciones', icon: 'fa-solid fa-bell', route: '/notifications', iconColor: 'var(--warning-color)' },
    { label: 'Ayuda', icon: 'fa-solid fa-circle-question', route: '/help', iconColor: 'var(--text-color-secondary)' },
    { label: 'Cerrar Sesión', icon: 'fa-solid fa-right-from-bracket', route: '/logout', iconColor: 'var(--error-color)' }
  ];

  exampleUser = {
    name: 'Demo User',
    role: 'Administrator',
    initials: 'DU'
  };

  stepperSteps: Step[] = [
    { label: 'Datos Personales', description: 'Información básica', icon: '👤' },
    { label: 'Verificación', description: 'Confirmar email' },
    { label: 'Pago', description: 'Método de pago', optional: true },
    { label: 'Confirmación', description: 'Revisar pedido' }
  ];

  readonly currentStep = 1;
}



