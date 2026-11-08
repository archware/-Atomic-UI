import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

async function crearFixture(orientacion: 'horizontal' | 'vertical' = 'horizontal') {
  TestBed.overrideComponent(TabsHostComponent, { set: {
    template: `<app-tabs orientation="${orientacion}">
      <app-tab label="General">Contenido general</app-tab>
      <app-tab label="Detalle">Contenido de detalle</app-tab>
      <app-tab label="Bloqueada" [disabled]="true">Contenido bloqueado</app-tab>
    </app-tabs>`,
  } });
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

function botonesPestanas(fixture: ComponentFixture<TabsHostComponent>): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
}

async function pulsarTecla(fixture: ComponentFixture<TabsHostComponent>, tecla: string, opciones: KeyboardEventInit = {}): Promise<KeyboardEvent> {
  const evento = new KeyboardEvent('keydown', { key: tecla, bubbles: true, cancelable: true, ...opciones });
  document.activeElement?.dispatchEvent(evento);
  await fixture.whenStable();
  return evento;
}

function comprobarSeleccion(fixture: ComponentFixture<TabsHostComponent>, indice: number): void {
  const botones = botonesPestanas(fixture);
  const paneles: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('app-tab');
  expect(document.activeElement).toBe(botones[indice]);
  botones.forEach((boton, actual) => {
    expect(boton.getAttribute('aria-selected')).toBe(String(actual === indice));
    expect(boton.tabIndex).toBe(actual === indice ? 0 : -1);
    expect(paneles[actual].classList.contains('active')).toBe(actual === indice);
  });
  expect(fixture.nativeElement.querySelector('[role="tabpanel"]').getAttribute('aria-labelledby')).toBe(botones[indice].id);
}

describe('TabsComponent teclado desde controles reales', () => {
  it('ArrowRight y ArrowLeft mueven el foco, dan la vuelta y saltan las deshabilitadas', async () => {
    const fixture = await crearFixture();
    botonesPestanas(fixture)[0].focus();
    expect((await pulsarTecla(fixture, 'ArrowRight')).defaultPrevented).toBeTrue();
    comprobarSeleccion(fixture, 1);
    await pulsarTecla(fixture, 'ArrowRight');
    comprobarSeleccion(fixture, 0);
    await pulsarTecla(fixture, 'ArrowLeft');
    comprobarSeleccion(fixture, 1);
    await pulsarTecla(fixture, 'ArrowLeft');
    comprobarSeleccion(fixture, 0);
  });

  it('Home y End seleccionan los extremos habilitados', async () => {
    const fixture = await crearFixture();
    botonesPestanas(fixture)[0].focus();
    await pulsarTecla(fixture, 'End');
    comprobarSeleccion(fixture, 1);
    await pulsarTecla(fixture, 'Home');
    comprobarSeleccion(fixture, 0);
  });

  it('el input vertical asigna Down y Up y conserva las flechas horizontales', async () => {
    const fixture = await crearFixture('vertical');
    expect(fixture.nativeElement.querySelector('[role="tablist"]').getAttribute('aria-orientation')).toBe('vertical');
    botonesPestanas(fixture)[0].focus();
    await pulsarTecla(fixture, 'ArrowDown');
    comprobarSeleccion(fixture, 1);
    await pulsarTecla(fixture, 'ArrowDown');
    comprobarSeleccion(fixture, 0);
    await pulsarTecla(fixture, 'ArrowUp');
    comprobarSeleccion(fixture, 1);
    for (const tecla of ['ArrowLeft', 'ArrowRight']) {
      expect((await pulsarTecla(fixture, tecla)).defaultPrevented).toBeFalse();
      comprobarSeleccion(fixture, 1);
    }
  });

  it('no consume flechas ajenas ni atajos con modificadores', async () => {
    const fixture = await crearFixture();
    botonesPestanas(fixture)[0].focus();
    for (const tecla of ['ArrowUp', 'ArrowDown']) {
      expect((await pulsarTecla(fixture, tecla)).defaultPrevented).toBeFalse();
      comprobarSeleccion(fixture, 0);
    }
    for (const modificador of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      for (const tecla of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
        expect((await pulsarTecla(fixture, tecla, { [modificador]: true })).defaultPrevented).toBeFalse();
        comprobarSeleccion(fixture, 0);
      }
    }
  });
});
