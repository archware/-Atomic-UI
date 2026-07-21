import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type VersionVariant = 'pill' | 'badge' | 'text' | 'compact';

/**
 * Reusable version indicator component for footers, topbars, and application info panels.
 */
@Component({
  selector: 'app-version',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atomic-version" [class]="'atomic-version--' + variant">
      @if (variant === 'pill' || variant === 'badge') {
        <span class="atomic-version__dot" [class]="'atomic-version__dot--' + environment.toLowerCase()"></span>
      }
      
      @if (appName) {
        <span class="atomic-version__name">{{ appName }}</span>
      }
      
      <span class="atomic-version__number">{{ version }}</span>

      @if (environment) {
        <span class="atomic-version__env" [class]="'atomic-version__env--' + environment.toLowerCase()">
          {{ environment }}
        </span>
      }

      @if (showBuildDate && buildDate) {
        <span class="atomic-version__date">({{ buildDate }})</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .atomic-version {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2, 8px);
      font-family: var(--font-family, system-ui, -apple-system, sans-serif);
      font-size: var(--text-xs, 0.75rem);
      line-height: 1;
      color: var(--text-color-secondary, rgba(255, 255, 255, 0.6));
      user-select: none;
      transition: all 0.2s ease;
    }

    /* === PILL VARIANT === */
    .atomic-version--pill {
      padding: var(--space-1, 4px) var(--space-3, 12px);
      background: var(--surface-hover, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: var(--radius-full, 9999px);
    }

    /* === BADGE VARIANT === */
    .atomic-version--badge {
      padding: var(--space-1, 4px) var(--space-2, 8px);
      background: var(--surface-section, rgba(0, 0, 0, 0.2));
      border: 1px solid var(--border-color-light, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-sm, 4px);
    }

    /* === TEXT VARIANT === */
    .atomic-version--text {
      background: transparent;
      border: none;
      padding: 0;
    }

    /* === COMPACT VARIANT === */
    .atomic-version--compact {
      gap: var(--space-1, 4px);
      font-size: 0.7rem;
      opacity: 0.8;
    }

    /* Elements */
    .atomic-version__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--success-color, #10b981);
      box-shadow: 0 0 6px var(--success-color, #10b981);
    }

    .atomic-version__dot--dev {
      background-color: var(--warning-color, #f59e0b);
      box-shadow: 0 0 6px var(--warning-color, #f59e0b);
    }

    .atomic-version__dot--beta {
      background-color: var(--info-color, #3b82f6);
      box-shadow: 0 0 6px var(--info-color, #3b82f6);
    }

    .atomic-version__dot--qa, .atomic-version__dot--staging {
      background-color: #8b5cf6;
      box-shadow: 0 0 6px #8b5cf6;
    }

    .atomic-version__name {
      font-weight: 500;
      color: var(--text-color-muted, rgba(255, 255, 255, 0.5));
    }

    .atomic-version__number {
      font-weight: 700;
      letter-spacing: 0.03em;
      color: var(--primary-color, var(--text-color, #ffffff));
    }

    .atomic-version__env {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      background: var(--surface-elevated, rgba(255, 255, 255, 0.15));
      color: var(--text-color, #ffffff);
    }

    .atomic-version__env--prod {
      background: var(--success-color, #10b981);
      color: #ffffff;
    }

    .atomic-version__env--dev {
      background: var(--warning-color, #f59e0b);
      color: #000000;
    }

    .atomic-version__env--beta {
      background: #3b82f6;
      color: #ffffff;
    }

    .atomic-version__env--qa, .atomic-version__env--staging {
      background: #8b5cf6;
      color: #ffffff;
    }

    .atomic-version__date {
      color: var(--text-color-muted, rgba(255, 255, 255, 0.4));
      font-size: 0.65rem;
    }
  `]
})
export class VersionComponent {
  @Input() version = 'v1.0.0';
  @Input() appName = '';
  @Input() environment = '';
  @Input() variant: VersionVariant = 'pill';
  @Input() showBuildDate = false;
  @Input() buildDate = '';
}
