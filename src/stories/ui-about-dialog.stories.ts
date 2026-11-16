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
    value: 'Atomic UI (@atomic-ui/core v5.23.1) — Signals & OnPush',
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

const techStackDemo: AboutTechBadge[] = [
  { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
  { label: 'Angular 22 + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
  { label: 'Atomic UI v5.23.1', icon: 'fa-solid fa-layer-group', variant: 'info' },
  { label: 'Artifact Mangosta', icon: 'fa-solid fa-diagram-project', variant: 'primary' },
  { label: 'Artifact Barracuda', icon: 'fa-solid fa-bolt', variant: 'secondary' },
  { label: 'PDF.js + pdf-lib', icon: 'fa-solid fa-file-pdf', variant: 'warning' },
  { label: 'DIY AI Lab · 100% Local', icon: 'fa-solid fa-lock', variant: 'success' },
];

const linksDemo: AboutLinkItem[] = [
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

const meta: Meta<AboutDialogComponent> = {
  title: 'Organisms/AboutDialog',
  component: AboutDialogComponent,
  tags: ['autodocs'],
  args: {
    open: true,
    variant: 'card',
    size: 'md',
    dialogTitle: 'Acerca de Unión PDF',
    appName: 'Unión PDF',
    appSubtitle:
      'Suite Corporativa de Ingeniería Documental — Demostrador de Calidad Empresarial Backend (Artifact Mangosta) & Frontend (Artifact Barracuda + Atomic UI)',
    appDescription:
      'Aplicación corporativa diseñada para demostrar que la arquitectura propia de Backend (Artifact Mangosta) y Frontend (Artifact Barracuda + Atomic UI) genera software nativo de calidad empresarial, 100% local en memoria y certificado por compuertas deterministas. Al ejecutar el pipeline CI/CD (GitHub Actions) o el build canónico local (cargo build --release), se compilan los binarios nativos en src-tauri/target/release/ y se publican con firma SHA-256 en GitHub Releases (github.com/archware/union-pdf/releases): ejecutable PE64 con extensión .exe en Windows (union-pdf-windows-x86_64.exe), paquete Application Bundle union-pdf.app con extensión .app.tar.gz en macOS Apple Silicon/Intel (union-pdf-macos-arm64.app.tar.gz y union-pdf-macos-x86_64.app.tar.gz, formato Mach-O) y paquete comprimido .tar.gz con el ejecutable ELF en Linux (union-pdf-linux-x86_64.tar.gz), todos con el frontend Angular 22 + Atomic UI embebido directamente en el binario.',
    version: 'v0.5.3',
    environment: 'CORPORATIVO · LOCAL & SEGURO',
    runtimeInfo: 'Tauri + Rust Desktop',
    logoIcon: 'fa-solid fa-file-pdf',
    logoImageUrl: 'assets/doctrinas/ssit-emblem.jpg',
    authorName: 'Ing. Havel CONTRERAS TAPAHUASCO',
    authorRole:
      'Arquitecto de Software Corporativo | DIY AI Lab | Creador de Ecosistemas · COTAHA (@archware · Atomic UI · Artifact Barracuda · Artifact Mangosta)',
    githubHandle: '@archware',
    githubUrl: 'https://github.com/archware',
    aiDisclosure:
      'Desarrollado en co-ingeniería con IA Agéntica en el DIY AI Lab de Ing. Havel CONTRERAS TAPAHUASCO (COTAHA · @archware): arquitectura corporativa enfocada en demostrar que la integración entre el Backend propio Artifact Mangosta (DDD, Arquitectura Hexagonal y CQRS estricto) y el Frontend propio Artifact Barracuda + Atomic UI (@atomic-ui/core) produce aplicaciones nativas de calidad empresarial, auditadas en laboratorio bare-metal local (NVIDIA Tesla V100 32 GB VRAM) y compiladas exitosamente de forma multiplataforma (Windows .exe, macOS Mach-O y Linux ELF) mediante pipelines CI/CD reproducibles.',
    credits: creditsDemo,
    techStack: techStackDemo,
    links: linksDemo,
    copyrightText:
      '© 2026 Ing. Havel CONTRERAS TAPAHUASCO (COTAHA · @archware). Todos los derechos reservados.',
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
