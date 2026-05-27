import type { Meta, StoryObj } from '@storybook/angular';
import { TimelineComponent } from '../app/shared/ui/molecules/timeline/timeline.component';

const meta: Meta<TimelineComponent> = {
  title: '2. Molecules/Timeline',
  component: TimelineComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'centered'],
    },
  },
};
export default meta;
type Story = StoryObj<TimelineComponent>;

export const Default: Story = {
  args: {
    variant: 'default',
    items: [
      {
        id: '1',
        title: 'Proyecto creado',
        description: 'Se creó el proyecto y se definieron los requerimientos iniciales.',
        date: '10 Ene 2026',
        icon: '🚀',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Diseño aprobado',
        description: 'El equipo de diseño presentó los mockups y fueron aprobados.',
        date: '20 Ene 2026',
        icon: '🎨',
        status: 'completed',
      },
      {
        id: '3',
        title: 'Desarrollo en curso',
        description: 'El equipo de desarrollo está implementando las funcionalidades.',
        date: '1 Feb 2026',
        icon: '⚙️',
        status: 'active',
      },
      {
        id: '4',
        title: 'QA y Testing',
        description: 'Pruebas de calidad y validación de funcionalidades.',
        date: 'Pendiente',
        icon: '🧪',
        status: 'pending',
      },
      {
        id: '5',
        title: 'Lanzamiento',
        description: 'Deploy en producción y comunicación a usuarios.',
        date: 'Pendiente',
        icon: '🎉',
        status: 'pending',
      },
    ],
  },
};

export const Compact: Story = {
  args: {
    variant: 'compact',
    items: [
      { id: '1', title: 'Usuario registrado', date: '01/01/2026', status: 'completed' },
      { id: '2', title: 'Email verificado', date: '02/01/2026', status: 'completed' },
      { id: '3', title: 'Perfil completado', date: '03/01/2026', status: 'active' },
      { id: '4', title: 'Primera compra', date: 'Pendiente', status: 'pending' },
    ],
  },
};

export const WithErrors: Story = {
  args: {
    variant: 'default',
    items: [
      { id: '1', title: 'Pago iniciado', date: '15/03/2026', status: 'completed', icon: '💳' },
      { id: '2', title: 'Procesando pago', date: '15/03/2026', status: 'error', description: 'Error al procesar: tarjeta rechazada.', icon: '❌' },
      { id: '3', title: 'Reintento automático', date: 'En espera', status: 'pending', icon: '🔄' },
    ],
  },
};
