import { Component, signal, ChangeDetectionStrategy, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiShowcaseComponent } from './components/ui-showcase/ui-showcase.component';
import {
  ScrollOverlayComponent,
  ThemeSwitcherComponent,
  PanelComponent,
  LayoutShellComponent,
  SidebarComponent,
  SidebarMenuItem,
  TopbarComponent,
  TableActionsComponent,
  FloatingInputComponent,
  Select2Component,
  Select2Option,
  RowComponent,
  ButtonComponent,
  TextComponent,
  ChipComponent,
  DatepickerComponent,
  ToastComponent,
  PopupContainerComponent,
  ModalContainerComponent,
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
  col9: string;
  statusVariant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    ScrollOverlayComponent,
    ThemeSwitcherComponent,
    UiShowcaseComponent,
    PanelComponent,
    TableActionsComponent,
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    FloatingInputComponent,
    Select2Component,
    RowComponent,
    TextComponent,
    DatepickerComponent,
    ChipComponent,
    ToastComponent,
    PopupContainerComponent,
    ModalContainerComponent,
    FiltersComponent,
    TranslateModule
],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  private readonly MOBILE_BREAKPOINT = 768;

  protected readonly title = signal('app.title');

  constructor() {
    // Initialize translation language
    const savedLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('app-language')
      : null;
    this.translate.use(savedLang || 'es');
    this.generateData();
  }

  // Filtros
  filterDateStart = '';
  filterDateEnd = '';
  floatingInputValue = '';
  // Floating Input value

  // Opciones para el select de estado
  statusOptions: Select2Option[] = [
    { value: '', label: 'filters.statusOptions.all' },
    { value: 'data.status.active', label: 'filters.statusOptions.active' },
    { value: 'data.status.pending', label: 'filters.statusOptions.pending' },
    { value: 'data.status.inactive', label: 'filters.statusOptions.inactive' }
  ];
  filterStatus: string | number = '';

  // Método para obtener variante de chip según estado (Claves i18n)
  getStatusClass(statusKey: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' {
    const statusMap: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      'data.status.active': 'success',
      'data.status.completed': 'success',
      'data.status.approved': 'success',
      'data.status.pending': 'warning',
      'data.status.review': 'secondary',
      'data.status.inactive': 'error'
    };
    return statusMap[statusKey] || 'default';
  }

  // Event handlers placeholder
  onFilter() {
    // Filtering logic
  }

  onClear() {
    this.filterStatus = '';
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.floatingInputValue = '';
  }

  // Sidebar toggle - inicia oculto en móvil
  sidebarVisible = signal(this.getInitialSidebarState());

  menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/' },
    { label: 'Showcase', icon: 'fa-solid fa-layer-group', route: '/showcase' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' }
  ];

  private getInitialSidebarState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.innerWidth > this.MOBILE_BREAKPOINT;
    }
    return true; // Default visible for SSR
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
      // Auto-hide on mobile, auto-show on desktop
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

  onSidebarNavigate() {
    // Only auto-close on mobile (breakpoint 768px matches CSS)
    if (isPlatformBrowser(this.platformId) && window.innerWidth <= 768) {
      this.sidebarVisible.set(false);
    }
  }

  // Logout handler
  onLogout() {
    // Auth service logout
    alert('Cerrando sesión...');
  }

  onView(_row: TableRow) { }
  onEdit(_row: TableRow) { }
  onDelete(_row: TableRow) { }

  // Datos de ejemplo con claves de traducción
  private nombres = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez', 'Laura Torres', 'Diego Ramírez', 'Sofia Herrera'];
  private estados = ['data.status.active', 'data.status.pending', 'data.status.completed', 'data.status.review', 'data.status.approved'];
  private tipos = ['data.type.fua', 'data.type.prescription', 'data.type.order', 'data.type.consultation', 'data.type.referral'];
  private prioridades = ['data.priority.high', 'data.priority.medium', 'data.priority.low'];

  // Cantidad de filas
  rowCount = signal(25);

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
    const data = Array.from({ length: count }, (_, i) => {
      const nombre = this.nombres[i % this.nombres.length];
      const email = nombre.toLowerCase().replace(' ', '.').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u') + '@email.com';
      const statusKey = this.estados[i % this.estados.length];
      return {
        col1: `${1001 + i}`,
        col2: nombre,
        col3: email,
        col4: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/12/2024`,
        col5: statusKey, // Ahora es una key
        col6: this.tipos[i % this.tipos.length],
        col7: `S/ ${(Math.random() * 500 + 50).toFixed(2)}`,
        col9: this.prioridades[i % this.prioridades.length],
        statusVariant: this.getStatusClass(statusKey)
      };
    });
    this.tableData.set(data);
  }

}
