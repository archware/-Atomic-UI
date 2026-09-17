import { Component, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'label';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'white';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent implements OnInit {
  readonly variant = input<TextVariant>('body');
  readonly weight = input<TextWeight>('normal');
  readonly color = input<TextColor>('default');
  readonly align = input<TextAlign>('left');

  renderAs = 'p';

  ngOnInit() {
    // Map variant to semantic HTML tag
    const variant = this.variant();
    if (['h1', 'h2', 'h3', 'h4'].includes(variant)) {
      this.renderAs = variant;
    } else {
      this.renderAs = 'p';
    }
  }

  get classes() {
    return {
      [`text-${this.variant()}`]: true,
      [`weight-${this.weight()}`]: true,
      [`color-${this.color()}`]: true,
      [`align-${this.align()}`]: true
    };
  }
}
