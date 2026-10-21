import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select2Component } from './select2.component';
import { TranslateModule } from '@ngx-translate/core';

describe('Select2Component', () => {
  let fixture: ComponentFixture<Select2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select2Component, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('options', [{ label: 'Arequipa', value: 'ARE' }]);
    fixture.detectChanges();
  });

  it('abre un popover real: z-index no evita el recorte por overflow', async () => {
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector(
      '.select2-wrapper',
    ) as HTMLElement;
    expect(wrapper.classList).toContain('open');
    const panel = wrapper.querySelector('.select2-dropdown') as HTMLElement;
    expect(panel.getAttribute('popover')).toBe('manual');
    expect(panel.matches(':popover-open')).toBeTrue();
    expect(panel.parentElement).toBe(wrapper);
    expect(getComputedStyle(panel).position).toBe('fixed');
    expect(getComputedStyle(wrapper).zIndex).not.toBe('9999');
  });

  it('removes a disabled control from the tab order and keeps it closed', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      '.select2-trigger',
    ) as HTMLElement;

    trigger.click();

    expect(trigger.tabIndex).toBe(-1);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(fixture.componentInstance.isOpen()).toBeFalse();
  });

  it('excluye explicitamente la lista desplazable del recorrido nativo de Tab', async () => {
    const panel = await abrir();
    const lista = panel.querySelector('.select2-options') as HTMLElement;
    expect(lista.getAttribute('tabindex')).toBe('-1');
  });

  it('announces disabled options and skips them when the list opens', () => {
    fixture.componentRef.setInput('options', [
      { label: 'No disponible', value: 'blocked', disabled: true },
      { label: 'Arequipa', value: 'ARE' },
    ]);
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();

    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('.select2-option');
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      '.select2-trigger',
    ) as HTMLElement;
    expect(options[0].getAttribute('aria-disabled')).toBe('true');
    expect(fixture.componentInstance.highlightedIndex()).toBe(1);
    expect(trigger.getAttribute('aria-activedescendant')).toContain('-1');
  });

  it('gives every removable tag an explicit accessible label', () => {
    fixture.componentRef.setInput('multiple', true);
    fixture.componentInstance.writeValue(['ARE']);
    fixture.detectChanges();

    const remove = (fixture.nativeElement as HTMLElement).querySelector(
      '.tag-remove',
    ) as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Quitar Arequipa');
  });

  it('rehydrates selected labels when asynchronous options are replaced', () => {
    fixture.componentInstance.writeValue('ARE');
    fixture.componentRef.setInput('options', [
      { label: 'Arequipa actualizado', value: 'ARE' },
      { label: 'Cusco', value: 'CUS' },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedOption()?.label).toBe('Arequipa actualizado');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.select2-value')?.textContent,
    ).toContain('Arequipa actualizado');
  });

  it('uses the explicit accessible label when no visible label is provided', () => {
    fixture.componentRef.setInput('label', '');
    fixture.componentRef.setInput('ariaLabel', 'Provincia de atención');
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('.select2-trigger')
        ?.getAttribute('aria-label'),
    ).toBe('Provincia de atención');
  });

  async function abrir(): Promise<HTMLElement> {
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    await fixture.whenStable();
    await esperarCuadros();
    return (fixture.nativeElement as HTMLElement).querySelector('.select2-dropdown') as HTMLElement;
  }

  async function esperarCuadros(cantidad = 2): Promise<void> {
    for (let indice = 0; indice < cantidad; indice++) {
      await new Promise<void>(resolver => requestAnimationFrame(() => resolver()));
    }
    await fixture.whenStable();
  }

  it('enfoca automaticamente el buscador visible despues de posicionar la capa', async () => {
    const panel = await abrir();
    expect(document.activeElement).toBe(panel.querySelector('input'));
    expect(panel.classList).toContain('capa-posicionada');
    expect(panel.matches(':popover-open')).toBeTrue();
  });

  it('sin busqueda conserva el foco en el disparador', async () => {
    fixture.componentRef.setInput('searchable', false);
    fixture.detectChanges();
    const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
    disparador.focus();
    const panel = await abrir();
    expect(panel.querySelector('input')).toBeNull();
    expect(document.activeElement).toBe(disparador);
  });

  it('reintenta una vez si el primer foco no llega al buscador', async () => {
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.select2-dropdown')?.classList).toContain('capa-posicionada');
    const busqueda = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    const enfocarNativo = busqueda.focus.bind(busqueda);
    expect(getComputedStyle(busqueda).transitionProperty.split(',').map(propiedad => propiedad.trim()))
      .toEqual(['border-color', 'background-color', 'color', 'box-shadow']);
    let intentos = 0;
    const enfocar = spyOn(busqueda, 'focus').and.callFake((opciones?: FocusOptions) => {
      if (++intentos === 2) enfocarNativo(opciones);
    });
    await esperarCuadros();
    expect(enfocar).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(busqueda);
  });

  it('mantiene el dialogo modal abierto con Escape y devuelve foco sin scroll', async () => {
    const dialogo = document.createElement('dialog');
    document.body.append(dialogo);
    dialogo.append(fixture.nativeElement);
    dialogo.showModal();
    try {
      const panel = await abrir();
      expect(document.activeElement).toBe(panel.querySelector('input'));
      const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
      const enfocar = spyOn(disparador, 'focus').and.callThrough();
      const evento = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      panel.querySelector('input')!.dispatchEvent(evento);
      expect(evento.defaultPrevented).toBeTrue();
      expect(dialogo.open).toBeTrue();
      expect(panel.matches(':popover-open')).toBeFalse();
      expect(fixture.componentInstance.isOpen()).toBeFalse();
      expect(document.activeElement).toBe(disparador);
      expect(enfocar).toHaveBeenCalledOnceWith({ preventScroll: true });
      const cerrado = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      disparador.dispatchEvent(cerrado);
      expect(cerrado.defaultPrevented).toBeFalse();
    } finally {
      fixture.destroy();
      dialogo.close();
      dialogo.remove();
    }
  });

  for (const shiftKey of [false, true]) {
    it(`cierra con ${shiftKey ? 'ShiftTab' : 'Tab'} sin cancelar recorrido ni recuperar foco`, async () => {
      const tocado = jasmine.createSpy('tocado');
      fixture.componentInstance.registerOnTouched(tocado);
      const panel = await abrir();
      expect(document.activeElement).toBe(panel.querySelector('input'));
      const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
      const enfocar = spyOn(disparador, 'focus');
      const evento = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });
      panel.querySelector('input')!.dispatchEvent(evento);
      expect(evento.defaultPrevented).toBeFalse();
      expect(fixture.componentInstance.isOpen()).toBeTrue();
      expect(panel.matches(':popover-open')).toBeTrue();
      // dispatchEvent no ejecuta la tabulacion nativa: se representa su destino antes de la macrotarea.
      const destino = document.createElement('button');
      document.body.append(destino);
      try {
        destino.focus();
        await new Promise<void>(resolver => window.setTimeout(resolver, 0));
        expect(fixture.componentInstance.isOpen()).toBeFalse();
        expect(document.activeElement).toBe(destino);
      } finally { destino.remove(); }
      expect(enfocar).not.toHaveBeenCalled();
      expect(tocado).toHaveBeenCalledTimes(1);
    });
  }

  it('conserva abierto si otro manejador cancela Tab', async () => {
    const tocado = jasmine.createSpy('tocado');
    fixture.componentInstance.registerOnTouched(tocado);
    const panel = await abrir();
    const evento = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    panel.addEventListener('keydown', teclado => teclado.preventDefault(), { once: true });
    panel.querySelector('input')!.dispatchEvent(evento);
    const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
    disparador.focus();
    await new Promise<void>(resolver => window.setTimeout(resolver, 0));
    expect(evento.defaultPrevented).toBeTrue();
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    expect(tocado).not.toHaveBeenCalled();
  });

  it('conserva abierto cuando Tab deja el foco dentro del panel', async () => {
    const tocado = jasmine.createSpy('tocado');
    fixture.componentInstance.registerOnTouched(tocado);
    const panel = await abrir();
    const busqueda = panel.querySelector('input')!;
    busqueda.focus();
    busqueda.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    await new Promise<void>(resolver => window.setTimeout(resolver, 0));
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    expect(document.activeElement).toBe(busqueda);
    expect(tocado).not.toHaveBeenCalled();
  });

  it('cancela el cierre diferido al cerrar y reabrir otro panel', async () => {
    const anterior = await abrir();
    anterior.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    const nuevo = await abrir();
    await new Promise<void>(resolver => window.setTimeout(resolver, 0));
    expect(nuevo).not.toBe(anterior);
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    expect(nuevo.matches(':popover-open')).toBeTrue();
  });

  it('conserva CVA single y restaura foco una vez al seleccionar', async () => {
    const cambio = jasmine.createSpy('cambio');
    const tocado = jasmine.createSpy('tocado');
    fixture.componentInstance.registerOnChange(cambio);
    fixture.componentInstance.registerOnTouched(tocado);
    const panel = await abrir();
    panel.querySelector('.select2-option')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(cambio).toHaveBeenCalledOnceWith('ARE');
    expect(tocado).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.isOpen()).toBeFalse();
    expect(document.activeElement?.classList).toContain('select2-trigger');
  });

  it('conserva CVA multiple, deja abierto y permite retirar la seleccion', async () => {
    fixture.componentRef.setInput('multiple', true);
    const cambio = jasmine.createSpy('cambio');
    fixture.componentInstance.registerOnChange(cambio);
    const panel = await abrir();
    const opcion = panel.querySelector('.select2-option')!;
    opcion.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(cambio).toHaveBeenCalledWith(['ARE']);
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    opcion.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    expect(cambio).toHaveBeenCalledWith([]);
    expect(panel.matches(':popover-open')).toBeTrue();
  });

  it('solo desplaza opciones al navegar y no solicita posicion por su scroll interno', async () => {
    fixture.componentRef.setInput('options', Array.from({ length: 45 }, (_, indice) => ({ value: indice, label: `Opcion ${indice}` })));
    fixture.componentRef.setInput('searchable', false);
    const panel = await abrir();
    const pagina = document.documentElement.scrollTop;
    const lista = panel.querySelector('.select2-options') as HTMLElement;
    const desplazamientoAncestro = (fixture.nativeElement as HTMLElement).scrollTop;
    for (let indice = 0; indice < 35; indice++) {
      fixture.componentInstance.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    }
    expect(lista.scrollTop).toBeGreaterThan(0);
    expect(document.documentElement.scrollTop).toBe(pagina);
    expect((fixture.nativeElement as HTMLElement).scrollTop).toBe(desplazamientoAncestro);
    const programar = spyOn(window, 'requestAnimationFrame').and.callThrough();
    lista.dispatchEvent(new Event('scroll'));
    expect(programar).not.toHaveBeenCalled();
  });

  it('agrupa resize y scroll externo en un solo frame y cancela al deshabilitar', async () => {
    const panel = await abrir();
    await new Promise<void>(resolver => requestAnimationFrame(() => resolver()));
    const programar = spyOn(window, 'requestAnimationFrame').and.callThrough();
    const cancelar = spyOn(window, 'cancelAnimationFrame').and.callThrough();
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('scroll'));
    window.visualViewport?.dispatchEvent(new Event('resize'));
    expect(programar).toHaveBeenCalledTimes(1);
    fixture.componentInstance.setDisabledState(true);
    expect(cancelar).toHaveBeenCalledTimes(1);
    expect(panel.matches(':popover-open')).toBeFalse();
    programar.calls.reset();
    window.dispatchEvent(new Event('resize'));
    expect(programar).not.toHaveBeenCalled();
  });

  it('cierra ante pointerdown externo aun cuando el destino detiene click', async () => {
    await abrir();
    const externo = document.createElement('div');
    document.body.append(externo);
    externo.addEventListener('click', evento => evento.stopPropagation());
    try {
      externo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(fixture.componentInstance.isOpen()).toBeFalse();
    } finally { externo.remove(); }
  });

  it('tolera opciones vacias, busqueda sin resultados y reabre con opciones asincronas', async () => {
    fixture.componentRef.setInput('options', []);
    await abrir();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent).toContain('No hay resultados');
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    fixture.componentInstance.writeValue('CUS');
    fixture.componentRef.setInput('options', [{ value: 'CUS', label: 'Cusco' }]);
    await abrir();
    expect(fixture.componentInstance.selectedOption()?.value).toBe('CUS');
    fixture.componentInstance.onSearchTermChange('sin coincidencia');
    fixture.detectChanges();
    expect(fixture.componentInstance.highlightedIndex()).toBe(-1);
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('[role="option"]').length).toBe(0);
  });

  it('libera popover y listeners al destruir y permite cerrar/reabrir', async () => {
    await abrir();
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    const panel = await abrir();
    expect(panel.matches(':popover-open')).toBeTrue();
    fixture.destroy();
    expect(panel.matches(':popover-open')).toBeFalse();
    const programar = spyOn(window, 'requestAnimationFrame').and.callThrough();
    window.dispatchEvent(new Event('resize'));
    expect(programar).not.toHaveBeenCalled();
  });

  it('observa el cierre del dialogo ancestro sin recuperar foco', async () => {
    const dialogo = document.createElement('dialog');
    document.body.append(dialogo);
    dialogo.append(fixture.nativeElement);
    dialogo.showModal();
    try {
      await abrir();
      const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
      const enfocar = spyOn(disparador, 'focus');
      dialogo.removeAttribute('open');
      await fixture.whenStable();
      expect(fixture.componentInstance.isOpen()).toBeFalse();
      expect(enfocar).not.toHaveBeenCalled();
    } finally { fixture.destroy(); dialogo.remove(); }
  });

  it('mantiene posicion fija funcional sin Popover API', async () => {
    const mostrar = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'showPopover');
    const ocultar = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'hidePopover');
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: undefined });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', { configurable: true, value: undefined });
    try {
      const panel = await abrir();
      expect(getComputedStyle(panel).position).toBe('fixed');
      expect(getComputedStyle(panel).visibility).toBe('visible');
      expect(panel.getBoundingClientRect().width).toBeGreaterThan(0);
      fixture.componentInstance.toggleDropdown();
      expect(fixture.componentInstance.isOpen()).toBeFalse();
    } finally {
      if (mostrar) Object.defineProperty(HTMLElement.prototype, 'showPopover', mostrar);
      else Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
      if (ocultar) Object.defineProperty(HTMLElement.prototype, 'hidePopover', ocultar);
      else Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
    }
  });

  it('cierra sin recuperar foco cuando desaparece el disparador', async () => {
    await abrir();
    const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
    const enfocar = spyOn(disparador, 'focus');
    spyOn(disparador, 'getClientRects').and.returnValue([] as unknown as DOMRectList);
    window.dispatchEvent(new Event('resize'));
    await new Promise<void>(resolver => requestAnimationFrame(() => resolver()));
    expect(fixture.componentInstance.isOpen()).toBeFalse();
    expect(enfocar).not.toHaveBeenCalled();
  });

  it('ignora pointerdown dentro del panel y notifica tocado una sola vez fuera', async () => {
    const tocado = jasmine.createSpy('tocado');
    fixture.componentInstance.registerOnTouched(tocado);
    const panel = await abrir();
    panel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    document.body.click();
    expect(tocado).toHaveBeenCalledTimes(1);
  });

  for (const ocultarAncestro of [false, true]) {
    it(`cierra al ocultar ${ocultarAncestro ? 'un ancestro' : 'el disparador'} sin scroll ni resize`, async () => {
      await abrir();
      const raiz = fixture.nativeElement as HTMLElement;
      const disparador = raiz.querySelector('.select2-trigger') as HTMLElement;
      const enfocar = spyOn(disparador, 'focus').and.callThrough();
      const ocultado = ocultarAncestro ? raiz : disparador;
      try {
        ocultado.style.visibility = 'hidden';
        expect(ocultado.style.visibility).toBe('hidden');
        // MutationObserver notifica antes del siguiente frame; no se simula resize ni scroll.
        const limite = performance.now() + 500;
        while (getComputedStyle(disparador).visibility !== 'hidden' && performance.now() < limite) {
          await new Promise<void>(resolver => requestAnimationFrame(() => resolver()));
        }
        expect(getComputedStyle(disparador).visibility).toBe('hidden');
        await esperarCuadros();
        expect(fixture.componentInstance.isOpen()).toBeFalse();
        expect(enfocar).not.toHaveBeenCalled();
      } finally { ocultado.style.removeProperty('visibility'); }
    });
  }

  it('reposiciona al mover un ancestro sin resize ni scroll', async () => {
    const panel = await abrir();
    await esperarCuadros(16);
    const raiz = fixture.nativeElement as HTMLElement;
    const superiorAnterior = parseFloat(panel.style.getPropertyValue('--select2-capa-superior'));
    try {
      raiz.style.top = '20px';
      await esperarCuadros(4);
      expect(parseFloat(panel.style.getPropertyValue('--select2-capa-superior'))).toBe(superiorAnterior + 20);
    } finally { raiz.style.removeProperty('top'); }
  });

  for (const multiple of [false, true]) {
    it(`muestra el destacado final sin busqueda en modo ${multiple ? 'multiple' : 'single'} al abrir y reabrir`, async () => {
      fixture.componentRef.setInput('multiple', multiple);
      fixture.componentRef.setInput('searchable', false);
      fixture.componentRef.setInput('options', Array.from({ length: 45 }, (_, indice) => ({
        value: indice, label: `Opcion ${indice}`, disabled: multiple && indice < 44,
      })));
      fixture.detectChanges();
      fixture.componentInstance.writeValue(multiple ? [44] : 44);
      const raiz = fixture.nativeElement as HTMLElement;
      const disparador = raiz.querySelector('.select2-trigger') as HTMLElement;
      disparador.focus();
      const pagina = document.documentElement.scrollTop;
      const desplazamientoAncestro = raiz.scrollTop;
      for (let apertura = 0; apertura < 2; apertura++) {
        const panel = await abrir();
        const lista = panel.querySelector('.select2-options') as HTMLElement;
        const destacado = lista.querySelectorAll('.select2-option')[44] as HTMLElement;
        expect(fixture.componentInstance.highlightedIndex()).toBe(44);
        expect(lista.scrollTop).toBeGreaterThan(0);
        expect(destacado.getBoundingClientRect().top).toBeGreaterThanOrEqual(lista.getBoundingClientRect().top);
        expect(destacado.getBoundingClientRect().bottom).toBeLessThanOrEqual(lista.getBoundingClientRect().bottom);
        expect(document.activeElement).toBe(disparador);
        expect(document.documentElement.scrollTop).toBe(pagina);
        expect(raiz.scrollTop).toBe(desplazamientoAncestro);
        fixture.componentInstance.toggleDropdown();
        fixture.detectChanges();
      }
    });
  }

  it('no rearma el desplazamiento inicial al filtrar conservando todas las opciones', async () => {
    fixture.componentRef.setInput('options', Array.from({ length: 45 }, (_, indice) => ({
      value: indice, label: `Opcion ${indice}`,
    })));
    const panel = await abrir();
    const lista = panel.querySelector('.select2-options') as HTMLElement;
    lista.scrollTop = 200;
    const desplazamiento = lista.scrollTop;
    expect(desplazamiento).toBeGreaterThan(0);
    fixture.componentInstance.onSearchTermChange('Opcion');
    fixture.detectChanges();
    await esperarCuadros();
    expect(lista.querySelectorAll('.select2-option').length).toBe(45);
    expect(lista.scrollTop).toBe(desplazamiento);
  });

  it('Tab cancela el foco programado antes del primer frame', async () => {
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    const busqueda = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    const enfocar = spyOn(busqueda, 'focus').and.callThrough();
    busqueda.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await esperarCuadros();
    expect(enfocar).not.toHaveBeenCalled();
  });

  for (const searchable of [true, false]) {
    it(`Escape desde la lista enfocada conserva el dialogo con busqueda ${searchable}`, async () => {
      fixture.componentRef.setInput('searchable', searchable);
      fixture.detectChanges();
      const dialogo = document.createElement('dialog');
      document.body.append(dialogo);
      dialogo.append(fixture.nativeElement);
      dialogo.showModal();
      try {
        const panel = await abrir();
        const lista = panel.querySelector('.select2-options') as HTMLElement;
        lista.focus();
        expect(document.activeElement).toBe(lista);
        const evento = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        lista.dispatchEvent(evento);
        expect(evento.defaultPrevented).toBeTrue();
        expect(fixture.componentInstance.isOpen()).toBeFalse();
        expect(dialogo.open).toBeTrue();
        expect(document.activeElement).toBe((fixture.nativeElement as HTMLElement).querySelector('.select2-trigger'));
      } finally {
        fixture.destroy();
        dialogo.close();
        dialogo.remove();
      }
    });
  }

  it('Tab desde la lista enfocada cierra despues de salir sin recuperar foco', async () => {
    const panel = await abrir();
    const lista = panel.querySelector('.select2-options') as HTMLElement;
    lista.focus();
    expect(document.activeElement).toBe(lista);
    const disparador = (fixture.nativeElement as HTMLElement).querySelector('.select2-trigger') as HTMLElement;
    const enfocar = spyOn(disparador, 'focus').and.callThrough();
    const evento = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    lista.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBeFalse();
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    expect(lista.isConnected).toBeTrue();
    const destino = document.createElement('button');
    document.body.append(destino);
    try {
      // dispatchEvent no hace la tabulacion nativa; se representa su destino.
      destino.focus();
      await new Promise<void>(resolver => window.setTimeout(resolver, 0));
      expect(fixture.componentInstance.isOpen()).toBeFalse();
      expect(document.activeElement).toBe(destino);
      expect(enfocar).not.toHaveBeenCalled();
    } finally { destino.remove(); }
  });

  it('ShiftTab desde la lista al buscador conserva el panel abierto', async () => {
    const panel = await abrir();
    const lista = panel.querySelector('.select2-options') as HTMLElement;
    lista.focus();
    expect(document.activeElement).toBe(lista);
    const evento = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    lista.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBeFalse();
    panel.querySelector('input')!.focus();
    await new Promise<void>(resolver => window.setTimeout(resolver, 0));
    expect(fixture.componentInstance.isOpen()).toBeTrue();
    expect(document.activeElement).toBe(panel.querySelector('input'));
  });

  it('no duplica Tab procedente de una opcion', async () => {
    const panel = await abrir();
    const manejar = spyOn(fixture.componentInstance, 'handleKeydown').and.callThrough();
    panel.querySelector('.select2-option')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(manejar).toHaveBeenCalledTimes(1);
    await new Promise<void>(resolver => window.setTimeout(resolver, 0));
  });

  it('no duplica flechas de opciones ni delega las originadas en listbox', async () => {
    fixture.componentRef.setInput('options', [
      { value: 'ARE', label: 'Arequipa' }, { value: 'CUS', label: 'Cusco' },
    ]);
    const panel = await abrir();
    const manejar = spyOn(fixture.componentInstance, 'handleKeydown').and.callThrough();
    panel.querySelector('.select2-option')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    expect(manejar).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.highlightedIndex()).toBe(1);
    panel.querySelector('.select2-options')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    expect(manejar).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.highlightedIndex()).toBe(1);
  });

  for (const destruir of [false, true]) {
    it(`${destruir ? 'destruir' : 'deshabilitar'} cancela foco y posicion pendientes`, async () => {
      fixture.componentInstance.toggleDropdown();
      fixture.detectChanges();
      const busqueda = (fixture.nativeElement as HTMLElement).querySelector('input')!;
      const enfocar = spyOn(busqueda, 'focus').and.callThrough();
      const cancelar = spyOn(window, 'cancelAnimationFrame').and.callThrough();
      if (destruir) fixture.destroy();
      else fixture.componentInstance.setDisabledState(true);
      expect(cancelar.calls.count()).toBeGreaterThanOrEqual(2);
      await new Promise<void>(resolver => requestAnimationFrame(() => resolver()));
      expect(enfocar).not.toHaveBeenCalled();
    });
  }
});
