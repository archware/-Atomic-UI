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
  
  TextComponent,
  Step,
  ToggleComponent
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
    
    TextComponent,
    ToggleComponent
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
    { label: 'Detalles Médicos', description: 'Historial' },
    { label: 'Confirmación', description: 'Revisar datos' }
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    documentId: ['', Validators.required],
    bloodType: [''],
    allergies: [''],
    hasInsurance: [false],
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

  get nextEnabled(): boolean {
    if (this.currentStep() === 0) {
      return this.form.controls.firstName.valid && this.form.controls.lastName.valid && this.form.controls.documentId.valid;
    }
    return true;
  }

  onStepChange(stepIndex: number) {
    // Only allow navigating backward or to completed steps for this demo
    if (stepIndex < this.currentStep()) {
      this.currentStep.set(stepIndex);
    }
  }

  onNext() {
    if (this.currentStep() < this.steps.length - 1) {
      if (this.currentStep() === 0) {
        this.form.controls.firstName.markAsTouched();
        this.form.controls.lastName.markAsTouched();
        this.form.controls.documentId.markAsTouched();
        if (this.form.controls.firstName.invalid || this.form.controls.lastName.invalid || this.form.controls.documentId.invalid) {
          return;
        }
      }
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
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      alert('Datos guardados exitosamente');
      this.router.navigate(['/crud']);
    }, 1500);
  }
}
