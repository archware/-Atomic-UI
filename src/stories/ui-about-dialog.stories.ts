import type { Meta, StoryObj } from '@storybook/angular';
import {
  AboutDialogComponent,
  type AboutCreditItem,
  type AboutLinkItem,
  type AboutTechBadge,
} from '../app/shared/ui/organisms/about-dialog/about-dialog.component';

const creditsDemo: AboutCreditItem[] = [
  {
    label: 'Autoría Principal',
    value: 'Ing. Havel CONTRERAS TAPAHUASCO (@archware) · SSIT CONSULTING E.I.R.L.',
    subtext:
      'Arquitecto de Software Full-Stack, firma consultora SSIT CONSULTING E.I.R.L. y creador de herramientas propias de ingeniería, sistemas de diseño y doctrinas de arquitectura empresarial',
    icon: 'fa-solid fa-user-shield',
    imageUrl: 'assets/doctrinas/ssit-emblem.jpg',
    bannerImageUrl: 'assets/doctrinas/merch-desk-setup.jpg',
    badge: 'Marca Personal',
  },
  {
    label: 'Doctrina Mangosta',
    value: 'Suite Mangosta — Arquitectura Hexagonal & CQRS Estricto',
    subtext:
      'Vertical Slicing, dominio rico en español, persistencia limpia sin micro-ORMs, fronteras IPC/HTTP tipadas y seguridad por diseño',
    icon: 'fa-solid fa-diagram-project',
    imageUrl: 'assets/doctrinas/doctrina-mangosta-icon.jpg',
    bannerImageUrl: 'assets/doctrinas/doctrina-mangosta-banner.jpg',
    badge: 'Backend Canon',
  },
  {
    label: 'Doctrina Barracuda',
    value: 'Suite Barracuda — Chasis Frontend Reactivo con Signals',
    subtext:
      'Andamiaje modular en Angular 22 + Signals, control flow nativo, plantillas gobernadas, accesibilidad estricta y cero deuda visual',
    icon: 'fa-solid fa-bolt',
    imageUrl: 'assets/doctrinas/doctrina-barracuda-icon.jpg',
    bannerImageUrl: 'assets/doctrinas/doctrina-barracuda-banner.jpg',
    badge: 'Frontend Canon',
  },
  {
    label: 'Sistema de Diseño',
    value: 'Atomic UI (@atomic-ui/core v5.22.0) — Signals & OnPush',
    subtext:
      'Librería de autor con tokens semánticos puros, desplazamiento gobernado y fidelidad visual anti-alucinación',
    icon: 'fa-solid fa-cubes',
    imageUrl: 'assets/doctrinas/barracuda-mangosta-duality-icon.jpg',
    bannerImageUrl: 'assets/doctrinas/merch-kit-ejecutivo.jpg',
    badge: 'ADN Visual',
  },
  {
    label: 'Co-Ingeniería IA',
    value: 'Asistencia de IA Agéntica & Orquestación Doctrinal',
    subtext:
      'Aceleración de entrega con agentes especializados gobernados por reglas de arquitectura, auditoría adversarial y compuertas deterministas',
    icon: 'fa-solid fa-wand-magic-sparkles',
    badge: 'IA Agéntica',
  },
  {
    label: 'Arquitectura y Seguridad',
    value: 'Procesamiento 100% local en memoria sin subida a servidores',
    subtext:
      'Frontera nativa Tauri + Rust (RespuestaSistemaV1), privacidad institucional absoluta y ejecución de alto rendimiento',
    icon: 'fa-solid fa-shield-halved',
    badge: 'Privacidad',
  },
];

const techStackDemo: AboutTechBadge[] = [
  { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
  { label: 'Angular 22 + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
  { label: 'Atomic UI v5.22.0', icon: 'fa-solid fa-layer-group', variant: 'info' },
  { label: 'Doctrina Mangosta', icon: 'fa-solid fa-diagram-project', variant: 'primary' },
  { label: 'Doctrina Barracuda', icon: 'fa-solid fa-bolt', variant: 'secondary' },
  { label: 'PDF.js + pdf-lib', icon: 'fa-solid fa-file-pdf', variant: 'warning' },
  { label: '100% Local', icon: 'fa-solid fa-lock', variant: 'success' },
];

const linksDemo: AboutLinkItem[] = [
  {
    label: 'Portafolio & GitHub @archware',
    url: 'https://github.com/archware',
    icon: 'fa-brands fa-github',
    external: true,
  },
  {
    label: 'Repositorio Atomic UI',
    url: 'https://github.com/archware/-Atomic-UI',
    icon: 'fa-solid fa-code-branch',
    external: true,
  },
];

const meta: Meta<AboutDialogComponent> = {
  title: 'Organisms/AboutDialog',
  component: AboutDialogComponent,
  tags: ['autodocs'],
  args: {
    open: true,
    variant: 'card',
    size: 'md',
    dialogTitle: 'Acerca de Editor PDF Studio',
    appName: 'Editor PDF Studio',
    appSubtitle: 'Organizador, extractor y unificador visual de documentos PDF',
    appDescription:
      'Aplicación de escritorio de alto rendimiento para unificar, reorganizar, rotar y extraer páginas de archivos PDF con procesamiento 100% en memoria local y privacidad absoluta.',
    version: 'v0.5.1',
    environment: 'LOCAL & SEGURO',
    runtimeInfo: 'Tauri + Rust Desktop',
    logoIcon: 'fa-solid fa-file-pdf',
    logoImageUrl: 'assets/doctrinas/ssit-emblem.jpg',
    authorName: 'Ing. Havel CONTRERAS TAPAHUASCO',
    authorRole:
      'Arquitecto de Software Principal · SSIT CONSULTING E.I.R.L. & Creador del Ecosistema @archware (Atomic UI · Doctrina Barracuda · Doctrina Mangosta)',
    githubHandle: '@archware',
    githubUrl: 'https://github.com/archware',
    aiDisclosure:
      'Desarrollado en co-ingeniería con IA Agéntica por SSIT CONSULTING E.I.R.L. bajo el ecosistema de autor @archware: una suite propia de ingeniería de software que integra Doctrina Mangosta (Arquitectura Hexagonal y CQRS estricto), Doctrina Barracuda (Chasis Frontend reactivo con Signals) y el sistema de diseño Atomic UI (@atomic-ui/core), logrando productos de calidad empresarial verificados por compuertas deterministas.',
    credits: creditsDemo,
    techStack: techStackDemo,
    links: linksDemo,
    copyrightText:
      '© 2026 Ing. Havel CONTRERAS TAPAHUASCO (@archware) · SSIT CONSULTING E.I.R.L. Todos los derechos reservados.',
    closeButtonText: 'Cerrar',
  },
};

export default meta;
type Story = StoryObj<AboutDialogComponent>;

export const VistaEnLineaCard: Story = {
  args: {
    variant: 'card',
    size: 'lg',
  },
};

export const VentanaModal: Story = {
  args: {
    variant: 'modal',
    open: true,
    size: 'md',
  },
};

export const VentanaPopup: Story = {
  args: {
    variant: 'popup',
    open: true,
    size: 'md',
  },
};
