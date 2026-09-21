import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionComponent } from '../../atoms/version/version.component';
import { LinkComponent } from '../../atoms/link/link.component';
import { AppVersionService } from '../../services/app-version.service';

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'github' | 'youtube';
  url: string;
  label?: string;
}

export interface LegalLink {
  label: string;
  url: string;
}

export type FooterVariant = 'simple' | 'inline' | 'columns';

/**
 * Pie de página genérico del sistema Atomic.
 *
 * El componente no depende de un proveedor de traducciones. El shell es quien
 * reserva su fila al final de la ventana; el footer sólo controla su contenido
 * y presentación para no competir con el contenedor que posee el scroll.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, VersionComponent, LinkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.css',
    templateUrl: './footer.component.html'
})
export class FooterComponent {
  public readonly versionService = inject(AppVersionService, { optional: true });

  readonly variant = input<FooterVariant>('inline');
  readonly accessibleLabel = input('Pie de página');
  readonly companyName = input('Suite Barracuda');
  readonly year = input(new Date().getFullYear());
  readonly copyrightText = input('Todos los derechos reservados.');
  readonly copyrightSeparator = input(' - ');
  readonly supportText = input('');
  readonly supportSeparator = input('|');
  readonly description = input('');
  readonly legalTitle = input('Enlaces legales');
  readonly socialTitle = input('Redes sociales');
  readonly showVersion = input(true);
  readonly showBuildDate = input(false);
  readonly version = input('v1.0.0');
  readonly environment = input('PROD');
  readonly buildDate = input('');
  readonly socialLinks = input<SocialLink[]>([]);
  readonly legalLinks = input<LegalLink[]>([]);

  get copyrightLine(): string {
    return `© ${this.year()} ${this.companyName()}${this.copyrightSeparator()}${this.copyrightText()}`;
  }

  getSocialIcon(platform: SocialLink['platform']): string {
    const icons: Record<SocialLink['platform'], string> = {
      facebook: 'fa-brands fa-facebook-f',
      twitter: 'fa-brands fa-x-twitter',
      instagram: 'fa-brands fa-instagram',
      linkedin: 'fa-brands fa-linkedin-in',
      github: 'fa-brands fa-github',
      youtube: 'fa-brands fa-youtube'
    };
    return icons[platform];
  }

  getSocialLabel(link: SocialLink): string {
    if (link.label) return link.label;
    const labels: Record<SocialLink['platform'], string> = {
      facebook: 'Facebook',
      twitter: 'X',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      youtube: 'YouTube'
    };
    return labels[link.platform];
  }
}
