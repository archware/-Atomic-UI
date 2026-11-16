import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { FormActionsComponent } from '../app/shared/ui/molecules/form-actions/form-actions.component';

@Component({
  selector: 'app-form-actions-demo',
  standalone: true,
  imports: [FormActionsComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-form-actions>
      <app-button variant="ghost">Cancelar</app-button>
      <app-button variant="primary">Guardar cambios</app-button>
    </app-form-actions>
  `,
})
class FormActionsDemoComponent {}

const meta: Meta<FormActionsDemoComponent> = {
  id: 'molecules-form-actions',
  title: '2. Molecules/FormActions',
  component: FormActionsDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<FormActionsDemoComponent>;

export const Default: Story = {};
