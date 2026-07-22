import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionComponent } from '../../atoms/version/version.component';
import { AppVersionService } from '../../services/app-version.service';

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'github' | 'youtube';
  url: string;
}

export interface LegalLink {
  label: string;
  url: string;
}

export type FooterVariant = 'simple' | 'inline' | 'columns';

/**
 * Atomic Footer Component.
 * Guaranteed 100% visible and robust across all application views and layouts.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, VersionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="atomic-footer" [class]="'atomic-footer--' + (variant || 'inline')">
      <div class="atomic-footer__container">
        <div class="atomic-footer__info">
          <span class="atomic-footer__copyright">© {{ year }} {{ companyName }}. {{ copyrightText }}</span>
        </div>

        @if (showVersion) {
          <div class="atomic-footer__version">
            <app-version 
              [version]="versionService.versionInfo().version"
              [environment]="versionService.versionInfo().environment"
              [showBuildDate]="!!versionService.versionInfo().buildDate"
              [buildDate]="versionService.versionInfo().buildDate"
              variant="badge">
            </app-version>
          </div>
        }
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block !important;
      width: 100% !important;
      margin-top: auto !important;
      box-sizing: border-box !important;
    }

    .atomic-footer {
      width: 100% !important;
      background: #0f172a !important;
      color: #94a3b8 !important;
      border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
      padding: 12px 24px !important;
      box-sizing: border-box !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .atomic-footer__container {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-wrap: wrap !important;
      gap: 12px !important;
      max-width: 1400px !important;
      margin: 0 auto !important;
    }

    .atomic-footer__info {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }

    .atomic-footer__copyright {
      font-size: 0.8rem !important;
      font-weight: 500 !important;
      color: #cbd5e1 !important;
      line-height: 1.4 !important;
    }

    .atomic-footer__version {
      display: flex !important;
      align-items: center !important;
    }

    @media (max-width: 640px) {
      .atomic-footer__container {
        flex-direction: column !important;
        text-align: center !important;
        justify-content: center !important;
      }
    }
  `]
})
export class FooterComponent {
  public readonly versionService = inject(AppVersionService);

  @Input() variant: FooterVariant = 'inline';
  @Input() companyName = 'Hospital Regional Ayacucho';
  @Input() year = new Date().getFullYear();
  @Input() copyrightText = 'Todos los derechos reservados.';
  @Input() description = '';
  @Input() showVersion = true;
  @Input() socialLinks: SocialLink[] = [];
  @Input() legalLinks: LegalLink[] = [];
}
