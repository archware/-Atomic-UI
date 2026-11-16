import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { TextComponent } from '../app/shared/ui/atoms/text/text.component';
import { AuthBannerComponent } from '../app/shared/ui/molecules/auth-banner/auth-banner.component';

@Component({
  selector: 'app-auth-banner-demo',
  standalone: true,
  imports: [AuthBannerComponent, TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-banner>
      <app-text variant="h2" color="white">Plataforma Corporativa</app-text>
      <app-text variant="body" color="white">
        Acceso unificado con trazabilidad y estándares institucionales.
      </app-text>
    </app-auth-banner>
  `,
})
class AuthBannerDemoComponent {}

const meta: Meta<AuthBannerDemoComponent> = {
  id: 'molecules-auth-banner',
  title: '2. Molecules/AuthBanner',
  component: AuthBannerDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AuthBannerDemoComponent>;

export const Default: Story = {};
