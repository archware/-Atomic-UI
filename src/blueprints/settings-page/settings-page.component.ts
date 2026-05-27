import { Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarMenuItem,
  PanelComponent,
  RowComponent,
  TextComponent,
  ButtonComponent,
  FloatingInputComponent,
  AvatarComponent,
  DividerComponent,
  AlertComponent,
  TabsComponent,
  TabComponent,
  ToggleComponent,
  SelectComponent,
  ApiService,
  useApi,
  ThemeSwitcherComponent,
} from '@shared/ui';

/**
 * SettingsPageComponent — Página de configuración de cuenta/perfil
 *
 * Secciones:
 * - Perfil: foto, nombre, bio
 * - Seguridad: cambio de contraseña
 * - Notificaciones: preferencias de alertas
 * - Apariencia: tema, idioma
 *
 * @usage
 * 1. Copia esta carpeta a src/app/pages/settings
 * 2. Ajusta los endpoints en los métodos save*()
 * 3. Registra la ruta con authGuard
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    PanelComponent,
    RowComponent,
    TextComponent,
    ButtonComponent,
    FloatingInputComponent,
    AvatarComponent,
    DividerComponent,
    AlertComponent,
    TabsComponent,
    TabComponent,
    ToggleComponent,
    SelectComponent,
    ThemeSwitcherComponent
],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  protected sidebarVisible = signal(true);
  protected successMessage = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);

  // ============================================================
  // MENU — @customize: ajusta a tu navegación
  // ============================================================
  protected menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-gauge', route: '/dashboard' },
    { label: 'Usuarios', icon: 'fa-solid fa-users', route: '/users' },
    { label: 'Configuración', icon: 'fa-solid fa-gear', route: '/settings', active: true },
  ];

  // ============================================================
  // PERFIL FORM
  // ============================================================
  protected profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    bio:       ['', [Validators.maxLength(300)]],
  });

  // ============================================================
  // SEGURIDAD FORM
  // ============================================================
  protected passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  // ============================================================
  // NOTIFICACIONES
  // ============================================================
  protected notifEmail   = signal(true);
  protected notifPush    = signal(false);
  protected notifWeekly  = signal(true);
  protected notifSystem  = signal(true);

  // ============================================================
  // APARIENCIA
  // ============================================================
  protected selectedLanguage = signal('es');
  protected languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  // ============================================================
  // API STATE
  // ============================================================
  protected profileApi = useApi<{ message: string }>();
  protected passwordApi = useApi<{ message: string }>();
  protected saving = computed(() => this.profileApi.loading() || this.passwordApi.loading());

  ngOnInit(): void {
    // @customize: reemplaza con tu llamada real a la API
    this.profileForm.patchValue({
      firstName: 'Admin',
      lastName: 'Usuario',
      email: 'admin@empresa.com',
      phone: '+54 9 11 1234-5678',
      bio: 'Administrador del sistema.',
    });
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  onToggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  onLogout(): void {
    // @customize: llama a authService.logout()
    this.router.navigate(['/login']);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.clearMessages();
    // @customize: this.profileApi.execute(this.api.put('/profile', this.profileForm.value));
    this.successMessage.set('Perfil actualizado correctamente.');
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    this.clearMessages();
    // @customize: this.passwordApi.execute(this.api.put('/auth/password', this.passwordForm.value));
    this.successMessage.set('Contraseña actualizada correctamente.');
    this.passwordForm.reset();
    setTimeout(() => this.successMessage.set(null), 4000);
  }

  saveNotifications(): void {
    // @customize: llama a tu endpoint de notificaciones
    this.successMessage.set('Preferencias de notificaciones guardadas.');
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }
}
