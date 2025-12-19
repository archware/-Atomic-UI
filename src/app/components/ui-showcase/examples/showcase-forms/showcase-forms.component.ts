import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent } from '../../../../shared/ui/atoms/floating-input/floating-input.component';
import { Select2Component, Select2Option } from '../../../../shared/ui/molecules/select2/select2.component';
import { DatepickerComponent } from '../../../../shared/ui/molecules/datepicker/datepicker.component';
import { FormRowComponent } from '../../../../shared/ui/atoms/form-row/form-row.component';
import { RowComponent } from '../../../../shared/ui/atoms/row/row.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/ui/molecules/dropdown/dropdown.component';
import { TextareaComponent } from '../../../../shared/ui/atoms/textarea/textarea.component';
import { RadioComponent, RadioOption } from '../../../../shared/ui/atoms/radio/radio.component';
import { CheckboxComponent } from '../../../../shared/ui/atoms/checkbox/checkbox.component';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';

@Component({
  selector: 'app-showcase-forms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FloatingInputComponent,
    Select2Component,
    DatepickerComponent,
    FormRowComponent,
    RowComponent,
    DropdownComponent,
    TextareaComponent,
    RadioComponent,
    CheckboxComponent,
    ButtonComponent
  ],
  template: `
    <!-- FLOATING INPUTS -->
    <form class="showcase-section" (submit)="$event.preventDefault()">
      <h3 class="section-title">Floating Inputs</h3>
      <div class="input-variants-grid">
        <app-floating-input 
          variant="floating" 
          label="Nombre completo" 
          [(ngModel)]="floatingInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        
        <app-floating-input 
          variant="underline" 
          label="Email" 
          type="email"
          [(ngModel)]="underlineInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        
        <app-floating-input 
          variant="material" 
          label="Contraseña" 
          type="password"
          [(ngModel)]="materialInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        
        <app-floating-input 
          variant="outline" 
          label="Teléfono" 
          type="tel"
          [(ngModel)]="outlineInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
      </div>
      
      <h4 class="subsection-title">Estados y tipos especiales</h4>
      <div class="input-variants-grid">
        <app-floating-input 
          variant="floating" 
          label="Con error" 
          error="Este campo es requerido"
          [(ngModel)]="errorInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        
        <app-floating-input 
          variant="floating" 
          label="Deshabilitado" 
          [disabled]="true"
          [ngModel]="'Valor deshabilitado'"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        
        <app-datepicker 
          variant="floating" 
          label="Fecha de nacimiento" 
          [(ngModel)]="dateInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-datepicker>
        
        <app-floating-input 
          variant="floating" 
          label="Contraseña (con toggle)" 
          type="password"
          [(ngModel)]="passwordInputValue"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
      </div>
      
      <h4 class="subsection-title">Anchos Personalizados</h4>
      <app-row columns="auto auto auto auto" gap="1rem" align="left">
        <app-floating-input 
          variant="outline" 
          label="100px" 
          width="100px"
          [(ngModel)]="widthExample1"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        <app-floating-input 
          variant="outline" 
          label="150px" 
          width="150px"
          [(ngModel)]="widthExample2"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        <app-floating-input 
          variant="outline" 
          label="200px" 
          width="200px"
          [(ngModel)]="widthExample3"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        <app-floating-input 
          variant="outline" 
          label="auto (default)"
          [(ngModel)]="widthExample4"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
      </app-row>
      
      <app-row columns="auto auto auto" gap="1rem" align="left" style="margin-top: 1rem;">
        <app-select2 
          [options]="select2Options" 
          placeholder="100px"
          width="100px"
        ></app-select2>
        <app-select2 
          [options]="select2Options" 
          placeholder="200px"
          width="200px"
        ></app-select2>
        <app-select2 
          [options]="select2Options" 
          placeholder="auto (default)"
        ></app-select2>
      </app-row>
      
      <h4 class="subsection-title" style="margin-top: 1.5rem;">Anchos en Porcentaje</h4>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <app-floating-input 
          variant="outline" 
          label="width=25%"
          width="25%"
          [(ngModel)]="widthPercent1"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        <app-floating-input 
          variant="outline" 
          label="width=50%"
          width="50%"
          [(ngModel)]="widthPercent2"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
        <app-floating-input 
          variant="outline" 
          label="width=75%"
          width="75%"
          [(ngModel)]="widthPercent3"
          [ngModelOptions]="{standalone: true}"
        ></app-floating-input>
      </div>
    </form>

    <!-- SELECT2 -->
    <section class="showcase-section">
      <h3 class="section-title">Select2 (Búsqueda + Tags)</h3>
      <div class="input-variants-grid">
        <div>
          <h4 class="subsection-title">Simple con búsqueda</h4>
          <app-select2 
            [options]="select2Options" 
            [(ngModel)]="select2Value"
            placeholder="Buscar país..."
          ></app-select2>
          <p class="mt-2 text-sm">Seleccionado: {{ select2Value || 'Ninguno' }}</p>
        </div>
        
        <div>
          <h4 class="subsection-title">Multi-select con tags</h4>
          <app-select2 
            [options]="select2Options" 
            [(ngModel)]="select2MultiValue"
            [multiple]="true"
            placeholder="Seleccionar países..."
          ></app-select2>
        </div>
      </div>
    </section>

    <!-- DROPDOWN -->
    <section class="showcase-section">
      <h3 class="section-title">Dropdown</h3>
      <app-dropdown 
        [options]="countryOptions" 
        [(value)]="selectedCountry"
        placeholder="Selecciona un país">
      </app-dropdown>
      <p class="mt-2 text-sm">Seleccionado: {{ selectedCountry || 'Ninguno' }}</p>
    </section>

    <!-- FORMULARIO -->
    <section class="showcase-section">
      <h3 class="section-title">Formulario con Componentes Atomic</h3>
      <form class="showcase-form">
        <!-- Fila 1: Nombre y Email -->
        <app-form-row>
          <app-floating-input 
            variant="floating" 
            label="Nombre completo" 
            [(ngModel)]="formData.name"
            name="name"
          ></app-floating-input>
          
          <app-floating-input 
            variant="floating" 
            label="Correo electrónico" 
            type="email"
            [(ngModel)]="formData.email"
            name="email"
          ></app-floating-input>
        </app-form-row>
        
        <!-- Fila 2: Teléfono y País -->
        <app-form-row>
          <app-floating-input 
            variant="floating" 
            label="Teléfono" 
            type="tel"
            [(ngModel)]="formData.phone"
            name="phone"
          ></app-floating-input>
          
          <app-select2 
            label="País"
            [options]="formSelect2Options" 
            [(ngModel)]="formData.country"
            name="country"
            placeholder="Seleccionar..."
          ></app-select2>
        </app-form-row>
        
        <!-- Mensaje -->
        <app-textarea 
          label="Mensaje" 
          variant="floating"
          [rows]="4"
          [maxlength]="500"
          [(ngModel)]="formData.message"
          name="message"
        ></app-textarea>
        
        <!-- Checkbox y Radio en fila -->
        <app-form-row>
          <app-checkbox 
            label="Acepto los términos y condiciones" 
            [(ngModel)]="formData.terms"
            name="terms"
          ></app-checkbox>
          
          <app-radio 
            label="Preferencia de contacto"
            name="preference"
            [options]="preferenceOptions"
            direction="horizontal"
            [(ngModel)]="formData.preference"
          ></app-radio>
        </app-form-row>
        
        <!-- Botones -->
        <app-row columns="auto auto" gap="1rem" align="right">
          <app-button variant="outline" (onClick)="onCancel()">Cancelar</app-button>
          <app-button variant="primary" type="submit" (onClick)="onSubmit()">Enviar</app-button>
        </app-row>
      </form>
    </section>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-color); }
    .subsection-title { font-size: 1rem; font-weight: 500; margin: 1rem 0 0.5rem; color: var(--text-color-secondary); }
    .input-variants-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    
    /* Form Styles */
    .showcase-form { background: var(--surface-card); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-color); }
    .form-input, .form-select, .form-textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface-input); color: var(--text-color); }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }
    
    /* Checkbox & Radio */
    .checkbox-label, .radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: var(--text-color); }
    .radio-group { display: flex; gap: 1rem; }
    
    /* Helper buttons */
    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
  `]
})
export class ShowcaseFormsComponent {
  // Input values
  floatingInputValue = '';
  underlineInputValue = '';
  materialInputValue = '';
  outlineInputValue = '';
  errorInputValue = '';
  dateInputValue = '';
  passwordInputValue = '';

