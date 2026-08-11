import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { FloatingInputComponent } from '../app/shared/ui/atoms/floating-input/floating-input.component';
import { TextareaComponent } from '../app/shared/ui/atoms/textarea/textarea.component';
import { ContextMenuComponent } from '../app/shared/ui/molecules/context-menu/context-menu.component';

const meta: Meta<ContextMenuComponent> = {
  id: 'molecules-context-menu',
  title: '2. Molecules/ContextMenu',
  component: ContextMenuComponent,
  decorators: [
    moduleMetadata({
      imports: [ContextMenuComponent, FloatingInputComponent, TextareaComponent],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Menú contextual accesible de edición de texto para navegadores embebidos; se monta una vez como singleton cooperativo por Document.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ContextMenuComponent>;

export const EditableControls: Story = {
  name: 'Controles editables',
  render: () => ({
    template: `
      <section aria-labelledby="context-menu-editable-title">
        <h3 id="context-menu-editable-title">Edición mediante menú contextual</h3>
        <p>El clic secundario o Shift+F10 presenta las acciones disponibles para cada control.</p>
        <app-floating-input
          label="Texto editable"
          type="text"
          value="Texto de ejemplo con contenido seleccionable"
        ></app-floating-input>
        <app-textarea
          label="Observaciones"
          [rows]="4"
          [maxlength]="240"
        ></app-textarea>
        <p
          contenteditable="true"
          data-context-menu-policy="text-edit"
          aria-label="Contenido editable"
        >
          Esta región permite edición de texto sin formato.
        </p>
      </section>
      <app-context-menu />
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Texto editable') as HTMLInputElement;

    await step('El clic secundario abre las cuatro acciones de edición', async () => {
      input.setSelectionRange(0, 5);
      await fireEvent.contextMenu(input, { clientX: 40, clientY: 40 });

      const menu = await canvas.findByRole('menu', { name: 'Opciones de edición' });
      const menuScope = within(menu);

      expect(menuScope.getAllByRole('menuitem')).toHaveLength(4);
      expect(menuScope.getByRole('menuitem', { name: 'Cortar' })).toBeInTheDocument();
      expect(menuScope.getByRole('menuitem', { name: 'Copiar' })).toBeInTheDocument();
      expect(menuScope.getByRole('menuitem', { name: 'Pegar' })).toBeInTheDocument();
      expect(menuScope.getByRole('menuitem', { name: 'Seleccionar todo' })).toBeInTheDocument();
    });
  },
};

export const PasteOnlyPassword: Story = {
  name: 'Contraseña protegida para pegado',
  render: () => ({
    template: `
      <section aria-labelledby="context-menu-password-title">
        <h3 id="context-menu-password-title">Protección del valor secreto</h3>
        <p>El campo conserva Pegar y Seleccionar todo, mientras Cortar y Copiar permanecen bloqueados.</p>
        <app-floating-input
          label="Contraseña institucional"
          type="password"
          autocomplete="current-password"
        ></app-floating-input>
      </section>
      <app-context-menu />
    `,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Contraseña institucional') as HTMLInputElement;

    await step(
      'La política paste-only conserva solo acciones que no extraen el valor',
      async () => {
        await userEvent.click(input);
        await userEvent.type(input, String(Date.now()));
        input.select();
        await userEvent.keyboard('{Shift>}{F10}{/Shift}');

        const menu = await canvas.findByRole('menu', { name: 'Opciones de edición' });
        const menuScope = within(menu);
        const cut = menuScope.getByRole('menuitem', { name: 'Cortar' });
        const copy = menuScope.getByRole('menuitem', { name: 'Copiar' });
        const paste = menuScope.getByRole('menuitem', { name: 'Pegar' });
        const selectAll = menuScope.getByRole('menuitem', { name: 'Seleccionar todo' });

        expect(cut).toBeDisabled();
        expect(copy).toBeDisabled();
        expect(paste).not.toBeDisabled();
        expect(selectAll).not.toBeDisabled();

        await userEvent.keyboard('{Escape}');
        await userEvent.clear(input);
      },
    );
  },
};

export const DisabledMenu: Story = {
  name: 'Sustitución desactivada',
  render: () => ({
    template: `
      <app-floating-input
        label="Campo gestionado por el host"
        type="text"
        value="La instancia global permanece desactivada"
      ></app-floating-input>
      <app-context-menu [disabled]="true" />
    `,
  }),
};
