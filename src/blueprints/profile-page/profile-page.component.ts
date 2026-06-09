import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LayoutShellComponent,
  TopbarComponent,
  SidebarComponent,
  SidebarMenuItem,
  PanelComponent,
  RowComponent,
  AvatarComponent,
  TextComponent,
  ButtonComponent,
  FloatingInputComponent,
  FormRowComponent,
  DividerComponent,
  AlertComponent,
  ChipComponent,
  SkeletonComponent,
  ThemeSwitcherComponent,
  AuthService,
  ApiService,
  useApi,
} from '@shared/ui';

/** Perfil del usuario
 * @customize Ajusta según tu API */
interface UserProfile {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  role?:     string;
  phone?:    string;
  avatar?:   string;
}

/** Respuesta al guardar perfil */
interface SaveProfileResponse {
  message: string;
}

/** Respuesta al cambiar contraseña */
interface ChangePasswordResponse {
  message: string;
}

const PROFILE_ENDPOINT         = '/Users/GetProfile';
const SAVE_PROFILE_ENDPOINT    = '/Users/UpdateProfile';
const CHANGE_PASSWORD_ENDPOINT = '/Authentication/ChangePassword';

/**
 * Profile Page Blueprint
 *
 * Secciones:
 * - Información personal (nombre, apellido, teléfono)
 * - Cambio de contraseña
 * - Resumen de cuenta (email, rol)
 *
 * @usage
 * 1. Copiar al directorio `pages/` de tu proyecto
 * 2. Ajustar interfaces y endpoints
 * 3. Agregar ruta en app.routes.ts con `canActivate: [authGuard]`
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LayoutShellComponent,
    TopbarComponent,
    SidebarComponent,
    PanelComponent,
    RowComponent,
    AvatarComponent,
    TextComponent,
    ButtonComponent,
    FloatingInputComponent,
    FormRowComponent,
    DividerComponent,
    AlertComponent,
    ChipComponent,
    SkeletonComponent,
    ThemeSwitcherComponent
],
  templateUrl: './profile-page.component.html',
  styleUrl:    './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly fb         = inject(FormBuilder);
  private readonly router     = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api        = inject(ApiService);
  private readonly auth       = inject(AuthService);

  protected sidebarVisible = signal(true);

  protected profileApi     = useApi<UserProfile>();
  protected saveApi        = useApi<SaveProfileResponse>();
  protected passwordApi    = useApi<ChangePasswordResponse>();

  protected saveSuccess    = signal(false);
  protected passSuccess    = signal(false);

  /** Formulario de datos personales */
  protected infoForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    phone:     [''],
  });

  /** Formulario de cambio de contraseña */
  protected passForm = this.fb.group({
    current:  ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', Validators.required],
  }, { validators: this.matchPasswords });

  // ── Sidebar menu ──────────────────────────────────
  protected readonly menuItems: SidebarMenuItem[] = [
      { label: 'Volver a Showcase', icon: 'fa-solid fa-arrow-left', route: '/showcase', iconColor: 'var(--primary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-gauge', route: '/dashboard', iconColor: 'var(--info-color)' },
    { label: 'Perfil', icon: 'fa-solid fa-user', active: true, iconColor: 'var(--warning-color)' },
    { label: 'Cerrar sesión', icon: 'fa-solid fa-right-from-bracket', iconColor: 'var(--danger-color)' },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.sidebarVisible.set(window.innerWidth >= 768);
    }
    this.loadProfile();
  }

  private loadProfile(): void {
    this.profileApi.execute(
      this.api.get<UserProfile>(PROFILE_ENDPOINT)
    );
    // Cuando lleguen los datos, popular el formulario
    const sub = this.profileApi.data;
    // Effect manual: watch data signal change
    const fill = () => {
      const profile = this.profileApi.data();
      if (profile) {
        this.infoForm.patchValue({
          firstName: profile.firstName,
          lastName:  profile.lastName,
          phone:     profile.phone ?? '',
        });
      }
    };
    // Poll once after execute (signals are synchronous in most cases)
    setTimeout(fill, 100);
    void sub; // suppress unused warning
  }

  protected saveProfile(): void {
    if (this.infoForm.invalid) { this.infoForm.markAllAsTouched(); return; }
    this.saveSuccess.set(false);
    this.saveApi.execute(
      this.api.put<SaveProfileResponse>(SAVE_PROFILE_ENDPOINT, this.infoForm.value)
    );
    // Mostrar éxito
    setTimeout(() => { if (this.saveApi.success()) this.saveSuccess.set(true); }, 300);
  }

  protected changePassword(): void {
    if (this.passForm.invalid) { this.passForm.markAllAsTouched(); return; }
    this.passSuccess.set(false);
    const { current, password } = this.passForm.value;
    this.passwordApi.execute(
      this.api.post<ChangePasswordResponse>(CHANGE_PASSWORD_ENDPOINT, {
        currentPassword: current,
        newPassword: password,
      })
    );
    setTimeout(() => {
      if (this.passwordApi.success()) {
        this.passSuccess.set(true);
        this.passForm.reset();
      }
    }, 300);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected onToggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  private matchPasswords(group: import('@angular/forms').AbstractControl) {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirm')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  get uf() { return this.infoForm.controls; }
  get pf() { return this.passForm.controls; }
  get currentUser() { return this.auth.currentUser(); }
}






