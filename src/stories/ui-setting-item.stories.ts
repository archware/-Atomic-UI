import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { ToggleComponent } from '../app/shared/ui/atoms/toggle/toggle.component';
import { SettingItemComponent } from '../app/shared/ui/molecules/setting-item/setting-item.component';

@Component({
  selector: 'app-setting-item-demo',
  standalone: true,
  imports: [SettingItemComponent, ToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-setting-item
      title="Autenticación en dos pasos"
      description="Exige verificación adicional en cada inicio de sesión."
    >
      <app-toggle label="Habilitar 2FA" />
    </app-setting-item>
  `,
})
class SettingItemDemoComponent {}

const meta: Meta<SettingItemDemoComponent> = {
  id: 'molecules-setting-item',
  title: '2. Molecules/SettingItem',
  component: SettingItemDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SettingItemDemoComponent>;

export const Default: Story = {};
