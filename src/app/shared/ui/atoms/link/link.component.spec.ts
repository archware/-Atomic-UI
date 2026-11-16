import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LinkComponent } from './link.component';

describe('LinkComponent', () => {
  it('renderiza enlace externo con href y variante por defecto primary', async () => {
    await TestBed.configureTestingModule({
      imports: [LinkComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(LinkComponent);
    fixture.componentRef.setInput('href', 'https://example.com');
    fixture.componentRef.setInput('ariaLabel', 'Documentación');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('https://example.com');
    expect(anchor.getAttribute('aria-label')).toBe('Documentación');
    expect(anchor.className).toContain('primary');
  });

  it('renderiza enlace con routerLink y variante danger', async () => {
    await TestBed.configureTestingModule({
      imports: [LinkComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(LinkComponent);
    fixture.componentRef.setInput('routerLink', ['/clientes']);
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(anchor.className).toContain('danger');
  });
});
