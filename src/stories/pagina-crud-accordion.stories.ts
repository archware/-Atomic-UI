import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideTranslateService } from '@ngx-translate/core';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Alert } from '../app/shared/ui/molecules/alert/alert.component';
import { type DataTableColumn, type DataTableStatus } from '../app/shared/ui/organisms/data-table/data-table';
import { PaginaCrudAccordion, type EventoEntidadAccordion } from '../app/shared/ui/templates/pagina-crud-accordion/pagina-crud-accordion';
import { type EntidadAccordion } from '../app/shared/ui/templates/modelos-crud';

interface FilaConfirmacionDemostracion {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-pagina-crud-accordion-demostracion',
  imports: [PaginaCrudAccordion, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-crud-accordion
      titulo="Entidades de demostración"
      [entidades]="entidades"
      [columnasPorEntidad]="columnasPorEntidad"
      [filasPorEntidad]="filasPorEntidad"
      [estadoPorEntidad]="estadoPorEntidad"
      [totalPorEntidad]="totalPorEntidad"
      [acciones]="{ ver: false, editar: false, eliminar: true }"
      (alEliminar)="registrarSolicitud($event)"
    />
    <app-alert kind="info" title="Rastro de demostración">
      Solicitudes emitidas: {{ solicitudesEmitidas() }}. {{ ultimaSolicitud() }}
    </app-alert>
  `,
})
class PaginaCrudAccordionDemostracion {
  protected readonly entidades: readonly EntidadAccordion[] = [
    { clave: 'bancos', titulo: 'Bancos', abiertoInicial: true },
    { clave: 'billeteras', titulo: 'Billeteras' },
  ];
  protected readonly columnasPorEntidad: Readonly<Record<string, readonly DataTableColumn<FilaConfirmacionDemostracion>[]>> = {
    bancos: [{ key: 'nombre', header: 'Nombre' }],
    billeteras: [{ key: 'nombre', header: 'Nombre' }],
  };
  protected readonly filasPorEntidad: Readonly<Record<string, readonly FilaConfirmacionDemostracion[]>> = {
    bancos: [{ id: 'banco-demo', nombre: 'Banco de demostración' }],
    billeteras: [{ id: 'billetera-demo', nombre: 'Billetera de demostración' }],
  };
  protected readonly estadoPorEntidad: Readonly<Record<string, DataTableStatus>> = { bancos: 'success', billeteras: 'success' };
  protected readonly totalPorEntidad = { bancos: 1, billeteras: 1 };
  protected readonly solicitudesEmitidas = signal(0);
  protected readonly ultimaSolicitud = signal('Ninguna solicitud.');

  protected registrarSolicitud(evento: EventoEntidadAccordion<FilaConfirmacionDemostracion>): void {
    this.solicitudesEmitidas.update(total => total + 1);
    this.ultimaSolicitud.set(`Clave: ${evento.clave}; entidad: ${evento.datos.id}.`);
  }
}

const meta: Meta<PaginaCrudAccordionDemostracion> = {
  id: 'templates-pagina-crud-accordion',
  title: 'Catalogos/Confirmación del acordeón',
  component: PaginaCrudAccordionDemostracion,
  decorators: [applicationConfig({ providers: [provideTranslateService()] })],
};
export default meta;

export const ConfirmacionAccesible: StoryObj<PaginaCrudAccordionDemostracion> = {
  play: async ({ canvasElement }) => {
    const lienzo = within(canvasElement);
    const disparador = lienzo.getAllByRole('button', { name: 'Desactivar' })[0];
    await userEvent.click(disparador);
    const dialogo = await lienzo.findByRole('alertdialog');
    await expect(dialogo).toHaveAttribute('open');
    const titulo = dialogo.getAttribute('aria-labelledby')!;
    const descripcion = dialogo.getAttribute('aria-describedby')!;
    await expect(dialogo.querySelector(`[id="${titulo}"]`)).not.toBeNull();
    const mensaje = dialogo.querySelector<HTMLElement>(`[id="${descripcion}"]`)!;
    await expect(mensaje).not.toBeNull();
    await expect(dialogo).toHaveAccessibleName();
    await expect(dialogo).toHaveAccessibleDescription();
    const cancelar = within(dialogo).getByRole('button', { name: 'Cancelar' });
    await expect(cancelar).toHaveFocus();
    await userEvent.click(mensaje);
    await expect(dialogo).toHaveAttribute('open');
    await userEvent.click(cancelar);
    await waitFor(() => expect(dialogo).not.toHaveAttribute('open'));
    await expect(lienzo.getByText(/Solicitudes emitidas: 0/)).toBeInTheDocument();
    await waitFor(() => expect(disparador).toHaveFocus());
    await userEvent.click(disparador);
    const confirmar = within(dialogo).getByRole('button', { name: 'Desactivar' });
    await userEvent.click(confirmar);
    confirmar.click();
    await waitFor(() => expect(dialogo).not.toHaveAttribute('open'));
    await expect(lienzo.getByText(/Solicitudes emitidas: 1. Clave: bancos; entidad: banco-demo./)).toBeInTheDocument();
    await waitFor(() => expect(disparador).toHaveFocus());
  },
};
