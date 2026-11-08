import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption' | 'label';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'white';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

@Component({
  selector: 'app-text',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text.component.html',
  styleUrl: './text.component.css'
})
export class TextComponent {
  readonly variant = input<TextVariant>('body');
  readonly weight = input<TextWeight>('normal');
  readonly color = input<TextColor>('default');
  readonly align = input<TextAlign>('left');

  readonly renderAs = computed<'h1' | 'h2' | 'h3' | 'h4' | 'p'>(() => {
    const variant = this.variant();
    if (variant === 'h1' || variant === 'h2' || variant === 'h3' || variant === 'h4') {
      return variant;
    }
    return 'p';
  });

  readonly classes = computed<Record<string, boolean>>(() => ({
    [`text-${this.variant()}`]: true,
    [`weight-${this.weight()}`]: true,
    [`color-${this.color()}`]: true,
    [`align-${this.align()}`]: true
  }));
}
