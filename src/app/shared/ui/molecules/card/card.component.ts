import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'interactive';
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Card component - Contenedor visual para agrupar contenido relacionado.
 * Sigue Atomic Design Guide: 100% tokenizado, OnPush, accesible.
 * 
 * @example
 * ```html
 * <app-card title="Mi Tarjeta" subtitle="Descripción">
 *   <img slot="image" src="imagen.jpg" alt="Imagen" />
 *   <p>Contenido de la tarjeta</p>
 *   <button slot="actions">Acción</button>
 * </app-card>
 * ```
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article 
      class="card" 
      [class]="'card--' + variant + ' card--' + size"
      [class.card--clickable]="clickable"
      [class.card--horizontal]="horizontal"
      [attr.tabindex]="clickable ? 0 : null"
      [attr.role]="clickable ? 'button' : null"
      (click)="onClick()"
      (keydown.enter)="onClick()"
      (keydown.space)="onClick(); $event.preventDefault()"
    >
      <!-- Image Slot -->
      <div class="card__image">
        <ng-content select="[slot=image]"></ng-content>
      </div>

      <!-- Header -->
      @if (title || subtitle || icon) {
        <header class="card__header">
          @if (icon) {
            <span class="card__icon"><i [class]="icon"></i></span>
          }
          <div class="card__header-text">
            @if (title) {
              <h3 class="card__title">{{ title }}</h3>
            }
            @if (subtitle) {
              <p class="card__subtitle">{{ subtitle }}</p>
            }
          </div>
        </header>
      }

      <!-- Body -->
      <div class="card__body">
        <ng-content></ng-content>
      </div>

      <!-- Footer / Actions -->
      <footer class="card__footer">
        <ng-content select="[slot=actions]"></ng-content>
      </footer>
    </article>
  `,
  styles: [`
    /* === Base Structure === */
    .card {
      display: flex;
      flex-direction: column;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: all 200ms ease;
    }

    /* === Variants === */
    .card--default {
      box-shadow: var(--shadow-sm);
    }

    .card--elevated {
      border: none;
      box-shadow: var(--shadow-md);
    }

    .card--elevated:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .card--outlined {
      background: transparent;
      box-shadow: none;
    }

    .card--filled {
      background: var(--surface-section);
      border: none;
      box-shadow: none;
    }

    .card--interactive {
      cursor: pointer;
      box-shadow: var(--shadow-sm);
    }

    .card--interactive:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--primary-color);
    }

    .card--interactive:focus {
      outline: none;
      box-shadow: var(--shadow-focus-primary);
    }

    .card--clickable {
      cursor: pointer;
    }

    /* === Sizes === */
    .card--sm .card__header,
    .card--sm .card__body,
    .card--sm .card__footer:not(:empty) {
      padding: var(--space-3);
    }

    .card--md .card__header,
    .card--md .card__body,
    .card--md .card__footer:not(:empty) {
      padding: var(--space-4);
    }

    .card--lg .card__header,
    .card--lg .card__body,
    .card--lg .card__footer:not(:empty) {
      padding: var(--space-5);
    }

    /* === Image === */
    .card__image {
      width: 100%;
      overflow: hidden;
    }

    .card__image:empty {
      display: none;
    }

    .card__image ::ng-deep img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
    }

    /* === Header === */
    .card__header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .card__icon {
      font-size: var(--text-2xl);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--space-10);
      height: var(--space-10);
      background: var(--primary-color-lighter);
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .card__header-text {
      flex: 1;
      min-width: 0;
    }

    .card__title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.3;
    }

    .card__subtitle {
      margin: var(--space-1) 0 0;
      font-size: var(--text-sm);
      color: var(--text-color-secondary);
      line-height: 1.4;
    }

    /* === Body === */
    .card__body {
      flex: 1;
      font-size: var(--text-md);
      color: var(--text-color);
      line-height: 1.6;
    }

    .card__body:empty {
      display: none;
    }

    /* === Footer === */
    .card__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3);
      border-top: 1px solid var(--border-color);
    }

    .card__footer:empty {
      display: none;
      border-top: none;
    }

    /* === Horizontal Layout === */
    .card--horizontal {
      flex-direction: row;
    }

    .card--horizontal .card__image {
      width: 40%;
      max-width: 200px;
      flex-shrink: 0;
    }

    .card--horizontal .card__image ::ng-deep img {
      height: 100%;
      object-fit: cover;
    }

    /* === Responsive === */
    @media (max-width: 768px) {
      .card--horizontal {
        flex-direction: column;
      }

      .card--horizontal .card__image {
        width: 100%;
        max-width: none;
      }
    }
  `]
})
export class CardComponent {
  /** Card variant style */
  @Input() variant: CardVariant = 'default';

  /** Card size (affects padding) */
  @Input() size: CardSize = 'md';

  /** Card title */
  @Input() title = '';

  /** Card subtitle */
  @Input() subtitle = '';

  /** Icon class (Font Awesome) */
  @Input() icon = '';

  /** Whether the card is clickable */
  @Input() clickable = false;

  /** Horizontal layout (image on side) */
  @Input() horizontal = false;

  /** Click event for interactive cards */
  @Output() cardClick = new EventEmitter<void>();

  onClick(): void {
    if (this.clickable) {
      this.cardClick.emit();
    }
  }
}
