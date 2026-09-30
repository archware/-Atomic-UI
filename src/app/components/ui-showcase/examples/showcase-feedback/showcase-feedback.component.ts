import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Alert } from '../../../../shared/ui/molecules/alert/alert.component';
import { ToastService } from '../../../../shared/ui/services/toast.service';
import { PopupService } from '../../../../shared/ui/services/popup.service';
import { ModalService } from '../../../../shared/ui/services/modal.service';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';

@Component({
  selector: 'app-showcase-feedback',
  standalone: true,
  imports: [ButtonComponent, TextComponent, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './showcase-feedback.component.html',
  styleUrl: './showcase-feedback.component.css'
})
export class ShowcaseFeedbackComponent {
  private readonly toast = inject(ToastService);
  private readonly popup = inject(PopupService);
  private readonly modal = inject(ModalService);

  showToast(type: 'info' | 'success' | 'warning' | 'error') {
    const messages = {
      info: 'Este es un mensaje informativo',
      success: '¡Operación completada exitosamente!',
      warning: 'Atención: revise los datos ingresados',
      error: 'Error: no se pudo completar la acción'
    };
    this.toast.show({ message: messages[type], type });
  }

  // === POPUP METHODS ===
  showPromoPopup() {
    this.popup.show({
      title: '¡Oferta Especial!',
      message: 'Obtén un 20% de descuento en todos nuestros productos. ¡Oferta válida solo hoy!',
      type: 'success',
      icon: 'fa-solid fa-gift',
      buttons: [
        { label: 'No gracias', variant: 'ghost', action: () => this.popup.close(this.popup.popups()[0]?.id ?? 0) },
        { label: '¡Lo quiero!', variant: 'primary', action: () => { this.toast.success('¡Cupón aplicado!'); this.popup.close(this.popup.popups()[0]?.id ?? 0); } }
      ]
    });
  }

  showInfoPop() {
    this.popup.info('Información', 'Este es un popup informativo que muestra datos importantes al usuario.');
  }

  showSuccessPopup() {
    this.popup.success('¡Guardado!', 'Los cambios se han guardado correctamente en el sistema.');
  }

  showConfirmPopup() {
    // El ejemplo tambien es doctrina: dice QUE pasa y el boton lleva el verbo.
    this.popup.confirm({
      title: 'Eliminar el elemento seleccionado',
      message: 'Se retira de la lista y de los reportes que lo incluyen. No se puede deshacer.',
      confirmLabel: 'Eliminar el elemento',
      cancelLabel: 'Cancelar',
      tone: 'danger',
      onConfirm: () => this.toast.success('Elemento eliminado'),
      onCancel: () => this.toast.info('Operación cancelada')
    });
  }

  // === MODAL METHODS ===
  openConfirmModal() {
    this.modal.confirm({
      title: 'Confirmar Acción',
      message: '¿Estás seguro de que deseas continuar con esta acción? Esta operación es irreversible.',
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      onConfirm: () => this.toast.success('Acción confirmada'),
      onCancel: () => this.toast.info('Acción cancelada')
    });
  }

  openBlockingModal() {
    this.modal.open({
      title: 'Atención Requerida',
      message: 'Esta es una modal bloqueante. El usuario debe tomar una decisión explícita para continuar.',
      size: 'md',
      closeOnBackdrop: false,
      closable: false,
      buttons: [
        { label: 'Entendido', variant: 'danger', action: () => { this.toast.warning('Modal cerrada'); this.modal.modals().forEach(m => this.modal.close(m.id)); } }
      ]
    });
  }

  openAlertModal() {
    this.popup.info('Información Importante', 'Este es un mensaje de alerta simple con un solo botón de acción.');
  }
}
