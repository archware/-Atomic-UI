import { installDialogPolyfill, restoreDialogPolyfill } from './dialog-polyfill';

/*
El contrato del polyfill de `<dialog>`, que es donde vivía un fallo
intermitente caro de diagnosticar.

POR QUE ESTAS PRUEBAS EXISTEN. El polyfill anterior escribía sobre el prototipo
compartido de `HTMLDialogElement` sin `writable: true` y sin deshacerlo nunca.
El corredor de Angular reutiliza un mismo proceso —y su DOM— para varios
archivos, así que el prototipo envenenado sobrevivía al archivo que lo instaló.
Cualquier prueba posterior que hiciera `dialog.showModal = ...` moría con
`TypeError: Cannot assign to read only property`, y solo cuando el reparto de
trabajadores las juntaba en el mismo proceso: verde en una máquina de muchos
núcleos, rojo en un CI de dos.

Ese fallo no lo detectaba ninguna prueba, porque las que sufrían el veneno eran
otras y solo a veces. Estas lo convierten en un fallo local y determinista de
quien rompa el contrato.

POR QUE LAS ASERCIONES SON ABSOLUTAS Y NO «COMO ESTABA ANTES». La primera
versión de este archivo comparaba el descriptor con el que había al empezar
cada caso, y era vacua: si el polyfill no se retiraba, el segundo caso leía
como «antes» el propio polyfill dejado por el primero y la comparación pasaba.
Una prueba de limpieza no puede tomar su referencia de un estado que ella misma
puede haber ensuciado. Aquí se afirma el hecho concreto: en jsdom
`HTMLDialogElement.prototype` NO trae `showModal`, así que después de restaurar
no debe traerlo.
*/
describe('polyfill de dialog', () => {
  /*
  Vigía. Si esto falla, el prototipo llegó sucio a este archivo: o lo ensució
  un caso anterior de aquí, o lo ensució otro archivo que compartió proceso.
  Las dos cosas son el defecto que este helper existe para impedir.
  */
  beforeEach(() => {
    expect(
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'),
    ).toBeUndefined();
  });

  afterEach(() => {
    restoreDialogPolyfill();
  });

  /*
  La regresión exacta. Una asignación sobre la instancia recorre la cadena de
  prototipos; si encuentra allí un dato de solo lectura, en modo estricto
  lanza. Basta con omitir `writable: true` para que este caso caiga.
  */
  it('deja el prototipo escribible, para que una prueba pueda sustituir showModal', () => {
    installDialogPolyfill();
    const dialog = document.createElement('dialog');

    expect(() => {
      dialog.showModal = () => dialog.setAttribute('open', '');
    }).not.toThrow();
  });

  /*
  Y la otra mitad: sin retirarlo, el prototipo queda con `showModal` funcional
  para todos los archivos que ese proceso ejecute después. El código de
  producción decide con `typeof element.showModal === 'function'`, así que qué
  rama se ejercita dependería del reparto de trabajadores. Retirarlo es lo que
  hace que cada archivo pruebe lo que cree probar.
  */
  it('retira el polyfill al restaurar, sin dejar rastro para el archivo siguiente', () => {
    installDialogPolyfill();
    expect(typeof HTMLDialogElement.prototype.showModal).toBe('function');

    restoreDialogPolyfill();

    expect(
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'),
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close'),
    ).toBeUndefined();
  });

  /*
  Instalar dos veces sin restaurar en medio guardaría el polyfill como si fuera
  el original, y entonces restaurar lo dejaría puesto para siempre: el peor de
  los casos, porque la limpieza aparentaría funcionar.
  */
  it('instalar dos veces seguidas no convierte el polyfill en el original', () => {
    installDialogPolyfill();
    installDialogPolyfill();

    restoreDialogPolyfill();

    expect(
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'),
    ).toBeUndefined();
  });

  it('mientras está instalado, abrir y cerrar mueve el atributo open', () => {
    installDialogPolyfill();
    const dialog = document.createElement('dialog');
    const cerrados: Event[] = [];
    dialog.addEventListener('close', (event) => cerrados.push(event));

    dialog.showModal();
    expect(dialog.hasAttribute('open')).toBe(true);

    dialog.close();
    expect(dialog.hasAttribute('open')).toBe(false);
    expect(cerrados).toHaveLength(1);
  });
});
