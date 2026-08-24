import { Component, ChangeDetectionStrategy, input } from '@angular/core';


/** Available panel visual styles */
export type PanelVariant = 'default' | 'elevated' | 'floating' | 'card' | 'flat' | 'outlined' | 'transparent' | 'plain';

/** Padding size options */
export type PanelPadding = 'none' | 'sm' | 'md' | 'lg';

/** Title size options */
export type PanelTitleSize = 'sm' | 'md' | 'lg' | 'xl';

/** Title weight options */
export type PanelTitleWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/** Title alignment options */
export type PanelTitleAlign = 'left' | 'center' | 'right';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {
  /** Panel variant style */
  readonly variant = input<PanelVariant>('default');

  /** Padding size */
  readonly padding = input<PanelPadding>('md');

  /** Optional title displayed in header */
  readonly title = input('');

  /** Optional icon displayed before title */
  readonly icon = input('');

  /** Whether to show the header section */
  readonly showHeader = input(true);

  /** Whether the panel should take full width (default: true) */
  readonly fullWidth = input(true);

  /** Title font size */
  readonly titleSize = input<PanelTitleSize>('md');

  /** Title font weight */
  readonly titleWeight = input<PanelTitleWeight>('semibold');

  /** Title text alignment */
  readonly titleAlign = input<PanelTitleAlign>('left');
}
