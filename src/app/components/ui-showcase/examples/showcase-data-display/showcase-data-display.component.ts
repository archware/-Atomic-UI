import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TableComponent } from '../../../../shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../../../../shared/ui/atoms/table/table-head.component';
import { TableRowComponent } from '../../../../shared/ui/atoms/table/table-row.component';
import { TableCellComponent } from '../../../../shared/ui/atoms/table/table-cell.component';
import { AvatarComponent } from '../../../../shared/ui/atoms/avatar/avatar.component';
import { ChipComponent } from '../../../../shared/ui/atoms/chip/chip.component';
import { RowComponent } from '../../../../shared/ui/atoms/row/row.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';
import { ActionGroupComponent, ActionItem } from '../../../../shared/ui/molecules/action-group/action-group.component';

@Component({
  selector: 'app-showcase-data-display',
  standalone: true,
  imports: [
    CommonModule,
    PanelComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
    TableCellComponent,
    AvatarComponent,
    ChipComponent,
    RowComponent,
    TextComponent,
    ActionGroupComponent
  ],
  template: `
    <!-- TABLAS CON ACTION GROUP -->
    <app-panel title="Tablas (Atomic) con ActionGroup" variant="flat" padding="md" class="showcase-section">
      <p style="color: var(--text-color-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
        Tabla con ActionGroup: overflow inteligente de acciones. El menú se crea en document.body para evitar problemas de z-index.
      </p>
      <app-table [maxHeight]="350">
        <app-table-head>
          <tr app-table-row>
            <th app-table-header-cell>Nombre</th>
            <th app-table-header-cell>Rol</th>
            <th app-table-header-cell>Estado</th>
            <th app-table-header-cell>Fecha</th>
            <th app-table-header-cell class="text-right">Acciones</th>
          </tr>
        </app-table-head>
        <tbody>
          @for (user of tableUsers; track user.id) {
            <tr app-table-row [selected]="user.selected">
              <td app-table-cell>
                <app-row gap="0.5rem" verticalAlign="center">
                  <app-avatar [name]="user.name" size="sm"></app-avatar>
                  <app-text>{{ user.name }}</app-text>
                </app-row>
              </td>
              <td app-table-cell>{{ user.role }}</td>
              <td app-table-cell>
                <app-chip [variant]="user.chipVariant" size="sm">{{ user.status }}</app-chip>
              </td>
              <td app-table-cell>{{ user.date }}</td>
              <td app-table-cell class="text-right">
                <app-action-group
                  [actions]="tableActions"
                  [maxVisible]="user.maxVisible"
                  [compact]="user.compact"
                  size="md"
                  (actionClick)="onAction($event, user.name)">
                </app-action-group>
              </td>
            </tr>
          }
        </tbody>
      </app-table>
      
      <h4 class="subsection-title">Variantes de ActionGroup</h4>
      <div class="action-variants">
        <div class="variant-item">
          <span class="variant-label">3 visibles:</span>
          <app-action-group [actions]="tableActions" [maxVisible]="3"></app-action-group>
        </div>
        <div class="variant-item">
          <span class="variant-label">2 visibles:</span>
          <app-action-group [actions]="tableActions" [maxVisible]="2"></app-action-group>
        </div>
        <div class="variant-item">
          <span class="variant-label">Compacto:</span>
          <app-action-group [actions]="tableActions" [compact]="true"></app-action-group>
        </div>
      </div>
      
      <h4 class="subsection-title">Tamaños</h4>
      <div class="action-variants">
        <div class="variant-item">
          <span class="variant-label">Small:</span>
          <app-action-group [actions]="tableActions" [maxVisible]="3" size="sm"></app-action-group>
        </div>
        <div class="variant-item">
          <span class="variant-label">Medium:</span>
          <app-action-group [actions]="tableActions" [maxVisible]="3" size="md"></app-action-group>
        </div>
        <div class="variant-item">
          <span class="variant-label">Large:</span>
          <app-action-group [actions]="tableActions" [maxVisible]="3" size="lg"></app-action-group>
        </div>
      </div>
    </app-panel>

    <!-- AVATAR -->
    <section class="showcase-section">
      <h3 class="section-title">Avatar</h3>
      <div class="avatar-grid">
        <app-avatar name="Juan Pérez" size="lg" status="online"></app-avatar>
        <app-avatar name="María García" size="lg" status="busy"></app-avatar>
        <app-avatar initials="AG" size="lg" status="away"></app-avatar>
        <app-avatar size="lg" status="offline"></app-avatar>
      </div>
      <h4 class="subsection-title">Tamaños</h4>
      <div class="avatar-grid">
        <app-avatar name="XS" size="xs"></app-avatar>
        <app-avatar name="SM" size="sm"></app-avatar>
        <app-avatar name="MD" size="md"></app-avatar>
        <app-avatar name="LG" size="lg"></app-avatar>
        <app-avatar name="XL" size="xl"></app-avatar>
      </div>
    </section>

    <!-- TAGS (CHIPS) -->
    <section class="showcase-section">
      <h3 class="section-title">Tags (Chips)</h3>
      <div class="chip-grid">
        <app-chip variant="default">Default</app-chip>
        <app-chip variant="primary">Primary</app-chip>
        <app-chip variant="secondary">Secondary</app-chip>
        <app-chip variant="success">Firmado</app-chip>
        <app-chip variant="warning">Pendiente</app-chip>
        <app-chip variant="error">Rechazado</app-chip>
        <app-chip variant="outline">Outline</app-chip>
        <app-chip variant="primary" [removable]="true">Removible</app-chip>
      </div>
    </section>

    <!-- BADGES -->
    <section class="showcase-section">
      <h3 class="section-title">Badges</h3>
      <div class="badge-container">
        <span class="badge">Default</span>
        <span class="badge badge-primary">Primary</span>
        <span class="badge badge-secondary">Secondary</span>
        <span class="badge badge-success">Success</span>
        <span class="badge badge-warning">Warning</span>
        <span class="badge badge-danger">Danger</span>
        <span class="badge badge-outline">Outline</span>
      </div>
    </section>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-color); }
    .subsection-title { font-size: 1rem; font-weight: 500; margin: 1rem 0 0.5rem; color: var(--text-color-secondary); }
    .avatar-grid, .chip-grid { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
    
    /* Badges styles */
    .badge-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--surface-hover); color: var(--text-color); }
    .badge-primary { background: var(--primary-color); color: white; }
    .badge-secondary { background: var(--secondary-color); color: white; }
    .badge-success { background: var(--success-color); color: white; }
    .badge-warning { background: var(--warning-color); color: white; }
    .badge-danger { background: var(--danger-color); color: white; }
    .badge-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
    
    /* Action variants */
    .action-variants { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; }
    .variant-item { display: flex; align-items: center; gap: 0.75rem; }
    .variant-label { color: var(--text-color-secondary); font-size: 0.875rem; min-width: 80px; }
  `]
})
export class ShowcaseDataDisplayComponent {
  // Table actions
  tableActions: ActionItem[] = [
    { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalles', variant: 'secondary' },
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' },
    { id: 'duplicate', icon: 'fa-solid fa-copy', label: 'Duplicar' },
    { id: 'export', icon: 'fa-solid fa-download', label: 'Exportar' }
  ];

  // Table users
  tableUsers = [
    { id: 1, name: 'Juan Pérez', role: 'Desarrollador', status: 'Activo', chipVariant: 'success' as const, date: '2024-01-15', maxVisible: 3, compact: false, selected: false },
    { id: 2, name: 'María García', role: 'Diseñadora', status: 'Ausente', chipVariant: 'warning' as const, date: '2024-02-20', maxVisible: 2, compact: false, selected: true },
    { id: 3, name: 'Carlos López', role: 'Manager', status: 'Inactivo', chipVariant: 'error' as const, date: '2024-03-10', maxVisible: 3, compact: true, selected: false },
    { id: 4, name: 'Ana Martínez', role: 'Analista', status: 'Activo', chipVariant: 'success' as const, date: '2024-04-05', maxVisible: 3, compact: false, selected: false },
    { id: 5, name: 'Roberto Sánchez', role: 'QA Engineer', status: 'Activo', chipVariant: 'success' as const, date: '2024-04-18', maxVisible: 2, compact: false, selected: false },
    { id: 6, name: 'Laura Torres', role: 'DevOps', status: 'Pendiente', chipVariant: 'warning' as const, date: '2024-05-02', maxVisible: 3, compact: false, selected: false },
    { id: 7, name: 'Diego Ramírez', role: 'Backend Dev', status: 'Activo', chipVariant: 'success' as const, date: '2024-05-20', maxVisible: 3, compact: false, selected: false },
    { id: 8, name: 'Sofía Hernández', role: 'Frontend Dev', status: 'Inactivo', chipVariant: 'error' as const, date: '2024-06-08', maxVisible: 3, compact: true, selected: false }
  ];

  onAction(actionId: string, userName: string): void {
    console.log(`Acción "${actionId}" ejecutada para ${userName}`);
  }
}
