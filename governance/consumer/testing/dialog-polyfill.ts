/*
El API modal de `<dialog>` para las pruebas, que jsdom no trae.

=== POR QUE HACE FALTA ===

jsdom implementa `HTMLDialogElement` como una clase vacía: existe el accesor
`open`, pero `showModal`, `close` y `returnValue` no están definidos. Cualquier
prueba que abra un diálogo real necesita ponerlos.

=== POR QUE `writable: true` NO ES OPCIONAL ===

Esta línea es el motivo de que este archivo exista.

`Object.defineProperty` solo aplica `writable: false` cuando **crea** la
propiedad, y aquí siempre la crea, porque jsdom no la trae. Omitirlo dejaba el
prototipo con un dato de solo lectura, y entonces cualquier prueba posterior
que hiciera

    dialog.showModal = () => ...

reventaba con `TypeError: Cannot assign to read only property 'showModal'`. No
por hacer nada raro: en modo estricto —y todo módulo ESM lo es— una asignación
sobre la instancia recorre la cadena de prototipos, encuentra el dato no
escribible y lanza.

El fallo era intermitente, que es lo que lo hacía caro: el veneno solo alcanza
a las pruebas que corren **después y en el mismo proceso**, y el planificador
de vitest reparte los archivos entre trabajadores. En una máquina con muchos
núcleos casi nunca coincidían; con un solo trabajador salía rojo siempre.

=== POR QUE SE RESTAURA ===

`writable: true` mata el error, pero no la clase de problema. El corredor de
Angular usa `isolate: false` por omisión: un mismo proceso ejecuta varios
archivos de prueba **compartiendo el entorno DOM**, y nada deshace un
`defineProperty` entre uno y otro —`vi.restoreAllMocks()` no lo toca—.

Sin restaurar, el resto de archivos de ese proceso ven un `<dialog>` con
`showModal` funcional, y el código de producción que hace
`typeof element.showModal === 'function'` toma una rama u otra **según el
reparto de trabajadores**. Es decir: qué código se ejercita dependería del
azar. Restaurar es lo que hace que cada archivo pruebe lo que cree probar.
*/

type PolyfilledMember = 'showModal' | 'close';

const ORIGINALS = new Map<PolyfilledMember, PropertyDescriptor | undefined>();

const IMPLEMENTATIONS: ReadonlyArray<readonly [PolyfilledMember, (this: HTMLDialogElement) => void]> =
  [
    [
      'showModal',
      function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    ],
    [
      'close',
      function (this: HTMLDialogElement) {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
      },
    ],
  ];

export function installDialogPolyfill(): void {
  for (const [name, value] of IMPLEMENTATIONS) {
    /* Solo se recuerda el descriptor de la PRIMERA instalación. Instalar dos
       veces sin restaurar en medio guardaría el polyfill como si fuera el
       original, y restaurar dejaría el prototipo sucio para siempre. */
    if (!ORIGINALS.has(name)) {
      ORIGINALS.set(name, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name));
    }
    Object.defineProperty(HTMLDialogElement.prototype, name, {
      configurable: true,
      writable: true,
      enumerable: false,
      value,
    });
  }
}

export function restoreDialogPolyfill(): void {
  for (const [name, descriptor] of ORIGINALS) {
    if (descriptor) {
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    } else {
      /* No había nada antes —el caso normal en jsdom—, así que devolver el
         prototipo a su estado original es borrar la propiedad, no dejarla
         indefinida: `typeof x.showModal === 'function'` debe volver a ser
         falso, como en un proceso recién arrancado. */
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>)[name];
    }
  }
  ORIGINALS.clear();
}
