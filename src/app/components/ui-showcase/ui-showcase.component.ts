import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/ui/atoms/loader/loader.component';
import { ToastComponent } from '../../shared/ui/molecules/toast/toast.component';
import { TabsComponent, TabComponent } from '../../shared/ui/organisms/tabs/tabs.component';
import { AccordionComponent, AccordionItemComponent } from '../../shared/ui/organisms/accordion/accordion.component';
import { DropdownComponent, DropdownOption } from '../../shared/ui/molecules/dropdown/dropdown.component';
import { AvatarComponent } from '../../shared/ui/atoms/avatar/avatar.component';
import { ChipComponent } from '../../shared/ui/atoms/chip/chip.component';
import { StepperComponent, Step } from '../../shared/ui/organisms/stepper/stepper.component';
import { SkeletonComponent } from '../../shared/ui/atoms/skeleton/skeleton.component';
import { PaginationComponent } from '../../shared/ui/molecules/pagination/pagination.component';
import { RatingComponent } from '../../shared/ui/atoms/rating/rating.component';
import { PanelComponent } from '../../shared/ui/surfaces/panel/panel.component';
import { ModalComponent } from '../../shared/ui/molecules/modal/modal.component';
import { TextComponent } from '../../shared/ui/atoms/text/text.component';
import { ToggleComponent } from '../../shared/ui/atoms/toggle/toggle.component';
import { CheckboxComponent } from '../../shared/ui/atoms/checkbox/checkbox.component';
import { FloatingInputComponent } from '../../shared/ui/atoms/floating-input/floating-input.component';
import { Select2Component, Select2Option } from '../../shared/ui/molecules/select2/select2.component';
import { RowComponent } from '../../shared/ui/atoms/row/row.component';
import { ButtonComponent } from '../../shared/ui/atoms/button/button.component';
import { DatepickerComponent } from '../../shared/ui/molecules/datepicker/datepicker.component';
import { FooterComponent, SocialLink, LegalLink } from '../../shared/ui/organisms/footer/footer.component';
import { AuthLayoutComponent } from '../../shared/ui/templates/auth-layout/auth-layout.component';
import { TableComponent } from '../../shared/ui/atoms/table/table.component';
import { TableHeadComponent } from '../../shared/ui/atoms/table/table-head.component';
import { TableRowComponent } from '../../shared/ui/atoms/table/table-row.component';
import { TableCellComponent } from '../../shared/ui/atoms/table/table-cell.component';
import { FormRowComponent } from '../../shared/ui/atoms/form-row/form-row.component';
import { DividerComponent } from '../../shared/ui/atoms/divider/divider.component';

