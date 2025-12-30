import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import {
  PanelComponent,
  ButtonComponent,
  InputComponent,
  Select2Component,
  TableComponent,
  TableHeadComponent,
  TableRowComponent,
  TableCellComponent,
  RowComponent,
  TextComponent,
  ChipComponent,
  IconButtonComponent,
  PaginationComponent,
  ModalComponent,
  FloatingInputComponent,
  LoaderComponent,
  ApiService,
  useApi
} from '@shared/ui';

/**
 * Generic entity interface
 * @customize Adjust to match your data model
 */
export interface Entity {
  id: string | number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * Paginated response interface
 * @customize Adjust to match your API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

/**
 * Filter options interface
 */
export interface FilterOptions {
  search: string;
  status: string;
  role: string;
}

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
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PanelComponent,
    ButtonComponent,
    InputComponent,
    FloatingInputComponent,
    Select2Component,
    PaginationComponent,
    ModalComponent,
    ChipComponent,
    LoaderComponent,
    IconButtonComponent,
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
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  // ============================================
  // CONFIGURATION - Customize these values
  // ============================================

  /** @customize API endpoint for CRUD operations */
  private readonly ENDPOINT = '/users';

  /** @customize Items per page */
  readonly PAGE_SIZE = 10;

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
    search: '',
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
    perPage: this.PAGE_SIZE,
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
    const params: Record<string, string> = {
      page: this.currentPage().toString(),
      perPage: this.PAGE_SIZE.toString()
    };

    const filters = this.filters();
    if (filters.search) params['search'] = filters.search;
    if (filters.status) params['status'] = filters.status;
    if (filters.role) params['role'] = filters.role;

    this.listApi.execute(
      this.api.get<PaginatedResponse<Entity>>(this.ENDPOINT, { params })
    );
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

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);

    // Debounce search
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this.filters.update(f => ({ ...f, search: input.value }));
      this.currentPage.set(1);
      this.loadData();
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
    this.filters.set({ search: '', status: '', role: '' });
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  hasActiveFilters(): boolean {
    const f = this.filters();
    return !!(f.search || f.status || f.role);
  }

  // ============================================
  // SELECTION
  // ============================================

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.clearSelection();
    } else {
      const allIds = new Set(this.items().map(item => item.id));
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

    const data = this.entityForm.value;

    if (this.isEditMode()) {
      const item = this.currentItem();
      if (item) {
        this.saveApi.execute(
          this.api.put<Entity>(`${this.ENDPOINT}/${item.id}`, data)
        );
      }
    } else {
      this.saveApi.execute(
        this.api.post<Entity>(this.ENDPOINT, data)
      );
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
    if (!item) return;

    this.deleteApi.execute(
      this.api.delete<{ success: boolean }>(`${this.ENDPOINT}/${item.id}`)
    );

    const checkDelete = setInterval(() => {
      if (this.deleteApi.success()) {
        clearInterval(checkDelete);
        this.closeDeleteModal();
        this.loadData();
      }
    }, 100);
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
