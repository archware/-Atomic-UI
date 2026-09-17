import { Component, ChangeDetectionStrategy, input } from '@angular/core';


export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'current';

/**
 * SpinnerComponent — Indicador de carga inline minimalista.
 * Usa solo CSS; sin FontAwesome, sin SVG externo.
 * Ideal para botones, inputs y espacios reducidos.
 *
 * @example
 * ```html
 * <!-- En un botón -->
 * <app-button [disabled]="loading">
 *   <app-spinner *ngIf="loading" size="sm" variant="white"></app-spinner>
 *   {{ loading ? 'Guardando…' : 'Guardar' }}
 * </app-button>
 *
 * <!-- Standalone -->
 * <app-spinner size="md" variant="primary"></app-spinner>
 * ```
 */
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly variant = input<SpinnerVariant>('primary');
  readonly label = input('Cargando…');
}
