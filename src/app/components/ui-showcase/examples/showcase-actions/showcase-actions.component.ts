import { Component, inject } from '@angular/core';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { IconButtonComponent } from '../../../../shared/ui/atoms/icon-button/icon-button.component';
import { ActionMenuComponent, ActionMenuItem } from '../../../../shared/ui/molecules/action-menu/action-menu.component';
import { PopupService } from '../../../../shared/ui/services/popup.service';

@Component({
  selector: 'app-showcase-actions',
  standalone: true,
  imports: [
    PanelComponent,
    TextComponent,
    ButtonComponent,
    IconButtonComponent,
    ActionMenuComponent
],
  template: `
    <!-- BOTONES -->
    <app-panel title="Botones (Flat, Gradient y Tonales)" variant="flat" padding="md" class="showcase-section">
      <app-text variant="caption" color="muted">Superficies sólidas uniformes (appearance="flat"):</app-text>
      <div class="button-grid" style="margin-top: 0.5rem;">
        <app-button variant="primary">Primary</app-button>
        <app-button variant="secondary">Secondary</app-button>
        <app-button variant="success">Success</app-button>
        <app-button variant="warning">Warning</app-button>
        <app-button variant="danger">Danger</app-button>
        <app-button variant="outline">Outline</app-button>
        <app-button variant="ghost">Ghost</app-button>
        <app-button variant="primary" [disabled]="true">Disabled</app-button>
      </div>

      <div style="margin-top: 1rem;">
        <app-text variant="caption" color="muted">Superficies sólidas con degradado y resplandor (appearance="gradient"):</app-text>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-button variant="primary" appearance="gradient" iconClass="fa-solid fa-layer-group">Unir PDFs</app-button>
          <app-button variant="secondary" appearance="gradient" iconClass="fa-solid fa-compress">Comprimir</app-button>
          <app-button variant="success" appearance="gradient" iconClass="fa-solid fa-check">Confirmar</app-button>
          <app-button variant="warning" appearance="gradient" iconClass="fa-solid fa-bolt">Optimizar</app-button>
          <app-button variant="danger" appearance="gradient" iconClass="fa-solid fa-scissors">Eliminar Páginas</app-button>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <app-text variant="caption" color="muted">Variantes contextuales Soft, Outline y Ghost por tono semántico:</app-text>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-button variant="soft" tone="neutral" size="sm">Soft Neutral</app-button>
          <app-button variant="soft" tone="primary" size="sm">Soft Primary</app-button>
          <app-button variant="soft" tone="secondary" size="sm">Soft Secondary</app-button>
          <app-button variant="soft" tone="success" size="sm">Soft Success</app-button>
          <app-button variant="soft" tone="warning" size="sm">Soft Warning</app-button>
          <app-button variant="soft" tone="danger" size="sm" iconClass="fa-solid fa-trash-can">Vaciar</app-button>
          <app-button variant="soft" tone="info" size="sm">Soft Info</app-button>
        </div>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-button variant="outline" tone="neutral" size="sm">Outline Neutral</app-button>
          <app-button variant="outline" tone="primary" size="sm">Outline Primary</app-button>
          <app-button variant="outline" tone="secondary" size="sm">Outline Secondary</app-button>
          <app-button variant="outline" tone="success" size="sm">Outline Success</app-button>
          <app-button variant="outline" tone="warning" size="sm">Outline Warning</app-button>
          <app-button variant="outline" tone="danger" size="sm">Outline Danger</app-button>
          <app-button variant="outline" tone="info" size="sm">Outline Info</app-button>
        </div>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-button variant="ghost" tone="neutral" size="sm">Ghost Neutral</app-button>
          <app-button variant="ghost" tone="primary" size="sm">Ghost Primary</app-button>
          <app-button variant="ghost" tone="secondary" size="sm">Ghost Secondary</app-button>
          <app-button variant="ghost" tone="success" size="sm">Ghost Success</app-button>
          <app-button variant="ghost" tone="warning" size="sm">Ghost Warning</app-button>
          <app-button variant="ghost" tone="danger" size="sm">Ghost Danger</app-button>
          <app-button variant="ghost" tone="info" size="sm">Ghost Info</app-button>
        </div>
      </div>

      <div class="button-sizes">
        <app-button variant="primary" appearance="gradient" size="sm">Small (sm)</app-button>
        <app-button variant="primary" appearance="gradient">Medium (md)</app-button>
        <app-button variant="primary" appearance="gradient" size="lg">Large (lg)</app-button>
      </div>

      <div style="margin-top: 1rem;">
        <app-text variant="caption" color="muted">Componente Button con iconos:</app-text>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-button variant="primary" icon="🔍">Buscar</app-button>
          <app-button variant="success" icon="✓" iconPosition="left">Guardar</app-button>
          <app-button variant="secondary" icon="→" iconPosition="right">Siguiente</app-button>
          <app-button variant="danger" icon="🗑️">Eliminar</app-button>
          <app-button variant="outline" icon="📋">Copiar</app-button>
          <app-button variant="ghost" icon="⚙️">Opciones</app-button>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <app-text variant="caption" color="muted">Componente IconButton (default, ghost, avatar, close, close-soft, tamaños y animaciones):</app-text>
        <div class="button-grid" style="margin-top: 0.5rem;">
          <app-icon-button variant="default" icon="fa-solid fa-gear" tooltip="Default" ariaLabel="Configuración" />
          <app-icon-button variant="ghost" icon="fa-solid fa-magnifying-glass-plus" tooltip="Ghost" ariaLabel="Inspeccionar" />
          <app-icon-button variant="avatar" icon="fa-solid fa-user" tooltip="Avatar" ariaLabel="Perfil" />
          <app-icon-button variant="close" tooltip="Close neutro" ariaLabel="Cerrar neutro" />
          <app-icon-button variant="close-soft" size="sm" tooltip="Close-soft (sm)" ariaLabel="Quitar compacto" />
          <app-icon-button variant="close-soft" size="md" tooltip="Close-soft (md)" ariaLabel="Quitar elemento" />
          <app-icon-button variant="close-soft" size="lg" tooltip="Close-soft (lg)" ariaLabel="Quitar grande" />
          <app-icon-button variant="default" animation="grow" icon="fa-solid fa-expand" tooltip="Animación grow" ariaLabel="Ampliar" />
          <app-icon-button variant="default" animation="rotate" icon="fa-solid fa-arrows-rotate" tooltip="Animación rotate" ariaLabel="Actualizar" />
        </div>
      </div>
    </app-panel>

    <!-- MENUS DE ACCION -->
    <app-panel title="Action Menu (Dropdown contextual)" variant="flat" padding="md" class="showcase-section">
      <div style="display: flex; gap: 2rem; align-items: flex-start;">
        <div>
          <app-text variant="caption" color="muted">Por defecto (Kebab):</app-text>
          <div style="margin-top: 0.5rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
            <span>Fila de tabla de ejemplo</span>
            <app-action-menu [actions]="tableActions" (actionClick)="onActionClicked($event)"></app-action-menu>
          </div>
        </div>

        <div>
          <app-text variant="caption" color="muted">Customizado (Gear icon):</app-text>
          <div style="margin-top: 0.5rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
            <span>Item con configuraciones</span>
            <app-action-menu 
              triggerIcon="fa-solid fa-gear" 
              triggerTitle="Configuraciones"
              [actions]="configActions" 
              (actionClick)="onActionClicked($event)">
            </app-action-menu>
          </div>
        </div>
      </div>
    </app-panel>
  `,
  styles: [`
    .showcase-section {
      margin-bottom: 2rem;
      display: block;
    }
    .button-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }
    .button-sizes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-top: 1rem;
    }
  `]
})
export class ShowcaseActionsComponent {
  private readonly popup = inject(PopupService);

  tableActions: ActionMenuItem[] = [
    { id: 'view', label: 'Ver detalles', icon: 'fa-solid fa-eye' },
    { id: 'edit', label: 'Editar', icon: 'fa-solid fa-pen' },
    { id: 'delete', label: 'Eliminar', icon: 'fa-solid fa-trash', variant: 'danger' }
  ];

  configActions: ActionMenuItem[] = [
    { id: 'settings', label: 'Ajustes', icon: 'fa-solid fa-sliders' },
    { id: 'export', label: 'Exportar', icon: 'fa-solid fa-download' },
    { id: 'disable', label: 'Deshabilitar', icon: 'fa-solid fa-ban', disabled: true }
  ];

  onActionClicked(actionId: string): void {
    console.log('Action clicked:', actionId);
    this.popup.info('Acción', 'Action clicked: ' + actionId);
  }
}
