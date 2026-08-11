import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './context-menu.component';

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextMenuComponent>;
  let component: ContextMenuComponent;
  let controls: HTMLElement[];
  let readText: jasmine.Spy<() => Promise<string>>;
  let writeText: jasmine.Spy<(text: string) => Promise<void>>;
  let execCommand: jasmine.Spy<(command: string) => boolean>;
  let clipboardDescriptor: PropertyDescriptor | undefined;
  let execCommandDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    controls = [];
    clipboardDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'clipboard');
    execCommandDescriptor = Object.getOwnPropertyDescriptor(document, 'execCommand');
    readText = jasmine.createSpy('readText').and.returnValue(Promise.resolve(''));
    writeText = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    execCommand = jasmine.createSpy('execCommand').and.returnValue(false);
    installClipboard();
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });

    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    for (const control of controls) {
      control.remove();
    }
    if (clipboardDescriptor) {
      Object.defineProperty(window.navigator, 'clipboard', clipboardDescriptor);
    } else {
      delete (window.navigator as unknown as { clipboard?: Clipboard }).clipboard;
    }
    if (execCommandDescriptor) {
      Object.defineProperty(document, 'execCommand', execCommandDescriptor);
    } else {
      delete (document as unknown as { execCommand?: Document['execCommand'] }).execCommand;
    }
    TestBed.resetTestingModule();
  });

  function installClipboard(): void {
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { readText, writeText } as unknown as Clipboard,
    });
  }

  function append<T extends HTMLElement>(element: T): T {
    document.body.appendChild(element);
    controls.push(element);
    return element;
  }

  function textInput(value = ''): HTMLInputElement {
    const input = append(document.createElement('input'));
    input.type = 'text';
    input.value = value;
    return input;
  }

  function openMenu(target: HTMLElement, x = 24, y = 32): MouseEvent {
    target.focus();
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  }

  function menu(): HTMLElement | null {
    return fixture.nativeElement.querySelector('[role="menu"]') as HTMLElement | null;
  }

  function action(label: string): HTMLButtonElement {
    const root = fixture.nativeElement as HTMLElement;
    const match = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')).find(
      (button) => button.textContent?.includes(label),
    );
    if (!match) {
      throw new Error(`No se encontró la acción ${label}.`);
    }
    return match;
  }

  async function settle(): Promise<void> {
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
  }

  it('abre el menú global sobre texto y conserva foco, selección y semántica', () => {
    const input = textInput('abcdef');
    input.setSelectionRange(1, 4);

    const event = openMenu(input, 40, 50);

    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(input);
    expect(menu()?.getAttribute('aria-label')).toBe('Opciones de edición');
    expect(menu()?.querySelectorAll('[role="menuitem"]')).toHaveSize(4);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(component.menuId);
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('cut'));
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);

    const pointerDown = new PointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    });
    action('Copiar').dispatchEvent(pointerDown);
    expect(pointerDown.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(4);
  });

  it('no sustituye el menú nativo fuera del alcance ni en controles deshabilitados', () => {
    const disabled = textInput('bloqueado');
    disabled.disabled = true;
    const email = append(document.createElement('input'));
    email.type = 'email';
    const date = append(document.createElement('input'));
    date.type = 'date';
    const plain = append(document.createElement('div'));
    const unmanagedEditable = append(document.createElement('div'));
    unmanagedEditable.setAttribute('contenteditable', 'true');

    for (const target of [disabled, email, date, plain, unmanagedEditable]) {
      const event = openMenu(target);
      expect(event.defaultPrevented).toBeFalse();
      expect(menu()).toBeNull();
    }
  });

  it('respeta controles con popup propio y el opt-out sin modificar sus atributos ARIA', () => {
    const combobox = textInput('consulta');
    combobox.setAttribute('role', 'combobox');
    combobox.setAttribute('aria-controls', 'resultados');
    combobox.setAttribute('aria-haspopup', 'listbox');
    combobox.setAttribute('aria-expanded', 'true');
    const native = textInput('nativo');
    native.setAttribute('data-context-menu-policy', 'native');

    for (const target of [combobox, native]) {
      const event = openMenu(target);
      expect(event.defaultPrevented).toBeFalse();
      expect(menu()).toBeNull();
    }
    expect(combobox.getAttribute('aria-controls')).toBe('resultados');
    expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    expect(combobox.hasAttribute('aria-activedescendant')).toBeFalse();
  });

  it('mantiene paste-only oculto o revelado y bloquea eventos aunque el menú tenga foco', () => {
    const input = textInput('valor temporal');
    input.type = 'password';
    input.dataset['clipboardPolicy'] = 'paste-only';
    input.setSelectionRange(0, input.value.length);
    openMenu(input);

    expect(action('Cortar').disabled).toBeTrue();
    expect(action('Copiar').disabled).toBeTrue();
    expect(action('Pegar').disabled).toBeFalse();
    expect(action('Seleccionar todo').disabled).toBeFalse();
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('paste'));

    component.setActiveAction('copy');
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('paste'));

    input.type = 'text';
    const pasteButton = action('Pegar');
    pasteButton.focus();
    const shortcut = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    pasteButton.dispatchEvent(shortcut);
    expect(shortcut.defaultPrevented).toBeTrue();

    for (const type of ['copy', 'cut', 'dragstart'] as const) {
      const protectedEvent = new Event(type, { bubbles: true, cancelable: true });
      pasteButton.dispatchEvent(protectedEvent);
      expect(protectedEvent.defaultPrevented).toBeTrue();
    }
    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'deleteByCut',
    });
    pasteButton.dispatchEvent(beforeInput);
    expect(beforeInput.defaultPrevented).toBeTrue();
  });

  it('conserva los guards con disabled y reasigna el controlador al destruirlo', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const second = TestBed.createComponent(ContextMenuComponent);
    second.detectChanges();
    const input = textInput('secreto');
    input.type = 'password';

    const blockedMenu = openMenu(input);
    expect(blockedMenu.defaultPrevented).toBeFalse();
    expect(menu()).toBeNull();
    expect(second.nativeElement.querySelector('[role="menu"]')).toBeNull();

    const copy = new Event('copy', { bubbles: true, cancelable: true });
    input.dispatchEvent(copy);
    expect(copy.defaultPrevented).toBeTrue();

    fixture.destroy();
    fixture = second;
    component = second.componentInstance;
    const reclaimed = openMenu(input);
    expect(reclaimed.defaultPrevented).toBeTrue();
    expect(menu()).not.toBeNull();
  });

  it('consume el primer Escape antes del modal y deja pasar Escape y Tab al cerrarse', () => {
    const overlay = append(document.createElement('div'));
    const input = document.createElement('input');
    input.type = 'text';
    input.value = 'texto';
    overlay.appendChild(input);
    const bubbled: string[] = [];
    overlay.addEventListener('keydown', (event) => bubbled.push(event.key));
    openMenu(input);

    const firstEscape = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(firstEscape);
    fixture.detectChanges();
    expect(firstEscape.defaultPrevented).toBeTrue();
    expect(menu()).toBeNull();
    expect(bubbled).toEqual([]);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(bubbled).toEqual(['Escape']);

    openMenu(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    fixture.detectChanges();
    expect(menu()).toBeNull();
    expect(bubbled).toEqual(['Escape', 'Tab']);
  });

  it('navega solo por acciones habilitadas y normaliza cambios dinámicos', () => {
    const input = textInput('abc');
    input.dataset['clipboardPolicy'] = 'paste-only';
    input.setSelectionRange(0, 3);
    openMenu(input);

    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('paste'));
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('select-all'));

    fixture.componentRef.setInput('disabledActions', ['select-all']);
    fixture.detectChanges();
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('paste'));
    component.setActiveAction('select-all');
    expect(input.getAttribute('aria-activedescendant')).toBe(component.itemId('paste'));
  });

  it('cierra una sesión obsoleta antes de permitir edición y no ejecuta el rango anterior', async () => {
    const input = textInput('abcdef');
    input.setSelectionRange(1, 4);
    openMenu(input);

    const typing = new KeyboardEvent('keydown', {
      key: 'q',
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(typing);
    fixture.detectChanges();
    expect(typing.defaultPrevented).toBeFalse();
    expect(menu()).toBeNull();

    input.value = 'cambiado';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    await component.executeAction('copy');
    expect(execCommand).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('cierra cuando el foco cambia programáticamente a otro control', () => {
    const first = textInput('primero');
    const second = textInput('segundo');
    openMenu(first);

    second.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(second);
    expect(menu()).toBeNull();
    const arrow = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    });
    second.dispatchEvent(arrow);
    expect(arrow.defaultPrevented).toBeFalse();
  });

  it('pega texto plano en el rango, normaliza inputs y respeta maxlength y eventos', async () => {
    const input = textInput('abcd');
    input.maxLength = 6;
    input.setSelectionRange(1, 3);
    const beforeInput = jasmine.createSpy('beforeinput');
    const inputEvent = jasmine.createSpy('input');
    input.addEventListener('beforeinput', beforeInput);
    input.addEventListener('input', inputEvent);
    readText.and.returnValue(Promise.resolve('XY\nZWQ'));
    const selected = jasmine.createSpy('selected');
    component.actionSelected.subscribe(selected);
    openMenu(input);

    action('Pegar').click();
    await settle();

    expect(readText).toHaveBeenCalledOnceWith();
    expect(input.value).toBe('aXY Zd');
    expect(beforeInput).toHaveBeenCalled();
    expect(inputEvent).toHaveBeenCalled();
    expect(selected).toHaveBeenCalledOnceWith('paste');
    expect(menu()).toBeNull();
  });

  it('conserva saltos en textarea e inserta solo nodos de texto en contenteditable', async () => {
    const textarea = append(document.createElement('textarea'));
    textarea.value = 'ab';
    textarea.setSelectionRange(1, 1);
    readText.and.returnValue(Promise.resolve('X\nY'));
    openMenu(textarea);
    action('Pegar').click();
    await settle();
    expect(textarea.value).toBe('aX\nYb');

    const editable = append(document.createElement('div'));
    editable.setAttribute('contenteditable', 'true');
    editable.setAttribute('data-context-menu-policy', 'text-edit');
    editable.textContent = 'abcd';
    editable.focus();
    const range = document.createRange();
    range.setStart(editable.firstChild!, 1);
    range.setEnd(editable.firstChild!, 3);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    readText.and.returnValue(Promise.resolve('<b>X</b>'));
    openMenu(editable);
    action('Pegar').click();
    await settle();

    expect(editable.textContent).toBe('a<b>X</b>d');
    expect(editable.querySelector('b')).toBeNull();
  });

  it('corta y copia selecciones normales sin incluir contenido en el menú', async () => {
    const input = textInput('abcdef');
    input.setSelectionRange(1, 4);
    openMenu(input);
    action('Copiar').click();
    await settle();
    expect(writeText).toHaveBeenCalledWith('bcd');
    expect(fixture.nativeElement.textContent).not.toContain('abcdef');

    writeText.calls.reset();
    input.setSelectionRange(1, 4);
    openMenu(input);
    action('Cortar').click();
    await settle();
    expect(writeText).toHaveBeenCalledWith('bcd');
    expect(input.value).toBe('aef');
  });

  it('informa rechazo de permisos sin mutar, filtrar el texto ni perder el foco', async () => {
    const input = textInput('original');
    input.setSelectionRange(2, 2);
    readText.and.returnValue(
      Promise.reject(new DOMException('detalle interno', 'NotAllowedError')),
    );
    const failed = jasmine.createSpy('failed');
    component.actionError.subscribe(failed);
    openMenu(input);

    action('Pegar').click();
    await settle();

    expect(input.value).toBe('original');
    expect(document.activeElement).toBe(input);
    expect(failed).toHaveBeenCalledOnceWith({
      action: 'paste',
      reason: 'clipboard-denied',
    });
    expect(fixture.nativeElement.textContent).not.toContain('detalle interno');
  });

  it('descarta una lectura asíncrona si el control desaparece o se reabre el menú', async () => {
    let resolveClipboard!: (value: string) => void;
    readText.and.returnValue(
      new Promise((resolve) => {
        resolveClipboard = resolve;
      }),
    );
    const first = textInput('primero');
    const second = textInput('segundo');
    const failed = jasmine.createSpy('failed');
    component.actionError.subscribe(failed);
    openMenu(first);
    action('Pegar').click();
    first.remove();
    openMenu(second);
    resolveClipboard('contenido no aplicable');
    await settle();

    expect(second.value).toBe('segundo');
    expect(failed).toHaveBeenCalledWith({ action: 'paste', reason: 'target-changed' });
    expect(fixture.nativeElement.textContent).not.toContain('contenido no aplicable');
  });

  it('descarta un pegado pendiente si el mismo control cambia antes de resolver', async () => {
    let resolveClipboard!: (value: string) => void;
    readText.and.returnValue(
      new Promise((resolve) => {
        resolveClipboard = resolve;
      }),
    );
    const input = textInput('original');
    input.setSelectionRange(input.value.length, input.value.length);
    const selected = jasmine.createSpy('selected');
    const failed = jasmine.createSpy('failed');
    component.actionSelected.subscribe(selected);
    component.actionError.subscribe(failed);
    openMenu(input);
    action('Pegar').click();

    input.value = 'modificado';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    resolveClipboard('no debe insertarse');
    await settle();

    expect(input.value).toBe('modificado');
    expect(selected).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalledWith({ action: 'paste', reason: 'target-changed' });
  });

  it('cierra la sesión al pulsar fuera del menú', () => {
    const input = textInput('texto');
    const outside = append(document.createElement('button'));
    openMenu(input);

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(menu()).toBeNull();
    expect(input.getAttribute('aria-expanded')).toBeNull();
  });

  it('cierra con scroll externo y conserva el menú durante su propio scroll', () => {
    const input = textInput('texto');
    openMenu(input);
    const openMenuElement = menu()!;
    openMenuElement.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(menu()).not.toBeNull();

    input.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(menu()).toBeNull();
  });
});
