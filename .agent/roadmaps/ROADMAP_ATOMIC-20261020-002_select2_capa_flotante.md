---
title: "Select2 en capa flotante sin recorte"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-20"
last_updated: "2026-10-20"
version: "1.0.0"
change_id: "ATOMIC-20261020-002"
document_type: "roadmap de asignación"
status: "fuente validada para adopción acotada"
---

# Select2 en capa flotante sin recorte

## Autorización, línea base y alcance

El dueño confirmó que terminó la sincronización y autorizó corregir Select2 en
Atomic mediante una capa flotante y después llevar el resultado a ventas-cxc,
sin sobrescribir trabajo existente. Posteriormente se autorizó expresamente un
commit local acotado a Select2, sus pruebas y documentación, después de la
validación y revisión, sin push. Esta excepción solo rige para esta unidad;
no levanta el congelamiento general ni autoriza publicar.
Atomic parte de main, OID `2d797c04633b7fd08630e775393bbeb168f086e7`, limpio.
La captura previa del 20 de octubre a las 21:55:57 −05:00 abarca 38 repositorios
y reside en el temporal `atomic-select2-535dc8cfb5244131a0135c7bba6d6bca`.

La lista absoluta de Select2 siempre abre debajo; su z-index no evita el
recorte de los ancestros del formulario. Se evaluará el patrón popover manual
ya empleado por Toast, manteniendo el nodo dentro del DOM del componente para
preservar herencia visual e interacción dentro de un diálogo modal.

El alcance se limita al componente Select2, sus pruebas, historia y catálogo,
el manifiesto generado de fuentes y la documentación de esta unidad. No se
modifican ScrollOverlay, ventanas, otros controles, contratos de negocio,
datos, dependencias, tokens globales ni configuración de las compuertas.
La extracción compatible de su plantilla a HTML externo forma parte del
alcance si la orden lo requiere. Las rutas exactas se fijan antes del constructor.

## Plan verificable

- [x] Confirmar liberación humana y capturar el estado inicial.
- [x] Identificar la causa y las piezas reutilizables sin escribir producto.
- [x] Cerrar la orden de obra y medir el reparto acotado.
- [x] Implementar capa superior, posición adaptable, límites y limpieza de recursos.
- [x] Preservar búsqueda, CVA, etiquetas, selección simple/múltiple y teclado.
- [x] Probar Escape sin cierre del formulario, foco, desplazamiento y reapertura.
- [x] Verificar geometría en navegador, tema claro/oscuro y pantalla estrecha.
- [x] Ejecutar pruebas y compuertas; distinguir fallos previos de los propios.
- [x] Obtener juicio independiente y actualizar documentación y evidencia.
- [x] Preparar la adopción en Ventas sin falsear la procedencia del candidato.

## Criterios y custodia

La lista puede salir del popup pero no debe quedar fuera del área visible de
pantalla. Se abre hacia el lado disponible, limita su altura y conserva el
desplazamiento de opciones. No se eleva el z-index como sustituto del cálculo.
El primer Escape cierra la lista, no el formulario; los listeners se retiran
al cerrar o destruir y un control deshabilitado no permanece abierto.

Se utiliza el reparto secuencial para evitar escrituras paralelas en Select2.
El orquestador custodia documentación; el constructor implementa solo su orden
y un juez de modelo distinto verifica contra ella. Las pruebas negativas se
realizan en una copia temporal, sin alterar la instancia del usuario.

La propagación certificada necesita una referencia elegible y limpia. El
congelamiento general permanece vigente salvo el commit local expresamente
autorizado para esta unidad; no se modifica el pin del
consumidor para atribuir código sin confirmar a un commit existente. Cualquier
paso impedido se registra como pendiente, no como prueba aprobada.

## Validación y rollback

Se registrarán comandos, códigos y límites de pruebas, catálogo, tokens,
gobierno, compilación, Storybook y consumidor. La inspección estática no acredita
top layer ni geometría. No se guardarán políticas ni otros datos reales.

