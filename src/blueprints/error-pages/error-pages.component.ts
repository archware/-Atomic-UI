import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  TextComponent,
  ScrollOverlayComponent,
  RowComponent,
} from '@shared/ui';

export type ErrorCode = 400 | 401 | 403 | 404 | 500 | 503;

export interface ErrorPageConfig {
  code: ErrorCode;
  title: string;
  description: string;
  icon: string;
  primaryAction?: { label: string; route: string };
  secondaryAction?: { label: string; action: () => void };
}

const ERROR_DEFAULTS: Record<ErrorCode, Omit<ErrorPageConfig, 'primaryAction' | 'secondaryAction'>> = {
  400: {
    code: 400,
    title: 'Solicitud inválida',
    description: 'La solicitud enviada no es válida. Verifica los datos ingresados e intenta de nuevo.',
    icon: '⚠️',
  },
  401: {
    code: 401,
    title: 'No autorizado',
    description: 'No tienes credenciales para acceder a este recurso. Inicia sesión para continuar.',
    icon: '🔐',
  },
  403: {
    code: 403,
    title: 'Acceso denegado',
    description: 'No tienes permisos para acceder a esta página. Contacta a tu administrador.',
    icon: '🚫',
  },
  404: {
    code: 404,
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o fue movida. Verifica la URL o vuelve al inicio.',
    icon: '🔍',
  },
  500: {
    code: 500,
    title: 'Error interno del servidor',
    description: 'Ocurrió un error inesperado en el servidor. Por favor intenta más tarde.',
    icon: '💥',
  },
  503: {
    code: 503,
    title: 'Servicio no disponible',
    description: 'El servicio está temporalmente fuera de línea por mantenimiento. Vuelve en unos minutos.',
    icon: '🔧',
  },
};

/**
 * ErrorPagesComponent — Página de error genérica para 400/401/403/404/500/503
 *
 * @usage
 * ```html
 * <!-- En app.routes.ts -->
 * { path: '**', component: ErrorPagesComponent, data: { code: 404 } }
 * { path: '500', component: ErrorPagesComponent, data: { code: 500 } }
 * ```
 *
 * @usage
 * ```html
 * <!-- En template -->
 * <app-error-pages [code]="404"></app-error-pages>
 * <app-error-pages [code]="500" title="Error personalizado"></app-error-pages>
 * ```
 */
@Component({
  selector: 'app-error-pages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    TextComponent,
    ScrollOverlayComponent,
    RowComponent,
  ],
  template: `
    <app-scroll-overlay class="so-block h-screen w-full" [skipTableDetection]="true">
    <div class="error-page">
      <div class="error-container">

        <!-- Icono / Ilustración -->
        <div class="error-icon" role="img" [attr.aria-label]="'Error ' + resolvedCode()">
          {{ resolvedIcon() }}
        </div>

        <!-- Código HTTP -->
        <div class="error-code">{{ resolvedCode() }}</div>

        <!-- Título -->
        <app-text variant="h2" class="error-title">
          {{ resolvedTitle() }}
        </app-text>

        <!-- Descripción -->
        <app-text variant="body" color="muted" class="error-description">
          {{ resolvedDescription() }}
        </app-text>

        <!-- Acciones -->
        <app-row gap="1rem" class="error-actions">
          <app-button
            variant="primary"
            (click)="onPrimaryAction()"
          >
            <i class="fa-solid fa-house" icon-left></i>
            {{ primaryActionLabel() }}
          </app-button>

          @if (showSecondaryAction()) {
            <app-button variant="ghost" (click)="onSecondaryAction()">
              <i class="fa-solid fa-arrow-rotate-right" icon-left></i>
              Reintentar
            </app-button>
          }

          <app-button variant="ghost" (click)="goBack()">
            <i class="fa-solid fa-arrow-left" icon-left></i>
            Volver
          </app-button>
        </app-row>

        <!-- Info técnica (solo en development) -->
        @if (showTechnicalInfo() && technicalMessage()) {
          <details class="error-technical">
            <summary>Información técnica</summary>
            <code>{{ technicalMessage() }}</code>
          </details>
        }

      </div>
    </div>
    </app-scroll-overlay>
  `,
  styles: [`
    .error-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--page-background, var(--surface-background));
      padding: var(--space-8);
    }

    .error-container {
      max-width: 32.5rem;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .error-icon {
      font-size: 5rem;
      line-height: 1;
      animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .error-code {
      font-size: 7rem;
      font-weight: var(--font-weight-display);
      line-height: 1;
      color: var(--primary-color);
      opacity: 0.15;
      letter-spacing: -0.25rem;
      user-select: none;
    }

    .error-title {
      margin-top: calc(-1 * var(--space-8));
    }

    .error-description {
      max-width: 25rem;
    }

    .error-actions {
      margin-top: var(--space-2);
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-technical {
      margin-top: var(--space-6);
      text-align: left;
      background: var(--surface-section);
      border: var(--border-width-sm, 0.0625rem) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      width: 100%;
      font-size: 0.75rem;
    }

    .error-technical summary {
      cursor: pointer;
      color: var(--text-color-muted);
      margin-bottom: var(--space-2);
    }

    .error-technical code {
      font-family: monospace;
      color: var(--color-error);
      word-break: break-all;
    }

    @keyframes bounce-in {
      from { transform: scale(0.5); opacity: 0; }
      to   { transform: scale(1);   opacity: 1; }
    }

    @media (max-width: 30rem) {
      .error-code { font-size: 5rem; }
      .error-icon { font-size: 3.5rem; }
    }
  `],
})
export class ErrorPagesComponent {
  /** HTTP error code to display */
  readonly code = input<ErrorCode>(404);

  /** Override default title */
  readonly title = input<string | undefined>(undefined);

  /** Override default description */
  readonly description = input<string | undefined>(undefined);

  /** Override default icon */
  readonly icon = input<string | undefined>(undefined);

  /** Label for primary action button */
  readonly primaryActionLabel = input('Ir al inicio');

  /** Route for primary action */
  readonly primaryActionRoute = input('/');

  /** Show retry button (useful for 500, 503) */
  readonly showSecondaryAction = input(false);

  /** Show technical details section */
  readonly showTechnicalInfo = input(false);

  /** Technical error message for developers */
  readonly technicalMessage = input<string | undefined>(undefined);

  private readonly router = inject(Router, { optional: true });
  private readonly route = inject(ActivatedRoute, { optional: true });

  protected readonly resolvedCode = computed<ErrorCode>(() => {
    const routeCode = this.route?.snapshot?.data?.['code'];
    return typeof routeCode === 'number' ? (routeCode as ErrorCode) : this.code();
  });

  protected readonly resolvedTitle = computed<string>(() => {
    const code = this.resolvedCode();
    return this.title()?.trim() || ERROR_DEFAULTS[code]?.title || 'Error';
  });

  protected readonly resolvedDescription = computed<string>(() => {
    const code = this.resolvedCode();
    return this.description()?.trim() || ERROR_DEFAULTS[code]?.description || '';
  });

  protected readonly resolvedIcon = computed<string>(() => {
    const code = this.resolvedCode();
    return this.icon()?.trim() || ERROR_DEFAULTS[code]?.icon || '❌';
  });

  onPrimaryAction(): void {
    this.router?.navigate([this.primaryActionRoute()]);
  }

  onSecondaryAction(): void {
    window.location.reload();
  }

  goBack(): void {
    history.back();
  }
}

