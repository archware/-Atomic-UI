import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoaderComponent } from '../../../../shared/ui/atoms/loader/loader.component';
import { ShowcaseStatusComponent } from './showcase-status.component';

describe('ShowcaseStatus y LoaderComponent: progresión de tamaños y alineación de variantes', () => {
  it('diferencia estrictamente los tamaños sm (24px), md (40px) y lg (56px) en progresión ascendente', () => {
    const fixture = TestBed.createComponent(ShowcaseStatusComponent);
    fixture.detectChanges();

    const loaders = fixture.debugElement.queryAll(By.directive(LoaderComponent));
    // Los loaders en los índices 6, 7 y 8 corresponden a la sección "Tamaños" (sm, md, lg)
    const sizeLoaders = loaders.slice(6, 9);
    expect(sizeLoaders.map((d) => (d.componentInstance as LoaderComponent).size())).toEqual([
      'sm',
      'md',
      'lg',
    ]);

    const containers = sizeLoaders.map(
      (d) => d.nativeElement.querySelector('.loader-container') as HTMLElement
    );
    const rects = containers.map((el) => el.getBoundingClientRect());

    expect(Math.round(rects[0].width)).toBe(24);
    expect(Math.round(rects[0].height)).toBe(24);
    expect(Math.round(rects[1].width)).toBe(40);
    expect(Math.round(rects[1].height)).toBe(40);
    expect(Math.round(rects[2].width)).toBe(56);
    expect(Math.round(rects[2].height)).toBe(56);

    expect(rects[0].width).toBeLessThan(rects[1].width);
    expect(rects[1].width).toBeLessThan(rects[2].width);
    expect(rects[0].height).toBeLessThan(rects[1].height);
    expect(rects[1].height).toBeLessThan(rects[2].height);

    // Verifica que el SVG del spinner también escala en sm < md < lg en dimensiones y grosor de trazo
    const spinners = containers.map((el) => el.querySelector('.gradient-spinner') as HTMLElement);
    const spinnerWidths = spinners.map((el) => Math.round(el.getBoundingClientRect().width));
    expect(spinnerWidths).toEqual([24, 40, 56]);

    const arcs = containers.map((el) => el.querySelector('.spinner-arc') as SVGCircleElement);
    const strokeWidths = arcs.map((el) => parseFloat(getComputedStyle(el).strokeWidth));
    expect(strokeWidths[0]).toBeLessThan(strokeWidths[1]);
    expect(strokeWidths[1]).toBeLessThan(strokeWidths[2]);
  });

  it('reserva la misma altura vertical en las 6 variantes (incluido Dots) y alinea sus etiquetas inferiores', () => {
    const fixture = TestBed.createComponent(ShowcaseStatusComponent);
    fixture.detectChanges();

    const loaders = fixture.debugElement.queryAll(By.directive(LoaderComponent));
    const variantLoaders = loaders.slice(0, 6);
    expect(variantLoaders.map((d) => (d.componentInstance as LoaderComponent).variant())).toEqual([
      'spinner',
      'dots',
      'pulse',
      'bars',
      'gradient',
      'orbit',
    ]);

    const containerHeights = variantLoaders.map((d) => {
      const container = d.nativeElement.querySelector('.loader-container') as HTMLElement;
      return Math.round(container.getBoundingClientRect().height);
    });

    // Todas las variantes lg deben reservar exactamente 56px de alto
    for (const h of containerHeights) {
      expect(h).toBe(56);
    }

    const dotsEl = variantLoaders[1].nativeElement.querySelector('.dots') as HTMLElement;
    expect(Math.round(dotsEl.getBoundingClientRect().height)).toBe(56);

    // Las etiquetas de las variantes en la misma fila deben quedar alineadas en la misma línea base
    const variantCards = Array.from(
      fixture.nativeElement.querySelectorAll('.loader-grid .loader-item')
    ) as HTMLElement[];
    expect(variantCards.length).toBe(6);

    const firstRowLabels = variantCards
      .slice(0, 2)
      .map((card) => card.querySelector('.loader-label') as HTMLElement);
    const spinnerLabelTop = firstRowLabels[0].getBoundingClientRect().top;
    const dotsLabelTop = firstRowLabels[1].getBoundingClientRect().top;
    expect(Math.abs(dotsLabelTop - spinnerLabelTop)).toBeLessThanOrEqual(1);
  });

  it('alinea las etiquetas Small, Medium y Large en la misma línea base horizontal', () => {
    const fixture = TestBed.createComponent(ShowcaseStatusComponent);
    fixture.detectChanges();

    const sizeItems = Array.from(
      fixture.nativeElement.querySelectorAll('.loader-sizes .loader-size-item .loader-label')
    ) as HTMLElement[];
    expect(sizeItems.length).toBe(3);

    const tops = sizeItems.map((el) => el.getBoundingClientRect().top);
    expect(Math.abs(tops[0] - tops[1])).toBeLessThanOrEqual(1);
    expect(Math.abs(tops[1] - tops[2])).toBeLessThanOrEqual(1);
  });
});
