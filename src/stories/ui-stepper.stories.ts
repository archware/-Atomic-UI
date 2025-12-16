import type { Meta, StoryObj } from '@storybook/angular';
import { StepperComponent } from '../app/shared/ui/organisms/stepper/stepper.component';

const meta: Meta<StepperComponent> = {
  title: 'Organisms/Stepper',
  component: StepperComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<StepperComponent>;

const basicSteps = [
  { label: 'Datos personales', description: 'Información básica' },
  { label: 'Dirección', description: 'Datos de envío' },
  { label: 'Pago', description: 'Método de pago' },
  { label: 'Confirmación', description: 'Revisar pedido' },
];

const stepsWithIcons = [
  { label: 'Carrito', icon: '🛒', description: 'Productos seleccionados' },
  { label: 'Envío', icon: '🚚', description: 'Datos de entrega' },
  { label: 'Pago', icon: '💳', description: 'Información de pago' },
  { label: 'Listo', icon: '✅', description: 'Pedido realizado' },
];

export const Default: Story = {
  args: {
    steps: basicSteps,
    activeStep: 0,
  },
};

export const SecondStep: Story = {
  args: {
    steps: basicSteps,
    activeStep: 1,
  },
};

export const ThirdStep: Story = {
  args: {
    steps: basicSteps,
    activeStep: 2,
  },
};

export const LastStep: Story = {
  args: {
    steps: basicSteps,
    activeStep: 3,
  },
};

export const WithIcons: Story = {
  args: {
    steps: stepsWithIcons,
    activeStep: 1,
  },
};

export const TwoSteps: Story = {
  args: {
    steps: [
      { label: 'Inicio', description: 'Comenzar proceso' },
      { label: 'Finalizar', description: 'Completar' },
    ],
    activeStep: 0,
  },
};

export const ManySteps: Story = {
  args: {
    steps: [
      { label: 'Paso 1' },
      { label: 'Paso 2' },
      { label: 'Paso 3' },
      { label: 'Paso 4' },
      { label: 'Paso 5' },
      { label: 'Paso 6' },
    ],
    activeStep: 3,
  },
};

export const Completed: Story = {
  args: {
    steps: basicSteps,
    activeStep: 4, // Beyond last step = all completed
  },
};
