import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'gradient' | 'orbit';
export type LoaderSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader-container" [class]="'loader-' + variant()" [class.loader-sm]="size() === 'sm'" [class.loader-lg]="size() === 'lg'">

      <!-- Spinner con degradado -->
      @if (variant() === 'spinner') {
        <div class="gradient-spinner">
          <svg viewBox="0 0 50 50">
            <defs>
              <linearGradient [attr.id]="spinnerId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" class="gradient-1" />
                <stop offset="25%" class="gradient-2" />
                <stop offset="50%" class="gradient-3" />
                <stop offset="75%" class="gradient-4" />
                <stop offset="100%" class="gradient-5" />
              </linearGradient>
            </defs>
            <circle class="spinner-track" cx="25" cy="25" r="20" />
            <circle 
              cx="25" cy="25" r="20" 
              fill="none" 
              [attr.stroke]="'url(#' + spinnerId + ')'" 
              stroke-width="4"
              stroke-linecap="round"
              stroke-dasharray="75 50"
            />
          </svg>
        </div>
      }

      <!-- 5 Dots con degradado -->
      @if (variant() === 'dots') {
        <div class="dots">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
          <span class="dot dot-4"></span>
          <span class="dot dot-5"></span>
        </div>
      }

      <!-- Pulse con degradado multicolor -->
      @if (variant() === 'pulse') {
        <div class="pulse">
          <div class="pulse-ring pulse-ring-1"></div>
          <div class="pulse-ring pulse-ring-2"></div>
          <div class="pulse-ring pulse-ring-3"></div>
          <div class="pulse-core"></div>
        </div>
      }

      <!-- 5 Barras con degradado -->
      @if (variant() === 'bars') {
        <div class="bars">
          <span class="bar bar-1"></span>
          <span class="bar bar-2"></span>
          <span class="bar bar-3"></span>
          <span class="bar bar-4"></span>
          <span class="bar bar-5"></span>
        </div>
      }

      <!-- Gradiente circular animado con cónica -->
      @if (variant() === 'gradient') {
        <div class="gradient-ring">
          <svg viewBox="0 0 50 50">
            <defs>
              <linearGradient [attr.id]="ringId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" class="gradient-1" />
                <stop offset="25%" class="gradient-2" />
                <stop offset="50%" class="gradient-3" />
                <stop offset="75%" class="gradient-4" />
                <stop offset="100%" class="gradient-5" />
              </linearGradient>
            </defs>
            <circle 
              cx="25" cy="25" r="20" 
              fill="none" 
              [attr.stroke]="'url(#' + ringId + ')'" 
              stroke-width="5"
              stroke-linecap="round"
              stroke-dasharray="62.83 62.83"
            />
          </svg>
        </div>
      }
      <!-- 6. ORBIT (NUEVO DISEÑO) -->
      @if (variant() === 'orbit') {
        <div class="orbit">
          <div class="orbit-ring"></div>
          <div class="orbit-planet"></div>
        </div>
      }
    </div>
  `,
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
