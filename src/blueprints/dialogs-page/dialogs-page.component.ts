import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  SidebarMenuItem,
  LayoutShellComponent,
  SidebarComponent,
  TopbarComponent,
  ThemeSwitcherComponent,
  PanelComponent,
  CardComponent,
  RowComponent,
  TextComponent,
  DividerComponent,
  ButtonComponent,
  IconButtonComponent,
  TableAction,
  Alert,
  ChipComponent,
  FileInputComponent,
  FileInputFile,
  BadgeComponent,
  ModalService,
  PopupService,
  ToastService,
} from '@shared/ui';

@Component({
  selector: 'app-dialogs-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LayoutShellComponent,
    SidebarComponent,
    TopbarComponent,
    ThemeSwitcherComponent,
    PanelComponent,
    CardComponent,
    RowComponent,
    TextComponent,
    DividerComponent,
    ButtonComponent,
    IconButtonComponent,
    TableAction,
    Alert,
    ChipComponent,
    FileInputComponent,
    BadgeComponent,
  ],
  templateUrl: './dialogs-page.component.html',
  styleUrl: './dialogs-page.component.css',
})
export class DialogsPageComponent {
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly popup = inject(PopupService);
  private readonly toast = inject(ToastService);

  readonly sidebarVisible = signal(true);

  readonly menuItems: SidebarMenuItem[] = [
    { label: 'Showcase', icon: 'fa-solid fa-palette', route: '/showcase', iconColor: 'var(--secondary-color)' },
    { label: 'Dashboard', icon: 'fa-solid fa-chart-pie', route: '/dashboard', iconColor: 'var(--info-color)' },
    { label: 'CRUD', icon: 'fa-solid fa-table', route: '/crud', iconColor: 'var(--success-color)' },
    { label: 'Wizard', icon: 'fa-solid fa-wand-magic-sparkles', route: '/wizard', iconColor: 'var(--warning-color)' },
    { label: 'Cierres', icon: 'fa-solid fa-window-restore', route: '/dialogs', active: true, iconColor: 'var(--primary-color)' },
    { label: 'Settings', icon: 'fa-solid fa-gear', route: '/settings', iconColor: 'var(--text-color-secondary)' },
  ];

  // Estado interactivo de etiquetas removibles (Variante 5)
  readonly activeTags = signal<string[]>([
    'Filtro Activo',
    'Rol Operador',
    'Prioridad Urgente',
    'Periodo Actual',
  ]);

  // Estado interactivo de alerta (Variante 4)
  readonly alertDismissed = signal(false);

  // Registro de interaccion en vivo
  readonly lastInteraction = signal<string>('Ninguna accion ejecutada todavia');

  // Archivos de demostracion para zona de arrastre y descarte (Variante 6)
  readonly attachedFiles = signal<FileInputFile[]>([
    {
      name: 'documento_autorizacion.pdf',
      size: 245760,
      type: 'application/pdf',
      file: new File([], 'documento_autorizacion.pdf', { type: 'application/pdf' }),
    },
  ]);

  onToggleSidebar(): void {
    this.sidebarVisible.update((visible) => !visible);
  }

