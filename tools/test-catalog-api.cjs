#!/usr/bin/env node

const assert = require('node:assert/strict');
const { declaredInSource } = require('./check-catalog-api.cjs');

const source = `
  import { Input, input, model } from '@angular/core';
  class ComponentePrueba {
    readonly interno = input(false, { alias: 'publico' });
    readonly requerido = input.required<string>({ alias: 'texto' });
    readonly valor = model(0);
    readonly seleccion = model.required<string>({ alias: 'opcion' });
    @Input('tituloPublico') tituloInterno = '';
    @Input({ alias: 'abierto' }) set estadoAbierto(valor: boolean) {}
  }
`;

assert.deepEqual(
  [...declaredInSource(source)].sort(),
  ['abierto', 'opcion', 'publico', 'texto', 'tituloPublico', 'valor'],
);

console.log('Extractor de catálogo probado: respeta alias públicos de signals y decoradores.');
