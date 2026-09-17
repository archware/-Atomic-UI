const origDOMException = global.DOMException;
global.DOMException = class extends origDOMException {
  constructor(message, name) {
    console.error('DOMException THROWN:', message, name);
    console.error(new Error().stack);
    super(message, name);
  }
};
