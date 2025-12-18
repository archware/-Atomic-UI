import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';

@Component({
  selector: 'app-showcase-actions',
  standalone: true,
  imports: [
    CommonModule,
    PanelComponent,
    TextComponent,
    ButtonComponent
  ],
  template: `
    <!-- BOTONES -->
    <app-panel title="Botones" variant="flat" padding="md" class="showcase-section">
      <div class="button-grid">
        <button class="btn btn-primary">Primary</button>
        <button class="btn btn-secondary">Secondary</button>
        <button class="btn btn-success">Success</button>
        <button class="btn btn-warning">Warning</button>
        <button class="btn btn-danger">Danger</button>
        <button class="btn btn-outline">Outline</button>
        <button class="btn btn-ghost">Ghost</button>
        <button class="btn btn-primary" disabled>Disabled</button>
      </div>
      
      <div class="button-sizes">
        <button class="btn btn-primary btn-sm">Small</button>
        <button class="btn btn-primary">Medium</button>
        <button class="btn btn-primary btn-lg">Large</button>
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
    /* Estilos legacy para botones nativos en el showcase */
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .btn-primary { background-color: var(--primary-color); color: white; }
    .btn-secondary { background-color: var(--secondary-color); color: white; }
    .btn-success { background-color: var(--success-color); color: white; }
    .btn-warning { background-color: var(--warning-color); color: white; }
    .btn-danger { background-color: var(--danger-color); color: white; }
    .btn-outline { background-color: transparent; border-color: var(--border-color); color: var(--text-color); }
    .btn-ghost { background-color: transparent; color: var(--text-color); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
    .btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
  `]
})
export class ShowcaseActionsComponent { }
