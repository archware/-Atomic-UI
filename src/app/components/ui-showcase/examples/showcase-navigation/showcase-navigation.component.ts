import { Component, signal } from '@angular/core';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TabsComponent, TabComponent } from '../../../../shared/ui/organisms/tabs/tabs.component';
import { AccordionComponent, AccordionItemComponent } from '../../../../shared/ui/organisms/accordion/accordion.component';
import { SidebarComponent, SidebarMenuItem } from '../../../../shared/ui/organisms/sidebar/sidebar.component';
import { TopbarComponent } from '../../../../shared/ui/organisms/topbar/topbar.component';
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
    TopbarComponent,
    StepperComponent
],
  template: `
    <!-- TOPBAR -->
    <app-panel title="Topbar (Organism)" variant="flat" padding="md" class="showcase-section">
      <div style="width: 100%; border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; background-color: var(--surface-ground);">
        <app-topbar 
          title="Atomic UI Topbar" 
          userInitials="DU" 
          userName="Demo User"
          userEmail="demo.user@email.com" 
          [notificationCount]="3" 
          subtitle="Entorno Operativo"
          apiStatus="API en línea"
          [showHomeButton]="true"
          [showSidebarToggle]="true"
          userRole="Administrator"
          bgColor="var(--surface-sunken)"
          [showNotifications]="true"
          [showLanguageSwitcher]="false">
        </app-topbar>
      </div>
    </app-panel>

    <!-- SIDEBAR -->
    <app-panel title="Sidebar (Organism)" variant="flat" padding="md" class="showcase-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; width: 100%; box-sizing: border-box;">

        <!-- Variant 1: Dashboard -->
        <div style="height: 500px; min-width: 0; border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
          <app-sidebar [menuItems]="variant1Items" [user]="exampleUser" [collapsed]="false" logoText="Atomic UI" logoSubtitle="SSIT CONSULTING" logoImageUrl="assets/doctrinas/ssit-emblem.jpg" [logoBadgeImages]="['assets/doctrinas/doctrina-barracuda-icon.jpg', 'assets/doctrinas/doctrina-mangosta-icon.jpg']" logoIcon="fa-solid fa-layer-group" logoIconColor="var(--primary-color)" logoTextColor="var(--text-color)" headerBgColor="var(--surface-sunken)" footerBgColor="var(--surface-sunken)"></app-sidebar>
          <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; color: #e5e7eb; letter-spacing: 0.02em;">
            Variant 1: Main App
          </div>
        </div>

        <!-- Variant 2: Settings/Simple -->
        <div style="height: 500px; min-width: 0; border: 1px solid var(--border-color); border-radius: 0.75rem; overflow: hidden; position: relative; background-color: var(--surface-ground);">
          <app-sidebar [menuItems]="variant2Items" [collapsed]="false" logoText="Config" logoIcon="fa-solid fa-gear" logoIconColor="var(--info-color)"></app-sidebar>
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
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; width: 100%; box-sizing: border-box;">
        <div style="min-width: 0;">
          <p style="margin: 0 0 0.75rem; font-size: var(--text-sm); font-weight: var(--font-weight-emphasis); color: var(--text-color);">
            Variante 1: Selección única (<code>variant="single"</code>)
          </p>
          <p style="margin: 0 0 1rem; font-size: var(--text-xs); color: var(--text-color-secondary);">
            Al abrir un panel, los demás se cierran automáticamente.
          </p>
          <app-accordion variant="single">
            <app-accordion-item
              title="¿Qué es este sistema?"
              description="Arquitectura y soporte de temas"
              icon="fa-solid fa-layer-group"
              [open]="true"
            >
              Este es un sistema de componentes UI reutilizables con soporte para temas claro y oscuro.
            </app-accordion-item>
            <app-accordion-item
              title="¿Cómo cambio el tema?"
              description="Conmutación entre modo claro y oscuro"
              icon="fa-solid fa-palette"
            >
              Usa el componente ThemeSwitcher en la esquina superior derecha para cambiar entre modos.
            </app-accordion-item>
            <app-accordion-item
              title="¿Puedo personalizar los colores?"
              description="Variables semánticas y tokens de marca"
              icon="fa-solid fa-sliders"
            >
              Sí, todos los colores están definidos como variables CSS en el archivo tokens.css.
            </app-accordion-item>
          </app-accordion>
        </div>

        <div style="min-width: 0;">
          <p style="margin: 0 0 0.75rem; font-size: var(--text-sm); font-weight: var(--font-weight-emphasis); color: var(--text-color);">
            Variante 2: Apertura múltiple (<code>variant="multiple"</code>)
          </p>
          <p style="margin: 0 0 1rem; font-size: var(--text-xs); color: var(--text-color-secondary);">
            Permite mantener varias secciones abiertas simultáneamente para comparar contenido.
          </p>
          <app-accordion variant="multiple">
            <app-accordion-item title="Resumen de facturación" [open]="true">
              Comprobantes emitidos y estado de envío electrónico del periodo actual.
            </app-accordion-item>
            <app-accordion-item title="Condiciones comerciales" [open]="true">
              Plazos de crédito, descuentos autorizados y límites operativos vigentes.
            </app-accordion-item>
            <app-accordion-item title="Historial de auditoría">
              Registro cronológico de aprobaciones y cambios aplicados al expediente.
            </app-accordion-item>
          </app-accordion>
        </div>
      </div>

      <div style="margin-top: 2rem; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: var(--space-4); background: var(--surface-background);">
        <p style="margin: 0 0 0.75rem; font-size: var(--text-sm); font-weight: var(--font-weight-emphasis); color: var(--text-color);">
          Variante 3: Sin marco e integrado (<code>variant="flush" [single]="true"</code>)
        </p>
        <app-accordion variant="flush" [single]="true">
          <app-accordion-item title="Verificación de identidad" description="Paso 1 completado" [open]="true">
            Documento validado satisfactoriamente contra el padrón oficial.
          </app-accordion-item>
          <app-accordion-item title="Evaluación crediticia" description="Paso 2 en revisión">
            Cálculo de capacidad de pago y calificación de riesgo del solicitante.
          </app-accordion-item>
          <app-accordion-item title="Desembolso final" description="Disponible tras la aprobación" [disabled]="true">
            Este panel permanece bloqueado hasta completar la evaluación crediticia.
          </app-accordion-item>
        </app-accordion>
      </div>
    </app-panel>

    <!-- STEPPER -->
    <app-panel title="Stepper" variant="flat" padding="md" class="showcase-section">
      <p style="margin-bottom: 1rem; color: var(--text-color-secondary);">Horizontal Stepper:</p>
      <app-stepper
        [steps]="stepperSteps"
        [activeStep]="currentStep()"
        [maxReachableStep]="1"
        (stepChange)="currentStep.set($event)"
      ></app-stepper>

      <div style="margin-top: 2rem;">
        <p style="margin-bottom: 1rem; color: var(--text-color-secondary);">Vertical Stepper:</p>
        <app-stepper
          [steps]="stepperSteps"
          [activeStep]="currentStep()"
          [maxReachableStep]="1"
          [vertical]="true"
          (stepChange)="currentStep.set($event)"
        ></app-stepper>
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

  readonly currentStep = signal(1);
}



