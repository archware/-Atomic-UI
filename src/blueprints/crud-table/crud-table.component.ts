import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { SidebarMenuItem,
  PanelComponent,
  ButtonComponent,
  AvatarComponent,
  ChoiceControl,
  Select2Component,
  TableComponent,
  TableHeadComponent,
  TableRowComponent,
  TableCellComponent,
  RowComponent,
  TextComponent,
  ChipComponent,
  ActionGroupComponent,
  ActionItem,
  PaginationComponent,
  DataPagerComponent,
  LayoutShellComponent,
  SidebarComponent,
  TopbarComponent,
  ThemeSwitcherComponent,

  ModalComponent,
  FloatingInputComponent,
  LoaderComponent,
  ApiService,
  useApi
} from '@shared/ui';

import { of, delay } from 'rxjs';

export interface Entity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface FilterOptions {
  searchType: string;
  searchValue: string;
  status: string;
  role: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

const FAKE_DB: Entity[] = Array.from({ length: 50 }).map((_, i) => ({
  id: String(i + 1),
  name: `Usuario de Prueba ${i + 1}`,
  email: `usuario${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : i % 2 === 0 ? 'editor' : 'user',
  status: i % 5 === 0 ? 'inactive' : i % 7 === 0 ? 'pending' : 'active',
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
}));
let idCounter = 51;

/**
 * CRUD Table Blueprint
 * 
 * Features:
 * - Data table with pagination
 * - Search and filter functionality
 * - Create/Edit modal
 * - Delete confirmation
 * - Bulk actions
 * - Loading and error states
 * - Responsive design
 * 
 * @usage
 * 1. Copy this folder to your project
 * 2. Rename Entity interface to your model (User, Product, etc.)
 * 3. Configure API endpoints
 * 4. Adjust table columns
 */
@Component({
  selector: 'app-crud-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    PanelComponent,
    ButtonComponent,
    FloatingInputComponent,
    Select2Component,
    PaginationComponent,
    DataPagerComponent,
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    ThemeSwitcherComponent,
    ModalComponent,
    AvatarComponent,
    ChoiceControl,
    ChipComponent,
    LoaderComponent,
    ActionGroupComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
    TableCellComponent,
    RowComponent,
    TextComponent
],
  templateUrl: './crud-table.component.html',
  styleUrl: './crud-table.component.css'
})
export class CrudTableComponent implements OnInit {
  // SIDEBAR
  sidebarVisible = signal(true);
  menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Perfil', icon: 'fa-solid fa-user', route: '/profile' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-cog', route: '/settings' , iconColor: 'var(--danger-color)' },
  ];

  onToggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  onSidebarNavigate(item: SidebarMenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onLogout() {
    alert('Cerrando sesión...');
    this.router.navigate(['/login']);
  }

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private api = inject(ApiService);

  // Table actions configuration
  tableActions: ActionItem[] = [
    { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    { id: 'delete', icon: 'fa-solid fa-trash', label: 'Eliminar', variant: 'danger' }
  ];

  onRowAction(actionId: string, item: Entity) {
    if (actionId === 'edit') {
      this.openEditModal(item);
    } else if (actionId === 'delete') {
      this.openDeleteModal(item);
    }
  }

  // ============================================
  // CONFIGURATION - Customize these values
  // ============================================

  /** @customize API endpoint for CRUD operations */
  private readonly ENDPOINT = '/users';

  /** @customize Items per page */
  pageSize = signal(10);

  /** @customize Table title */
  readonly TABLE_TITLE = 'Usuarios';

  /** @customize Entity name (singular) */
  readonly ENTITY_NAME = 'Usuario';

  // ============================================
  // STATE
  // ============================================

  private _searchTimeout?: ReturnType<typeof setTimeout>;

  /** List API state */
  listApi = useApi<PaginatedResponse<Entity>>();

  /** Create/Update API state */
  saveApi = useApi<Entity>();

  /** Delete API state */
  deleteApi = useApi<{ success: boolean }>();

  /** Current page */
  currentPage = signal(1);

  /** Search term */
  searchTerm = signal('');

  /** Active filters */
  filters = signal<FilterOptions>({
    searchType: '',
    searchValue: '',
    status: '',
    role: ''
  });

  /** Selected items for bulk actions */
  selectedItems = signal<Set<string | number>>(new Set());

  /** All items selected flag */
  allSelected = signal(false);

  /** Modal visibility */
  showModal = signal(false);

  /** Delete confirmation modal */
  showDeleteModal = signal(false);

  /** Item to delete */
  itemToDelete = signal<Entity | null>(null);

  /** Edit mode flag */
  isEditMode = signal(false);

  /** Current editing item */
  currentItem = signal<Entity | null>(null);

  // ============================================
  // FILTER OPTIONS
  // ============================================

  /** @customize Status options for filter */
  
  searchTypeOptions = [
    { value: '', label: 'Seleccione' },
    { value: 'name', label: 'Nombre del personal' },
    { value: 'document', label: 'Número de documento' },
    { value: 'regimen', label: 'Régimen laboral' },
    { value: 'status', label: 'Estado' }
  ];

  regimenOptions = [
    { value: '', label: 'Seleccione' },
    { value: '728', label: 'D.L. 728' },
    { value: '1057', label: 'CAS' },
    { value: '276', label: 'D.L. 276' }
  ];

  selectedSearchType = signal('');
  searchValue = signal('');

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' }
  ];

  /** @customize Role options for filter */
  roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'guest', label: 'Invitado' }
  ];

  // ============================================
  // FORM
  // ============================================

  entityForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', [Validators.required]],
    status: ['active', [Validators.required]]
  });

  // ============================================
  // COMPUTED
  // ============================================

  /** Current page data */
  items = computed(() => this.listApi.data()?.data ?? []);

  /** Pagination meta */
  meta = computed(() => this.listApi.data()?.meta ?? {
    total: 0,
    page: 1,
    perPage: this.pageSize(),
    totalPages: 1
  });

  /** Number of selected items */
  selectedCount = computed(() => this.selectedItems().size);

  /** Has selected items */
  hasSelection = computed(() => this.selectedCount() > 0);

  // ============================================
  // LIFECYCLE
  // ============================================

  ngOnInit(): void {
    this.loadData();
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadData(): void {
    const filters = this.filters();
    let filtered = [...FAKE_DB];
    if (filters.searchType && filters.searchValue) {
      const type = filters.searchType;
      const val = filters.searchValue.toLowerCase();
      if (type === 'name') filtered = filtered.filter(e => e.name.toLowerCase().includes(val) || e.email.toLowerCase().includes(val));
      if (type === 'document') filtered = filtered.filter(e => e.id.toLowerCase().includes(val)); // Mock document as id
      if (type === 'regimen') {
        // Mock regimen logic (we don't have regimen in Entity, let's map it randomly or just skip)
        // Let's pretend everyone with role admin is 728, others are CAS (1057)
        filtered = filtered.filter(e => (val === '728' ? e.role === 'admin' : e.role !== 'admin'));
      }
      if (type === 'status') filtered = filtered.filter(e => e.status === val);
    }
    if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
    if (filters.role) filtered = filtered.filter(e => e.role === filters.role);
    
    const page = this.currentPage();
    const perPage = this.pageSize();
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    
    const res: PaginatedResponse<Entity> = {
      data: paginated,
      meta: { total: filtered.length, page, perPage, totalPages: Math.ceil(filtered.length / perPage) }
    };
    
    this.listApi.execute(of(res).pipe(delay(600)) as any);
  }

  // ============================================
  // PAGINATION
  // ============================================

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.clearSelection();
    this.loadData();
  }

  // ============================================
  // SEARCH & FILTERS
  // ============================================

  applySearch(): void {
    this.filters.update(f => ({ ...f, searchType: this.selectedSearchType(), searchValue: this.searchValue() }));
    this.currentPage.set(1);
    this.loadData();
  }

  onSearchTypeChange(type: string): void {
    this.selectedSearchType.set(type);
    this.searchValue.set(''); // clear value when type changes
    this.applySearch();
  }

  onSearchValueChange(val: string): void {
    this.searchValue.set(val);
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this.applySearch();
    }, 300);
  }

  onStatusFilter(status: string): void {
    this.filters.update(f => ({ ...f, status }));
    this.currentPage.set(1);
    this.loadData();
  }

  onRoleFilter(role: string): void {
    this.filters.update(f => ({ ...f, role }));
    this.currentPage.set(1);
    this.loadData();
  }

  clearFilters(): void {
    this.filters.set({ searchType: '', searchValue: '', status: '', role: '' });
    this.selectedSearchType.set(''); this.searchValue.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.searchType || f.searchValue || f.status || f.role);
  }

  // ============================================
  // SELECTION
  // ============================================

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.clearSelection();
    } else {
      const allIds = new Set(this.items().map((item: any) => item.id));
      this.selectedItems.set(allIds);
      this.allSelected.set(true);
    }
  }

  toggleSelect(item: Entity): void {
    const selected = new Set(this.selectedItems());
    if (selected.has(item.id)) {
      selected.delete(item.id);
    } else {
      selected.add(item.id);
    }
    this.selectedItems.set(selected);
    this.allSelected.set(selected.size === this.items().length);
  }

  isSelected(item: Entity): boolean {
    return this.selectedItems().has(item.id);
  }

  clearSelection(): void {
    this.selectedItems.set(new Set());
    this.allSelected.set(false);
  }

  // ============================================
  // CREATE / EDIT
  // ============================================

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.currentItem.set(null);
    this.entityForm.reset({
      name: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    this.showModal.set(true);
  }

  openEditModal(item: Entity): void {
    this.isEditMode.set(true);
    this.currentItem.set(item);
    this.entityForm.patchValue({
      name: item.name,
      email: item.email,
      role: item.role,
      status: item.status
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.saveApi.reset();
  }

  onSave(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      return;
    }

    const data: any = this.entityForm.value;

    if (this.isEditMode()) {
      const item = this.currentItem();
      if (item) {
        const idx = FAKE_DB.findIndex(e => e.id === item.id);
        if (idx !== -1) FAKE_DB[idx] = { ...FAKE_DB[idx], ...data } as Entity;
        this.saveApi.execute(of(data).pipe(delay(800)) as any);
      }
    } else {
      data.id = String(idCounter++);
      data.createdAt = new Date().toISOString().split('T')[0];
      FAKE_DB.unshift(data as Entity);
      this.saveApi.execute(of(data).pipe(delay(800)) as any);
    }

    // Check for success
    const checkSave = setInterval(() => {
      if (this.saveApi.success()) {
        clearInterval(checkSave);
        this.closeModal();
        this.loadData();
      }
    }, 100);
  }

  // ============================================
  // DELETE
  // ============================================

  openDeleteModal(item: Entity): void {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
    this.deleteApi.reset();
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (item) {
      const idx = FAKE_DB.findIndex(e => e.id === item.id);
      if (idx !== -1) { FAKE_DB.splice(idx, 1); }
      this.deleteApi.execute(of({ success: true }).pipe(delay(600)) as any);
      const checkDelete = setInterval(() => {
        if (this.deleteApi.success()) {
          clearInterval(checkDelete);
          this.closeDeleteModal();
          this.loadData();
        }
      }, 100);
    }
  }

  // ============================================
  // BULK ACTIONS
  // ============================================

  bulkDelete(): void {
    const ids = Array.from(this.selectedItems());
    if (ids.length === 0) return;

    // TODO: Implement bulk delete API call
    // Example: this.api.post('/bulk-delete', { ids }).subscribe(() => this.loadData());
    this.clearSelection();
  }

  bulkExport(): void {
    const _ids = Array.from(this.selectedItems());
    // TODO: Implement export functionality
    // Example: this.api.downloadFile('/export', { ids: ids.length > 0 ? ids : 'all' });
  }

  // ============================================
  // HELPERS
  // ============================================

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadData();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.entityForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';

    if (field.errors['required']) return 'Campo requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}





