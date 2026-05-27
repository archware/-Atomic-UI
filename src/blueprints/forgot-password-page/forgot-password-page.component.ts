import { Component, inject, signal, effect } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthLayoutComponent,
  FloatingInputComponent,
  ButtonComponent,
  ApiService,
  useApi,
  FormErrorComponent,
  PanelComponent,
  TextComponent,
  FormRowComponent,
  AlertComponent,
  DividerComponent,
} from '@shared/ui';

/** Paso actual del flujo de recuperación */
type Step = 'request' | 'sent' | 'reset' | 'done';

/** Respuesta de la API al solicitar reset */
interface ForgotResponse {
  message: string;
}

/** Respuesta de la API al confirmar nueva contraseña */
interface ResetResponse {
  message: string;
}

/**
 * Forgot Password Page Blueprint
 *
 * Flujo de 4 pasos:
 * 1. request — el usuario ingresa su email
 * 2. sent    — confirmación de envío de correo
 * 3. reset   — el usuario ingresa código + nueva contraseña
 * 4. done    — confirmación de restablecimiento
 *
 * @usage
 * 1. Copiar al directorio `pages/` de tu proyecto
 * 2. Configurar `FORGOT_ENDPOINT` y `RESET_ENDPOINT`
 * 3. Agregar ruta en app.routes.ts con `canActivate: [guestGuard]`
 */
const FORGOT_ENDPOINT = '/Authentication/ForgotPassword';
const RESET_ENDPOINT  = '/Authentication/ResetPassword';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FloatingInputComponent,
    ButtonComponent,
    FormErrorComponent,
    PanelComponent,
    TextComponent,
    FormRowComponent,
    AlertComponent,
    DividerComponent
],
  templateUrl: './forgot-password-page.component.html',
  styleUrl:    './forgot-password-page.component.css',
})
export class ForgotPasswordPageComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api    = inject(ApiService);

  protected step = signal<Step>('request');

  protected forgotApi = useApi<ForgotResponse>();
  protected resetApi  = useApi<ResetResponse>();

  /** Formulario paso 1: email */
  protected emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  /** Formulario paso 3: código + nueva contraseña */
  protected resetForm = this.fb.group({
    code:     ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', Validators.required],
  }, { validators: this.matchPasswords });

  constructor() {
    effect(() => {
      if (this.forgotApi.success()) this.step.set('sent');
    });
    effect(() => {
      if (this.resetApi.success()) this.step.set('done');
    });
  }

  private matchPasswords(group: import('@angular/forms').AbstractControl) {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirm')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  protected submitEmail(): void {
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.forgotApi.execute(
      this.api.post<ForgotResponse>(FORGOT_ENDPOINT, { email: this.emailForm.value.email })
    );
  }

  protected submitReset(): void {
    if (this.resetForm.invalid) { this.resetForm.markAllAsTouched(); return; }
    const { code, password } = this.resetForm.value;
    this.resetApi.execute(
      this.api.post<ResetResponse>(RESET_ENDPOINT, {
        email: this.emailForm.value.email,
        token: code,
        newPassword: password,
      })
    );
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected resend(): void {
    this.forgotApi.reset();
    this.submitEmail();
  }

  get ef() { return this.emailForm.controls; }
  get rf() { return this.resetForm.controls; }
}
