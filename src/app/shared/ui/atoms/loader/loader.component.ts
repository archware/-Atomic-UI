import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'gradient' | 'orbit';
export type LoaderSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  /** ID único para evitar conflictos de SVG gradient */
  private readonly uniqueId = Math.random().toString(36).substring(2, 9);
  readonly spinnerId = `spinner-${this.uniqueId}`;
  readonly ringId = `ring-${this.uniqueId}`;

  /** Variante del loader: spinner, dots, pulse, bars, gradient */
  readonly variant = input<LoaderVariant>('spinner');

  /** Tamaño del loader: sm, md (default), lg */
  readonly size = input<LoaderSize>('md');
}