  // Width examples
  widthExample1 = '';
  widthExample2 = '';
  widthExample3 = '';
  widthExample4 = '';
  widthPercent1 = '';
  widthPercent2 = '';
  widthPercent3 = '';

  // Select2
  select2Value: string | number = '';
  select2MultiValue: (string | number)[] = [];
  select2Options: Select2Option[] = [
    { value: 'pe', label: 'Perú', icon: '🇵🇪' },
    { value: 'mx', label: 'México', icon: '🇲🇽' },
    { value: 'co', label: 'Colombia', icon: '🇨🇴' },
    { value: 'ar', label: 'Argentina', icon: '🇦🇷' },
    { value: 'cl', label: 'Chile', icon: '🇨🇱' },
    { value: 'es', label: 'España', icon: '🇪🇸' },
    { value: 'br', label: 'Brasil', icon: '🇧🇷' },
    { value: 'us', label: 'Estados Unidos', icon: '🇺🇸' }
  ];

  // Dropdown
  selectedCountry: string | number = '';
  countryOptions: DropdownOption[] = [
    { value: 'pe', label: 'Perú', icon: '🇵🇪' },
    { value: 'mx', label: 'México', icon: '🇲🇽' },
    { value: 'co', label: 'Colombia', icon: '🇨🇴' },
    { value: 'ar', label: 'Argentina', icon: '🇦🇷' },
    { value: 'cl', label: 'Chile', icon: '🇨🇱' }
  ];

  // Radio options
  preferenceOptions: RadioOption[] = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'both', label: 'Ambos' }
  ];

  // Country options for form (sin iconos)
  formCountryOptions: DropdownOption[] = [
    { value: 'pe', label: 'Perú' },
    { value: 'mx', label: 'México' },
    { value: 'co', label: 'Colombia' },
    { value: 'ar', label: 'Argentina' },
    { value: 'es', label: 'España' },
    { value: 'us', label: 'Estados Unidos' }
  ];

  // Country options for form (Select2 format)
  formSelect2Options: Select2Option[] = [
    { value: 'pe', label: 'Perú' },
    { value: 'mx', label: 'México' },
    { value: 'co', label: 'Colombia' },
    { value: 'ar', label: 'Argentina' },
    { value: 'es', label: 'España' },
    { value: 'us', label: 'Estados Unidos' }
  ];

  // Form Data
  formData = {
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
    terms: false,
    preference: 'email'
  };

  onCancel(): void {
    // Reset form
    this.formData = {
      name: '',
      email: '',
      phone: '',
      country: '',
      message: '',
      terms: false,
      preference: 'email'
    };
  }

  onSubmit(): void {
    console.log('Formulario enviado:', this.formData);
  }
}
