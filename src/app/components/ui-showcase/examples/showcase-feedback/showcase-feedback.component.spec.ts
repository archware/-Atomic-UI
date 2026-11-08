import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../shared/ui/atoms/button/button.component';
import { TooltipDirective } from '../../../../shared/ui/atoms/tooltip/tooltip.directive';
import { Alert } from '../../../../shared/ui/molecules/alert/alert.component';
import { ShowcaseFeedbackComponent } from './showcase-feedback.component';

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
  template: `
    <div class="wide-row" style="width: 800px; display: block; padding: 80px;">
      <app-button
        id="btn-top"
        variant="outline"
        appTooltip="Este es un tooltip de ayuda"
        tooltipPosition="top">
        Hover sobre mí
      </app-button>
      <app-button
        id="btn-bottom"
        variant="outline"
        appTooltip="Tooltip inferior"
        tooltipPosition="bottom">
        Abajo
      </app-button>
      <app-button
        id="btn-left"
        variant="outline"
        appTooltip="Tooltip izquierdo"
        tooltipPosition="left">
        Izquierda
      </app-button>
      <app-button
        id="btn-right"
        variant="outline"
        appTooltip="Tooltip derecho"
        tooltipPosition="right">
        Derecha
      </app-button>
    </div>
  `,
})
class TooltipPositionHostComponent {}

describe('ShowcaseFeedback: misma alerta y tooltip que el consumidor', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('.tooltip').forEach((el) => el.remove());
  });

  it('renderiza las cuatro variantes mediante Alert, sin alertas paralelas', () => {
    const fixture = TestBed.createComponent(ShowcaseFeedbackComponent);
    fixture.detectChanges();
    const alerts = fixture.debugElement.queryAll(By.directive(Alert));
    expect(alerts.length).toBe(4);
    expect(alerts.map((alert) => (alert.componentInstance as Alert).kind())).toEqual([
      'info',
      'success',
      'warning',
      'danger',
    ]);
    expect(fixture.nativeElement.querySelectorAll('.alert').length).toBe(4);
    expect(fixture.nativeElement.querySelector('.alert-info')).toBeNull();
  });

  it('consume TooltipDirective canónica en ShowcaseFeedback sin pseudo-elementos paralelos .tooltip-trigger', () => {
    const fixture = TestBed.createComponent(ShowcaseFeedbackComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tooltip-trigger')).toBeNull();
    const tooltipDirs = fixture.debugElement.queryAll(By.directive(TooltipDirective));
    expect(tooltipDirs.length).toBe(4);

    const hostEl = tooltipDirs[0].nativeElement as HTMLElement;
    hostEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tooltipEl = document.body.querySelector('.tooltip') as HTMLElement | null;
    expect(tooltipEl).not.toBeNull();
    expect(tooltipEl?.textContent?.trim()).toBe('Este es un tooltip de ayuda');
    expect(tooltipEl?.getAttribute('role')).toBe('tooltip');

    hostEl.dispatchEvent(new MouseEvent('mouseleave'));
    expect(document.body.querySelector('.tooltip')).toBeNull();
  });

  it('centra el tooltip sobre el botón real dentro de una fila ancha (800px) y no al 50% del contenedor', () => {
    const fixture = TestBed.createComponent(TooltipPositionHostComponent);
    fixture.detectChanges();

    const appButtonEl = fixture.nativeElement.querySelector('#btn-top') as HTMLElement;
    const innerBtnEl = appButtonEl.querySelector('button') as HTMLElement;

    appButtonEl.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const tooltipEl = document.body.querySelector('.tooltip') as HTMLElement;
    expect(tooltipEl).not.toBeNull();

    const btnRect = innerBtnEl.getBoundingClientRect();
    const tipRect = tooltipEl.getBoundingClientRect();

    const btnCenterX = btnRect.left + btnRect.width / 2;
    const tipCenterX = tipRect.left + tipRect.width / 2;

    expect(Math.abs(tipCenterX - btnCenterX)).toBeLessThanOrEqual(2);
    expect(tipRect.bottom).toBeLessThanOrEqual(btnRect.top + 1);
  });

  it('posiciona correctamente las variantes top, bottom, left y right respecto al disparador', () => {
    const fixture = TestBed.createComponent(TooltipPositionHostComponent);
    fixture.detectChanges();

    const checkPosition = (selector: string, assertion: (btnRect: DOMRect, tipRect: DOMRect) => void) => {
      const hostEl = fixture.nativeElement.querySelector(selector) as HTMLElement;
      const innerBtnEl = hostEl.querySelector('button') as HTMLElement;
      hostEl.dispatchEvent(new MouseEvent('mouseenter'));
      const tipEl = document.body.querySelector('.tooltip') as HTMLElement;
      expect(tipEl).not.toBeNull();
      assertion(innerBtnEl.getBoundingClientRect(), tipEl.getBoundingClientRect());
      hostEl.dispatchEvent(new MouseEvent('mouseleave'));
      expect(document.body.querySelector('.tooltip')).toBeNull();
    };

    checkPosition('#btn-top', (btn, tip) => {
      expect(tip.bottom).toBeLessThanOrEqual(btn.top + 1);
    });
    checkPosition('#btn-bottom', (btn, tip) => {
      expect(tip.top).toBeGreaterThanOrEqual(btn.bottom - 1);
    });
    checkPosition('#btn-left', (btn, tip) => {
      expect(tip.right).toBeLessThanOrEqual(btn.left + 1);
    });
    checkPosition('#btn-right', (btn, tip) => {
      expect(tip.left).toBeGreaterThanOrEqual(btn.right - 1);
    });
  });

  it('garantiza contraste legible WCAG AA/AAA (>= 7:1) en temas light, dark y brand-dark', () => {
    const fixture = TestBed.createComponent(ShowcaseFeedbackComponent);
    fixture.detectChanges();
    const hostEl = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement as HTMLElement;

    for (const theme of ['light', 'dark', 'brand-dark'] as const) {
      document.documentElement.setAttribute('data-theme', theme);
      hostEl.dispatchEvent(new MouseEvent('mouseenter'));

      const tooltipEl = document.body.querySelector('.tooltip') as HTMLElement;
      expect(tooltipEl).not.toBeNull();

      const styles = getComputedStyle(tooltipEl);
      const ratio = contrastRatio(styles.color, styles.backgroundColor);
      expect(ratio).withContext(`Contraste insuficiente en tema ${theme}`).toBeGreaterThanOrEqual(7);

      hostEl.dispatchEvent(new MouseEvent('mouseleave'));
    }
  });

  it('no duplica nodos al repetir mouseenter/focusin y limpia el DOM al destruir el host', () => {
    const fixture = TestBed.createComponent(ShowcaseFeedbackComponent);
    fixture.detectChanges();
    const hostEl = fixture.debugElement.query(By.directive(TooltipDirective)).nativeElement as HTMLElement;

    hostEl.dispatchEvent(new MouseEvent('mouseenter'));
    hostEl.dispatchEvent(new MouseEvent('mouseenter'));
    hostEl.dispatchEvent(new FocusEvent('focusin'));
    expect(document.body.querySelectorAll('.tooltip').length).toBe(1);

    fixture.destroy();
    expect(document.body.querySelectorAll('.tooltip').length).toBe(0);
  });
});