El rollback retira únicamente los bloques de esta unidad y sus archivos nuevos,
contrastando primero los cambios posteriores. No se restauran archivos completos
del consumidor ni se emplean reset, checkout o limpiezas globales.

## Resultado

El candidato final pasa 63/63 pruebas en ChromeHeadless y 63/63 en
Vitest/JSDOM temporal. El juicio anterior detectó el desplazamiento inicial
sin buscador, la cobertura enmascarada del observador y el foco automático de
Chromium en el listbox desplazable. La segunda corrección conserva el scroll
inicial, declara tabindex=-1 y canaliza Tab/Escape del listbox por el cierre
existente, sin duplicar eventos de opciones. La revisión final y la adopción
real requieren su acreditación separada. El juicio final de la fuente es
APROBADO: ejecución propia de 63/63, aplicación/librería/Storybook salida 0 y
seis negativas con 11/5/1/2/5/3 fallos respectivamente. Restauración final
63/63 y ocho archivos idénticos a fuente. Las advertencias de tamaño de las
compilaciones no se ocultan ni autorizan cambiar presupuestos.

La fuente queda lista para el commit local expresamente autorizado. El OID y
la comprobación posterior del consumidor quedan en su roadmap; no se afirma
que la adopción haya ocurrido antes de esa evidencia.

CUA verifica la historia EnPopupConRecorte en 320, 375, 768 y 1366 px, temas
claro/oscuro, dos filtros de lista corta y altura reducida 375x320. El juez
inspeccionó las capturas y geometrías crudas: lista larga arriba y corta abajo,
margen 8, separación 4, texto envuelto y límites del viewport respetados.
El operador CUA fue el orquestador; el juicio corresponde al revisor externo.
Los recorridos finales simples, múltiples y sin búsqueda mantienen foco
nativo: Tab sale al pie, ShiftTab vuelve al destino legítimo y Escape cierra
solo Select2. Se verificó además el clic real en scrollbar, Tab y ShiftTab
desde ese foco, y reapertura con Opción 45 visible. No se guardaron datos.

Las compuertas finales de catálogo, API, tokens, Signals, control flow,
estilos externos, etiquetas, selectores, valores CSS, tipografía, contraste
y foco devuelven 0. El manifiesto canónico descubre 326 archivos; su huella
definitiva se conserva en distribution/atomic-source-manifest.json.
El reparto final antes de commit devuelve 0: 14 rutas, 0 externas; conserva
una entrada de stash previa sin manipularla. La comprobación documental del
proyecto devuelve 0 con dos avisos.

El primer juicio rechazó foco y ocultación; se corrigieron en la misma unidad
mediante órdenes del arquitecto. La transición del buscador solo conserva
borde, fondo, color y sombra, evitando animar tamaño/visibilidad. El registro
de restricciones e incidencias se conserva en
[la desviación de ensayo](../../.agents/desviaciones/DESV_ATOMIC-20261020-002_ensayo_select2.md).
La suite global no se certifica: existen seis TS2345 previos en otras pruebas.

governance:test pasa; governance:smoke pasa después de regenerar el manifiesto
estable. Las etapas restantes de governance:check se ejecutaron por separado
con éxito (incluidos tooling:test, pruebas negativas de Signals/control flow,
package:check y tokens:dart:check). No se oculta la primera salida 1 del comando
compuesto por manifiesto transitorio; no equivale a una certificación global
de la raíz. Los logs y las capturas residen en el temporal de esta unidad.

El sondeo previo al commit compara 38 repositorios y devuelve 1 por las
21 diferencias esperadas de esta unidad en Atomic y los documentos de Ventas;
no detecta cambios de rama, referencias ni remotos. La colisión vuelve a
devolver 0 (14 rutas tocadas, 0 externas). La entrada de stash previa permanece
intacta. La aprobación humana del commit local es la excepción expresa al
congelamiento señalado por el sondeo; no autoriza push.
