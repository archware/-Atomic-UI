import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from '../app/shared/ui/atoms/form-error/form-error.component';

const meta: Meta<FormErrorComponent> = {
  title: '1. Atoms/FormError',
  component: FormErrorComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Componente para mostrar mensajes de error de validación de formularios.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<FormErrorComponent>;

export const Required: Story = {
  render: () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <div style="max-width: 300px;">
          <input type="text" placeholder="Campo requerido" [formControl]="control"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
          <app-form-error [control]="control"></app-form-error>
        </div>
      `,
    };
  },
};

export const Email: Story = {
  render: () => {
    const control = new FormControl('invalid-email', Validators.email);
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <div style="max-width: 300px;">
          <input type="email" [formControl]="control"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
          <app-form-error [control]="control"></app-form-error>
        </div>
      `,
    };
  },
};

export const MinLength: Story = {
  render: () => {
    const control = new FormControl('ab', Validators.minLength(5));
    control.markAsTouched();
    return {
      props: { control },
      template: `
        <div style="max-width: 300px;">
          <input type="text" [formControl]="control"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
          <app-form-error [control]="control"></app-form-error>
        </div>
      `,
    };
  },
};

export const NoError: Story = {
  render: () => {
    const control = new FormControl('valor válido', Validators.required);
    return {
      props: { control },
      template: `
        <div style="max-width: 300px;">
          <input type="text" [formControl]="control"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
          <app-form-error [control]="control"></app-form-error>
          <p style="color: green; font-size: 0.875rem; margin-top: 0.5rem;">✓ El campo es válido</p>
        </div>
      `,
    };
  },
};
