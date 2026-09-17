import { Component, signal, input, model } from '@angular/core';


@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [],
  templateUrl: './rating.component.html',
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
