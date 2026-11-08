import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextComponent, TextColor } from './text.component';

@Component({
  standalone: true,
  imports: [TextComponent],
  template: `
    <app-text id="secondary-text" variant="body-sm" color="secondary">
      Especificacion oficial de superposiciones y acciones de escape.
    </app-text>
    <app-text id="muted-text" variant="body-sm" color="muted">
      Texto secundario de referencia.
    </app-text>
  `
})
class TestHostComponent {}

describe('TextComponent', () => {
  let fixture: ComponentFixture<TextComponent>;
  let component: TextComponent;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextComponent, TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps color="secondary" and color="muted" to the high-contrast secondary text token instead of brand yellow fill', () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const secondaryParagraph = hostFixture.nativeElement.querySelector('#secondary-text p') as HTMLElement;
    const mutedParagraph = hostFixture.nativeElement.querySelector('#muted-text p') as HTMLElement;

    expect(secondaryParagraph).toBeTruthy();
    expect(mutedParagraph).toBeTruthy();
    expect(secondaryParagraph.classList.contains('color-secondary')).toBeTrue();

    const secondaryColor = getComputedStyle(secondaryParagraph).color;
    const mutedColor = getComputedStyle(mutedParagraph).color;

    expect(secondaryColor).toBe(mutedColor);
    expect(secondaryColor).not.toBe('rgb(255, 184, 0)');
  });

  it('applies color classes for all supported TextColor values', () => {
    const colors: TextColor[] = ['default', 'primary', 'secondary', 'muted', 'success', 'warning', 'danger', 'white'];
    for (const color of colors) {
      setInput('color', color);
      const rendered = fixture.nativeElement.querySelector('p, h1, h2, h3, h4') as HTMLElement;
      expect(rendered.classList.contains(`color-${color}`)).toBe(true);
    }
  });

  it('reactively switches semantic HTML tag when variant signal changes dynamically under OnPush', () => {
    expect(fixture.nativeElement.querySelector('p')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();

    setInput('variant', 'h2');
    const heading = fixture.nativeElement.querySelector('h2') as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.classList.contains('text-h2')).toBe(true);
    expect(fixture.nativeElement.querySelector('p')).toBeNull();

    setInput('variant', 'caption');
    const captionParagraph = fixture.nativeElement.querySelector('p') as HTMLElement;
    expect(captionParagraph).toBeTruthy();
    expect(captionParagraph.classList.contains('text-caption')).toBe(true);
    expect(fixture.nativeElement.querySelector('h2')).toBeNull();
  });
});
