import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';


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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="card"
      [class]="'card--' + variant() + ' card--' + size()"
      [class.card--clickable]="clickable()"
      [class.card--horizontal]="horizontal()"
      [attr.tabindex]="clickable() ? 0 : null"
      [attr.role]="clickable() ? 'button' : null"
      (click)="onClick($event)"
      (keydown.enter)="onClick($event)"
      (keydown.space)="onClick($event); $event.preventDefault()"
    >
      <!-- Image Slot -->
      <div class="card__image">
        <ng-content select="[slot=image]"></ng-content>
      </div>

      <!-- Header -->
      @if (title() || subtitle() || icon()) {
        <header class="card__header">
          @if (icon()) {
            <span class="card__icon"><i [class]="icon()"></i></span>
          }
          <div class="card__header-text">
            @if (title()) {
              <h3 class="card__title">{{ title() }}</h3>
            }
            @if (subtitle()) {
              <p class="card__subtitle">{{ subtitle() }}</p>
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
  styleUrl: './card.component.css'
})
export class CardComponent {
  /** Card variant style */
  readonly variant = input<CardVariant>('default');

  /** Card size (affects padding) */
  readonly size = input<CardSize>('md');

  /** Card title */
  readonly title = input('');

  /** Card subtitle */
  readonly subtitle = input('');

  /** Icon class (Font Awesome) */
  readonly icon = input('');

  /** Whether the card is clickable */
  readonly clickable = input(false);

  /** Horizontal layout (image on side) */
  readonly horizontal = input(false);

  /** Click event for interactive cards */
  readonly cardClick = output<void>();

  onClick(event?: Event): void {
    if (!this.clickable()) return;

    // Los controles proyectados conservan su propia interacción. El contenido
    // neutro sigue formando parte de la superficie clicable de la tarjeta.
    const target = event?.target;
    const currentTarget = event?.currentTarget;
    if (target instanceof Element && currentTarget instanceof Element) {
      const nestedControl = target.closest(
        'a, button, input, select, textarea, summary, [contenteditable="true"], [role="button"], [role="link"], [tabindex]'
      );
      if (nestedControl && nestedControl !== currentTarget) return;
    }

    this.cardClick.emit();
  }
}
