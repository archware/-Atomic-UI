import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';

const meta: Meta<FloatingInputComponent> = {
  id: 'atoms-floating-input',
  title: '1. Atoms/FloatingInput',
  component: FloatingInputComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FloatingInputComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-floating-input label="Email" type="email"></app-floating-input>`,
  }),
};

export const Password: Story = {
  render: () => ({
    template: `<app-floating-input label="Contraseña" type="password" autocomplete="current-password"></app-floating-input>`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Contraseña') as HTMLInputElement;
    const reveal = canvas.getByRole('button', { name: 'Mostrar contraseña' });

    await step('El control de revelado entra en el recorrido de teclado', async () => {
      expect(reveal).toHaveAttribute('aria-controls', input.id);
      expect(reveal).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(input);
      await userEvent.tab();
      expect(reveal).toHaveFocus();
    });

    await step('Enter revela la contraseña y actualiza el estado accesible', async () => {
      await userEvent.keyboard('{Enter}');
      expect(input).toHaveAttribute('type', 'text');
      expect(reveal).toHaveAttribute('aria-label', 'Ocultar contraseña');
      expect(reveal).toHaveAttribute('aria-pressed', 'true');
      expect(reveal.querySelector('i')).toHaveAttribute('aria-hidden', 'true');
      expect(reveal).toHaveFocus();
    });

    await step('Espacio vuelve a ocultar la contraseña sin perder el foco', async () => {
      await userEvent.keyboard(' ');
      expect(input).toHaveAttribute('type', 'password');
      expect(reveal).toHaveAttribute('aria-label', 'Mostrar contraseña');
      expect(reveal).toHaveAttribute('aria-pressed', 'false');
      expect(reveal).toHaveFocus();
    });
  },
};

export const PasswordLightAndDark: Story = {
  name: 'Contraseña en temas claro y oscuro',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));">
        <section data-theme="light" style="background:var(--surface-background); color:var(--text-color); padding:var(--space-8);">
          <h3>Modo claro</h3>
          <app-floating-input
            label="Contraseña institucional"
            type="password"
            autocomplete="current-password"
            value="ClaveSegura2026"
          ></app-floating-input>
        </section>
        <section data-theme="dark" style="background:var(--surface-background); color:var(--text-color); padding:var(--space-8);">
          <h3>Modo oscuro</h3>
          <app-floating-input
            label="Contraseña institucional"
            type="password"
            autocomplete="current-password"
            value="ClaveSegura2026"
          ></app-floating-input>
        </section>
      </div>
    `,
  }),
};

export const PasswordMobile: Story = {
  name: 'Contraseña en pantalla móvil',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => ({
    template: `
      <main data-theme="light" style="min-height:100dvh; background:var(--surface-background); color:var(--text-color); padding:var(--space-5);">
        <app-floating-input
          label="Contraseña"
          type="password"
          autocomplete="current-password"
          value="ClaveSegura2026"
        ></app-floating-input>
      </main>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `<app-floating-input label="Buscar" type="text" icon="🔍"></app-floating-input>`,
  }),
};

export const Underline: Story = {
  render: () => ({
    template: `<app-floating-input label="Nombre completo" type="text" variant="underline"></app-floating-input>`,
  }),
};

export const Material: Story = {
  render: () => ({
    template: `<app-floating-input label="Teléfono" type="tel" variant="material"></app-floating-input>`,
  }),
};

export const DateInput: Story = {
  render: () => ({
    template: `<app-floating-input label="Fecha de nacimiento" type="date"></app-floating-input>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<app-floating-input label="Campo deshabilitado" type="text" [disabled]="true"></app-floating-input>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 400px;">
        <app-floating-input label="Floating (default)" type="text" variant="floating"></app-floating-input>
        <app-floating-input label="Underline" type="text" variant="underline"></app-floating-input>
        <app-floating-input label="Material" type="text" variant="material"></app-floating-input>
      </div>
    `,
  }),
};
