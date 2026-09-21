import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  SidebarMenuItem,
  LayoutShellComponent,
  SidebarComponent,
  TopbarComponent,
  ThemeSwitcherComponent,
  PaginaWizardComponent,
  FloatingInputComponent,
  Select2Component,
  RowComponent,
  TextareaComponent,
  TextComponent,
  Step,
  ToggleComponent,
  DatepickerComponent,
  CheckboxComponent,
  RadioComponent,
  FileInputComponent,
  FileInputFile
} from '@shared/ui';

@Component({
  selector: 'app-wizard-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    ThemeSwitcherComponent,
    PaginaWizardComponent,
    FloatingInputComponent,
    Select2Component,
    RowComponent,
    TextareaComponent,
    TextComponent,
    ToggleComponent,
    DatepickerComponent,
    CheckboxComponent,
    RadioComponent,
    FileInputComponent
  ],
  templateUrl: './wizard-page.component.html',
  styleUrl: './wizard-page.component.css'
})
export class WizardPageComponent {
  // SIDEBAR
  sidebarVisible = signal(true);
  menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase' , iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard' , iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud' , iconColor: 'var(--success-color)' },
    { label: 'Wizard', icon: 'fa-solid fa-wand-magic-sparkles', route: '/wizard' , active: true, iconColor: 'var(--warning-color)' },
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
    alert('Cerrando sesión...');
    this.router.navigate(['/login']);
  }

  onUserAction(action: any): void {
    if (action.id === 'settings') this.router.navigate(['/settings']);
  }

  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);

  // WIZARD STATE
  currentStep = signal(0);
  isSaving = signal(false);

  steps: Step[] = [
    { label: 'Información Básica', description: 'Datos personales' },
    { label: 'Datos de Contacto', description: 'Ubicación y comunicación' },
    { label: 'Detalles Médicos', description: 'Historial y seguro' },
    { label: 'Confirmación', description: 'Revisar datos' }
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    documentId: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['', Validators.required],
    maritalStatus: [''],

    country: ['', Validators.required],
    state: [''],
    city: ['', Validators.required],
    address: ['', Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],

    bloodType: [''],
    allergies: [''],
    hasInsurance: [false],
    medicalHistory: [''],
    emergencyContact: [''],
    emergencyPhone: [''],
    agreeTerms: [false, Validators.requiredTrue],
    preferredContact: ['email'],
    documents: [[] as FileInputFile[]],
    languages: [[] as string[]]
  });

  bloodTypeOptions = [
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
  ];

  genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  maritalStatusOptions = [
    { value: 'S', label: 'Soltero/a' },
    { value: 'C', label: 'Casado/a' },
    { value: 'D', label: 'Divorciado/a' },
    { value: 'V', label: 'Viudo/a' },
  ];

  languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' },
    { value: 'pt', label: 'Portugués' },
    { value: 'fr', label: 'Francés' },
  ];

  countryOptions = [
    { value: 'PE', label: 'Perú' },
    { value: 'MX', label: 'México' },
    { value: 'CO', label: 'Colombia' },
    { value: 'AR', label: 'Argentina' },
    { value: 'CL', label: 'Chile' },
  ];

  stateOptions = [
    { value: 'LIM', label: 'Lima' },
    { value: 'CUS', label: 'Cusco' },
    { value: 'ARE', label: 'Arequipa' },
    { value: 'PIU', label: 'Piura' },
  ];

  contactPreferencesOptions = [
    { value: 'email', label: 'Correo Electrónico' },
    { value: 'phone', label: 'Llamada Telefónica' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  get nextEnabled(): boolean {
    return true;
  }

  onStepChange(stepIndex: number) {
    this.currentStep.set(stepIndex);
  }

  onNext() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(v => v + 1);
    }
  }

  onBack() {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  onCancel() {
    this.router.navigate(['/crud']);
  }

  onFinish() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      alert('Datos guardados exitosamente');
      this.router.navigate(['/crud']);
    }, 1500);
  }
}
