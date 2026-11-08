import { TestBed } from '@angular/core/testing';
import { CrudDialog } from './crud-dialog';

describe('CrudDialog', () => {
  it('proyecta el formulario y conserva la semántica accesible', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.componentRef.setInput('describedBy', 'editor-help');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('editor-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('editor-help');
    expect(dialog.classList).toContain('crud-dialog');
    expect(getComputedStyle(dialog).overflow).toBe('visible');

    const viewport = dialog.querySelector('app-scroll-overlay') as HTMLElement;
    const surface = dialog.querySelector('[data-crud-dialog-scroll-surface]') as HTMLElement;
    expect(viewport.classList).toContain('crud-dialog__viewport');
    expect(surface.getAttribute('data-so-managed-scrollbar')).toBe('true');
    expect(getComputedStyle(surface).overflowY).toBe('visible');
    expect(getComputedStyle(surface).getPropertyValue('scrollbar-width')).toBe('none');
  });

  it('prioriza el control Atomic marcado y restaura el foco al cerrar', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const launcher = document.createElement('button');
    document.body.appendChild(launcher);
    launcher.focus();

    const ordinaryInput = document.createElement('input');
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.setAttribute('aria-hidden', 'true');
    hiddenInput.tabIndex = -1;
    const control = document.createElement('button');
    control.setAttribute('data-dialog-initial-focus', '');
    fixture.componentInstance.nativeElement.append(ordinaryInput, hiddenInput, control);

    fixture.componentInstance.showModal();
    expect(document.activeElement).toBe(control);

    fixture.componentInstance.close();
    await Promise.resolve();
    expect(document.activeElement).toBe(launcher);

    launcher.remove();
  });

  it('focuses the first invalid interactive control instead of its invalid form container', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const form = document.createElement('form');
    form.classList.add('ng-invalid');
    const hiddenInvalid = document.createElement('input');
    hiddenInvalid.type = 'hidden';
    hiddenInvalid.classList.add('ng-invalid');
    const visibleInvalid = document.createElement('input');
    visibleInvalid.classList.add('ng-invalid');
    form.append(hiddenInvalid, visibleInvalid);
    fixture.componentInstance.nativeElement.append(form);

    fixture.componentInstance.showModal();
    fixture.componentInstance.focusInvalid();

    expect(document.activeElement).toBe(visibleInvalid);
    fixture.componentInstance.close();
  });

  it('reinicia el desplazamiento al volver a abrir el diálogo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const dialog = fixture.componentInstance.nativeElement;
    const scrollSurface = dialog.querySelector('[data-crud-dialog-scroll-surface]') as HTMLElement;
    fixture.componentInstance.showModal();
    scrollSurface.scrollTop = 120;
    fixture.componentInstance.close();

    fixture.componentInstance.showModal();
    expect(dialog.scrollTop).toBe(0);
    expect(scrollSurface.scrollTop).toBe(0);
    fixture.componentInstance.close();
  });

  it('delega el scroll a una sola superficie sin scrollbar nativo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.componentInstance.nativeElement;
    const surface = dialog.querySelector('[data-crud-dialog-scroll-surface]') as HTMLElement;
    const internalArea = dialog.querySelector('.so-scroll-area') as HTMLElement;

    expect(dialog.querySelectorAll('[data-crud-dialog-scroll-surface]').length).toBe(1);
    expect(internalArea.style.overflowY).toBe('hidden');
    expect(surface.getAttribute('data-so-vertical')).toBe('true');
    expect(surface.getAttribute('data-so-managed-scrollbar')).toBe('true');
  });

  it('enfoca el control nativo dentro del primer componente inválido', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const host = document.createElement('app-input');
    host.classList.add('ng-invalid');
    const input = document.createElement('input');
    host.appendChild(input);
    fixture.componentInstance.nativeElement.appendChild(host);

    fixture.componentInstance.showModal();
    fixture.componentInstance.focusInvalid();

    expect(document.activeElement).toBe(input);
    fixture.componentInstance.close();
  });

  it('enfoca la alerta de operación proyectada después de un fallo asíncrono', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const error = document.createElement('div');
    error.setAttribute('role', 'alert');
    error.setAttribute('data-dialog-error', '');
    error.tabIndex = -1;
    fixture.componentInstance.nativeElement.appendChild(error);

    fixture.componentInstance.showModal();
    expect(fixture.componentInstance.focusError()).toBe(true);
    expect(document.activeElement).toBe(error);
    fixture.componentInstance.close();
  });

  /*
    LA PRUEBA DE ARRIBA SE PONIA `tabIndex = -1` A SI MISMA.

    Por eso pasaba mientras el aviso REAL no recibia el foco: `prest-alert`
    renderiza un <div role="alert"> sin tabindex, que no es enfocable. El
    `focus()` no hacia nada, `focusFirst` devolvia `true` igual, y `focusError`
    cancelaba su reintento convencido de haber avisado.

    Esta prueba usa el aviso tal y como existe en el producto.
  */
  it('enfoca un aviso que no es enfocable por si mismo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const error = document.createElement('div');
    error.setAttribute('role', 'alert');
    error.textContent = 'No se pudo registrar el cobro.';
    fixture.componentInstance.nativeElement.appendChild(error);

    fixture.componentInstance.showModal();

    expect(fixture.componentInstance.focusError()).toBe(true);
    expect(document.activeElement).toBe(error);
    expect(error.getAttribute('tabindex')).toBe('-1');
    fixture.componentInstance.close();
  });

  /*
    Y no puede mentir cuando de verdad no hay nada que enfocar: `focusError`
    devuelve false y programa el reintento para cuando el consumidor proyecte el
    aviso.
  */
  it('no da por enfocado lo que no existe', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    fixture.componentInstance.showModal();

    expect(fixture.componentInstance.focusError()).toBe(false);
    fixture.componentInstance.close();
  });
});

