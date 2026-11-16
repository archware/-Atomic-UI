import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import { ToggleComponent } from '../app/shared/ui/atoms/toggle/toggle.component';
import { CardComponent } from '../app/shared/ui/molecules/card/card.component';
import { SettingItemComponent } from '../app/shared/ui/molecules/setting-item/setting-item.component';
import { PaginaAjustesComponent } from '../app/shared/ui/templates/pagina-ajustes/pagina-ajustes.component';

@Component({
  selector: 'app-pagina-ajustes-demo',
  standalone: true,
  imports: [
    PaginaAjustesComponent,
    CardComponent,
    SettingItemComponent,
    ToggleComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-ajustes>
      <div ajustes-aside>
        <app-card title="Perfil Institucional" subtitle="SSIT CONSULTING E.I.R.L.">
          <app-button variant="outline" size="sm">Cambiar clave</app-button>
        </app-card>
      </div>
      <app-card title="Preferencias Generales" subtitle="Configuración de la sesión">
        <app-setting-item
          title="Notificaciones del sistema"
          description="Recibir alertas operativas al completar operaciones."
        >
          <app-toggle label="Activar alertas" />
        </app-setting-item>
      </app-card>
    </app-pagina-ajustes>
  `,
})
class PaginaAjustesDemoComponent {}

const meta: Meta<PaginaAjustesDemoComponent> = {
  id: 'templates-pagina-ajustes',
  title: '4. Templates/Pagina Ajustes',
  component: PaginaAjustesDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PaginaAjustesDemoComponent>;

export const Default: Story = {};
