import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  AuthLayoutComponent,
  FloatingInputComponent,
  ButtonComponent,
  CheckboxComponent,
  ApiService,
  useApi,
  FormErrorComponent,
  PanelComponent,
  TextComponent,
  RowComponent,
  FormRowComponent,
  DividerComponent
} from '@shared/ui';

/**
 * Response from login API endpoint
 * @customize Adjust to match your API response structure
 */
interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

/**
 * Response from register API endpoint
 * @customize Adjust to match your API response structure
 */
interface RegisterResponse {
  message: string;
  userId?: string;
}

/**
 * Response from forgot password API endpoint
 */
interface ForgotPasswordResponse {
  message: string;
}

/**
 * Login Page Blueprint
 * 
 * Features:
 * - Login form with email/password
 * - Register form with validation
 * - Forgot password flow
 * - Remember me checkbox
 * - API integration with loading states
 * - Error handling and display
 * 
 * @usage
 * 1. Copy this folder to your project's pages directory
 * 2. Update imports to match your project structure
 * 3. Configure API_BASE_URL to your backend
 * 4. Add route in app.routes.ts
 */
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthLayoutComponent,
    FloatingInputComponent,
    ButtonComponent,
    CheckboxComponent,
    FormErrorComponent,
    PanelComponent,
    TextComponent,
    RowComponent,
    FormRowComponent,
    DividerComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  // ============================================
  // CONFIGURATION - Customize these values
  // ============================================

  /** @customize Set your API base URL */
  private readonly API_BASE_URL = 'https://api.example.com/v1';

  /** @customize Route to redirect after successful login */
  private readonly REDIRECT_AFTER_LOGIN = '/dashboard';

  /** @customize Token storage key */
  private readonly TOKEN_KEY = 'auth_token';

  // ============================================
  // STATE
  // ============================================

  /** Current active view: 'login' | 'register' | 'forgot' */
  activeView = signal<'login' | 'register' | 'forgot'>('login');

  /** API state hooks */
  loginApi = useApi<LoginResponse>();
  registerApi = useApi<RegisterResponse>();
  forgotApi = useApi<ForgotPasswordResponse>();

  /** Success message for forgot password */
  forgotSuccessMessage = signal<string | null>(null);

  // ============================================
  // FORMS
  // ============================================

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // ============================================
  // LIFECYCLE
  // ============================================

  constructor() {
    this.api.setBaseUrl(this.API_BASE_URL);
  }

  // ============================================
  // VIEW SWITCHING
  // ============================================

  showLogin(): void {
    this.activeView.set('login');
    this.resetAllForms();
  }

  showRegister(): void {
    this.activeView.set('register');
    this.resetAllForms();
  }

  showForgot(): void {
    this.activeView.set('forgot');
    this.resetAllForms();
  }

  private resetAllForms(): void {
    this.loginForm.reset();
    this.registerForm.reset();
    this.forgotForm.reset();
    this.loginApi.reset();
    this.registerApi.reset();
    this.forgotApi.reset();
    this.forgotSuccessMessage.set(null);
  }

  // ============================================
  // FORM SUBMISSIONS
  // ============================================

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, rememberMe } = this.loginForm.value;

    // MOCK LOGIN FOR DEMO PURPOSE (Enable real API by uncommenting line below)
    this.loginApi.execute(
      new Observable(observer => {
        setTimeout(() => {
          observer.next({
            token: 'mock-jwt-token-123456',
            user: {
              id: '1',
              name: 'Demo User',
              email: email || 'demo@example.com'
            }
          });
          observer.complete();
        }, 1500);
      })
      // this.api.post<LoginResponse>('/auth/login', { email, password })
    );

    // Handle successful login using effect() for automatic cleanup
    effect(() => {
      if (this.loginApi.success()) {
        const response = this.loginApi.data();
        if (response) {
          this.handleLoginSuccess(response, rememberMe ?? false);
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      // Handle password mismatch
      return;
    }

    const { name, email } = this.registerForm.value;

    this.registerApi.execute(
      this.api.post<RegisterResponse>('/auth/register', { name, email, password })
    );
  }

  onForgotPassword(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const { email } = this.forgotForm.value;

    this.forgotApi.execute(
      this.api.post<ForgotPasswordResponse>('/auth/forgot-password', { email })
    );

    // Handle success using effect() for automatic cleanup
    effect(() => {
      if (this.forgotApi.success()) {
        const response = this.forgotApi.data();
        if (response) {
          this.forgotSuccessMessage.set(response.message || 'Se ha enviado un correo con instrucciones');
        }
      }
    });
  }

  // ============================================
  // HANDLERS
  // ============================================

  private handleLoginSuccess(response: LoginResponse, rememberMe: boolean): void {
    // TODO: SECURITY - Migrar a cookies HttpOnly cuando el backend lo soporte
    // Los tokens en localStorage son vulnerables a ataques XSS
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, response.token);

    // Set auth header for future requests
    this.api.setAuthToken(response.token);

    // Store user info if needed
    storage.setItem('user', JSON.stringify(response.user));

    // Navigate to dashboard
    this.router.navigate([this.REDIRECT_AFTER_LOGIN]);
  }

  // ============================================
  // FORM FIELD ERRORS
  // ============================================

  getFieldError(form: 'login' | 'register' | 'forgot', fieldName: string): string {
    let field;

    if (form === 'login') {
      field = this.loginForm.get(fieldName);
    } else if (form === 'register') {
      field = this.registerForm.get(fieldName);
    } else {
      field = this.forgotForm.get(fieldName);
    }

    if (!field || !field.touched || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }
    if (field.errors['email']) {
      return 'Ingresa un email válido';
    }
    if (field.errors['minlength']) {
      const min = field.errors['minlength'].requiredLength;
      return `Mínimo ${min} caracteres`;
    }

    return '';
  }
}
