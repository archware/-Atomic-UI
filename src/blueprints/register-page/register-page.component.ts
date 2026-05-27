import { Component, inject, signal, effect } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  AuthLayoutComponent,
  FloatingInputComponent,
  ButtonComponent,
  ApiService,
  useApi,
  FormErrorComponent,
  PanelComponent,
  TextComponent,
  RowComponent,
  FormRowComponent,
  AlertComponent,
  CheckboxComponent,
  DividerComponent,
} from '@shared/ui';

/**
 * Respuesta del endpoint de registro
 * @customize Ajustar según tu API
 */
interface RegisterResponse {
  message: string;
  userId?: string;
}

/**
 * Register Page Blueprint
 *
 * Flujo completo de registro:
 * - Nombre, apellido, email, contraseña con confirmación
 * - Aceptar términos y condiciones
 * - Manejo de errores inline con AlertComponent
 * - Validaciones reactivas
 *
 * @usage
 * 1. Copiar esta carpeta al directorio `pages/` de tu proyecto
 * 2. Ajustar la interface RegisterResponse
 * 3. Configurar el endpoint `REGISTER_ENDPOINT`
 * 4. Agregar ruta en app.routes.ts con `canActivate: [guestGuard]`
 */
const REGISTER_ENDPOINT = '/Authentication/Register';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    FloatingInputComponent,
    ButtonComponent,
    FormErrorComponent,
    PanelComponent,
    TextComponent,
    RowComponent,
    FormRowComponent,
    AlertComponent,
    CheckboxComponent,
    DividerComponent
],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
})
export class RegisterPageComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api    = inject(ApiService);

  protected readonly registerApi = useApi<RegisterResponse>();
  protected registered = signal(false);

  protected form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName:  ['', [Validators.required, Validators.minLength(2)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]],
    confirm:   ['', Validators.required],
    terms:     [false, Validators.requiredTrue],
  }, { validators: this.matchPasswords });

  constructor() {
    // Redirigir al login tras registro exitoso
    effect(() => {
      if (this.registerApi.success()) {
        this.registered.set(true);
      }
    });
  }

  private matchPasswords(group: import('@angular/forms').AbstractControl) {
    const pw  = group.get('password')?.value;
    const cpw = group.get('confirm')?.value;
    return pw === cpw ? null : { passwordMismatch: true };
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, password } = this.form.value;
    this.registerApi.execute(
      this.api.post<RegisterResponse>(REGISTER_ENDPOINT, { firstName, lastName, email, password })
    );
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Helpers de acceso al form
  get f() { return this.form.controls; }
}
