import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent } from '../../../../shared/ui/atoms/floating-input/floating-input.component';
import { Select2Component, Select2Option } from '../../../../shared/ui/molecules/select2/select2.component';
import { DatepickerComponent } from '../../../../shared/ui/molecules/datepicker/datepicker.component';
import { FormRowComponent } from '../../../../shared/ui/atoms/form-row/form-row.component';
import { RowComponent } from '../../../../shared/ui/atoms/row/row.component';
import { DropdownComponent, DropdownOption } from '../../../../shared/ui/molecules/dropdown/dropdown.component';

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
    DropdownComponent
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
      <h3 class="section-title">Formulario</h3>
      <form class="showcase-form">
        <div class="form-group">
          <label class="form-label">Nombre completo</label>
          <input type="text" class="form-input" placeholder="Ingrese su nombre" [(ngModel)]="formData.name" name="name">
        </div>
        
        <div class="form-group">
          <label class="form-label">Correo electrónico</label>
          <input type="email" class="form-input" placeholder="ejemplo@correo.com" [(ngModel)]="formData.email" name="email">
        </div>
        
        <app-form-row>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input type="tel" class="form-input" placeholder="+1 234 567 890" [(ngModel)]="formData.phone" name="phone">
          </div>
          <div class="form-group">
            <label class="form-label">País</label>
            <select class="form-select" [(ngModel)]="formData.country" name="country">
              <option value="">Seleccionar...</option>
              <option value="mx">México</option>
              <option value="us">Estados Unidos</option>
              <option value="es">España</option>
              <option value="ar">Argentina</option>
            </select>
          </div>
        </app-form-row>
        
        <div class="form-group">
          <label class="form-label">Mensaje</label>
          <textarea class="form-textarea" rows="3" placeholder="Escriba su mensaje..." [(ngModel)]="formData.message" name="message"></textarea>
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" class="form-checkbox" [(ngModel)]="formData.terms" name="terms">
            <span>Acepto los términos y condiciones</span>
          </label>
        </div>
        
        <div class="form-group">
          <label class="form-label">Preferencias</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="preference" value="email" [(ngModel)]="formData.preference">
              <span>Email</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="preference" value="phone" [(ngModel)]="formData.preference">
              <span>Teléfono</span>
            </label>
            <label class="radio-label">
              <input type="radio" name="preference" value="both" [(ngModel)]="formData.preference">
              <span>Ambos</span>
            </label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-outline">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar</button>
        </div>
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
}
