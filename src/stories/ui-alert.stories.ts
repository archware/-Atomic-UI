import type { Meta, StoryObj } from '@storybook/angular';
import { Alert } from '../app/shared/ui/molecules/alert/alert.component';

// El cuerpo de la alerta se proyecta como contenido: la entrada `message`
// desapareció en 5.4.0 porque duplicaba ese mismo canal. Por eso las historias
// usan `render` con plantilla en vez de `args`.
const meta: Meta<Alert> = {
  title: '2. Molecules/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    spacing: { control: 'select', options: ['default', 'compact', 'none'] },
    title: { control: 'text' },
    closable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<Alert>;

function story(template: string): Story {
  return { render: () => ({ template, imports: [Alert] }) };
}

export const Info = story(`
  <app-alert kind="info" title="Información" [closable]="true">
    Tu sesión expirará en 5 minutos.
  </app-alert>
`);

export const Exito = story(`
  <app-alert kind="success" title="¡Operación exitosa!" [closable]="true">
    Los cambios han sido guardados correctamente.
  </app-alert>
`);

export const Advertencia = story(`
  <app-alert kind="warning" title="Atención">
    Este proceso no se puede deshacer.
  </app-alert>
`);

export const Error = story(`
  <app-alert kind="danger" title="Error al guardar" [closable]="true">
    No se pudo conectar con el servidor. Intente nuevamente.
  </app-alert>
`);

export const SinTitulo = story(`
  <app-alert kind="info">
    Recuerda completar tu perfil para acceder a todas las funciones.
  </app-alert>
`);

// Sustituye a la antigua historia «Tamaños», que demostraba una entrada `size`
// inexistente y usaba kind="primary", un valor que nunca estuvo en el tipo: se
// pintaba sin estilo porque las clases se construían por concatenación, de modo
// que cualquier cadena producía una clase válida y el fallo era silencioso.
export const Espaciado = story(`
  <div style="display:flex;flex-direction:column;padding:1rem">
    <app-alert kind="info" spacing="default">Separación por omisión</app-alert>
    <app-alert kind="info" spacing="compact">Separación compacta</app-alert>
    <app-alert kind="info" spacing="none">Sin separación de flujo</app-alert>
  </div>
`);
