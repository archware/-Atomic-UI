// Script de diagnóstico para pegar en la consola del navegador
const root = document.querySelector('.so-root');
const barY = document.querySelector('.so-scrollbar-y');
const barX = document.querySelector('.so-scrollbar-x');
const scrollArea = document.querySelector('.so-scroll-area');

console.log('=== ANÁLISIS DE DIMENSIONES ===');
console.log('Root rect:', root?.getBoundingClientRect());
console.log('Barra Y rect:', barY?.getBoundingClientRect());
console.log('Barra X rect:', barX?.getBoundingClientRect());
console.log('Scroll area rect:', scrollArea?.getBoundingClientRect());
console.log('Barra Y right:', getComputedStyle(barY).right);
console.log('Barra Y width:', getComputedStyle(barY).width);
console.log('Barra X left:', getComputedStyle(barX).left);
console.log('Barra X width:', getComputedStyle(barX).width);
