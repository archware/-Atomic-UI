import { Component, signal, input, model } from '@angular/core';


@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [],
  template: `
    <div class="rating" [class]="'rating-' + size()" [class.readonly]="readonly()">
      @for (star of stars; track $index; let i = $index) {
        <button type="button"
          class="star"
          [class.filled]="i < (hoverValue() ?? value())"
          [class.half]="allowHalf() && (i + 0.5) === (hoverValue() ?? value())"
          (mouseenter)="!readonly() && onHover(i + 1)"
          (mouseleave)="!readonly() && onLeave()"
          (click)="!readonly() && onSelect(i + 1)"
          (keydown.enter)="!readonly() && onSelect(i + 1)"
          (keydown.space)="!readonly() && onSelect(i + 1)"
          [disabled]="readonly()"
        >
          <i class="fa-solid fa-star"></i>
        </button>
      }
      @if (showValue()) {
        <span class="rating-value">{{ value().toFixed(1) }}</span>
      }
    </div>
  `,
  styleUrl: './rating.component.css'
})
export class RatingComponent {
  readonly value = model(0);
  readonly max = input(5);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly readonly = input(false);
  readonly allowHalf = input(false);
  readonly showValue = input(false);

  hoverValue = signal<number | null>(null);

  get stars() {
    return Array(this.max()).fill(0);
  }

  onHover(value: number) {
    this.hoverValue.set(value);
  }

  onLeave() {
    this.hoverValue.set(null);
  }

  onSelect(value: number) {
    this.value.set(value);
  }
}
