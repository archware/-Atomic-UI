import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionComponent } from '../../atoms/version/version.component';
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
  imports: [CommonModule, VersionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer
      class="atomic-footer"
      [class]="'atomic-footer--' + variant()"
      [attr.aria-label]="accessibleLabel()">
      @if (variant() === 'simple') {
        <div class="atomic-footer__container atomic-footer__container--bottom">
          <ng-container *ngTemplateOutlet="copyrightTemplate"></ng-container>
          <ng-container *ngTemplateOutlet="versionTemplate"></ng-container>
        </div>
      }

      @if (variant() === 'inline') {
        <div class="atomic-footer__container atomic-footer__container--stacked">
          @if (socialLinks().length > 0 || legalLinks().length > 0) {
            <div class="atomic-footer__inline-top">
              <ng-container *ngTemplateOutlet="social"></ng-container>
              <ng-container *ngTemplateOutlet="legal"></ng-container>
            </div>
          }
          <div class="atomic-footer__bottom-row">
            <ng-container *ngTemplateOutlet="copyrightTemplate"></ng-container>
            <ng-container *ngTemplateOutlet="versionTemplate"></ng-container>
          </div>
        </div>
      }

      @if (variant() === 'columns') {
        <div class="atomic-footer__container atomic-footer__container--stacked">
          <div class="atomic-footer__columns">
            <div class="atomic-footer__company">
              <h3 class="atomic-footer__logo">{{ companyName() }}</h3>
              @if (description()) {
                <p class="atomic-footer__description">{{ description() }}</p>
              }
            </div>

            @if (legalLinks().length > 0) {
              <div class="atomic-footer__column">
                <h4 class="atomic-footer__column-title">{{ legalTitle() }}</h4>
                <ng-container *ngTemplateOutlet="legal"></ng-container>
              </div>
            }

            @if (socialLinks().length > 0) {
              <div class="atomic-footer__column">
                <h4 class="atomic-footer__column-title">{{ socialTitle() }}</h4>
                <ng-container *ngTemplateOutlet="social; context: { vertical: true }"></ng-container>
              </div>
            }
          </div>

          <div class="atomic-footer__bottom-row">
            <ng-container *ngTemplateOutlet="copyrightTemplate"></ng-container>
            <ng-container *ngTemplateOutlet="versionTemplate"></ng-container>
          </div>
        </div>
      }
    </footer>

    <ng-template #social let-vertical="vertical">
      @if (socialLinks().length > 0) {
        <nav
          class="atomic-footer__social"
          [class.atomic-footer__social--vertical]="vertical"
          [attr.aria-label]="socialTitle()">
          @for (link of socialLinks(); track link.url) {
            <a
              class="atomic-footer__social-link"
              [class.atomic-footer__social-link--with-text]="vertical"
              [href]="link.url"
              target="_blank"
              rel="noopener noreferrer"
              [attr.aria-label]="getSocialLabel(link)">
              <i [class]="getSocialIcon(link.platform)" aria-hidden="true"></i>
              @if (vertical) {
                <span>{{ getSocialLabel(link) }}</span>
              }
            </a>
          }
        </nav>
      }
    </ng-template>

    <ng-template #legal>
      @if (legalLinks().length > 0) {
        <nav class="atomic-footer__legal" [attr.aria-label]="legalTitle()">
          @for (link of legalLinks(); track link.url; let last = $last) {
            <a class="atomic-footer__legal-link" [href]="link.url">{{ link.label }}</a>
            @if (!last) {
              <span class="atomic-footer__separator" aria-hidden="true">·</span>
            }
          }
        </nav>
      }
    </ng-template>

    <ng-template #copyrightTemplate>
      <span class="atomic-footer__copyright">
        <span>{{ copyrightLine }}</span>
        @if (supportText()) {
          <span class="atomic-footer__separator" aria-hidden="true">{{ supportSeparator() }}</span>
          <span>{{ supportText() }}</span>
        }
      </span>
    </ng-template>

    <ng-template #versionTemplate>
      @if (showVersion()) {
        <app-version
          [version]="versionService?.versionInfo()?.version || version()"
          [environment]="versionService?.versionInfo()?.environment || environment()"
          [showBuildDate]="showBuildDate()"
          [buildDate]="versionService?.versionInfo()?.buildDate || buildDate()"
          variant="badge">
        </app-version>
      }
    </ng-template>
  `,
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  public readonly versionService = inject(AppVersionService, { optional: true });

  readonly variant = input<FooterVariant>('inline');
  readonly accessibleLabel = input('Pie de página');
  readonly companyName = input('Hospital Regional Ayacucho');
  readonly year = input(new Date().getFullYear());
  readonly copyrightText = input('Todos los derechos reservados.');
  readonly copyrightSeparator = input(' - ');
  readonly supportText = input('Soporte: Sistemas de Información');
  readonly supportSeparator = input('|');
  readonly description = input('');
  readonly legalTitle = input('Enlaces legales');
  readonly socialTitle = input('Redes sociales');
  readonly showVersion = input(true);
  readonly showBuildDate = input(false);
  readonly version = input('Beta');
  readonly environment = input('BETA');
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
