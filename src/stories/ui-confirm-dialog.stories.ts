import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { ConfirmDialogComponent } from '../app/shared/ui/organisms/confirm-dialog/confirm-dialog.component';
import { type ConfirmDialogResult } from '../app/shared/ui/organisms/confirm-dialog/confirm-dialog.models';
import { ConfirmDialogService } from '../app/shared/ui/organisms/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog-demo',
  standalone: true,
  imports: [ConfirmDialogComponent, ButtonComponent, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-button variant="danger" (buttonClick)="abrirDeclarativo()">
      Abrir confirmación declarativa
    </app-button>
    <app-button variant="outline" (buttonClick)="abrirPorServicio()">
      Abrir vía servicio
    </app-button>

    <app-confirm-dialog
      title="Eliminar registro"
      subtitle="Acción irreversible"
      message="El elemento seleccionado se retirará del catálogo activo."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      tone="danger"
      [open]="abiertoDeclarativo()"
      (closed)="registrarCierre($event)"
    />

    <app-confirm-dialog [useService]="true" />

    @if (ultimoResultado()) {
      <app-alert kind="info" title="Último resultado">
        {{ ultimoResultado() }}
      </app-alert>
    }
  `,
})
class ConfirmDialogDemoComponent {
  private readonly confirmService = inject(ConfirmDialogService);
  readonly abiertoDeclarativo = signal(false);
  readonly ultimoResultado = signal('');

  abrirDeclarativo(): void {
    this.abiertoDeclarativo.set(true);
  }

  registrarCierre(result: ConfirmDialogResult): void {
    this.abiertoDeclarativo.set(false);
    this.ultimoResultado.set(`Motivo: ${result.reason}, confirmado: ${String(result.confirmed)}`);
  }

  async abrirPorServicio(): Promise<void> {
    const result = await this.confirmService.confirm({
      title: 'Confirmar cierre de lote',
      message: 'Las operaciones pendientes quedarán bloqueadas para edición.',
      tone: 'warning',
      confirmLabel: 'Cerrar lote',
    });
    this.ultimoResultado.set(`Cola: motivo=${result.reason}, confirmado=${String(result.confirmed)}`);
  }
}

const meta: Meta<ConfirmDialogDemoComponent> = {
  id: 'organisms-confirm-dialog',
  title: '3. Organisms/ConfirmDialog',
  component: ConfirmDialogDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ConfirmDialogDemoComponent>;

export const Default: Story = {};
