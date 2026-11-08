import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoaderComponent, LoaderSize, LoaderVariant } from './loader.component';

@Component({
  standalone: true,
  imports: [LoaderComponent],
  template: `
    <app-loader [variant]="variant()" [size]="size()"></app-loader>
  `,
})
class LoaderTestHostComponent {
  readonly variant = signal<LoaderVariant>('spinner');
  readonly size = signal<LoaderSize>('md');
}

describe('LoaderComponent', () => {
  const variants: readonly LoaderVariant[] = [
    'spinner',
    'dots',
    'pulse',
    'bars',
    'gradient',
    'orbit',
  ];

  it('progresa estrictamente en dimensiones (24px < 40px < 56px) para las 6 variantes', () => {
    const fixture = TestBed.createComponent(LoaderTestHostComponent);
    const host = fixture.componentInstance;

    for (const variant of variants) {
      host.variant.set(variant);

      host.size.set('sm');
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.loader-container') as HTMLElement;
      const smRect = container.getBoundingClientRect();

      host.size.set('md');
      fixture.detectChanges();
      const mdRect = container.getBoundingClientRect();

      host.size.set('lg');
      fixture.detectChanges();
      const lgRect = container.getBoundingClientRect();

      expect(Math.round(smRect.height)).withContext(`${variant} sm height`).toBe(24);
      expect(Math.round(mdRect.height)).withContext(`${variant} md height`).toBe(40);
      expect(Math.round(lgRect.height)).withContext(`${variant} lg height`).toBe(56);

      expect(smRect.width).withContext(`${variant} sm < md width`).toBeLessThan(mdRect.width);
      expect(mdRect.width).withContext(`${variant} md < lg width`).toBeLessThan(lgRect.width);
      expect(smRect.height).withContext(`${variant} sm < md height`).toBeLessThan(mdRect.height);
      expect(mdRect.height).withContext(`${variant} md < lg height`).toBeLessThan(lgRect.height);
    }
  });

  it('escala el grosor de trazo (strokeWidth / borderWidth) entre sm, md y lg', () => {
    const fixture = TestBed.createComponent(LoaderTestHostComponent);
    const host = fixture.componentInstance;

    // 1. Spinner SVG stroke-width
    host.variant.set('spinner');
    const spinnerStrokes: number[] = [];
    for (const size of ['sm', 'md', 'lg'] as const) {
      host.size.set(size);
      fixture.detectChanges();
      const arc = fixture.nativeElement.querySelector('.spinner-arc') as SVGCircleElement;
      const track = fixture.nativeElement.querySelector('.spinner-track') as SVGCircleElement;
      const arcStroke = parseFloat(getComputedStyle(arc).strokeWidth);
      const trackStroke = parseFloat(getComputedStyle(track).strokeWidth);
      expect(arcStroke).toBe(trackStroke);
      spinnerStrokes.push(arcStroke);
    }
    expect(spinnerStrokes[0]).toBeLessThan(spinnerStrokes[1]);
    expect(spinnerStrokes[1]).toBeLessThan(spinnerStrokes[2]);

    // 2. Gradient SVG stroke-width
    host.variant.set('gradient');
    const gradientStrokes: number[] = [];
    for (const size of ['sm', 'md', 'lg'] as const) {
      host.size.set(size);
      fixture.detectChanges();
      const arc = fixture.nativeElement.querySelector('.gradient-arc') as SVGCircleElement;
      gradientStrokes.push(parseFloat(getComputedStyle(arc).strokeWidth));
    }
    expect(gradientStrokes[0]).toBeLessThan(gradientStrokes[1]);
    expect(gradientStrokes[1]).toBeLessThan(gradientStrokes[2]);

    // 3. Orbit border-width
    host.variant.set('orbit');
    const orbitBorders: number[] = [];
    for (const size of ['sm', 'md', 'lg'] as const) {
      host.size.set(size);
      fixture.detectChanges();
      const ring = fixture.nativeElement.querySelector('.orbit-ring') as HTMLElement;
      orbitBorders.push(parseFloat(getComputedStyle(ring).borderTopWidth));
    }
    expect(orbitBorders[0]).toBeLessThan(orbitBorders[1]);
    expect(orbitBorders[1]).toBeLessThan(orbitBorders[2]);
  });

  it('genera identificadores de gradiente únicos por instancia para evitar colisiones SVG', () => {
    const f1 = TestBed.createComponent(LoaderComponent);
    const f2 = TestBed.createComponent(LoaderComponent);
    f1.detectChanges();
    f2.detectChanges();

    expect(f1.componentInstance.spinnerId).not.toBe(f2.componentInstance.spinnerId);
    expect(f1.componentInstance.ringId).not.toBe(f2.componentInstance.ringId);
  });
});