@Component({
  selector: 'app-ui-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoaderComponent,
    ToastComponent,
    TabsComponent,
    TabComponent,
    AccordionComponent,
    AccordionItemComponent,
    DropdownComponent,
    AvatarComponent,
    ChipComponent,
    StepperComponent,
    SkeletonComponent,
    PaginationComponent,
    RatingComponent,
    PanelComponent,
    ModalComponent,
    TextComponent,
    ToggleComponent,
    CheckboxComponent,
    FloatingInputComponent,
    Select2Component,
    RowComponent,
    ButtonComponent,
    DatepickerComponent,
    FooterComponent,
    AuthLayoutComponent,
    TableComponent,
    TableHeadComponent,
    TableRowComponent,
    TableCellComponent,
    FormRowComponent,
    DividerComponent
  ],
  template: `
    <app-panel title="UI Components Showcase" icon="🎨" variant="elevated" padding="lg">
      
      <!-- TYPOGRAPHY -->
      <app-panel title="Tipografía" variant="flat" padding="md" class="showcase-section">
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <app-text variant="h1" color="primary">Heading 1</app-text>
          <app-text variant="h2">Heading 2</app-text>
          <app-text variant="h3">Heading 3</app-text>
          <app-text variant="h4">Heading 4</app-text>
          <app-text variant="body" weight="medium">Body text (Medium)</app-text>
          <app-text variant="caption" color="muted">Caption text</app-text>
        </div>
      </app-panel>

      <!-- DIVIDERS -->
      <app-panel title="Dividers" variant="flat" padding="md" class="showcase-section">
        <app-text variant="body">Párrafo superior</app-text>
        <app-divider></app-divider>
        <app-text variant="body">Párrafo inferior (Divider simple)</app-text>
        
        <br>
        
        <app-text variant="body">Sección A</app-text>
        <app-divider text="O"></app-divider>
        <app-text variant="body">Sección B (Divider con texto)</app-text>
        
        <br>
        
        <app-text variant="body">Inicio</app-text>
        <app-divider text="Continuar" align="start"></app-divider>
        <app-text variant="body">Fin (Divider alineado al inicio)</app-text>
      </app-panel>

      <!-- PANEL TITLE CUSTOMIZATION DEMO -->
      <app-panel title="Panel Title Customization" variant="flat" padding="md" titleSize="lg" titleWeight="bold" class="showcase-section">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <app-panel title="Izquierda (Left)" variant="outlined" padding="sm" titleAlign="left" titleWeight="bold">
            <app-text variant="caption">titleAlign="left"</app-text>
          </app-panel>
          <app-panel title="Centrado (Center)" variant="outlined" padding="sm" titleAlign="center" titleWeight="bold">
            <app-text variant="caption">titleAlign="center"</app-text>
          </app-panel>
          <app-panel title="Derecha (Right)" variant="outlined" padding="sm" titleAlign="right" titleWeight="bold">
            <app-text variant="caption">titleAlign="right"</app-text>
          </app-panel>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <app-panel title="Size SM" variant="card" padding="sm" titleSize="sm">
            <app-text variant="caption">titleSize="sm"</app-text>
          </app-panel>
          <app-panel title="Size MD" variant="card" padding="sm" titleSize="md">
            <app-text variant="caption">titleSize="md"</app-text>
          </app-panel>
          <app-panel title="Size LG" variant="card" padding="sm" titleSize="lg">
            <app-text variant="caption">titleSize="lg"</app-text>
          </app-panel>
          <app-panel title="Size XL" variant="card" padding="sm" titleSize="xl">
            <app-text variant="caption">titleSize="xl"</app-text>
          </app-panel>
        </div>
      </app-panel>

      <!-- ROW CONTAINER DEMO -->
      <app-panel title="Row Container" variant="flat" padding="md" titleSize="lg" titleWeight="bold" class="showcase-section">
        <app-row columns="1fr 1fr 1fr" gap="1rem" align="center">
          <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
            <app-text variant="caption">Column 1</app-text>
          </div>
          <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
            <app-text variant="caption">Column 2</app-text>
          </div>
          <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
            <app-text variant="caption">Column 3</app-text>
          </div>
        </app-row>
        
        <div style="margin-top: 1rem;">
          <app-text variant="caption" color="muted">align="left"</app-text>
          <app-row columns="repeat(3, auto)" gap="1rem" align="left" style="margin-bottom: 0.5rem;">
            <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
            <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
            <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
          </app-row>
        </div>
        
        <div style="margin-top: 0.5rem;">
          <app-text variant="caption" color="muted">align="center"</app-text>
          <app-row columns="repeat(3, auto)" gap="1rem" align="center" justify="center" style="margin-bottom: 0.5rem;">
            <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
            <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
            <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
          </app-row>
        </div>
        
        <div style="margin-top: 0.5rem;">
          <app-text variant="caption" color="muted">align="right"</app-text>
          <app-row columns="repeat(3, auto)" gap="1rem" align="right" justify="end">
            <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
            <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
            <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
          </app-row>
        </div>
      </app-panel>

      <!-- BOTONES -->
      <app-panel title="Botones" variant="flat" padding="md" class="showcase-section">
        <div class="button-grid">
          <button class="btn btn-primary">Primary</button>
          <button class="btn btn-secondary">Secondary</button>
          <button class="btn btn-success">Success</button>
          <button class="btn btn-warning">Warning</button>
          <button class="btn btn-danger">Danger</button>
          <button class="btn btn-outline">Outline</button>
          <button class="btn btn-ghost">Ghost</button>
          <button class="btn btn-primary" disabled>Disabled</button>
        </div>
        
        <div class="button-sizes">
          <button class="btn btn-primary btn-sm">Small</button>
          <button class="btn btn-primary">Medium</button>
          <button class="btn btn-primary btn-lg">Large</button>
        </div>
        
        <div style="margin-top: 1rem;">
          <app-text variant="caption" color="muted">Componente Button con iconos:</app-text>
          <div class="button-grid" style="margin-top: 0.5rem;">
            <app-button variant="primary" icon="🔍">Buscar</app-button>
            <app-button variant="success" icon="✓" iconPosition="left">Guardar</app-button>
            <app-button variant="secondary" icon="→" iconPosition="right">Siguiente</app-button>
            <app-button variant="danger" icon="🗑️">Eliminar</app-button>
            <app-button variant="outline" icon="📋">Copiar</app-button>
            <app-button variant="ghost" icon="⚙️">Opciones</app-button>
          </div>
        </div>
      </app-panel>

      <!-- TABLAS -->
      <app-panel title="Tablas (Atomic)" variant="flat" padding="md" class="showcase-section">
        <app-table>
          <app-table-head>
            <tr app-table-row>
              <th app-table-header-cell>Nombre</th>
              <th app-table-header-cell>Rol</th>
              <th app-table-header-cell>Estado</th>
              <th app-table-header-cell class="text-right">Acciones</th>
            </tr>
          </app-table-head>
          <tbody>
            <tr app-table-row>
              <td app-table-cell>
                <app-row gap="0.5rem" verticalAlign="center">
                  <app-avatar name="Juan Perez" size="sm"></app-avatar>
                  <app-text>Juan Pérez</app-text>
                </app-row>
              </td>
              <td app-table-cell>Desarrollador</td>
              <td app-table-cell><app-chip variant="success" size="sm">Activo</app-chip></td>
              <td app-table-cell class="text-right">
                <app-button variant="ghost" size="sm" icon="✎"></app-button>
              </td>
            </tr>
            <tr app-table-row [selected]="true">
              <td app-table-cell>
                <app-row gap="0.5rem" verticalAlign="center">
                  <app-avatar name="Maria Garcia" size="sm"></app-avatar>
                  <app-text>Maria García</app-text>
                </app-row>
              </td>
              <td app-table-cell>Diseñadora</td>
              <td app-table-cell><app-chip variant="warning" size="sm">Ausente</app-chip></td>
              <td app-table-cell class="text-right">
                <app-button variant="ghost" size="sm" icon="✎"></app-button>
              </td>
            </tr>
            <tr app-table-row>
              <td app-table-cell>
                <app-row gap="0.5rem" verticalAlign="center">
                  <app-avatar name="Carlos Lopez" size="sm"></app-avatar>
                  <app-text>Carlos Lopez</app-text>
                </app-row>
              </td>
              <td app-table-cell>Manager</td>
              <td app-table-cell><app-chip variant="error" size="sm">Inactivo</app-chip></td>
              <td app-table-cell class="text-right">
                <app-button variant="ghost" size="sm" icon="✎"></app-button>
              </td>
            </tr>
          </tbody>
        </app-table>
      </app-panel>

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

      <!-- CARDS -->
      <section class="showcase-section">
        <h3 class="section-title">Cards</h3>
        <div class="card-grid">
          <div class="card">
            <div class="card-header">
              <span class="card-icon">📊</span>
              <h4 class="card-title">Estadísticas</h4>
            </div>
            <p class="card-content">Visualiza tus métricas de rendimiento en tiempo real.</p>
            <div class="card-footer">
              <button class="btn btn-ghost btn-sm">Ver más</button>
            </div>
          </div>
          
          <div class="card card-elevated">
            <div class="card-header">
              <span class="card-icon">⚙️</span>
              <h4 class="card-title">Configuración</h4>
            </div>
            <p class="card-content">Personaliza tu experiencia según tus preferencias.</p>
            <div class="card-footer">
              <button class="btn btn-primary btn-sm">Configurar</button>
            </div>
          </div>
          
          <div class="card card-success">
            <div class="card-header">
              <span class="card-icon">✅</span>
              <h4 class="card-title">Completado</h4>
            </div>
            <p class="card-content">Tu proceso se ha completado exitosamente.</p>
            <div class="card-footer">
              <span class="badge badge-success">Activo</span>
            </div>
          </div>
        </div>
      </section>

      <!-- BADGES -->
      <section class="showcase-section">
        <h3 class="section-title">Badges</h3>
        <div class="badge-container">
          <span class="badge">Default</span>
          <span class="badge badge-primary">Primary</span>
          <span class="badge badge-secondary">Secondary</span>
          <span class="badge badge-success">Success</span>
          <span class="badge badge-warning">Warning</span>
          <span class="badge badge-danger">Danger</span>
          <span class="badge badge-outline">Outline</span>
        </div>
      </section>

      <!-- ALERTS -->
      <section class="showcase-section">
        <h3 class="section-title">Alertas</h3>
        <div class="alert alert-info">
          <span class="alert-icon">ℹ️</span>
          <div class="alert-content">
            <strong>Información:</strong> Este es un mensaje informativo para el usuario.
          </div>
        </div>
        <div class="alert alert-success">
          <span class="alert-icon">✅</span>
          <div class="alert-content">
            <strong>Éxito:</strong> La operación se completó correctamente.
          </div>
        </div>
        <div class="alert alert-warning">
          <span class="alert-icon">⚠️</span>
          <div class="alert-content">
            <strong>Advertencia:</strong> Por favor revise los datos antes de continuar.
          </div>
        </div>
        <div class="alert alert-danger">
          <span class="alert-icon">❌</span>
          <div class="alert-content">
            <strong>Error:</strong> Ocurrió un problema al procesar su solicitud.
          </div>
        </div>
      </section>

      <!-- MODALES -->
      <section class="showcase-section">
        <h3 class="section-title">Modales</h3>
        <p class="text-sm text-gray-500 mb-4">Diálogos modales que bloquean la interacción con el resto de la página.</p>
        <div class="button-grid">
          <button class="btn btn-primary" (click)="showModal.set(true)">Modal de Confirmación</button>
          <button class="btn btn-danger" (click)="showBlockingModal.set(true)">Modal Bloqueante</button>
        </div>
      </section>

      <!-- POPUPS -->
      <section class="showcase-section">
        <h3 class="section-title">Popups</h3>
        <p class="text-sm text-gray-500 mb-4">Ventanas emergentes informativas o de promoción.</p>
        <div class="button-grid">
          <button class="btn btn-secondary" (click)="showPopup.set(true)">Abrir Popup Promocional</button>
          <button class="btn btn-outline" (click)="showInfoPopup.set(true)">Abrir Popup Informativo</button>
        </div>
      </section>

      <!-- LOADERS -->
      <section class="showcase-section">
        <h3 class="section-title">Loaders</h3>
        <div class="loader-grid">
          <div class="loader-item">
            <app-loader variant="spinner" size="lg"></app-loader>
            <span class="loader-label">Spinner</span>
          </div>
          <div class="loader-item">
            <app-loader variant="dots" size="lg"></app-loader>
            <span class="loader-label">Dots</span>
          </div>
          <div class="loader-item">
            <app-loader variant="pulse" size="lg"></app-loader>
            <span class="loader-label">Pulse</span>
          </div>
          <div class="loader-item">
            <app-loader variant="bars" size="lg"></app-loader>
            <span class="loader-label">Bars</span>
          </div>
          <div class="loader-item loader-item-gradient">
            <app-loader variant="gradient" size="lg"></app-loader>
            <span class="loader-label">Gradient</span>
          </div>
          <div class="loader-item">
            <app-loader variant="orbit" size="lg"></app-loader>
            <span class="loader-label">Orbit</span>
          </div>
        </div>
        
        <h4 class="subsection-title">Tamaños</h4>
        <div class="loader-sizes">
          <div class="loader-size-item">
            <app-loader variant="spinner" size="sm"></app-loader>
            <span>Small</span>
          </div>
          <div class="loader-size-item">
            <app-loader variant="spinner" size="md"></app-loader>
            <span>Medium</span>
          </div>
          <div class="loader-size-item">
            <app-loader variant="spinner" size="lg"></app-loader>
            <span>Large</span>
          </div>
        </div>
      </section>

      <!-- LOADING STATES -->
      <section class="showcase-section">
        <h3 class="section-title">Estados de Carga</h3>
        <div class="loading-container">
          <app-loader variant="spinner" size="md"></app-loader>
          <app-skeleton variant="text" width="100%"></app-skeleton>
          <app-skeleton variant="text" width="60%"></app-skeleton>
          <app-skeleton variant="circular" width="3rem" height="3rem"></app-skeleton>
        </div>
      </section>

      <!-- PROGRESS -->
      <section class="showcase-section">
        <h3 class="section-title">Progreso</h3>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 75%"></div>
          </div>
          <span class="progress-label">75%</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar progress-success">
            <div class="progress-fill" style="width: 100%"></div>
          </div>
          <span class="progress-label">Completado</span>
        </div>
      </section>

      <!-- TOOLTIP DEMO -->
      <section class="showcase-section">
        <h3 class="section-title">Tooltips</h3>
        <div class="tooltip-container">
          <button class="btn btn-outline tooltip-trigger" data-tooltip="Este es un tooltip de ayuda">
            Hover para tooltip
          </button>
        </div>
      </section>

      <!-- TOAST -->
      <section class="showcase-section">
        <h3 class="section-title">Toast / Notificaciones</h3>
        <div class="button-grid">
          <button class="btn btn-primary" (click)="showToast('info')">Info</button>
          <button class="btn btn-success" (click)="showToast('success')">Success</button>
          <button class="btn btn-warning" (click)="showToast('warning')">Warning</button>
          <button class="btn btn-danger" (click)="showToast('error')">Error</button>
        </div>
      </section>

      <!-- TABS -->
      <section class="showcase-section">
        <h3 class="section-title">Tabs</h3>
        <app-tabs>
          <app-tab label="General" icon="⚙️">
            <p>Contenido de la pestaña General</p>
          </app-tab>
          <app-tab label="Perfil" icon="👤">
            <p>Contenido de la pestaña Perfil</p>
          </app-tab>
          <app-tab label="Notificaciones" icon="🔔">
            <p>Contenido de la pestaña Notificaciones</p>
          </app-tab>
        </app-tabs>
      </section>

      <!-- ACCORDION -->
      <section class="showcase-section">
        <h3 class="section-title">Accordion</h3>
        <app-accordion>
          <app-accordion-item title="¿Qué es este sistema?">
            Este es un sistema de componentes UI reutilizables con soporte para temas claro y oscuro.
          </app-accordion-item>
          <app-accordion-item title="¿Cómo cambio el tema?">
            Usa el componente ThemeSwitcher en la esquina superior derecha para cambiar entre modos.
          </app-accordion-item>
          <app-accordion-item title="¿Puedo personalizar los colores?" [open]="true">
            Sí, todos los colores están definidos como variables CSS en el archivo tokens.css.
          </app-accordion-item>
        </app-accordion>
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

      <!-- AVATAR -->
      <section class="showcase-section">
        <h3 class="section-title">Avatar</h3>
        <div class="avatar-grid">
          <app-avatar name="Juan Pérez" size="lg" status="online"></app-avatar>
          <app-avatar name="María García" size="lg" status="busy"></app-avatar>
          <app-avatar initials="AG" size="lg" status="away"></app-avatar>
          <app-avatar size="lg" status="offline"></app-avatar>
        </div>
        <h4 class="subsection-title">Tamaños</h4>
        <div class="avatar-grid">
          <app-avatar name="XS" size="xs"></app-avatar>
          <app-avatar name="SM" size="sm"></app-avatar>
          <app-avatar name="MD" size="md"></app-avatar>
          <app-avatar name="LG" size="lg"></app-avatar>
          <app-avatar name="XL" size="xl"></app-avatar>
        </div>
      </section>

      <!-- TAGS (CHIPS) -->
      <section class="showcase-section">
        <h3 class="section-title">Tags (Chips)</h3>
        <div class="chip-grid">
          <app-chip variant="default">Default</app-chip>
          <app-chip variant="primary">Primary</app-chip>
          <app-chip variant="secondary">Secondary</app-chip>
          <app-chip variant="success">Firmado</app-chip>
          <app-chip variant="warning">Pendiente</app-chip>
          <app-chip variant="error">Rechazado</app-chip>
          <app-chip variant="outline">Outline</app-chip>
          <app-chip variant="primary" [removable]="true">Removible</app-chip>
        </div>
      </section>

      <!-- TOGGLE / SWITCH -->
      <section class="showcase-section">
        <h3 class="section-title">Toggle / Switch</h3>
        <div class="toggle-grid">
          <app-toggle [(ngModel)]="toggleValue1" label="Notificaciones"></app-toggle>
          <app-toggle [(ngModel)]="toggleValue2" label="Modo oscuro"></app-toggle>
          <app-toggle [ngModel]="true" label="Activo" [disabled]="true"></app-toggle>
          <app-toggle [ngModel]="false" label="Desactivado" [disabled]="true"></app-toggle>
        </div>
      </section>

      <!-- CHECKBOX -->
      <section class="showcase-section">
        <h3 class="section-title">Checkbox</h3>
        <div class="toggle-grid">
          <app-checkbox [(ngModel)]="checkboxValue1" label="Acepto términos"></app-checkbox>
          <app-checkbox [(ngModel)]="checkboxValue2" label="Recibir emails"></app-checkbox>
          <app-checkbox [ngModel]="true" label="Verificado" [disabled]="true"></app-checkbox>
        </div>
      </section>

      <!-- STEPPER -->
      <section class="showcase-section">
        <h3 class="section-title">Stepper</h3>
        <app-stepper [steps]="steps" [activeStep]="currentStep()"></app-stepper>
        <div class="stepper-controls">
          <button class="btn btn-outline" (click)="currentStep.set(Math.max(0, currentStep() - 1))" [disabled]="currentStep() === 0">Anterior</button>
          <button class="btn btn-primary" (click)="currentStep.set(Math.min(steps.length - 1, currentStep() + 1))" [disabled]="currentStep() === steps.length - 1">Siguiente</button>
        </div>
      </section>

      <!-- SKELETON -->
      <section class="showcase-section">
        <h3 class="section-title">Skeleton (Loading States)</h3>
        <div class="skeleton-grid">
          <div>
            <h4 class="subsection-title">Card</h4>
            <app-skeleton variant="card"></app-skeleton>
          </div>
          <div>
            <h4 class="subsection-title">Avatar + Text</h4>
            <app-skeleton variant="avatar-text"></app-skeleton>
            <app-skeleton variant="avatar-text"></app-skeleton>
          </div>
          <div>
            <h4 class="subsection-title">Text Lines</h4>
            <app-skeleton variant="text" width="100%"></app-skeleton>
            <app-skeleton variant="text" width="80%"></app-skeleton>
            <app-skeleton variant="text" width="60%"></app-skeleton>
          </div>
        </div>
      </section>

      <!-- PAGINATION -->
      <section class="showcase-section">
        <h3 class="section-title">Pagination</h3>
        <app-pagination 
          [total]="100" 
          [pageSize]="10" 
          [page]="currentPage()"
          (pageChange)="currentPage.set($event)">
        </app-pagination>
        <p class="mt-2 text-sm">Página actual: {{ currentPage() }} de 10</p>
      </section>

      <!-- RATING -->
      <section class="showcase-section">
        <h3 class="section-title">Rating</h3>
        <div class="rating-grid">
          <div>
            <h4 class="subsection-title">Interactivo</h4>
            <app-rating [(value)]="rating" [showValue]="true" size="lg"></app-rating>
          </div>
          <div>
            <h4 class="subsection-title">Solo lectura</h4>
            <app-rating [value]="4.5" [readonly]="true" [showValue]="true"></app-rating>
          </div>
          <div>
            <h4 class="subsection-title">Tamaños</h4>
            <app-rating [value]="3" [readonly]="true" size="sm"></app-rating>
            <app-rating [value]="3" [readonly]="true" size="md"></app-rating>
            <app-rating [value]="3" [readonly]="true" size="lg"></app-rating>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <section class="showcase-section">
        <h3 class="section-title">Footer</h3>
        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <div>
            <h4 class="subsection-title">Simple (Copyright)</h4>
            <app-footer variant="simple" companyName="Atomic UI"></app-footer>
          </div>
          
          <div>
            <h4 class="subsection-title">Inline (Redes + Links)</h4>
            <app-footer 
              variant="inline" 
              companyName="Atomic UI"
              [socialLinks]="footerSocialLinks"
              [legalLinks]="footerLegalLinks">
            </app-footer>
          </div>
          
          <div>
            <h4 class="subsection-title">Columns (Estilo Startup)</h4>
            <app-footer 
              variant="columns" 
              companyName="Atomic UI"
              description="Una librería de componentes UI moderna basada en Atomic Design para Angular."
              [socialLinks]="footerSocialLinks"
              [legalLinks]="footerLegalLinks">
            </app-footer>
          </div>
        </div>
      </section>

      <!-- TEMPLATES -->
      <section class="showcase-section">
        <h3 class="section-title">Templates</h3>
        <p class="text-sm text-gray-500 mb-4">Layouts completos reutilizables para diferentes secciones de la aplicación.</p>
        <div class="button-grid">
          <button class="btn btn-primary" (click)="showLoginLayout.set(true)">
            🔐 Ver Login Layout
          </button>
        </div>
      </section>
    </app-panel>

    @if (showModal()) {
      <app-modal title="Confirmar Acción" (close)="showModal.set(false)">
        <p>¿Está seguro de que desea realizar esta acción? Esta operación no se puede deshacer.</p>
        <div class="modal-input-group">
          <label class="form-label">Escriba "CONFIRMAR" para continuar:</label>
          <input type="text" class="form-input" placeholder="CONFIRMAR">
        </div>
        
        <div class="modal-footer" slot="footer">
          <button class="btn btn-outline" (click)="showModal.set(false)">Cancelar</button>
          <button class="btn btn-danger">Eliminar</button>
        </div>
      </app-modal>
    }

    @if (showBlockingModal()) {
      <app-modal 
        title="Modal Bloqueante" 
        [closeOnBackdrop]="false" 
        (close)="showBlockingModal.set(false)"
      >
        <p class="text-sm text-gray-500 mb-4">
          Este modal no se cierra haciendo clic afuera. Solo con el botón de cerrar (X) o el botón de acción.
        </p>
        <p class="font-medium">Contenido vacío (Atmo bacio)...</p>
        
        <div class="modal-footer" slot="footer">
           <button class="btn btn-primary" (click)="showBlockingModal.set(false)">Entendido</button>
        </div>
      </app-modal>
    }

    @if (showPopup()) {
      <app-modal 
        title="¡Oferta Especial!" 
        size="sm"
        (close)="showPopup.set(false)"
      >
        <div class="text-center">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
          <h4 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--primary-color);">¡Descuento Exclusivo!</h4>
          <p class="text-sm text-gray-600 mb-4">
            Obtén un <strong>20% de descuento</strong> en tu suscripción anual si actualizas ahora.
          </p>
          <div style="background: var(--surface-section); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
            <code style="font-weight: bold; font-size: 1.1rem; color: var(--primary-color);">ANGULAR2025</code>
          </div>
        </div>
        
        <div class="modal-footer" slot="footer">
           <button class="btn btn-ghost" (click)="showPopup.set(false)">No gracias</button>
           <button class="btn btn-primary" (click)="showPopup.set(false)">Canjear Ahora</button>
        </div>
      </app-modal>
    }

    @if (showInfoPopup()) {
      <app-modal 
        title="Información Importante" 
        size="sm"
        (close)="showInfoPopup.set(false)"
      >
        <div class="text-center">
          <div style="font-size: 3rem; margin-bottom: 1rem;">ℹ️</div>
          <p class="text-sm text-gray-600 mb-4">
            Este es un aviso simple para informar al usuario sobre cambios recientes en la plataforma.
          </p>
        </div>
        
        <div class="modal-footer" slot="footer">
           <button class="btn btn-primary" (click)="showInfoPopup.set(false)">Entendido</button>
        </div>
      </app-modal>
    }

    @if (showLoginLayout()) {
      <div class="login-preview-overlay" (click)="showLoginLayout.set(false)">
        <button class="close-preview-btn" (click)="showLoginLayout.set(false)">✕ Cerrar</button>
        <div class="login-preview-container" (click)="$event.stopPropagation()">
          <app-auth-layout>
            <div slot="header">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔐</div>
              <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-color); margin: 0;">Iniciar Sesión</h2>
              <p style="font-size: 0.875rem; color: var(--text-color-secondary); margin-top: 0.5rem;">Ingresa tus credenciales para continuar</p>
            </div>
            
            <form class="login-form">
              <app-floating-input 
                variant="floating" 
                label="Correo electrónico" 
                type="email">
              </app-floating-input>
              
              <app-floating-input 
                variant="floating" 
                label="Contraseña" 
                type="password">
              </app-floating-input>
              
              <div class="login-options">
                <app-checkbox label="Recordarme"></app-checkbox>
                <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
              </div>
              
              <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
            </form>
            
            <div slot="footer">
              <p>¿No tienes cuenta? <a href="#" class="register-link">Regístrate aquí</a></p>
            </div>
          </app-auth-layout>
        </div>
      </div>
    }

    <app-toast></app-toast>
  `,
  styles: [`
    .showcase-container {
      padding: 2rem;
      max-width: 900px;
      margin: 2rem auto;
      background: var(--surface-background);
      border-radius: 1rem;
      border: 1px solid var(--border-color);
    }

    .showcase-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      margin-bottom: 2rem;
      text-align: center;
    }

    .showcase-section {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border-color-light);
    }

    .showcase-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color-secondary, #6b7280);
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ========== BUTTONS ========== */
    .button-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .button-sizes {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* ========== FORM STYLES ========== */
    .showcase-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 500px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
      font-family: inherit;
      color: var(--input-text, var(--text-color));
      background-color: var(--input-bg, var(--surface-background));
      border: 2px solid var(--input-border, var(--border-color));
      border-radius: 0.5rem;
      transition: all 0.15s ease;
      outline: none;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: var(--input-border-focus, var(--primary-color));
      box-shadow: 0 0 0 3px var(--hover-background, rgba(121, 53, 118, 0.1));
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: var(--input-placeholder, var(--text-color-muted));
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2.5rem;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .checkbox-label,
    .radio-label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9375rem;
      color: var(--text-color);
      cursor: pointer;
    }

    .form-checkbox,
    input[type="radio"] {
      width: 1.125rem;
      height: 1.125rem;
      accent-color: var(--primary-color);
      cursor: pointer;
    }

    .radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    /* ========== CARDS ========== */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .card {
      background: var(--surface-section);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 1.25rem;
      transition: all 150ms ease;
    }

    .card:hover {
      box-shadow: var(--shadow-md);
    }

    .card-elevated {
      background: var(--surface-background);
      box-shadow: var(--shadow-sm);
    }

    .card-success {
      border-color: var(--success-color);
      background: linear-gradient(135deg, var(--surface-background) 0%, var(--success-color-lighter) 100%);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .card-icon {
      font-size: 1.5rem;
      width: 2.5rem;
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color-lighter), var(--secondary-color-lighter));
      border-radius: 0.5rem;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .card-content {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin: 0 0 1rem 0;
      line-height: 1.5;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }



    /* ========== ALERTS ========== */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .alert-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .alert-content {
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .alert-info {
      background: var(--alert-info-bg);
      border: 1px solid var(--alert-info-border);
      color: var(--alert-info-text);
    }

    .alert-success {
      background: var(--alert-success-bg);
      border: 1px solid var(--alert-success-border);
      color: var(--alert-success-text);
    }

    .alert-warning {
      background: var(--alert-warning-bg);
      border: 1px solid var(--alert-warning-border);
      color: var(--alert-warning-text);
    }

    .alert-danger {
      background: var(--alert-danger-bg);
      border: 1px solid var(--alert-danger-border);
      color: var(--alert-danger-text);
    }

    /* ========== MODAL ========== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 150ms ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: var(--surface-background, #ffffff);
      border-radius: 0.75rem;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 200ms ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .modal-close {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--text-color-secondary);
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .modal-close:hover {
      background: var(--surface-section);
      color: var(--text-color);
    }

    .modal-body {
      padding: 1.25rem;
    }

    .modal-body p {
      margin: 0 0 1rem 0;
      color: var(--text-color-secondary);
      line-height: 1.6;
    }

    .modal-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color);
    }

    /* ========== LOADING ========== */
    .loading-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      /* align-items: flex-start; Removed to allow skeletons to stretch */
    }









    /* ========== PROGRESS ========== */
    .progress-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .progress-bar {
      flex: 1;
      height: 0.5rem;
      background: var(--surface-section);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 9999px;
      transition: width 300ms ease;
    }

    .progress-success .progress-fill {
      background: var(--success-color);
    }

    .progress-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-color-secondary);
      min-width: 70px;
    }

    /* ========== LOADERS ========== */
    .loader-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .loader-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: var(--surface-section, #f9fafb);
      border-radius: 0.75rem;
      min-width: 100px;
    }

    .loader-item-gradient {
      background: linear-gradient(135deg, var(--primary-color-lighter, #efe7ef) 0%, var(--secondary-color-lighter, #e3f2fb) 100%);
    }

    .loader-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-color-secondary, #6b7280);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .subsection-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color-secondary, #6b7280);
      margin-bottom: 1rem;
    }

    .loader-sizes {
      display: flex;
      align-items: flex-end;
      gap: 2rem;
    }

    .loader-size-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .loader-size-item span {
      font-size: 0.75rem;
      color: var(--text-color-muted, #9ca3af);
    }

    /* ========== TOOLTIP ========== */
    .tooltip-container {
      display: flex;
      gap: 1rem;
    }

    .tooltip-trigger {
      position: relative;
    }

    .tooltip-trigger::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      background: var(--text-color, #111827);
      color: white;
      border-radius: 0.375rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 150ms ease;
    }

    .tooltip-trigger:hover::after {
      opacity: 1;
    }

    /* ========== NUEVOS COMPONENTES ========== */
    .avatar-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .chip-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .stepper-controls {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: center;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .skeleton-grid > div {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .rating-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .rating-grid > div {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .toggle-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      align-items: center;
    }

    .input-variants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    /* Utilidades */
    .mt-2 { margin-top: 0.5rem; }
    .text-sm { font-size: 0.875rem; color: var(--text-color-secondary, #6b7280); }

    /* ========== DARK MODE ========== */
    :host-context(html.dark),
    :host-context([data-theme="dark"]) {
      .showcase-container {
        background: var(--surface-background);
        border-color: var(--border-color);
      }

      .card {
        background: var(--surface-section);
      }

      .card-elevated {
        background: var(--surface-elevated);
      }

      .modal {
        background: var(--surface-section);
      }

      .skeleton {
        background: linear-gradient(90deg, var(--gray-700) 25%, var(--gray-600) 50%, var(--gray-700) 75%);
        background-size: 200% 100%;
      }

      .tooltip-trigger::after {
        background: var(--gray-100);
        color: var(--gray-900);
        box-shadow: var(--shadow-lg);
      }
    }

    /* Login Preview Overlay */
    .login-preview-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
    }

    .login-preview-container {
      width: 100%;
      max-width: 450px;
      animation: slideUp 0.3s ease-out;
    }

    .close-preview-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 10000;
    }

    .close-preview-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Login Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .forgot-link,
    .register-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }

    .forgot-link:hover,
    .register-link:hover {
      color: var(--primary-color-hover);
      text-decoration: underline;
    }
  `]
})
export class UiShowcaseComponent {
  @ViewChild(ToastComponent) toast?: ToastComponent;

