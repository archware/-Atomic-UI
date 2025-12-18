import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/molecules/modal/modal.component';
import { ToastComponent } from '../../../../shared/ui/molecules/toast/toast.component';

@Component({
  selector: 'app-showcase-feedback',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ToastComponent
  ],
  template: `
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
    
    <!-- MODALS COMPONENTS (Hidden by default) -->
    <app-modal *ngIf="showModal()" (close)="showModal.set(false)" title="Confirmar Acción">
      <p>¿Estás seguro de que deseas continuar con esta acción? Esta operación es irreversible.</p>
      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn btn-ghost" (click)="showModal.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="showModal.set(false)">Confirmar</button>
      </div>
    </app-modal>

    <app-modal *ngIf="showBlockingModal()" (close)="showBlockingModal.set(false)" title="Atención Requerida" [closeOnBackdrop]="false">
      <p>Esta es una modal bloqueante. El usuario debe tomar una decisión explícita para continuar.</p>
      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="btn btn-danger" (click)="showBlockingModal.set(false)">Entendido</button>
      </div>
    </app-modal>

    <app-toast></app-toast>
  `,
  styles: [`
    .showcase-section { margin-bottom: 2rem; display: block; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-color); }
    .button-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    
    /* Alerts styles reuse */
    .alert { padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid transparent; display: flex; gap: 0.75rem; margin-bottom: 1rem; background: var(--surface-card); }
    .alert-icon { font-size: 1.25rem; }
    .alert-info { border-color: var(--info-color); background: color-mix(in srgb, var(--info-color), transparent 90%); }
    .alert-success { border-color: var(--success-color); background: color-mix(in srgb, var(--success-color), transparent 90%); }
    .alert-warning { border-color: var(--warning-color); background: color-mix(in srgb, var(--warning-color), transparent 90%); }
    .alert-danger { border-color: var(--danger-color); background: color-mix(in srgb, var(--danger-color), transparent 90%); }
    
    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-secondary { background: var(--secondary-color); color: white; }
    .btn-success { background: var(--success-color); color: white; }
    .btn-warning { background: var(--warning-color); color: white; }
    .btn-danger { background: var(--danger-color); color: white; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); }
    .btn-ghost { background: transparent; color: var(--text-color); }
    
    /* Simple Tooltip impl for demo */
    .tooltip-trigger { position: relative; }
    .tooltip-trigger:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--text-color);
      color: var(--surface-card);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      white-space: nowrap;
      margin-bottom: 0.5rem;
    }
  `]
})
export class ShowcaseFeedbackComponent {
  @ViewChild(ToastComponent) toast?: ToastComponent;

  showModal = signal(false);
  showBlockingModal = signal(false);
  showPopup = signal(false);
  showInfoPopup = signal(false);

  showToast(type: 'info' | 'success' | 'warning' | 'error') {
    const messages = {
      info: 'Este es un mensaje informativo',
      success: '¡Operación completada exitosamente!',
      warning: 'Atención: revise los datos ingresados',
      error: 'Error: no se pudo completar la acción'
    };
    this.toast?.show({ message: messages[type], type });
  }
}
