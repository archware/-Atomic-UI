import type { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import { moduleMetadata } from '@storybook/angular';
import { TooltipDirective } from '../app/shared/ui/atoms/tooltip/tooltip.directive';

@Component({
  selector: 'app-tooltip-demo',
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <div style="display: flex; gap: 2rem; padding: 4rem; flex-wrap: wrap; align-items: center; justify-content: center;">
      <button appTooltip="Tooltip arriba (default)" style="padding: 8px 16px; cursor:pointer;">
        Hover — Arriba
      </button>
      <button appTooltip="Tooltip abajo" tooltipPosition="bottom" style="padding: 8px 16px; cursor:pointer;">
        Hover — Abajo
      </button>
      <button appTooltip="Tooltip izquierda" tooltipPosition="left" style="padding: 8px 16px; cursor:pointer;">
        Hover — Izquierda
      </button>
      <button appTooltip="Tooltip derecha" tooltipPosition="right" style="padding: 8px 16px; cursor:pointer;">
        Hover — Derecha
      </button>
    </div>
  `,
})
class TooltipDemoComponent {}

const meta: Meta<TooltipDemoComponent> = {
  title: '1. Atoms/Tooltip',
  component: TooltipDemoComponent,
  decorators: [
    moduleMetadata({ imports: [TooltipDirective] }),
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**TooltipDirective** — Directiva atómica para mostrar texto de ayuda en hover.

\`\`\`html
<button appTooltip="Texto del tooltip" tooltipPosition="top">Hover me</button>
\`\`\`

### Props
| Input | Tipo | Default | Descripción |
|---|---|---|---|
| \`appTooltip\` | \`string\` | \`''\` | Texto a mostrar |
| \`tooltipPosition\` | \`'top' \\| 'bottom' \\| 'left' \\| 'right'\` | \`'top'\` | Posición |
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<TooltipDemoComponent>;

export const AllPositions: Story = {};

@Component({
  selector: 'app-tooltip-long-demo',
  standalone: true,
  imports: [TooltipDirective],
  template: `
    <div style="padding: 5rem; display: flex; justify-content: center;">
      <i
        class="fa-solid fa-circle-info"
        appTooltip="Este campo acepta solo valores entre 1 y 100. Ingresa un número entero."
        tooltipPosition="right"
        style="font-size: 1.5rem; cursor: pointer; color: var(--primary-color);"
      ></i>
    </div>
  `,
})
class TooltipLongDemoComponent {}

export const WithIcon: StoryObj<TooltipLongDemoComponent> = {
  render: () => ({
    props: {},
    template: `
      <div style="padding: 5rem; display: flex; justify-content: center; gap: 1rem; align-items: center;">
        <span style="font-size: 0.875rem;">Precio unitario</span>
        <i
          class="fa-solid fa-circle-info"
          appTooltip="El precio no incluye impuestos. IVA se calcula en el checkout."
          tooltipPosition="right"
          style="font-size: 1rem; cursor: pointer; color: #6b7280;"
        ></i>
      </div>
    `,
    moduleMetadata: { imports: [TooltipDirective] },
  }),
};
