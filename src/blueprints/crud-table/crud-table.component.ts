import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  SidebarMenuItem,
  LayoutShellComponent,
  SidebarComponent,
  TopbarComponent,
  ThemeSwitcherComponent,
  PaginaCrud,
  FloatingInputComponent,
  Select2Component,
  DataTableColumn,
  DataTableStatus,
  PopupService
} from '@shared/ui';


import { useApi } from '@shared/ui/services/use-api.service';
import { of, delay } from 'rxjs';

export interface Entity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
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

@Component({
  selector: 'app-crud-table',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    ThemeSwitcherComponent,
    PaginaCrud,
    FloatingInputComponent,
    Select2Component
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
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , active: true, iconColor: 'var(--success-color)' },
    { label: 'Wizard', icon: 'fa-solid fa-wand-magic-sparkles', route: '/wizard' , iconColor: 'var(--warning-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings' , iconColor: 'var(--text-color-secondary)' },
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
    this.popup.info('Sesión finalizada', 'Cerrando sesión...');
    this.router.navigate(['/login']);
  }

  onUserAction(action: any): void {
    if (action.id === 'settings') this.router.navigate(['/settings']);
  }

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly popup = inject(PopupService);

  @ViewChild(PaginaCrud) readonly paginaCrud!: PaginaCrud<Entity>;

  // ============================================
  // PAGINA CRUD CONFIGURATION
  // ============================================

  readonly columnas: DataTableColumn<Entity>[] = [
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Rol', sortable: true, isTag: true, tagVariant: () => 'default' },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      isTag: true,
      tagVariant: (row: Entity) => {
        switch (row.status) {
          case 'active': return 'success';
          case 'pending': return 'warning';
          case 'inactive': return 'error';
          default: return 'default';
        }
      },
      format: (val: any) => val === 'active' ? 'Activo' : val === 'pending' ? 'Pendiente' : 'Inactivo'
    },
    {
      key: 'createdAt',
      header: 'Creado',
      sortable: true,
      format: (val: any) => new Date(val as string).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
    }
  ];

  readonly opcionesBusqueda = [
    { value: 'name', label: 'Nombre del personal' },
    { value: 'document', label: 'Número de documento' },
    { value: 'regimen', label: 'Régimen laboral', tipo: 'select' as const, opcionesSelect: [
      { value: '728', label: 'D.L. 728' },
      { value: '1057', label: 'CAS' },
      { value: '276', label: 'D.L. 276' }
    ]},
    { value: 'status', label: 'Estado', tipo: 'select' as const, opcionesSelect: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'pending', label: 'Pendiente' }
    ]}
  ];

  roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'guest', label: 'Invitado' }
  ];

  statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'pending', label: 'Pendiente' }
  ];

  // STATE
  listApi = useApi<{ data: Entity[], total: number }>();
  saveApi = useApi<Entity>();
  deleteApi = useApi<void>();

  filas = computed(() => this.listApi.data()?.data ?? []);
  totalRegistros = computed(() => this.listApi.data()?.total ?? 0);
  estadoGrilla = computed<DataTableStatus>(() => {
    if (this.listApi.loading()) return 'loading';
    if (this.listApi.hasError()) return 'error';
    if (this.filas().length === 0) return 'empty';
    return 'success';
  });

  paginaActual = signal(1);
  modoCrud = signal<'crear' | 'editar' | 'ver'>('crear');
  entidadActiva = signal<Entity | null>(null);

  // FORM
  entityForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', [Validators.required]],
    status: ['active', [Validators.required]]
  });

  ngOnInit() {
    this.cargarPagina({ pagina: 1, tamano: 10, busqueda: '' });
  }

  cargarPagina(req: { pagina: number; tamano: number; busqueda: string }) {
    this.paginaActual.set(req.pagina);
    
    // Simulate filtering
    let filtered = [...FAKE_DB];
    if (req.busqueda) {
      const type = this.paginaCrud?.tipoBusquedaInterno() ?? 'name';
      const val = req.busqueda.toLowerCase();
      
      if (type === 'name') filtered = filtered.filter(e => e.name.toLowerCase().includes(val) || e.email.toLowerCase().includes(val));
      if (type === 'document') filtered = filtered.filter(e => e.id.toLowerCase().includes(val));
      if (type === 'regimen') filtered = filtered.filter(e => (val === '728' ? e.role === 'admin' : e.role !== 'admin'));
      if (type === 'status') filtered = filtered.filter(e => e.status === val);
    }

    const start = (req.pagina - 1) * req.tamano;
    const paginated = filtered.slice(start, start + req.tamano);

    this.listApi.execute(of({ data: paginated, total: filtered.length }).pipe(delay(500)));
  }

  abrirCrear() {
    this.modoCrud.set('crear');
    this.entidadActiva.set(null);
    this.entityForm.reset({ role: 'user', status: 'active' });
    this.paginaCrud.abrirDialogo();
  }

  abrirEditar(entidad: Entity) {
    this.modoCrud.set('editar');
    this.entidadActiva.set(entidad);
    this.entityForm.patchValue(entidad);
    this.paginaCrud.abrirDialogo();
  }

  abrirVer(entidad: Entity) {
    this.modoCrud.set('ver');
    this.entidadActiva.set(entidad);
    this.entityForm.patchValue(entidad);
    this.entityForm.disable(); // For preview
    this.paginaCrud.abrirDialogo();
  }

  eliminar(entidad: Entity) {
    const idx = FAKE_DB.findIndex(e => e.id === entidad.id);
    if (idx !== -1) FAKE_DB.splice(idx, 1);
    
    this.deleteApi.execute(of(void 0).pipe(delay(500)));
    
    const check = setInterval(() => {
      if (this.deleteApi.success()) {
        clearInterval(check);
        this.cargarPagina({ pagina: 1, tamano: 10, busqueda: '' });
      }
    }, 100);
  }

  guardar() {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      this.paginaCrud.enfocarError();
      return;
    }

    const val = this.entityForm.getRawValue();
    const curr = this.entidadActiva();
    const data: Entity = {
      id: curr?.id ?? String(idCounter++),
      createdAt: curr?.createdAt ?? new Date().toISOString().split('T')[0],
      ...val
    };

    if (this.modoCrud() === 'editar' && curr) {
      const idx = FAKE_DB.findIndex(e => e.id === curr.id);
      if (idx !== -1) FAKE_DB[idx] = data;
    } else {
      FAKE_DB.unshift(data);
    }

    this.saveApi.execute(of(data).pipe(delay(500)));
    
    const check = setInterval(() => {
      if (this.saveApi.success()) {
        clearInterval(check);
        this.paginaCrud.cerrarDialogo();
        this.cargarPagina({ pagina: 1, tamano: 10, busqueda: '' });
      }
    }, 100);
  }

  cerrarDialogo() {
    this.saveApi.reset();
    this.entityForm.enable();
  }

  getFieldError(fieldName: string): string {
    const field = this.entityForm.get(fieldName);
    if (!field || !field.touched || !field.errors) return '';
    if (field.errors['required']) return 'Campo requerido';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    return '';
  }
}
