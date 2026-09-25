import { Component } from '@angular/core';
import type { ChartConfiguration } from 'chart.js';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { AvatarComponent } from '../../../../shared/ui/atoms/avatar/avatar.component';
import { ChipComponent } from '../../../../shared/ui/atoms/chip/chip.component';
import { ActionGroupComponent, ActionItem } from '../../../../shared/ui/molecules/action-group/action-group.component';
import { DataTable, DataTableColumn } from '../../../../shared/ui/organisms/data-table/data-table';
import { ChartComponent } from '../../../../shared/ui/organisms/chart/chart.component';
import { PaginationComponent } from '../../../../shared/ui/molecules/pagination/pagination.component';

@Component({
  selector: 'app-showcase-data-display',
  standalone: true,
  imports: [
    PanelComponent,
    AvatarComponent,
    ChipComponent,
    ActionGroupComponent,
    ChartComponent,
    DataTable,
    PaginationComponent
],
  template: `
    <!-- TABLAS CON ACTION GROUP -->
    <app-panel title="Tablas (Atomic) con ActionGroup" variant="flat" padding="md" class="showcase-section">
      <p style="color: var(--text-color-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
        Tabla con ActionGroup: overflow inteligente de acciones. El menú se crea en document.body para evitar problemas de z-index.
      </p>
      <app-data-table 
        [columns]="tableColumns"
        [rows]="tableUsers"
        caption="Usuarios"
        actionsWidth="140px"
        [showRowNumber]="false">
        <ng-template #actions let-row>
          <app-action-group
            [actions]="tableActions"
            [maxVisible]="row.maxVisible"
            [compact]="row.compact"
            size="md"
            (actionClick)="onAction($event, row.name)">
          </app-action-group>
        </ng-template>
      </app-data-table>

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

    <!-- CHARTS -->
    <section class="showcase-section">
      <h3 class="section-title">Gráficos (ChartComponent)</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <app-panel title="Line Chart">
          <app-chart type="line" [data]="chartLineData" [options]="chartOptions" height="250px"></app-chart>
        </app-panel>
        <app-panel title="Doughnut Chart">
          <app-chart type="doughnut" [data]="chartDonutData" [options]="donutOptions" height="250px"></app-chart>
        </app-panel>
        <app-panel title="Bar Chart">
          <app-chart type="bar" [data]="chartBarData" [options]="chartOptions" height="250px"></app-chart>
        </app-panel>
      </div>
    </section>

    <!-- PAGINACIÓN -->
    <section class="showcase-section">
      <h3 class="section-title">Paginación (Variantes)</h3>
      <p style="color: var(--text-color-secondary); margin-bottom: 1rem; font-size: 0.875rem;">
        Componente <code>&lt;app-pagination&gt;</code> con 4 variantes: <code>standard</code>, <code>minimal</code>, <code>rounded</code>, <code>cards</code>.
      </p>

      <app-panel title="Variante: standard" style="margin-bottom: 1rem;">
        <app-pagination
          [total]="100"
          [pageSize]="10"
          [page]="1"
          variant="standard"
          size="md">
        </app-pagination>
      </app-panel>

      <app-panel title="Variante: minimal" style="margin-bottom: 1rem;">
        <app-pagination
          [total]="100"
          [pageSize]="10"
          [page]="1"
          variant="minimal"
          size="md">
        </app-pagination>
      </app-panel>

      <app-panel title="Variante: rounded" style="margin-bottom: 1rem;">
        <app-pagination
          [total]="100"
          [pageSize]="10"
          [page]="1"
          variant="rounded"
          size="md">
        </app-pagination>
      </app-panel>

      <app-panel title="Variante: cards" style="margin-bottom: 1rem;">
        <app-pagination
          [total]="100"
          [pageSize]="10"
          [page]="1"
          variant="cards"
          size="md">
        </app-pagination>
      </app-panel>

      <h4 class="subsection-title">Tamaños (Sizes) - Variante 'standard'</h4>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-color-secondary)">Size: sm</span>
          <app-pagination [total]="50" [pageSize]="10" [page]="1" size="sm"></app-pagination>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-color-secondary)">Size: md (default)</span>
          <app-pagination [total]="50" [pageSize]="10" [page]="1" size="md"></app-pagination>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-color-secondary)">Size: lg</span>
          <app-pagination [total]="50" [pageSize]="10" [page]="1" size="lg"></app-pagination>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
    .section-title { font-size: 1.25rem; font-weight: var(--font-weight-emphasis); margin-bottom: 1rem; color: var(--text-color); }
    .subsection-title { font-size: 1rem; font-weight: var(--font-weight-body); margin: 1rem 0 0.5rem; color: var(--text-color-secondary); }
    .avatar-grid, .chip-grid { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }

    /* Badges styles */
    .badge-container { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: var(--font-weight-emphasis); background: var(--surface-hover); color: var(--text-color); }
    .badge-primary { background: var(--primary-color); color: white; }
    .badge-secondary { background: var(--secondary-color); color: white; }
    .badge-success { background: var(--success-color); color: white; }
    .badge-warning { background: var(--warning-color); color: white; }
    .badge-danger { background: var(--danger-color); color: white; }
    .badge-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }

    /* Action variants */
    .action-variants { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; }
    .variant-item { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
    .variant-label { color: var(--text-color-secondary); font-size: 0.875rem; min-width: 80px; flex-shrink: 0; }

    /* Mobile: actions cell no muestra label, usa toda la fila */
    @media screen and (max-width: 48rem) {
      .actions-cell {
        justify-content: flex-end;
        border-bottom: none !important;
        padding-top: var(--space-3) !important;
      }
      .action-variants { gap: 1rem; }
      .variant-item { flex-wrap: wrap; }
    }
  `]
})
export class ShowcaseDataDisplayComponent {
  tableColumns: DataTableColumn<any>[] = [
    { key: 'name', header: 'Nombre', width: 'minmax(200px, 1fr)' },
    { key: 'role', header: 'Rol', width: '120px' },
    { key: 'status', header: 'Estado', width: '120px', isTag: true, tagVariant: (row: any) => row.chipVariant === 'success' ? 'success' : (row.chipVariant === 'warning' ? 'warning' : 'error') },
    { key: 'date', header: 'Fecha', width: '120px' },
  ];

  // Table actions
  tableActions: ActionItem[] = [
    { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalles', variant: 'success' },
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'info' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' },
    { id: 'duplicate', icon: 'fa-solid fa-copy', label: 'Duplicar', variant: 'secondary' },
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

  // Showcase-only chart data. Production apps must bind SP/view contracts instead of copying these values.
  chartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  donutOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } }, cutout: '75%' };

  private chartColor(index: number, fallback: string): string {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--chart-color-${index}`).trim();
    return value || fallback;
  }

  get chartLineData() {
    return {
      labels: ['Ene', 'Feb', 'Mar'],
      datasets: [{ data: [65, 59, 80], label: 'Serie demo', borderColor: this.chartColor(2, '#3b82f6'), tension: 0.4 }]
    };
  }

  get chartDonutData() {
    return {
      labels: ['Rosa', 'Azul', 'Verde'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: [this.chartColor(1, '#ec4899'), this.chartColor(2, '#3b82f6'), this.chartColor(4, '#10b981')],
        borderWidth: 0
      }]
    };
  }

  get chartBarData() {
    return {
      labels: ['Q1', 'Q2', 'Q3'],
      datasets: [{ data: [45, 85, 30], label: 'Demo', backgroundColor: this.chartColor(3, '#8b5cf6'), borderRadius: 4 }]
    };
  }
}




