import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from '../button/button.component';
import { TooltipDirective } from './tooltip.directive';

function parseRgb(cssColor: string): [number, number, number] {
  const match = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) {
    throw new Error(`Color no reconocido: ${cssColor}`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(fgCss: string, bgCss: string): number {
  const l1 = relativeLuminance(parseRgb(fgCss));
  const l2 = relativeLuminance(parseRgb(bgCss));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

@Component({
  standalone: true,
  imports: [ButtonComponent, TooltipDirective],
  styles: [
    `
      .wide-row {
        width: 800px;
        display: block;
        padding: 80px;
      }
      .native-full-width {
        display: block;
        width: 100%;
      }
    `,
  ],
  template: `
    <div class="wide-row">
      <app-button
        id="tip-top"
        variant="outline"
        appTooltip="Este es un tooltip de ayuda"
        tooltipPosition="top">
        Arriba
      </app-button>
      <button
        id="native-wide"
        type="button"
        class="native-full-width"
        appTooltip="Elemento nativo ancho completo"
        tooltipPosition="bottom">
        Nativo 100%
      </button>
    </div>
  `,
})
class TooltipTestHostComponent {}

describe('TooltipDirective', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('.tooltip').forEach((el) => el.remove());
  });

  it('centra el tooltip sobre el botón real dentro de una fila de 800px y preserva width: 100% en elementos nativos', () => {
    const fixture = TestBed.createComponent(TooltipTestHostComponent);
    fixture.detectChanges();

    const appBtn = fixture.nativeElement.querySelector('#tip-top') as HTMLElement;
    const innerBtn = appBtn.querySelector('button') as HTMLElement;
    appBtn.dispatchEvent(new MouseEvent('mouseenter'));

    const tipEl = document.body.querySelector('.tooltip') as HTMLElement;
    expect(tipEl).not.toBeNull();
    expect(getComputedStyle(tipEl).position).toBe('fixed');

    const btnRect = innerBtn.getBoundingClientRect();
    const tipRect = tipEl.getBoundingClientRect();
    expect(Math.abs(tipRect.left + tipRect.width / 2 - (btnRect.left + btnRect.width / 2))).toBeLessThanOrEqual(2);
    appBtn.dispatchEvent(new MouseEvent('mouseleave'));

    const nativeWide = fixture.nativeElement.querySelector('#native-wide') as HTMLElement;
    expect(Math.round(nativeWide.getBoundingClientRect().width)).toBeGreaterThanOrEqual(600);
  });

  it('reposiciona en eventos scroll/resize y se oculta al presionar Escape (WCAG 1.4.13)', () => {
    const fixture = TestBed.createComponent(TooltipTestHostComponent);
    fixture.detectChanges();

    const appBtn = fixture.nativeElement.querySelector('#tip-top') as HTMLElement;
    const innerBtn = appBtn.querySelector('button') as HTMLElement;
    appBtn.dispatchEvent(new FocusEvent('focusin'));

    const tipEl = document.body.querySelector('.tooltip') as HTMLElement;
    expect(tipEl).not.toBeNull();

    const shiftedRect = new DOMRect(240, 180, 120, 40);
    spyOn(innerBtn, 'getBoundingClientRect').and.returnValue(shiftedRect);
    window.dispatchEvent(new Event('scroll'));

    const updatedTipRect = tipEl.getBoundingClientRect();
    const expectedCenterX = shiftedRect.left + shiftedRect.width / 2;
    const actualCenterX = updatedTipRect.left + updatedTipRect.width / 2;
    expect(Math.abs(actualCenterX - expectedCenterX)).toBeLessThanOrEqual(2);
    expect(updatedTipRect.bottom).toBeLessThanOrEqual(shiftedRect.top + 1);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.body.querySelector('.tooltip')).toBeNull();
  });

  it('mantiene contraste >= 7:1 en temas light, dark y brand-dark', () => {
    const fixture = TestBed.createComponent(TooltipTestHostComponent);
    fixture.detectChanges();
    const appBtn = fixture.nativeElement.querySelector('#tip-top') as HTMLElement;

    for (const theme of ['light', 'dark', 'brand-dark'] as const) {
      document.documentElement.setAttribute('data-theme', theme);
      appBtn.dispatchEvent(new MouseEvent('mouseenter'));

      const tipEl = document.body.querySelector('.tooltip') as HTMLElement;
      expect(tipEl).not.toBeNull();
      const styles = getComputedStyle(tipEl);
      expect(contrastRatio(styles.color, styles.backgroundColor))
        .withContext(`Tema ${theme}`)
        .toBeGreaterThanOrEqual(7);

      appBtn.dispatchEvent(new MouseEvent('mouseleave'));
    }
  });
});
