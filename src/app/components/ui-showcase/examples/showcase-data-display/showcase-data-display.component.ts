import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TableComponent } from '../../../../shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../../../../shared/ui/atoms/table/table-head.component';
import { TableRowComponent } from '../../../../shared/ui/atoms/table/table-row.component';
import { TableCellComponent } from '../../../../shared/ui/atoms/table/table-cell.component';
import { AvatarComponent } from '../../../../shared/ui/atoms/avatar/avatar.component';
import { ChipComponent } from '../../../../shared/ui/atoms/chip/chip.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { RowComponent } from '../../../../shared/ui/atoms/row/row.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';

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
    ButtonComponent,
    RowComponent,
    TextComponent
  ],
  template: `
    <!-- TABLAS -->
    <app-panel title="Tablas (Atomic)" variant="flat" padding="md" class="showcase-section">
      <app-table>
        <app-table-head>
          <tr app-table-row>
            <th app-table-header-cell>Nombre</th>
            <th app-table-header-cell>Rol</th>
            <th app-table-header-cell>Estado</th>
            <th app-table-header-cell class="text-right">Acciones</th>
          </tr>
        </app-table-head>
        <tbody>
          <tr app-table-row>
            <td app-table-cell>
              <app-row gap="0.5rem" verticalAlign="center">
                <app-avatar name="Juan Perez" size="sm"></app-avatar>
                <app-text>Juan Pérez</app-text>
              </app-row>
            </td>
            <td app-table-cell>Desarrollador</td>
            <td app-table-cell><app-chip variant="success" size="sm">Activo</app-chip></td>
            <td app-table-cell class="text-right">
              <app-button variant="ghost" size="sm" icon="✎"></app-button>
            </td>
          </tr>
          <tr app-table-row [selected]="true">
            <td app-table-cell>
              <app-row gap="0.5rem" verticalAlign="center">
                <app-avatar name="Maria Garcia" size="sm"></app-avatar>
                <app-text>Maria García</app-text>
              </app-row>
            </td>
            <td app-table-cell>Diseñadora</td>
            <td app-table-cell><app-chip variant="warning" size="sm">Ausente</app-chip></td>
            <td app-table-cell class="text-right">
              <app-button variant="ghost" size="sm" icon="✎"></app-button>
            </td>
          </tr>
          <tr app-table-row>
            <td app-table-cell>
              <app-row gap="0.5rem" verticalAlign="center">
                <app-avatar name="Carlos Lopez" size="sm"></app-avatar>
                <app-text>Carlos Lopez</app-text>
              </app-row>
            </td>
            <td app-table-cell>Manager</td>
            <td app-table-cell><app-chip variant="error" size="sm">Inactivo</app-chip></td>
            <td app-table-cell class="text-right">
              <app-button variant="ghost" size="sm" icon="✎"></app-button>
            </td>
          </tr>
        </tbody>
      </app-table>
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
    
    /* Badges styles - reusing from legacy css for now until Badges component exists */
    .badge-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--surface-hover); color: var(--text-color); }
    .badge-primary { background: var(--primary-color); color: white; }
    .badge-secondary { background: var(--secondary-color); color: white; }
    .badge-success { background: var(--success-color); color: white; }
    .badge-warning { background: var(--warning-color); color: white; }
    .badge-danger { background: var(--danger-color); color: white; }
    .badge-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
  `]
})
export class ShowcaseDataDisplayComponent { }