function punteroDialogo(destino: Element, opciones: PointerEventInit = {}): PointerEvent {
  const evento = new PointerEvent('pointerdown', {
    bubbles: true, cancelable: true, isPrimary: true, button: 0,
    clientX: 50, clientY: 50, ...opciones,
  });
  destino.dispatchEvent(evento);
  return evento;
}

async function crearDialogoPrueba(optativo = false) {
  await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
  const fixture = TestBed.createComponent(CrudDialog);
  fixture.componentRef.setInput('labelledBy', 'confirmacion-titulo');
  fixture.componentRef.setInput('cerrarAlPulsarFondo', optativo);
  if (optativo) fixture.componentRef.setInput('rol', 'alertdialog');
  fixture.detectChanges();
  const dialogo = fixture.componentInstance.nativeElement;
  spyOn(dialogo, 'getBoundingClientRect').and.returnValue(new DOMRect(100, 100, 300, 200));
  return fixture;
}

describe('CrudDialog rol y fondo optativos', () => {
  it('conserva dialog y no cancela por fondo de forma predeterminada', async () => {
    const fixture = await crearDialogoPrueba();
    const cancelar = jasmine.createSpy('cancelled');
    fixture.componentInstance.cancelled.subscribe(cancelar);
    fixture.componentInstance.showModal();
    expect(fixture.componentInstance.nativeElement.getAttribute('role')).toBe('dialog');
    expect(fixture.componentInstance.nativeElement.hasAttribute('aria-modal')).toBeFalse();
    expect(punteroDialogo(fixture.componentInstance.nativeElement).defaultPrevented).toBeFalse();
    expect(cancelar).not.toHaveBeenCalled();
    fixture.componentInstance.close();
  });

  it('el puntero primario exterior emite una vez con preventDefault y no cierra por su cuenta', async () => {
    const fixture = await crearDialogoPrueba(true);
    const cancelar = jasmine.createSpy('cancelled');
    fixture.componentInstance.cancelled.subscribe(cancelar);
    fixture.componentInstance.showModal();
    const dialogo = fixture.componentInstance.nativeElement;
    expect(dialogo.getAttribute('role')).toBe('alertdialog');
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    const evento = punteroDialogo(dialogo);
    expect(cancelar).toHaveBeenCalledOnceWith(evento);
    expect(evento.defaultPrevented).toBeTrue();
    expect(dialogo.open).toBeTrue();
    fixture.componentInstance.close();
  });

  it('ignora fondo cerrado, botones secundarios, punteros no primarios, interior, borde y descendientes', async () => {
    const fixture = await crearDialogoPrueba(true);
    const cancelar = jasmine.createSpy('cancelled');
    fixture.componentInstance.cancelled.subscribe(cancelar);
    const dialogo = fixture.componentInstance.nativeElement;
    punteroDialogo(dialogo);
    fixture.componentInstance.showModal();
    for (const opciones of [
      { button: 2 }, { isPrimary: false },
      { clientX: 100, clientY: 100 }, { clientX: 400, clientY: 300 },
      { clientX: 101, clientY: 101 }, { clientX: 250, clientY: 200 },
    ]) expect(punteroDialogo(dialogo, opciones).defaultPrevented).toBeFalse();
    const contenido = dialogo.querySelector('[data-crud-dialog-scroll-surface]')!;
    punteroDialogo(contenido);
    expect(cancelar).not.toHaveBeenCalled();
    fixture.componentInstance.close();
  });

  for (const origen of ['fondo', 'Escape']) {
    it(`el consumidor cierra por ${origen} y devuelve el foco al disparador conectado`, async () => {
      const fixture = await crearDialogoPrueba(true);
      const disparador = document.createElement('button');
      document.body.append(disparador);
      disparador.focus();
      fixture.componentInstance.cancelled.subscribe(() => fixture.componentInstance.close());
      fixture.componentInstance.showModal();
      const dialogo = fixture.componentInstance.nativeElement;
      const evento = origen === 'fondo' ? punteroDialogo(dialogo) : new Event('cancel', { cancelable: true });
      if (origen === 'Escape') dialogo.dispatchEvent(evento);
      expect(evento.defaultPrevented).toBeTrue();
      expect(dialogo.open).toBeFalse();
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(document.activeElement).toBe(disparador);
      disparador.remove();
    });
  }
});

