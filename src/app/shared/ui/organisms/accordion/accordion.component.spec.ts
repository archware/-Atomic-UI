import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  AccordionComponent,
  AccordionItemComponent,
  type AccordionVariant,
} from './accordion.component';

@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
    templateUrl: './accordion-test-host-component.component.html'
})
class AccordionTestHostComponent {
  readonly variant = signal<AccordionVariant>('default');
  readonly single = signal(true);
  readonly flush = signal(false);
  readonly collapsible = signal(true);
  readonly mostrarPrimero = signal(true);
  readonly primeroAbierto = signal(true);
  readonly segundoAbierto = signal(false);
  readonly iconoPrimero = signal('');
}

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<AccordionTestHostComponent>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionTestHostComponent);
    fixture.detectChanges();
  });

  it('connects each header and region with complete ARIA metadata', () => {
    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    const regions = host().querySelectorAll<HTMLElement>('[role="region"]');

    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[0].getAttribute('aria-controls')).toBe(regions[0].id);
    expect(regions[0].getAttribute('aria-labelledby')).toBe(headers[0].id);
    expect(regions[1].getAttribute('aria-hidden')).toBe('true');
    expect(regions[1].hasAttribute('inert')).toBe(true);
  });

  it('keeps only one item open in single mode', () => {
    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');

    headers[1].click();
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('activa el modo exclusivo con variant="single" sin requerir [single]="true"', () => {
    fixture.componentInstance.single.set(false);
    fixture.componentInstance.variant.set('single');
    fixture.detectChanges();

    const contenedor = host().querySelector<HTMLElement>('.accordion');
    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');

    expect(contenedor?.classList.contains('accordion-single')).toBeTrue();
    expect(contenedor?.getAttribute('data-variant')).toBe('single');

    headers[1].click();
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('cierra los demás paneles cuando un ítem se abre dinámicamente por entrada [open] en modo single', () => {
    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');

    fixture.componentInstance.segundoAbierto.set(true);
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('mantiene el primer panel abierto desde la carga inicial si varios declaran [open]="true" en modo single', () => {
    const inicial = TestBed.createComponent(AccordionTestHostComponent);
    inicial.componentInstance.single.set(false);
    inicial.componentInstance.variant.set('single');
    inicial.componentInstance.primeroAbierto.set(true);
    inicial.componentInstance.segundoAbierto.set(true);
    inicial.detectChanges();

    const headers = (inicial.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
      '.accordion-header',
    );
    const abiertos = Array.from(headers).filter(
      (h) => h.getAttribute('aria-expanded') === 'true',
    );

    expect(abiertos.length).toBe(1);
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');
    inicial.destroy();
  });

  it('al cambiar de modo múltiple a variant="single" conserva solo el primer panel abierto', () => {
    fixture.componentInstance.single.set(false);
    fixture.componentInstance.variant.set('multiple');
    fixture.componentInstance.segundoAbierto.set(true);
    fixture.detectChanges();

    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');

    fixture.componentInstance.variant.set('single');
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('impide plegar el único panel abierto cuando [collapsible]="false" en modo single, pero permite cambiar a otro', () => {
    fixture.componentInstance.collapsible.set(false);
    fixture.detectChanges();

    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    headers[0].click();
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('true');

    headers[1].click();
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('false');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('abre automáticamente el primer panel habilitado cuando [collapsible]="false" y el panel abierto se destruye o todos inician cerrados', () => {
    fixture.componentInstance.single.set(false);
    fixture.componentInstance.variant.set('single');
    fixture.componentInstance.collapsible.set(false);
    fixture.detectChanges();

    fixture.componentInstance.mostrarPrimero.set(false);
    fixture.detectChanges();

    const restantes = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    expect(restantes.length).toBe(1);
    expect(restantes[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('aplica la clase accordion-flush con variant="flush" y renderiza icono opcional en el encabezado', () => {
    fixture.componentInstance.variant.set('flush');
    fixture.componentInstance.iconoPrimero.set('fa-solid fa-layer-group');
    fixture.detectChanges();

    const contenedor = host().querySelector<HTMLElement>('.accordion');
    const icono = host().querySelector<HTMLElement>('.accordion-leading-icon');

    expect(contenedor?.classList.contains('accordion-flush')).toBeTrue();
    expect(icono).not.toBeNull();
    expect(icono?.classList.contains('fa-layer-group')).toBeTrue();
  });

  it('moves focus between headers with the keyboard and ignores modified shortcuts', () => {
    const headers = host().querySelectorAll<HTMLButtonElement>('.accordion-header');
    headers[0].focus();

    const ctrlHome = new KeyboardEvent('keydown', {
      key: 'Home',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    headers[0].dispatchEvent(ctrlHome);
    fixture.detectChanges();
    expect(ctrlHome.defaultPrevented).toBeFalse();
    expect(document.activeElement).toBe(headers[0]);

    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(headers[1]);
  });

  it('moves focus to the header before hiding focused content', () => {
    const action = host().querySelector<HTMLButtonElement>('.accordion-content button');
    const header = host().querySelector<HTMLButtonElement>('.accordion-header');
    const item = fixture.debugElement.query(By.directive(AccordionItemComponent))
      .componentInstance as AccordionItemComponent;

    action?.focus();
    expect(document.activeElement).toBe(action);

    item.setOpen(false, true);
    fixture.detectChanges();

    expect(document.activeElement).toBe(header);
    expect(
      host().querySelector<HTMLElement>('.accordion-content')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  /*
  Los paneles tienen que salir en el indice de encabezados. Sin esto, quien
  recorre la pantalla saltando por titulos no se entera de que existen los
  paneles ni de como se llaman: pasa del titulo de la pagina a lo que haya dentro
  del primero que este abierto.
  */
  it('anuncia el titulo de cada panel como encabezado', () => {
    const encabezados = host().querySelectorAll<HTMLElement>('[role="heading"]');

    expect(encabezados.length).toBe(2);
    expect(encabezados[0].getAttribute('aria-level')).toBe('3');
    expect(encabezados[0].querySelector('button')).not.toBeNull();
    expect(encabezados[0].textContent).toContain('Cliente');
    expect(encabezados[1].textContent).toContain('Cotización');
  });

  it('deja elegir el nivel a quien monta la pantalla', () => {
    const encabezados = host().querySelectorAll<HTMLElement>('[role="heading"]');

    // Solo la pantalla sabe que hay por encima: el primero se queda con el 3 por
    // omision y el segundo pide un 2 desde la plantilla que lo monta.
    expect(encabezados[0].getAttribute('aria-level')).toBe('3');
    expect(encabezados[1].getAttribute('aria-level')).toBe('2');
  });
});
