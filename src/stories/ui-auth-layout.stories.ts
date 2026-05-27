import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AuthLayoutComponent } from '../app/shared/ui/templates/auth-layout/auth-layout.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';

const meta: Meta<AuthLayoutComponent> = {
  title: '5. Templates/AuthLayout',
  component: AuthLayoutComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout de autenticación. Wrapper de pantalla completa para páginas de login, registro y recuperación de contraseña.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [AuthLayoutComponent, ButtonComponent, FloatingInputComponent],
    }),
  ],
  argTypes: {
    title: { control: 'text', description: 'Título principal del card' },
    subtitle: { control: 'text', description: 'Subtítulo descriptivo' },
    logoUrl: { control: 'text', description: 'URL del logo' },
    brandName: { control: 'text', description: 'Nombre de la marca' },
  },
};

export default meta;
type Story = StoryObj<AuthLayoutComponent>;

export const LoginForm: Story = {
  args: {
    title: 'Bienvenido',
    subtitle: 'Ingresa tus credenciales para continuar',
    brandName: 'Atomic UI',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-auth-layout [title]="title" [subtitle]="subtitle" [brandName]="brandName" style="height:100vh;">
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <app-floating-input label="Email" type="email" variant="outline"></app-floating-input>
          <app-floating-input label="Contraseña" type="password" variant="outline"></app-floating-input>
          <app-button variant="primary" style="width:100%;">Iniciar sesión</app-button>
          <a href="#" style="text-align:center; font-size:0.875rem; color:var(--primary-color, #6366f1);">¿Olvidaste tu contraseña?</a>
        </div>
      </app-auth-layout>
    `,
  }),
};

export const RegisterForm: Story = {
  args: {
    title: 'Crear cuenta',
    subtitle: 'Completa los datos para registrarte',
    brandName: 'Atomic UI',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-auth-layout [title]="title" [subtitle]="subtitle" [brandName]="brandName" style="height:100vh;">
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <app-floating-input label="Nombre completo" variant="outline"></app-floating-input>
          <app-floating-input label="Email" type="email" variant="outline"></app-floating-input>
          <app-floating-input label="Contraseña" type="password" variant="outline"></app-floating-input>
          <app-floating-input label="Confirmar contraseña" type="password" variant="outline"></app-floating-input>
          <app-button variant="primary" style="width:100%;">Crear cuenta</app-button>
          <p style="text-align:center; font-size:0.875rem; color:#888;">
            ¿Ya tienes cuenta? <a href="#" style="color:var(--primary-color,#6366f1);">Inicia sesión</a>
          </p>
        </div>
      </app-auth-layout>
    `,
  }),
};

export const ForgotPassword: Story = {
  args: {
    title: 'Recuperar contraseña',
    subtitle: 'Te enviaremos un enlace a tu email',
    brandName: 'Atomic UI',
  },
  render: (args) => ({
    props: args,
    template: `
      <app-auth-layout [title]="title" [subtitle]="subtitle" [brandName]="brandName" style="height:100vh;">
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <app-floating-input label="Email" type="email" variant="outline"></app-floating-input>
          <app-button variant="primary" style="width:100%;">Enviar enlace</app-button>
          <app-button variant="ghost" style="width:100%;">← Volver al login</app-button>
        </div>
      </app-auth-layout>
    `,
  }),
};
