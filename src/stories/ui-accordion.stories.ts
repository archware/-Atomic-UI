import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  AccordionComponent,
  AccordionItemComponent,
} from '../app/shared/ui/organisms/accordion/accordion.component';

const meta: Meta<AccordionComponent> = {
  title: '3. Organisms/Accordion',
  component: AccordionComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [AccordionComponent, AccordionItemComponent] })],
};

export default meta;
type Story = StoryObj<AccordionComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-accordion>
        <app-accordion-item title="¿Qué es esto?">
          <p>Este es un componente de acordeón que permite mostrar y ocultar contenido.</p>
        </app-accordion-item>
        <app-accordion-item title="¿Cómo funciona?">
          <p>Haz clic en el título para expandir o contraer cada sección.</p>
        </app-accordion-item>
        <app-accordion-item title="¿Puedo personalizar?">
          <p>Sí, puedes usar diferentes estilos y contenido en cada ítem.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const SingleOpen: Story = {
  name: 'Selección única (variant="single")',
  render: () => ({
    template: `
      <app-accordion variant="single">
        <app-accordion-item
          title="¿Qué es este sistema?"
          description="Arquitectura y soporte de temas"
          icon="fa-solid fa-layer-group"
          [open]="true"
        >
          <p>Al abrir otra sección, esta se cierra automáticamente para mantener una sola activa.</p>
        </app-accordion-item>
        <app-accordion-item
          title="¿Cómo cambio el tema?"
          description="Conmutación entre modo claro y oscuro"
          icon="fa-solid fa-palette"
        >
          <p>Usa el componente ThemeSwitcher en la esquina superior derecha para cambiar entre modos.</p>
        </app-accordion-item>
        <app-accordion-item
          title="¿Puedo personalizar los colores?"
          description="Variables semánticas y tokens de marca"
          icon="fa-solid fa-sliders"
        >
          <p>Sí, todos los colores están definidos como variables CSS en el archivo tokens.css.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const WithOneExpanded: Story = {
  render: () => ({
    template: `
      <app-accordion>
        <app-accordion-item title="Sección expandida" [open]="true">
          <p>Esta sección está abierta por defecto.</p>
        </app-accordion-item>
        <app-accordion-item title="Sección cerrada">
          <p>Esta sección está cerrada por defecto.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const FlushSingle: Story = {
  name: 'Sin marco con selección única (variant="flush" [single]="true")',
  render: () => ({
    template: `
      <app-accordion variant="flush" [single]="true">
        <app-accordion-item title="Condiciones del crédito" [open]="true">
          <p>Tasa, plazo y comisiones aplicables.</p>
        </app-accordion-item>
        <app-accordion-item title="Requisitos documentales">
          <p>Documentos que deben presentarse antes del desembolso.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const FAQ: Story = {
  render: () => ({
    template: `
      <app-accordion [single]="true">
        <app-accordion-item title="¿Cuáles son los métodos de pago?" [open]="true">
          <p>Aceptamos tarjetas de crédito, débito, transferencias bancarias y pagos en efectivo.</p>
        </app-accordion-item>
        <app-accordion-item title="¿Cuánto tarda el envío?">
          <p>El tiempo de envío es de 3 a 5 días hábiles para Lima y de 5 a 10 días para provincias.</p>
        </app-accordion-item>
        <app-accordion-item title="¿Cómo puedo rastrear mi pedido?">
          <p>Recibirás un correo con el número de seguimiento una vez despachado tu pedido.</p>
        </app-accordion-item>
        <app-accordion-item title="¿Puedo devolver un producto?">
          <p>Sí, tienes 30 días para realizar devoluciones en productos no usados.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <app-accordion variant="single">
        <app-accordion-item title="Información del producto" icon="fa-solid fa-box" [open]="true">
          <p>Detalles sobre el producto seleccionado.</p>
        </app-accordion-item>
        <app-accordion-item title="Envío y entrega" icon="fa-solid fa-truck">
          <p>Información sobre tiempos y costos de envío.</p>
        </app-accordion-item>
        <app-accordion-item title="Métodos de pago" icon="fa-solid fa-credit-card">
          <p>Opciones de pago disponibles.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const SingleItem: Story = {
  render: () => ({
    template: `
      <app-accordion>
        <app-accordion-item title="Ver más detalles" [open]="true">
          <p>Este es un acordeón con un solo ítem, útil para secciones expandibles.</p>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            <li>Detalle 1</li>
            <li>Detalle 2</li>
            <li>Detalle 3</li>
          </ul>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};
