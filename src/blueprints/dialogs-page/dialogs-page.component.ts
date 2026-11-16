import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  SidebarMenuItem,
  LayoutShellComponent,
  SidebarComponent,
  TopbarComponent,
  ThemeSwitcherComponent,
  RowComponent,
  TextComponent,
  ButtonComponent,
  IconButtonComponent,
  TableAction,
  Alert,
  ChipComponent,
  FileInputComponent,
  FileInputFile,
  FloatingInputComponent,
  BadgeComponent,
  ScrollOverlayComponent,
  AboutDialogComponent,
  type AboutCreditItem,
  type AboutTechBadge,
  type AboutLinkItem,
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
    RowComponent,
    TextComponent,
    ButtonComponent,
    IconButtonComponent,
    TableAction,
    Alert,
    ChipComponent,
    FileInputComponent,
    FloatingInputComponent,
    BadgeComponent,
    ScrollOverlayComponent,
    AboutDialogComponent,
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
    {
      name: 'resolucion_directoral_084.pdf',
      size: 512000,
      type: 'application/pdf',
      file: new File([], 'resolucion_directoral_084.pdf', { type: 'application/pdf' }),
    },
    {
      name: 'anexo_conformidad_tecnica.pdf',
      size: 389120,
      type: 'application/pdf',
      file: new File([], 'anexo_conformidad_tecnica.pdf', { type: 'application/pdf' }),
    },
    {
      name: 'acta_recepcion_firmada.pdf',
      size: 614400,
      type: 'application/pdf',
      file: new File([], 'acta_recepcion_firmada.pdf', { type: 'application/pdf' }),
    },
    {
      name: 'constancia_verificacion.pdf',
      size: 194560,
      type: 'application/pdf',
      file: new File([], 'constancia_verificacion.pdf', { type: 'application/pdf' }),
    },
  ]);

  // Archivos interactivos de demostracion del patron de fila PDF (Seccion 4)
  readonly pdfDemoFiles = signal<{ id: string; name: string; meta: string; pages: string }[]>([
    {
      id: 'pdf-1',
      name: 'expediente_clinico_2026.pdf',
      meta: '12 paginas · 1.4 MB',
      pages: '1-4, 7',
    },
    {
      id: 'pdf-2',
      name: 'consentimiento_informado.pdf',
      meta: '3 paginas · 420 KB',
      pages: '1-3',
    },
    {
      id: 'pdf-3',
      name: 'epicrisis_hospitalaria.pdf',
      meta: '6 paginas · 890 KB',
      pages: '1-6',
    },
    {
      id: 'pdf-4',
      name: 'orden_quirurgica_firmada.pdf',
      meta: '4 paginas · 640 KB',
      pages: '1-4',
    },
    {
      id: 'pdf-5',
      name: 'informe_radiologico_torax.pdf',
      meta: '8 paginas · 2.1 MB',
      pages: '1-2, 5-8',
    },
    {
      id: 'pdf-6',
      name: 'alta_medica_resumen.pdf',
      meta: '2 paginas · 310 KB',
      pages: '1-2',
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
      {
        name: 'resolucion_directoral_084.pdf',
        size: 512000,
        type: 'application/pdf',
        file: new File([], 'resolucion_directoral_084.pdf', { type: 'application/pdf' }),
      },
      {
        name: 'anexo_conformidad_tecnica.pdf',
        size: 389120,
        type: 'application/pdf',
        file: new File([], 'anexo_conformidad_tecnica.pdf', { type: 'application/pdf' }),
      },
      {
        name: 'acta_recepcion_firmada.pdf',
        size: 614400,
        type: 'application/pdf',
        file: new File([], 'acta_recepcion_firmada.pdf', { type: 'application/pdf' }),
      },
      {
        name: 'constancia_verificacion.pdf',
        size: 194560,
        type: 'application/pdf',
        file: new File([], 'constancia_verificacion.pdf', { type: 'application/pdf' }),
      },
    ]);
    this.lastInteraction.set('Archivos de muestra restaurados');
  }

  onSecondaryCancelAction(): void {
    this.lastInteraction.set('Variante 7 accionada: Salida segura mediante boton outline');
  }

  onCatalogActionTrigger(description: string): void {
    this.lastInteraction.set(`Catalogo de acciones: ${description}`);
  }

  onRemovePdfDemoFile(id: string): void {
    this.pdfDemoFiles.update((items) => items.filter((item) => item.id !== id));
    this.lastInteraction.set(`Catalogo de acciones: Documento retirado con close-soft [${id}]`);
  }

  onClearPdfDemoFiles(): void {
    this.pdfDemoFiles.set([]);
    this.lastInteraction.set('Catalogo de acciones: Lista vaciada con boton soft danger');
  }

  onRestorePdfDemoFiles(): void {
    this.pdfDemoFiles.set([
      {
        id: 'pdf-1',
        name: 'expediente_clinico_2026.pdf',
        meta: '12 paginas · 1.4 MB',
        pages: '1-4, 7',
      },
      {
        id: 'pdf-2',
        name: 'consentimiento_informado.pdf',
        meta: '3 paginas · 420 KB',
        pages: '1-3',
      },
      {
        id: 'pdf-3',
        name: 'epicrisis_hospitalaria.pdf',
        meta: '6 paginas · 890 KB',
        pages: '1-6',
      },
      {
        id: 'pdf-4',
        name: 'orden_quirurgica_firmada.pdf',
        meta: '4 paginas · 640 KB',
        pages: '1-4',
      },
      {
        id: 'pdf-5',
        name: 'informe_radiologico_torax.pdf',
        meta: '8 paginas · 2.1 MB',
        pages: '1-2, 5-8',
      },
      {
        id: 'pdf-6',
        name: 'alta_medica_resumen.pdf',
        meta: '2 paginas · 310 KB',
        pages: '1-2',
      },
    ]);
    this.lastInteraction.set('Catalogo de acciones: Documentos de demostracion restaurados');
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

  // --- Seccion 5: Organismo canonico Acerca de (app-about-dialog) ---
  readonly isAboutModalOpen = signal(false);
  readonly isAboutPopupOpen = signal(false);

  readonly aboutCredits: AboutCreditItem[] = [
    {
      label: 'Autoría Principal',
      value: 'Ing. Havel CONTRERAS TAPAHUASCO (COTAHA · @archware)',
      subtext:
        'Arquitecto de Software | DIY AI Lab | Creador de Ecosistemas: dirección técnica corporativa enfocada en demostrar que el ecosistema propio de Backend (Artifact Mangosta) y Frontend (Artifact Barracuda + Atomic UI) genera aplicaciones de escritorio Multi-Runtime (Rust/Tauri, Go/Wails, Python/PyWebView) de calidad empresarial',
      icon: 'fa-solid fa-user-shield',
      imageUrl: 'assets/doctrinas/ssit-emblem.jpg',
      bannerImageUrl: 'assets/doctrinas/merch-desk-setup.jpg',
      badge: 'Marca Personal',
    },
    {
      label: 'Artifact Mangosta',
      value: 'Artifact Mangosta — DDD, Arquitectura Hexagonal & CQRS Estricto',
      subtext:
        'Artefacto corporativo de ingeniería Backend (Rust/Tauri, C#/.NET, Java) que garantiza solidez empresarial: aislamiento de dominio, frontera IPC/HTTP determinista (DesktopFacadeService + RespuestaSistemaV1), motor nativo PDF (lopdf/rfd) y compilación limpia sin deuda técnica',
      icon: 'fa-solid fa-diagram-project',
      imageUrl: 'assets/doctrinas/doctrina-mangosta-icon.jpg',
      bannerImageUrl: 'assets/doctrinas/doctrina-mangosta-banner.jpg',
      badge: 'Backend Artifact',
    },
    {
      label: 'Artifact Barracuda',
      value: 'Artifact Barracuda — Chasis Frontend Reactivo con Signals',
      subtext:
        'Artefacto corporativo de ingeniería Frontend en Angular 22 + Signals y OnPush que entrega interfaces de alta gama: control flow nativo, procesamiento gráfico en memoria (PDF.js + pdf-lib), accesibilidad estricta y calidad respaldada por más de 325 pruebas automatizadas',
      icon: 'fa-solid fa-bolt',
      imageUrl: 'assets/doctrinas/doctrina-barracuda-icon.jpg',
      bannerImageUrl: 'assets/doctrinas/doctrina-barracuda-banner.jpg',
      badge: 'Frontend Artifact',
    },
    {
      label: 'Sistema de Diseño',
      value: 'Atomic UI (@atomic-ui/core v5.23.0) — Signals & OnPush',
      subtext:
        'Sistema de diseño corporativo de autor gobernado por pin criptográfico (ADR-017): tokens semánticos puros, desplazamiento controlado (app-scroll-overlay), cero CSS ad-hoc y acabado visual institucional uniforme',
      icon: 'fa-solid fa-cubes',
      imageUrl: 'assets/doctrinas/barracuda-mangosta-duality-icon.jpg',
      bannerImageUrl: 'assets/doctrinas/merch-kit-ejecutivo.jpg',
      badge: 'ADN Visual',
    },
    {
      label: 'DIY AI Lab & Co-Ingeniería IA',
      value: 'Laboratorio IA Bare-Metal Local & Orquestación de Agentes',
      subtext:
        'Infraestructura corporativa privada en servidor dedicado Ubuntu Linux con GPU NVIDIA Tesla V100 (32 GB VRAM), inferencia 100% local (Qwen3-Coder / llama.cpp), sistemas RAG (SQLite FTS5), protocolos MCP/ACP y auditoría por compuertas deterministas',
      icon: 'fa-solid fa-wand-magic-sparkles',
      badge: 'DIY AI Lab',
    },
    {
      label: 'Arquitectura y Seguridad',
      value: 'Compilación Multiplataforma CI/CD & Binarios Nativos Autónomos',
      subtext:
        'Ejecutables generados por cargo build --release en src-tauri/target/release/ y publicados por GitHub Actions en GitHub Releases con firma SHA-256: binario PE64 .exe en Windows (union-pdf-windows-x86_64.exe), Application Bundle nativo union-pdf.app empaquetado en .app.tar.gz en macOS Apple Silicon/Intel (union-pdf-macos-arm64.app.tar.gz y union-pdf-macos-x86_64.app.tar.gz, Mach-O) y binario nativo autónomo ELF empaquetado en .tar.gz en Linux (union-pdf-linux-x86_64.tar.gz), con el frontend embebido y privacidad 100% local',
      icon: 'fa-solid fa-shield-halved',
      badge: 'Multiplataforma CI/CD',
    },
  ];

  readonly aboutTechStack: AboutTechBadge[] = [
    { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
    { label: 'Angular 22 + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
    { label: 'Atomic UI v5.23.0', icon: 'fa-solid fa-layer-group', variant: 'info' },
    { label: 'Artifact Mangosta', icon: 'fa-solid fa-diagram-project', variant: 'primary' },
    { label: 'Artifact Barracuda', icon: 'fa-solid fa-bolt', variant: 'secondary' },
    { label: 'PDF.js + pdf-lib', icon: 'fa-solid fa-file-pdf', variant: 'warning' },
    { label: 'DIY AI Lab · 100% Local', icon: 'fa-solid fa-lock', variant: 'success' },
  ];

  readonly aboutLinks: AboutLinkItem[] = [
    {
      label: 'Releases y Ejecutables Compilados (Unión PDF)',
      url: 'https://github.com/archware/union-pdf/releases',
      icon: 'fa-solid fa-boxes-packing',
      external: true,
    },
    {
      label: 'Pipeline CI/CD Multiplataforma (GitHub Actions)',
      url: 'https://github.com/archware/union-pdf/actions',
      icon: 'fa-solid fa-gears',
      external: true,
    },
    {
      label: 'Portafolio & GitHub @archware',
      url: 'https://github.com/archware',
      icon: 'fa-brands fa-github',
      external: true,
    },
    {
      label: 'LinkedIn — Ing. Havel Contreras',
      url: 'https://www.linkedin.com/in/havel-contreras-tapahuasco-70a109167/',
      icon: 'fa-brands fa-linkedin',
      external: true,
    },
    {
      label: 'Repositorio Atomic UI',
      url: 'https://github.com/archware/-Atomic-UI',
      icon: 'fa-solid fa-code-branch',
      external: true,
    },
    {
      label: 'Contacto (havel363@gmail.com)',
      url: 'mailto:havel363@gmail.com',
      icon: 'fa-solid fa-envelope',
      external: false,
    },
  ];

  onOpenAboutModal(): void {
    this.isAboutModalOpen.set(true);
    this.lastInteraction.set('Abierto dialogo Acerca de en variante modal');
  }

  onCloseAboutModal(): void {
    this.isAboutModalOpen.set(false);
    this.lastInteraction.set('Cerrado dialogo Acerca de en variante modal');
  }

  onOpenAboutPopup(): void {
    this.isAboutPopupOpen.set(true);
    this.lastInteraction.set('Abierto dialogo Acerca de en variante popup');
  }

  onCloseAboutPopup(): void {
    this.isAboutPopupOpen.set(false);
    this.lastInteraction.set('Cerrado dialogo Acerca de en variante popup');
  }
}

