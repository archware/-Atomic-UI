import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { ModalComponent } from '../app/shared/ui/molecules/modal/modal.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';
import { ToastComponent } from '../app/shared/ui/molecules/toast/toast.component';
import { ToastService } from '../app/shared/ui/services/toast.service';

@Component({
  selector: 'app-story-modal-async-action',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="async-story">
      <div class="async-story__launchers">
        <app-button variant="primary" (buttonClick)="open('success')">
          Probar éxito
        </app-button>
        <app-button variant="outline" tone="danger" (buttonClick)="open('error')">
          Probar error
        </app-button>
      </div>

      @if (opened()) {
        <app-modal
          #dialog
          title="Guardar configuración"
          size="sm"
          [busy]="busy()"
          (closed)="close()"
        >
          <p>La demostración resuelve una operación asíncrona sin lógica de dominio.</p>
          @if (error()) {
            <p class="async-story__error" role="alert" data-modal-error tabindex="-1">
              {{ error() }}
            </p>
          }
          <div slot="footer" class="async-story__actions">
            <app-button variant="outline" [disabled]="busy()" (buttonClick)="close()">
              Cancelar
            </app-button>
            <app-button [loading]="busy()" (buttonClick)="submit()">
              Guardar
            </app-button>
          </div>
        </app-modal>
      }

      <app-toast />
    </div>
  `,
  styles: [`
    .async-story,
    .async-story__launchers,
    .async-story__actions {
      display: flex;
      gap: var(--space-3);
    }

    .async-story {
      flex-direction: column;
      align-items: flex-start;
    }

    .async-story__actions {
      justify-content: flex-end;
    }

    .async-story__error {
      margin: var(--space-4) 0 0;
      color: var(--danger-color);
      font-size: var(--text-sm);
    }
  `],
})
class ModalAsyncActionStory {
  protected readonly opened = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  private readonly mode = signal<'success' | 'error'>('success');
  private readonly dialog = viewChild(ModalComponent);
  private readonly toast = inject(ToastService);

  protected open(mode: 'success' | 'error'): void {
    this.toast.clear();
    this.mode.set(mode);
    this.error.set('');
    this.busy.set(false);
    this.opened.set(true);
  }

  protected close(): void {
    if (!this.busy()) {
      this.opened.set(false);
    }
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;

    this.busy.set(true);
    this.error.set('');
    await new Promise<void>((resolve) => setTimeout(resolve, 600));

    if (this.mode() === 'error') {
      this.error.set('No fue posible guardar. Revise la información e intente nuevamente.');
      this.busy.set(false);
      this.dialog()?.focusError();
      return;
    }

    this.busy.set(false);
    this.opened.set(false);
    setTimeout(() => this.toast.success('Configuración guardada.', 0));
  }
}

const meta: Meta<ModalComponent> = {
  id: 'molecules-modal',
  title: '2. Molecules/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, FloatingInputComponent, ModalAsyncActionStory],
    }),
  ],
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <app-modal title="Confirmar acción" size="md">
        <p>¿Está seguro de que desea continuar con esta acción?</p>
      </app-modal>
    `,
  }),
};

export const Small: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal pequeño" size="sm">
        <p>Contenido del modal pequeño.</p>
      </app-modal>
    `,
  }),
};

export const Large: Story = {
  render: () => ({
    template: `
      <app-modal title="Modal grande" size="lg">
        <p>Este es un modal grande con más espacio para contenido extenso.</p>
        <p>Puede contener formularios, tablas u otro contenido complejo.</p>
      </app-modal>
    `,
  }),
};

export const WithForm: Story = {
  render: () => ({
    template: `
      <app-modal title="Nuevo usuario" size="md">
        <form class="atomic-form-stack">
          <app-floating-input data-modal-initial-focus label="Nombre" autocomplete="name"></app-floating-input>
          <app-floating-input label="Correo electrónico" type="email" autocomplete="email"></app-floating-input>
        </form>
        <div slot="footer">
          <app-button variant="primary">Guardar</app-button>
        </div>
      </app-modal>
    `,
  }),
};

export const Confirmation: Story = {
  render: () => ({
    template: `
      <app-modal title="¿Eliminar registro?" size="sm">
        <p>Esta acción no se puede deshacer.</p>
        <div slot="footer" style="display:flex; gap:var(--space-2);">
          <app-button variant="outline">Cancelar</app-button>
          <app-button variant="outline" tone="danger">Eliminar</app-button>
        </div>
      </app-modal>
    `,
  }),
};

export const MobileBottomSheet: Story = {
  name: 'Diálogo móvil con área segura',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => ({
    template: `
      <app-modal title="Confirmar cambios" size="md">
        <p>Revise los datos antes de continuar. El contenido mantiene separación del borde inferior.</p>
        <div slot="footer" style="width:100%;">
          <app-button variant="primary" [fullWidth]="true">Confirmar</app-button>
        </div>
      </app-modal>
    `,
  }),
};

export const AsyncActionLifecycle: Story = {
  name: 'Acción asíncrona segura',
  render: () => ({
    template: `<app-story-modal-async-action />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('El estado busy bloquea Escape y el envío repetido', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Probar éxito' }));
      const dialog = await canvas.findByRole('dialog');
      const submit = within(dialog).getByRole('button', { name: 'Guardar' });
      await userEvent.click(submit);

      await waitFor(() => {
        expect(dialog).toHaveAttribute('aria-busy', 'true');
        expect(submit).toBeDisabled();
      });
      dialog.focus();
      await userEvent.keyboard('{Escape}');
      expect(canvas.getByRole('dialog')).toBe(dialog);
    });

    await step('El éxito retira el diálogo antes de presentar un único Toast', async () => {
      await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(), {
        timeout: 1500,
      });
      const toast = await canvas.findByRole('alert');
      expect(toast).toHaveTextContent('Configuración guardada.');
      expect(canvas.getAllByRole('alert')).toHaveLength(1);
      expect(canvas.getByRole('button', { name: 'Probar éxito' })).toHaveFocus();
    });

    await step('El error conserva el diálogo y mueve el foco a la alerta', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Probar error' }));
      const dialog = await canvas.findByRole('dialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }));

      const error = await within(dialog).findByRole('alert', undefined, { timeout: 1500 });
      expect(error).toHaveTextContent('No fue posible guardar.');
      expect(canvas.getByRole('dialog')).toBe(dialog);
      await waitFor(() => expect(error).toHaveFocus());
    });
  },
};