  Math = Math; // Para usar en template

  showModal = signal(false);
  showBlockingModal = signal(false);
  showPopup = signal(false);
  showInfoPopup = signal(false);
  showLoginLayout = signal(false);
  currentStep = signal(0);
  currentPage = signal(1);
  rating = 3;
  selectedCountry: string | number = '';

  // Toggle/Switch values
  toggleValue1 = true;
  toggleValue2 = false;

  // Checkbox values
  checkboxValue1 = false;
  checkboxValue2 = true;

  // Floating Input values
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

  // Select2 values
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

  formData = {
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
    terms: false,
    preference: 'email'
  };

  steps: Step[] = [
    { label: 'Datos', description: 'Información básica', icon: '📋' },
    { label: 'Revisión', description: 'Verificar datos' },
    { label: 'Firma', description: 'Confirmar', optional: true }
  ];

  countryOptions: DropdownOption[] = [
    { value: 'pe', label: 'Perú', icon: '🇵🇪' },
    { value: 'mx', label: 'México', icon: '🇲🇽' },
    { value: 'co', label: 'Colombia', icon: '🇨🇴' },
    { value: 'ar', label: 'Argentina', icon: '🇦🇷' },
    { value: 'cl', label: 'Chile', icon: '🇨🇱' }
  ];

  // Footer demo data
  footerSocialLinks: SocialLink[] = [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'github', url: 'https://github.com' }
  ];

  footerLegalLinks: LegalLink[] = [
    { label: 'FOOTER.TERMS', url: '/terms' },
    { label: 'FOOTER.PRIVACY', url: '/privacy' },
    { label: 'FOOTER.CONTACT', url: '/contact' }
  ];

  showToast(type: 'info' | 'success' | 'warning' | 'error') {
    const messages = {
      info: 'Este es un mensaje informativo',
      success: '¡Operación completada exitosamente!',
      warning: 'Atención: revise los datos ingresados',
      error: 'Error: no se pudo completar la acción'
    };
    this.toast?.show({ message: messages[type], type });
  }

  prevStep() {
    this.currentStep.set(Math.max(0, this.currentStep() - 1));
  }

  nextStep() {
    this.currentStep.set(Math.min(this.steps.length - 1, this.currentStep() + 1));
  }
}
