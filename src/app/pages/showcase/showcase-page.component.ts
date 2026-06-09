import { Component, signal, ChangeDetectionStrategy, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiShowcaseComponent } from '../../components/ui-showcase/ui-showcase.component';
import {
  ScrollOverlayComponent,
  ThemeSwitcherComponent,
  PanelComponent,
  LayoutShellComponent,
  SidebarComponent,
  SidebarMenuItem,
  TopbarComponent,
  ActionGroupComponent,
  FloatingInputComponent,
  Select2Component,
  Select2Option,
  RowComponent,
  TextComponent,
  ChipComponent,
  DatepickerComponent,
  FiltersComponent,
} from '@shared/ui';

interface TableRow {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
  col5: string;
  col6: string;
  col7: string;
  col8: string;
  statusVariant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-showcase-page',
  standalone: true,
  imports: [
    FormsModule,
    ScrollOverlayComponent,
    ThemeSwitcherComponent,
    UiShowcaseComponent,
    PanelComponent,
    ActionGroupComponent,
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    FloatingInputComponent,
    Select2Component,
    RowComponent,
    TextComponent,
    DatepickerComponent,
    ChipComponent,
    FiltersComponent,
    TranslateModule,
  ],
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePageComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly MOBILE_BREAKPOINT = 768;

  protected readonly title = signal('app.title');

  constructor() {
    const savedLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('app-language')
      : null;
    this.translate.use(savedLang || 'es');
    this.generateData();
  }

  // ============================================
  // FILTROS
  // ============================================

  filterDateStart = '';
  filterDateEnd = '';
  floatingInputValue = '';

  statusOptions: Select2Option[] = [
    { value: '', label: 'filters.statusOptions.all' },
    { value: 'data.status.active', label: 'filters.statusOptions.active' },
    { value: 'data.status.pending', label: 'filters.statusOptions.pending' },
    { value: 'data.status.completed', label: 'filters.statusOptions.completed' },
    { value: 'data.status.review', label: 'filters.statusOptions.review' },
    { value: 'data.status.approved', label: 'filters.statusOptions.approved' },
  ];
  filterStatus: string | number = '';

  getStatusClass(statusKey: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      'data.status.active': 'success',
      'data.status.completed': 'success',
      'data.status.approved': 'success',
      'data.status.pending': 'warning',
      'data.status.review': 'secondary',
      'data.status.inactive': 'error',
    };
    return statusMap[statusKey] || 'default';
  }

  onFilter() {
    const filtered = this.allTableData.filter(row =>
      !this.filterStatus || row.col5 === this.filterStatus
    );
    this.tableData.set(filtered);
  }

  onClear() {
    this.filterStatus = '';
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.floatingInputValue = '';
    this.tableData.set(this.allTableData);
  }

  // ============================================
  // SIDEBAR
  // ============================================

  sidebarVisible = signal(this.getInitialSidebarState());

  menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Profile', icon: 'fa-solid fa-user', route: '/profile' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
  ];

  private getInitialSidebarState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth > this.MOBILE_BREAKPOINT;
    }
    return true;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
      if (isMobile && this.sidebarVisible()) {
        this.sidebarVisible.set(false);
      } else if (!isMobile && !this.sidebarVisible()) {
        this.sidebarVisible.set(true);
      }
    }
  }

  onToggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  onSidebarNavigate(item: SidebarMenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= this.MOBILE_BREAKPOINT) {
      this.sidebarVisible.set(false);
    }
  }

  onLogout() {
    alert('Cerrando sesión...');
  }

  // ============================================
  // TABLA DE DEMO
  // ============================================

  onView(_row: TableRow) {}
  onEdit(_row: TableRow) {}
  onDelete(_row: TableRow) {}

  onActionClick(actionId: string, row: TableRow) {
    switch (actionId) {
      case 'view': this.onView(row); break;
      case 'edit': this.onEdit(row); break;
      case 'delete': this.onDelete(row); break;
    }
  }

  tableActions = [
    { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver', variant: 'success' as const },
    { id: 'edit', icon: 'fa-solid fa-pencil', label: 'Editar', variant: 'info' as const },
    { id: 'delete', icon: 'fa-solid fa-trash-can', label: 'Eliminar', variant: 'danger' as const }
  ];

  private nombres = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Pedro Sánchez', 'Laura Torres', 'Diego Ramírez', 'Sofia Herrera',
  ];
  private estados = [
    'data.status.active', 'data.status.pending', 'data.status.completed',
    'data.status.review', 'data.status.approved',
  ];
  private tipos = [
    'data.type.fua', 'data.type.prescription', 'data.type.order',
    'data.type.consultation', 'data.type.referral',
  ];
  private prioridades = ['data.priority.high', 'data.priority.medium', 'data.priority.low'];

  rowCount = signal(25);
  private allTableData: TableRow[] = [];
  protected readonly tableData = signal<TableRow[]>([]);

  updateRowCount(count: string | number) {
    const value = Number(count);
    if (!isNaN(value) && value > 0) {
      this.rowCount.set(value);
      this.generateData();
    }
  }

  private generateData() {
    const count = this.rowCount();
    this.allTableData = Array.from({ length: count }, (_, i) => {
      const nombre = this.nombres[i % this.nombres.length];
      const email =
        nombre
          .toLowerCase()
          .replace(' ', '.')
          .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
          .replace(/ó/g, 'o').replace(/ú/g, 'u') + '@email.com';
      const statusKey = this.estados[i % this.estados.length];
      return {
        col1: `${1001 + i}`,
        col2: nombre,
        col3: email,
        col4: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/12/2024`,
        col5: statusKey,
        col6: this.tipos[i % this.tipos.length],
        col7: `S/ ${(Math.random() * 500 + 50).toFixed(2)}`,
        col8: this.prioridades[i % this.prioridades.length],
        statusVariant: this.getStatusClass(statusKey),
      };
    });
    this.tableData.set(this.allTableData);
  }
}





