import type { Meta, StoryObj } from '@storybook/angular';
import { AccordionComponent } from '../app/shared/ui/organisms/accordion/accordion.component';

const meta: Meta<AccordionComponent> = {
  title: '3. Organisms/Accordion',
  component: AccordionComponent,
  tags: ['autodocs'],
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

export const WithOneExpanded: Story = {
  render: () => ({
    template: `
      <app-accordion>
        <app-accordion-item title="Sección expandida" [expanded]="true">
          <p>Esta sección está abierta por defecto.</p>
        </app-accordion-item>
        <app-accordion-item title="Sección cerrada">
          <p>Esta sección está cerrada por defecto.</p>
        </app-accordion-item>
      </app-accordion>
    `,
  }),
};

export const FAQ: Story = {
  render: () => ({
    template: `
      <app-accordion>
        <app-accordion-item title="¿Cuáles son los métodos de pago?">
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
      <app-accordion>
        <app-accordion-item title="📦 Información del producto">
          <p>Detalles sobre el producto seleccionado.</p>
        </app-accordion-item>
        <app-accordion-item title="🚚 Envío y entrega">
          <p>Información sobre tiempos y costos de envío.</p>
        </app-accordion-item>
        <app-accordion-item title="💳 Métodos de pago">
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
        <app-accordion-item title="Ver más detalles" [expanded]="true">
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
