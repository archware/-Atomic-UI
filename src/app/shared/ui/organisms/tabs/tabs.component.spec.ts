import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TabComponent, TabsComponent } from './tabs.component';

/*
  ESTAS PRUEBAS CORREN SIN ZONE.JS A PROPÓSITO.

  El panel de cada pestaña se muestra u oculta con la clase `active` de su
  host (`tab.component.css`: el host se oculta salvo `.active`). Cuando ese
  estado era una propiedad plana mutada imperativamente, el host binding solo
  se re-evaluaba porque Zone.js repintaba tras cada evento; en una aplicación
  zoneless nadie volvía a mirar la propiedad y la pantalla quedaba muerta con
  todos los paneles ocultos. El estado como signal registra la dependencia en
  el host binding y programa el repintado en ambos mundos.
*/
@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent],
    templateUrl: './tabs-host-component.component.html'
})
class TabsHostComponent {}

async function crearFixture() {
  await TestBed.configureTestingModule({
    imports: [TabsHostComponent],
    providers: [provideZonelessChangeDetection()],
  }).compileComponents();
  const fixture = TestBed.createComponent(TabsHostComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('TabsComponent (zoneless)', () => {
  it('activa el primer panel en la carga inicial sin Zone.js', async () => {
    const fixture = await crearFixture();

    const paneles = fixture.nativeElement.querySelectorAll('app-tab') as NodeListOf<HTMLElement>;
    expect(paneles.length).toBe(3);
    expect(paneles[0].classList.contains('active')).toBe(true);
    expect(paneles[1].classList.contains('active')).toBe(false);
    expect(paneles[2].classList.contains('active')).toBe(false);
  });

  it('repinta el panel al cambiar de pestaña con un click, sin Zone.js', async () => {
    const fixture = await crearFixture();

    const botones = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    botones[1].click();
    await fixture.whenStable();

    const paneles = fixture.nativeElement.querySelectorAll('app-tab') as NodeListOf<HTMLElement>;
    expect(paneles[0].classList.contains('active')).toBe(false);
    expect(paneles[1].classList.contains('active')).toBe(true);
    expect(botones[1].getAttribute('aria-selected')).toBe('true');
  });

  it('no activa una pestaña deshabilitada', async () => {
    const fixture = await crearFixture();

    const botones = fixture.nativeElement.querySelectorAll(
      '[role="tab"]',
    ) as NodeListOf<HTMLButtonElement>;
    botones[2].click();
    await fixture.whenStable();

    const paneles = fixture.nativeElement.querySelectorAll('app-tab') as NodeListOf<HTMLElement>;
    expect(paneles[0].classList.contains('active')).toBe(true);
    expect(paneles[2].classList.contains('active')).toBe(false);
  });
});
