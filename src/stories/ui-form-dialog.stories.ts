import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { Input } from '../app/shared/ui/atoms/form-input/input';
import { FormDialog, FormDialogActions } from '../app/shared/ui/organisms/form-dialog/form-dialog';

const meta: Meta<FormDialog> = {
  title: '3. Organisms/FormDialog',
  component: FormDialog,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, FormDialog, FormDialogActions, Input],
    }),
  ],
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg', 'xl'] },
    busy: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<FormDialog>;

export const Declarative: Story = {
  args: {
    eyebrow: 'Catálogo',
    title: 'Nuevo parentesco',
    description: 'Complete los campos obligatorios antes de guardar.',
    size: 'md',
    busy: false,
  },
  render: (args) => ({
    props: { ...args, opened: false },
    template: `
      <app-button (buttonClick)="opened = true">Abrir formulario</app-button>
      <prest-form-dialog
        [eyebrow]="eyebrow"
        [title]="title"
        [description]="description"
        [size]="size"
        [busy]="busy"
        [(opened)]="opened"
        (cancelled)="opened = false"
      >
        <app-button
          dialog-close
          variant="ghost"
          [disabled]="busy"
          (buttonClick)="opened = false"
        >
          Cerrar
        </app-button>
        <prest-input label="Nombre" [required]="true" />
        <prest-form-dialog-actions>
          <app-button variant="outline" [disabled]="busy" (buttonClick)="opened = false">
            Cancelar
          </app-button>
          <app-button [loading]="busy">Guardar</app-button>
        </prest-form-dialog-actions>
      </prest-form-dialog>
    `,
  }),
};