async function cerrarYRenderizar(fixture: Awaited<ReturnType<typeof crearDialogoPrueba>>): Promise<void> {
  const cerrado = new Promise<void>(resolve => fixture.componentInstance.nativeElement.addEventListener('close', () => resolve(), { once: true }));
  fixture.componentInstance.close();
  await cerrado;
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('CrudDialog destino de retorno', () => {
  let externos: HTMLElement[];
  beforeEach(() => { externos = []; });
  afterEach(() => externos.forEach(elemento => elemento.remove()));
  function boton(): HTMLButtonElement {
    const elemento = document.createElement('button');
    document.body.append(elemento);
    externos.push(elemento);
    return elemento;
  }

  it('evalua el callback despues de closed y enfoca el destino aunque se retire la fila', async () => {
    const fixture = await crearDialogoPrueba();
    const origen = boton();
    const destino = boton();
    let cerrado = false;
    const resolver = jasmine.createSpy('resolver').and.callFake(() => {
      expect(cerrado).toBeTrue();
      return destino;
    });
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    fixture.componentInstance.closed.subscribe(() => { cerrado = true; });
    origen.focus();
    fixture.componentInstance.showModal();
    expect(resolver).not.toHaveBeenCalled();
    origen.remove();
    await cerrarYRenderizar(fixture);
    expect(document.activeElement).toBe(destino);
    expect(resolver).toHaveBeenCalledTimes(1);
    fixture.componentInstance.nativeElement.dispatchEvent(new Event('close'));
    fixture.detectChanges();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  for (const caso of ['sin callback', 'null', 'excepcion', 'desconectado', 'hidden', 'aria-hidden', 'aria-disabled', 'disabled', 'inert', 'ancestro-hidden', 'no enfocable', 'interno', 'otro documento', 'retirado al enfocar', 'focus lanza']) {
    it(`conserva el origen ante ${caso}`, async () => {
      const fixture = await crearDialogoPrueba();
      const origen = boton();
      let destino: HTMLElement | null = boton();
      if (caso === 'null') destino = null;
      if (caso === 'desconectado') destino!.remove();
      if (caso === 'hidden') destino!.hidden = true;
      if (caso === 'aria-hidden') destino!.setAttribute('aria-hidden', 'true');
      if (caso === 'aria-disabled') destino!.setAttribute('aria-disabled', 'true');
      if (caso === 'disabled') (destino as HTMLButtonElement).disabled = true;
      if (caso === 'inert' || caso === 'ancestro-hidden') {
        const ancestro = document.createElement('div');
        ancestro.setAttribute(caso === 'inert' ? 'inert' : 'hidden', '');
        document.body.append(ancestro);
        ancestro.append(destino!);
        externos.push(ancestro);
      }
      if (caso === 'no enfocable') {
        destino!.remove();
        destino = document.createElement('div');
        destino.textContent = 'Destino sin tabindex';
        document.body.append(destino);
        externos.push(destino);
      }
      if (caso === 'interno') {
        destino!.remove();
        fixture.componentInstance.nativeElement.append(destino!);
      }
      if (caso === 'otro documento') destino = document.implementation.createHTMLDocument().body;
      if (caso === 'retirado al enfocar') destino!.addEventListener('focus', () => destino!.remove());
      if (caso === 'focus lanza') spyOn(destino!, 'focus').and.throwError('No disponible');
      if (caso !== 'sin callback') fixture.componentRef.setInput('resolverFocoRetorno', () => {
        if (caso === 'excepcion') throw new Error('Destino ya no disponible');
        return destino;
      });
      origen.focus();
      fixture.componentInstance.showModal();
      await cerrarYRenderizar(fixture);
      expect(document.activeElement).toBe(origen);
      if (caso === 'no enfocable') expect(destino!.hasAttribute('tabindex')).toBeFalse();
    });
  }

  it('no inventa un destino cuando se retira el origen', async () => {
    const fixture = await crearDialogoPrueba();
    const origen = boton();
    origen.focus();
    fixture.componentInstance.showModal();
    origen.remove();
    await cerrarYRenderizar(fixture);
    expect(document.activeElement).not.toBe(origen);
  });

  it('invalida la restauracion pendiente al reabrir antes del render', async () => {
    const fixture = await crearDialogoPrueba();
    const destino = boton();
    const resolver = jasmine.createSpy('resolver').and.returnValue(destino);
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    const control = document.createElement('input');
    fixture.componentInstance.nativeElement.append(control);
    fixture.componentInstance.showModal();
    const cerrado = new Promise<void>(resolve => fixture.componentInstance.nativeElement.addEventListener('close', () => resolve(), { once: true }));
    fixture.componentInstance.close();
    await cerrado;
    fixture.componentInstance.showModal();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(control);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('restaura una sola generacion al reabrir y cerrar antes del render', async () => {
    const fixture = await crearDialogoPrueba();
    const destino = boton();
    const resolver = jasmine.createSpy('resolver').and.returnValue(destino);
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    fixture.componentInstance.showModal();
    for (let ciclo = 0; ciclo < 2; ciclo++) {
      const cerrado = new Promise<void>(resolve => fixture.componentInstance.nativeElement.addEventListener('close', () => resolve(), { once: true }));
      fixture.componentInstance.close();
      await cerrado;
      if (ciclo === 0) fixture.componentInstance.showModal();
    }
    fixture.detectChanges();
    await fixture.whenStable();
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(destino);
  });

  it('cancela la restauracion pendiente al destruir', async () => {
    const fixture = await crearDialogoPrueba();
    const resolver = jasmine.createSpy('resolver').and.returnValue(boton());
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    fixture.componentInstance.showModal();
    const cerrado = new Promise<void>(resolve => fixture.componentInstance.nativeElement.addEventListener('close', () => resolve(), { once: true }));
    fixture.componentInstance.close();
    await cerrado;
    fixture.destroy();
    await Promise.resolve();
    expect(resolver).not.toHaveBeenCalled();
  });

  it('no confunde un modal oculto o un dialogo cerrado con otra ventana abierta', async () => {
    const fixture = await crearDialogoPrueba();
    const destino = boton();
    const oculto = document.createElement('div');
    oculto.setAttribute('aria-modal', 'true');
    oculto.hidden = true;
    const cerrado = document.createElement('dialog');
    cerrado.setAttribute('aria-modal', 'true');
    document.body.append(oculto, cerrado);
    externos.push(oculto, cerrado);
    fixture.componentRef.setInput('resolverFocoRetorno', () => destino);
    fixture.componentInstance.showModal();
    await cerrarYRenderizar(fixture);
    expect(document.activeElement).toBe(destino);
  });

  it('no roba foco a otra ventana modal abierta', async () => {
    const fixture = await crearDialogoPrueba();
    const otro = TestBed.createComponent(CrudDialog);
    otro.componentRef.setInput('labelledBy', 'otro');
    otro.detectChanges();
    document.body.append(fixture.nativeElement, otro.nativeElement);
    const control = document.createElement('input');
    otro.componentInstance.nativeElement.append(control);
    const resolver = jasmine.createSpy('resolver').and.returnValue(boton());
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    fixture.componentInstance.showModal();
    otro.componentInstance.showModal();
    await cerrarYRenderizar(fixture);
    expect(document.activeElement).toBe(control);
    expect(resolver).not.toHaveBeenCalled();
  });
});
