import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { InputComponent } from '../app/shared/ui/atoms/input/input.component';
import { FormDialog, FormDialogActions } from '../app/shared/ui/organisms/form-dialog/form-dialog';

const meta: Meta<FormDialog> = {
  title: '3. Organisms/FormDialog',
  component: FormDialog,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, FormDialog, FormDialogActions, InputComponent],
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
      <app-form-dialog
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
        <app-input label="Nombre" [required]="true" />
        <app-form-dialog-actions>
          <app-button variant="outline" [disabled]="busy" (buttonClick)="opened = false">
            Cancelar
          </app-button>
          <app-button [loading]="busy">Guardar</app-button>
        </app-form-dialog-actions>
      </app-form-dialog>
    `,
  }),
};

@Component({
  selector: 'app-story-form-render-retorno',
  imports: [FormDialog, FormDialogActions, InputComponent, ButtonComponent, ReactiveFormsModule],
  template: `<section #destino role="region" aria-label="Destino estable del formulario" tabindex="-1">
    <p>Modelo: {{ limite.value }}; campo independiente: {{ plazo.value }}</p>
    @if (origenVisible()) {
      <app-button (buttonClick)="abrir()">Abrir 0 a 500</app-button>
    }
    <app-button variant="outline" (buttonClick)="abierto.set(true)">Reabrir</app-button>
    <app-form-dialog title="Valores tras render" [(opened)]="abierto"
      [resolverFocoRetorno]="resolver" (cancelled)="abierto.set(false)">
      <app-input label="Limite" type="number" [formControl]="limite" />
      <app-input label="Plazo" type="number" [formControl]="plazo" />
      <app-form-dialog-actions>
        <app-button variant="outline" (buttonClick)="abierto.set(false)">Cancelar</app-button>
        <app-button (buttonClick)="origenVisible.set(false); abierto.set(false)">Retirar origen y cerrar</app-button>
      </app-form-dialog-actions>
    </app-form-dialog>
  </section>`,
})
class HistoriaFormularioRenderRetorno {
  readonly destino = viewChild.required<ElementRef<HTMLElement>>('destino');
  readonly limite = new FormControl(0, { nonNullable: true });
  readonly plazo = new FormControl(35, { nonNullable: true });
  readonly abierto = signal(false);
  readonly origenVisible = signal(true);
  readonly resolver = () => this.destino().nativeElement;
  abrir(): void { this.limite.setValue(500); this.abierto.set(true); }
}

export const AperturaTrasRenderYRetorno: Story = {
  decorators: [moduleMetadata({ imports: [HistoriaFormularioRenderRetorno] })],
  render: () => ({ template: '<app-story-form-render-retorno />' }),
};
