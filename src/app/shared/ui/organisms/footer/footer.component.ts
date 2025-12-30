import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'github' | 'youtube';
  url: string;
}

export interface LegalLink {
  label: string;
  url: string;
}

export type FooterVariant = 'simple' | 'inline' | 'columns';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer" [class]="'footer--' + variant">
      <!-- SIMPLE: Solo copyright -->
      @if (variant === 'simple') {
        <div class="footer__simple">
          <p class="footer__copyright">© {{ year }} {{ companyName }}. {{ copyrightText | translate }}</p>
        </div>
      }

      <!-- INLINE: Redes + links en una fila -->
      @if (variant === 'inline') {
        <div class="footer__inline">
          <div class="footer__inline-top">
            <!-- Social Links -->
            @if (socialLinks.length > 0) {
              <div class="footer__social">
                @for (social of socialLinks; track social.platform) {
                  <a [href]="social.url" target="_blank" rel="noopener noreferrer" class="footer__social-link" [attr.aria-label]="social.platform">
                    <i [class]="getSocialIcon(social.platform)"></i>
                  </a>
                }
              </div>
            }

            <!-- Legal Links -->
            @if (legalLinks.length > 0) {
              <nav class="footer__legal">
                @for (link of legalLinks; track link.url; let last = $last) {
                  <a [href]="link.url" class="footer__legal-link">{{ link.label | translate }}</a>
                  @if (!last) {
                    <span class="footer__separator">·</span>
                  }
                }
              </nav>
            }
          </div>
          <p class="footer__copyright">© {{ year }} {{ companyName }}</p>
        </div>
      }

      <!-- COLUMNS: Logo + columnas + redes -->
      @if (variant === 'columns') {
        <div class="footer__columns">
          <div class="footer__columns-content">
            <!-- Company Info -->
            <div class="footer__company">
              <h3 class="footer__logo">{{ companyName }}</h3>
              @if (description) {
                <p class="footer__description">{{ description | translate }}</p>
              }
            </div>

            <!-- Legal Links Column -->
            @if (legalLinks.length > 0) {
              <div class="footer__column">
                <h4 class="footer__column-title">{{ 'FOOTER.LEGAL' | translate }}</h4>
                <nav class="footer__column-links">
                  @for (link of legalLinks; track link.url) {
                    <a [href]="link.url" class="footer__column-link">{{ link.label | translate }}</a>
                  }
                </nav>
              </div>
            }

            <!-- Social Links Column -->
            @if (socialLinks.length > 0) {
              <div class="footer__column">
                <h4 class="footer__column-title">{{ 'FOOTER.FOLLOW_US' | translate }}</h4>
                <div class="footer__social footer__social--vertical">
                  @for (social of socialLinks; track social.platform) {
                    <a [href]="social.url" target="_blank" rel="noopener noreferrer" class="footer__social-link footer__social-link--with-text">
                      <i [class]="getSocialIcon(social.platform)"></i>
                      <span>{{ social.platform | titlecase }}</span>
                    </a>
                  }
                </div>
              </div>
            }
          </div>

          <div class="footer__bottom">
            <p class="footer__copyright">© {{ year }} {{ companyName }}. {{ copyrightText | translate }}</p>
          </div>
        </div>
      }
    </footer>
  `,
  styles: [`
    .footer {
      width: 100%;
      background: var(--surface-section);
      color: var(--text-color-secondary);
      border-top: 1px solid var(--border-color);
    }

    /* === SIMPLE === */
    .footer--simple {
      padding: var(--space-4) var(--space-6);
      text-align: center;
    }

    .footer__copyright {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--text-color-muted);
    }

    /* === INLINE === */
    .footer--inline {
      padding: var(--space-6);
    }

    .footer__inline-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .footer__social {
      display: flex;
      gap: var(--space-3);
    }

    .footer__social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--space-9, 2.25rem);
      height: var(--space-9, 2.25rem);
      background: var(--surface-hover);
      border-radius: 50%;
      color: var(--text-color-secondary);
      font-size: var(--text-md);
      transition: all 200ms ease;
    }

    .footer__social-link:hover {
      background: var(--primary-color);
      color: var(--text-color-on-primary);
      transform: translateY(-2px);
    }

    .footer__legal {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
    }

    .footer__legal-link {
      color: var(--text-color-secondary);
      font-size: var(--text-sm);
      text-decoration: none;
      transition: color 150ms ease;
    }

    .footer__legal-link:hover {
      color: var(--primary-color);
    }

    .footer__separator {
      color: var(--text-color-muted);
    }

    .footer--inline .footer__copyright {
      text-align: center;
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-color);
    }

    /* === COLUMNS === */
    .footer--columns {
      padding: var(--space-12) var(--space-6) var(--space-6);
    }

    .footer__columns-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--space-8);
      margin-bottom: var(--space-8);
    }

    .footer__company {
      max-width: 300px;
    }

    .footer__logo {
      margin: 0 0 var(--space-3);
      font-size: var(--text-xl);
      font-weight: 700;
      color: var(--text-color);
    }

    .footer__description {
      margin: 0;
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--text-color-secondary);
    }

    .footer__column-title {
      margin: 0 0 var(--space-4);
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .footer__column-links {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .footer__column-link {
      color: var(--text-color-secondary);
      font-size: var(--text-sm);
      text-decoration: none;
      transition: color 150ms ease;
    }

    .footer__column-link:hover {
      color: var(--primary-color);
    }

    .footer__social--vertical {
      flex-direction: column;
      gap: var(--space-2);
    }

    .footer__social-link--with-text {
      width: auto;
      height: auto;
      padding: var(--space-1) 0;
      background: transparent;
      border-radius: 0;
      gap: var(--space-2);
      font-size: var(--text-sm);
      justify-content: flex-start;
    }

    .footer__social-link--with-text:hover {
      background: transparent;
      color: var(--primary-color);
      transform: none;
    }

    .footer__social-link--with-text i {
      width: var(--space-5);
      text-align: center;
    }

    .footer__bottom {
      padding-top: var(--space-6);
      border-top: 1px solid var(--border-color);
      text-align: center;
    }

    /* === RESPONSIVE === */
    @media (max-width: 768px) {
      .footer__inline-top {
        flex-direction: column;
        text-align: center;
      }

      .footer__columns-content {
        grid-template-columns: 1fr;
        gap: var(--space-6);
        text-align: center;
      }

      .footer__company {
        max-width: 100%;
      }

      .footer__social {
        justify-content: center;
      }

      .footer__social--vertical {
        align-items: center;
      }

      .footer__column-links {
        align-items: center;
      }
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-section, --border-color, etc. ya tienen valores
     * apropiados para temas oscuros.
     */
  `]
})
export class FooterComponent {
  @Input() variant: FooterVariant = 'simple';
  @Input() companyName = 'Company';
  @Input() year = new Date().getFullYear();
  @Input() copyrightText = 'FOOTER.ALL_RIGHTS_RESERVED';
  @Input() description = '';
  @Input() socialLinks: SocialLink[] = [];
  @Input() legalLinks: LegalLink[] = [];

  getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      facebook: 'fa-brands fa-facebook-f',
      twitter: 'fa-brands fa-x-twitter',
      instagram: 'fa-brands fa-instagram',
      linkedin: 'fa-brands fa-linkedin-in',
      github: 'fa-brands fa-github',
      youtube: 'fa-brands fa-youtube'
    };
    return icons[platform] || 'fa-solid fa-link';
  }
}
