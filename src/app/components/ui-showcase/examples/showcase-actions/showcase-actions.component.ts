import { Component } from '@angular/core';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { ActionMenuComponent, ActionMenuItem } from '../../../../shared/ui/molecules/action-menu/action-menu.component';

@Component({
  selector: 'app-showcase-actions',
  standalone: true,
  imports: [
    PanelComponent,
    TextComponent,
    ButtonComponent,
    ActionMenuComponent
],
  template: `
    <!-- BOTONES -->
    <app-panel title="Botones" variant="flat" padding="md" class="showcase-section">
      <div class="button-grid">
        <app-button variant="primary">Primary</app-button>
        <app-button variant="secondary">Secondary</app-button>
        <app-button variant="success">Success</app-button>
        <app-button variant="warning">Warning</app-button>
        <app-button variant="danger">Danger</app-button>
        <app-button variant="outline">Outline</app-button>
        <app-button variant="ghost">Ghost</app-button>
        <app-button variant="primary" [disabled]="true">Disabled</app-button>
      </div>

      <div class="button-sizes">
        <app-button variant="primary" size="sm">Small</app-button>
        <app-button variant="primary">Medium</app-button>
        <app-button variant="primary" size="lg">Large</app-button>
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
    alert('Action clicked: ' + actionId);
  }
}
