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
    value: 'Ing. Havel CONTRERAS TAPAHUASCO (@archware)',
    subtext: 'Arquitectura Hexagonal, Gobierno UI y Desarrollo Principal',
    icon: 'fa-solid fa-user-shield',
    badge: 'Autor',
  },
  {
    label: 'Co-Ingeniería IA',
    value: 'Asistencia de IA Agéntica & Orquestación Doctrinal',
    subtext: 'Verificación por compuertas deterministas y pruebas reales',
    icon: 'fa-solid fa-wand-magic-sparkles',
    badge: 'IA',
  },
  {
    label: 'Arquitectura y Seguridad',
    value: 'Procesamiento 100% local en memoria sin subida a servidores',
    subtext: 'Frontera tipada y privacidad institucional',
    icon: 'fa-solid fa-shield-halved',
  },
  {
    label: 'Sistema de Diseño',
    value: 'Atomic UI (@atomic-ui/core) — Signals & OnPush',
    subtext: 'Tokens semánticos puros sin estilos paralelos',
    icon: 'fa-solid fa-cubes',
  },
];

const techStackDemo: AboutTechBadge[] = [
  { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
  { label: 'Angular 19 + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
  { label: 'Atomic UI', icon: 'fa-solid fa-layer-group', variant: 'info' },
  { label: 'PDF.js + pdf-lib', icon: 'fa-solid fa-file-pdf', variant: 'warning' },
  { label: '100% Local', icon: 'fa-solid fa-lock', variant: 'success' },
];

const linksDemo: AboutLinkItem[] = [
  {
    label: 'GitHub @archware',
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
    authorName: 'Ing. Havel CONTRERAS TAPAHUASCO',
    authorRole: 'Autor, Arquitecto de Software y Desarrollador Principal',
    githubHandle: '@archware',
    githubUrl: 'https://github.com/archware',
    aiDisclosure:
      'Desarrollado en co-ingeniería con IA Agéntica bajo la doctrina de arquitectura hexagonal y el sistema de diseño Atomic UI.',
    credits: creditsDemo,
    techStack: techStackDemo,
    links: linksDemo,
    copyrightText:
      '© 2026 Ing. Havel CONTRERAS TAPAHUASCO (@archware). Todos los derechos reservados.',
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
