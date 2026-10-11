---
title: "Presentación compatible de transacciones"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-01"
last_updated: "2026-10-01"
document_type: "roadmap de implementación"
status: "en curso"
version: "1.0.0"
change_id: "ATOMIC-20261001-001"
---

# Presentación compatible de transacciones

## Alcance

El dueño autoriza conservar el diseño de Ventas y crear las piezas faltantes
en Atomic. Fuente main, referencia inicial 7d9c87bec1e20778515c64e532bad6e7a144637b;
nueve documentos previos sucios preservados. Sin commits ni publicación.
Coordinado con VCXC-20261001-002; mismo temporal de sondeo y reparto Atomic propio,
capturado antes de escribir. No se modifica backend ni componentes existentes.

## Brecha comprobada y tareas

ReceiptPanel presenta comprobantes térmicos; PrintDocumentPanel resume tablas
en pantalla, no muestra sus filas. Ninguno reemplaza fielmente el detalle
aprobado de Ventas. No se altera su comportamiento ni el chasis/modal/stepper.

- [x] TransactionDetail: título/acción, grupos semánticos, tablas y total, con
  datos de presentación tipados; sin moneda, cálculos, API ni dominio internos.
- [x] TransactionEditor: slots públicos de disposición para filas, cabeceras,
  acciones y resumen; tokens existentes reales, sin CSS visual en features.
- [x] Catálogo, barrel, pruebas de proyección/lectura y reglas adaptables.
- [x] Validación de fuente antes de adopción local; registrar bloqueos de
  procedencia sin falsificar manifiesto ni declarar release.
- [x] Changelog, lecciones y continuidad con resultados y rollback.
- [ ] Publicación y procedencia global; muestra de catálogo y revisión visual móvil.

## Evidencia acotada

Tres pruebas específicas ChromeHeadless pasan; build de fuente pasa con aviso
de presupuesto (1.25 MB frente a 1.2 MB). Catálogo válido con 45 entradas; nuevas
piezas son candidatas y aún no tienen muestra. Los ocho archivos se mantienen
idénticos en ventas-cxc; sus 64 pruebas específicas pasan. Captura del detalle
oscuro confirma superficies y texto legibles; hay reglas móviles, no una
certificación visual móvil. No se guardaron operaciones financieras.

Gobierno agregado se detuvo al no concluir; tokens globales detectan referencias
preexistentes ausentes en pagina-crud-accordion y layout-shell. No tocar esas
piezas, políticas, manifiestos o hashes para dar verde. Colisión local pasa;
sondeo final no registra cambios de rama, HEAD o remoto. La fuente sigue sin
publicar y el roadmap abierto, aunque sus pruebas específicas sean positivas.

Validación documental del manifiesto temporal: pasa, limitada a forma/enlaces y
estado Git revisado; no acredita cierre de este roadmap ni toda la procedencia.
La ortografía heredada mantiene faltas de tilde reproducidas en la copia previa;
no hay defectos de bytes nuevos ni cambios de verificadores para ocultarlos.

## Aceptación y rollback

Conservar dos columnas de resumen, filas alineadas, pie, iconos y superficies
legibles en ambos temas. Cortes adaptables sin desbordamiento. Se distinguen
pruebas locales de gates globales. Retirar solamente las piezas nuevas y sus
referencias tras comprobar consumidores; conservar copias del estado previo.
No regenerar ni sobrescribir el árbol UI del consumidor ni elevar versión.
