import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { CardComponent } from '../app/shared/ui/molecules/card/card.component';
import { TextComponent } from '../app/shared/ui/atoms/text/text.component';
import { type PestanaDetalle } from '../app/shared/ui/templates/modelos-crud';
import { PaginaDetallePestanas } from '../app/shared/ui/templates/pagina-detalle-pestanas/pagina-detalle-pestanas';

@Component({
  selector: 'app-pagina-detalle-pestanas-demo',
  standalone: true,
  imports: [PaginaDetallePestanas, CardComponent, TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-detalle-pestanas
      titulo="Expediente #EXP-2026-041"
      subtitulo="Consulta integral de movimientos y estado"
      eyebrow="Detalle operativo"
      [pestanas]="pestanas"
      (alCambiarPestana)="pestanaActiva.set($event)"
    >
      <ng-template #pestana let-clave>
        @if (clave === 'resumen') {
          <app-card title="Datos Generales">
            <app-text variant="body">Expediente activo dentro del flujo de atención.</app-text>
          </app-card>
        } @else {
          <app-card title="Historial de Auditoría">
            <app-text variant="body">Última actualización registrada sin observaciones.</app-text>
          </app-card>
        }
      </ng-template>
    </app-pagina-detalle-pestanas>
  `,
})
class PaginaDetallePestanasDemoComponent {
  readonly pestanas: readonly PestanaDetalle[] = [
    { clave: 'resumen', titulo: 'Resumen', icono: 'fa-solid fa-file-lines', activa: true },
    { clave: 'historial', titulo: 'Historial', icono: 'fa-solid fa-clock-rotate-left' },
  ];
  readonly pestanaActiva = signal('resumen');
}

const meta: Meta<PaginaDetallePestanasDemoComponent> = {
  id: 'templates-pagina-detalle-pestanas',
  title: '4. Templates/Pagina Detalle Pestanas',
  component: PaginaDetallePestanasDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PaginaDetallePestanasDemoComponent>;

export const Default: Story = {};