  onSidebarNavigate(item: SidebarMenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onLogout(): void {
    this.popup.info('Sesion finalizada', 'Cerrando sesion...');
    this.router.navigate(['/login']);
  }

  onUserAction(action: { id?: string }): void {
    if (action.id === 'settings') {
      this.router.navigate(['/settings']);
    }
  }

  // --- Disparadores interactivos de las variantes ---

  onHangingCloseTrigger(): void {
    this.lastInteraction.set('Variante 1 accionada: Boton flotante exterior (hanging-close)');
  }

  onInsideCloseTrigger(): void {
    this.lastInteraction.set('Variante 2 accionada: Boton integrado interior (close)');
  }

  onGhostCloseTrigger(): void {
    this.lastInteraction.set('Variante 3 accionada: Boton fantasma contextual (ghost)');
  }

  onAlertDismissed(): void {
    this.alertDismissed.set(true);
    this.lastInteraction.set('Variante 4 accionada: Alerta descartada mediante table-action integrada');
  }

  onTableActionTrigger(): void {
    this.lastInteraction.set('Variante 4 accionada: Table-action compacta independiente activada');
  }

  onRestoreAlert(): void {
    this.alertDismissed.set(false);
    this.lastInteraction.set('Alerta restaurada para continuar evaluacion');
  }

  onRemoveTag(tagToRemove: string): void {
    this.activeTags.update((tags) => tags.filter((tag) => tag !== tagToRemove));
    this.lastInteraction.set(`Variante 5 accionada: Etiqueta descartada [${tagToRemove}]`);
  }

  onResetTags(): void {
    this.activeTags.set(['Filtro Activo', 'Rol Operador', 'Prioridad Urgente', 'Periodo Actual']);
    this.lastInteraction.set('Etiquetas restauradas');
  }

  onFilesChanged(files: FileInputFile[]): void {
    this.attachedFiles.set(files);
    this.lastInteraction.set(`Variante 6 accionada: Lista de archivos actualizada (${files.length} archivos)`);
  }

  onRemoveAttachedFile(fileName: string): void {
    this.attachedFiles.update((files) => files.filter((f) => f.name !== fileName));
    this.lastInteraction.set(`Variante 6 accionada: Archivo descartado [${fileName}]`);
  }

  onResetAttachedFiles(): void {
    this.attachedFiles.set([
      {
        name: 'documento_autorizacion.pdf',
        size: 245760,
        type: 'application/pdf',
        file: new File([], 'documento_autorizacion.pdf', { type: 'application/pdf' }),
      },
    ]);
    this.lastInteraction.set('Archivo de muestra restaurado');
  }

  onSecondaryCancelAction(): void {
    this.lastInteraction.set('Variante 7 accionada: Salida segura mediante boton outline');
  }

  // --- Lanzamiento de overlays reales del chasis ---

  onLaunchModal(): void {
    this.modal.open({
      title: 'Confirmacion del Sistema (Modal)',
      message: 'Esta es una advertencia del sistema. Conforme a la doctrina institucional, los modales de confirmacion llevan el boton de cierre integrado dentro del contenedor y el boton seguro Cancelar con autofoco.',
      size: 'sm',
      hasFooter: true,
      closable: true,
      buttons: [
        {
          label: 'Cancelar',
          variant: 'secondary',
          action: () => {
            const list = this.modal.modals();
            const current = list[list.length - 1];
            if (current) this.modal.close(current.id);
            this.lastInteraction.set('Modal cancelado con boton seguro');
          },
        },
        {
          label: 'Aceptar',
          variant: 'primary',
          action: () => {
            const list = this.modal.modals();
            const current = list[list.length - 1];
            if (current) this.modal.close(current.id);
            this.lastInteraction.set('Modal confirmado con boton primario');
          },
        },
      ],
    });
  }

  onLaunchPopup(): void {
    this.popup.show({
      title: 'Formulario Contextual Rapido (Popup)',
      message: 'Este es un popup de captura agil. Conforme a la doctrina institucional, los popups llevan el boton de cierre flotando por fuera del contenedor (hanging-close).',
      type: 'info',
      icon: 'fa-solid fa-pen-to-square',
      closable: true,
      buttons: [
        {
          label: 'Cerrar',
          variant: 'secondary',
          cancels: true,
          action: () => {
            const list = this.popup.popups();
            const current = list[list.length - 1];
            if (current) this.popup.close(current.id);
            this.lastInteraction.set('Popup cerrado');
          },
        },
        {
          label: 'Guardar',
          variant: 'primary',
          action: () => {
            const list = this.popup.popups();
            const current = list[list.length - 1];
            if (current) this.popup.close(current.id);
            this.lastInteraction.set('Popup guardado');
          },
        },
      ],
    });
  }

  onLaunchToast(): void {
    this.toast.show({
      message: 'Notificacion contextual con boton de cierre discreto',
      type: 'info',
    });
    this.lastInteraction.set('Toast emitido con descarte automatico y contextual');
  }
}
