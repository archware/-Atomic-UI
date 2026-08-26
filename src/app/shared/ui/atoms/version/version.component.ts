import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type VersionVariant = 'pill' | 'badge' | 'text' | 'compact';

/**
 * Reusable version indicator component for footers, topbars, and application info panels.
 *
 * La visibilidad la dan los tokens del tema, no colores fijos. La promesa
 * anterior -«visible en todos los temas gracias a colores solidos de respaldo»-
 * era exactamente al reves: el slate oscuro y el texto blanco estaban escritos a
 * mano, asi que la chapa se pintaba oscura sobre el pie claro donde de verdad
 * se usa. Un color quemado no sobrevive al cambio de tema; lo unico que lo
 * sobrevive es el token.
 */
@Component({
  selector: 'app-version',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atomic-version" [class]="'atomic-version--' + (variant() || 'badge')">
      @if (variant() === 'pill' || variant() === 'badge' || !variant()) {
        <span class="atomic-version__dot" [class]="'atomic-version__dot--' + (environment() || 'beta').toLowerCase()"></span>
      }

      @if (appName()) {
        <span class="atomic-version__name">{{ appName() }}</span>
      }

      <span class="atomic-version__number">{{ version() || 'v1.1.0' }}</span>

      @if (environment()) {
        <span class="atomic-version__env" [class]="'atomic-version__env--' + (environment() || 'beta').toLowerCase()">
          {{ environment() }}
        </span>
      }

      @if (showBuildDate() && buildDate()) {
        <span class="atomic-version__date">({{ buildDate() }})</span>
      }
    </div>
  `,
  styleUrl: './version.component.css'
})
export class VersionComponent {
  readonly version = input('v1.1.0');
  readonly appName = input('');
  readonly environment = input('BETA');
  readonly variant = input<VersionVariant>('badge');
  readonly showBuildDate = input(false);
  readonly buildDate = input('');
}
