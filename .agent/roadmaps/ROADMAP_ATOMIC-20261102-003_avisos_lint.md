---
title: "Corrección de los avisos de lint de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20261102-003"
---

# Corrección de los avisos de lint de Atomic UI

## Ficha de cambio por riesgo

```yaml
asignacion: "ATOMIC-20261102-003"
ruta: "completa"
justificacion: "Los avisos afectan tipos de una plantilla pública y semántica compartida de foco y teclado. La exploración detecta compatibilidad pendiente del genérico predeterminado de PaginaCrud; se mantiene la ruta completa para resolverla expresamente antes de construir."
objetivo: "Eliminar los 22 avisos sin supresiones ni reducción de severidad y conservar el arranque visible y las correcciones anteriores."
base:
  repositorio: "C:/Users/cotaha/source/repos/-Atomic-UI"
  rama: "main"
  oid: "7633d4c81384cfda10d6e7108750870ca44b8dc0"
  estado: "19 archivos modificados y ocho documentos nuevos previos de las unidades 001 y 002, preservados mediante diff y respaldo en TEMP."
trabajo_ajeno: "Las unidades 001 y 002 de esta conversación se preservan; el trabajo concurrente de ventas-cxc en la raíz compartida queda fuera de alcance. Modo sucio esperado declarado, sin ficheros compartidos de producto."
contratos: "Se autoriza expresamente endurecer el valor predeterminado de PaginaCrud a Record<string, unknown> dentro de la corrección solicitada; los tipos de entidad explícitos y el runtime permanecen. Las referencias desnudas pueden requerir parametrización. No se elimina ni propaga ningún componente publicado."
roles: "Orquestador /root sin edición de producto; exploradores gpt-6.1-sol bajo; arquitecto gpt-6-astra máximo; constructores gpt-6.1-sol alto; juez independiente gpt-6-astra máximo. Ejecución manual de las fases mediante herramientas nativas de Codex."
autorizaciones: "Corrección local de los avisos solicitada por el usuario. Continúa el congelamiento de publicación; no se autorizan cambios en consumidores, versiones, dependencias ni política de lint."
disparadores_escalado: "Cambio incompatible no resuelto, alteración de diseño útil, animación nueva o necesidad de tocar otro producto: detener el frente y cerrar la decisión antes de editar."
rollback: "Restituir únicamente los fragmentos de esta unidad desde TEMP/atomic-avisos-20261102-003/respaldo, conservando las unidades previas y el trabajo concurrente."
```

La captura inicial `sondeo-antes.json` registra los 38 repositorios a las
17:58:31 del 2 de noviembre. Las rutas exactas, órdenes cerradas y sus huellas
se incorporan al reparto antes de lanzar constructores. Los agentes de
exploración y arquitectura reciben el bloque A literal. La documentación de
continuidad y el manifiesto se actualizan después de estabilizar el producto.

## Encuadre y aceptación

La línea base contiene 18 avisos `no-explicit-any` y cuatro de accesibilidad.
Se conservan los resultados originales de la unidad 002: 708 pruebas correctas,
arranque ESM visible y lint sin errores. El criterio nuevo es cero avisos en
la ejecución completa, con pruebas de regresión para los comportamientos
afectados y compilación también de historias y blueprints.

| Criterio | Comprobación | Resultado esperado | Invalidación |
|---|---|---|---|
| Tipado y accesibilidad | `npm run lint` | Cero errores y cero avisos; reglas intactas | Cambios de código o configuración |
| Conducta | Karma completo en ChromeHeadless y regresiones específicas | Casos anteriores y nuevos correctos | Cambios de fuentes o dependencias |
| Distribución | Build de aplicación, biblioteca y Storybook; manifiesto | Código cero, inventario coherente | Cambios de fuentes, catálogo o configuración |
| Gobierno Atomic | `npm run governance:check` completo | Código cero | Cambios en sus entradas pertinentes |
| Interacción | Navegador real: arranque, pestañas y confirmación | Interfaz visible, teclado y foco funcionales | Cambios de componentes o entorno |
| Gobierno del ecosistema | `compuertas.ps1` completo y controles de encargo | Salidas originales y atribución de hallazgos externos | Última escritura pertinente |
| Revisión | Juez externo contra órdenes, diff y originales | Todos los criterios comprobados | Cambio posterior de producto |

Las entradas de `governance:test` se descubren y capturan antes de construir;
esa primera fase puede ejecutarse en paralelo porque no consume las fuentes
objeto de los avisos. Su equivalencia se comprobará antes del cierre. Las
fases posteriores se ejecutarán sobre las fuentes estables y el manifiesto
actualizado, repitiendo únicamente las que lo requieran si se adelantan.

El intento anticipado `governance.log` acreditó `governance:test`, pero su
segunda fase alcanzó el generador mientras el tipado ya había cambiado y el
manifiesto todavía no se había regenerado. Terminó con código uno y el
diagnóstico literal de inventario no coincidente. Esa salida se conserva y
no acredita el cierre. Se inició una segunda corrida completa con lecturas
suficientes; el manifiesto se regenerará al estabilizar el producto antes de
que sus fases dependientes lo consuman. No se omite ni desactiva una prueba.

## Órdenes de obra y decisión de compatibilidad

El arquitecto entrega `ORDEN_ATOMIC-20261102-003_tipado.md` en el directorio de
evidencia, con SHA-256
`652e2332ca61e4d17f8c493ae35ec24b2f3ed343132b3e7f89d2ecc4ef33ee9c`.
Sus 13 rutas figuran literalmente en `reparto-tipado.json`; la compuerta previa
devuelve cero y captura 29 archivos sucios. El lanzamiento ocurre a las
18:15:35, después de esa captura. No existe solapamiento con el frente de
accesibilidad pendiente de lanzamiento.

La decisión explícita del responsable mantiene la ruta completa y cambia
`PaginaCrud<T extends object = any>` por
`PaginaCrud<T extends object = Record<string, unknown>>`. El parámetro explícito
`PaginaCrud<Entidad>` conserva su contrato. Se reconoce el endurecimiento:
una referencia sin parámetro deja de permitir operaciones arbitrarias sobre
propiedades de fila. Se migra indicando la entidad, por ejemplo
`viewChild<PaginaCrud<EntidadCatalogo>>('chasis')`, o estrechando el valor
desconocido. No se promete equivalencia universal con `any`, ni se toma una
decisión de versión o publicación. El barrido de consumidores existentes y
la fixture Angular estricta se conservan con sus límites en la orden.

La segunda orden, `ORDEN_ATOMIC-20261102-003_accesibilidad.md`, tiene SHA-256
`316336fc98df7acfec558703f6378617991b74818cc6b7e27380de0f386c2ccd`.
Antes de ampliar se verificó el confinamiento del tramo de tipado: cero rutas
externas. `reparto-producto.json` añade doce rutas disjuntas; su captura previa
contiene 42 archivos sucios y devuelve cero antes del nuevo lanzamiento.

`CrudDialog` incorpora `rol` (`dialog` por defecto) y
`cerrarAlPulsarFondo` (`false` por defecto). La confirmación del acordeón opta
por `alertdialog` y fondo, conserva su anchura máxima previa de 28rem mediante
el token real del chasis y usa cierre interno sin animación. Se elimina el
fondo interactivo artificial y se conserva la decisión de cancelación en el
consumidor. La intención se consume antes de emitir para impedir duplicados
reentrantes. Las diferencias inevitables de top layer y margen canónico se
declaran; no se afirma una comparación visual previa que la demo idle no
permitió realizar. La historia nueva acredita el flujo real con datos de
demostración y sin una operación de persistencia.

## Tareas

- [x] Capturar estado inicial y explorar tipos y accesibilidad sin escribir.
- [x] Cerrar arquitectura, compatibilidad y órdenes de obra de producto.
- [x] Verificar reparto disjunto y conservar respaldos antes de construir.
- [x] Corregir los avisos con cobertura conductual.
- [x] Ejecutar pruebas, construcciones, gobierno y navegador.
- [x] Obtener juicio independiente y completar las compuertas del alcance, declarando el defecto global externo.
- [x] Actualizar continuidad, lecciones, changelog e inventario documental.
- [x] Acreditar sondeo y confinamiento finales y dejar rollback revisable.

## Desviaciones y evidencia

La evidencia original reside en
`C:/Users/cotaha/AppData/Local/Temp/atomic-avisos-20261102-003`.
La desviación `DESVIACION-ATOMIC-20261102-003-001` registra la corrección de
una captura preliminar de entradas con rutas erróneas. No afecta al producto;
se conservó la captura inválida y se descubrieron las 25 entradas reales antes
del lanzamiento de constructores y se repitió Karma con lectura suficiente.
La desviación 002 registra la prueba reentrante que inicialmente no detectaba
el defecto; la negativa corregida detecta la doble emisión y su restauración
pasa. La desviación 003 registra las esquinas y los IDs numéricos de Storybook;
ambos resultados se corrigieron y verificaron en navegador. Las tres están
corregidas, conservando sus fallos y mediciones originales.

## Adendas y reparto final

El escribano recibió la orden de cierre con huella
`cb8999a8da53a11cb4bc93973c72202ea7259bc2c15f9c22ee503e46da639a14`.
La aclaración de foco nativo tiene huella
`88a9e13c8ff500948d782bbad049d0eaa850c55436b447fea47b7c78ee7ad9cc`;
precisa el alcance descrito por [W3C H102](https://www.w3.org/WAI/WCAG22/Techniques/html/H102):
ningún control del fondo recibe foco mientras el diálogo es modal; se admite
el acceso a controles propios del navegador. La lectura BODY se conserva como
observación junto con AX, sin presentarla por sí sola como prueba de chrome.

La adenda de esquinas tiene huella
`c45670a2d82440cc704486845f41c7328b32dfbae29c67fbf42befb4bac35154`.
Añade cuatro radios interiores con tokens, sin alterar el chasis ni overflow.
La adenda de montaje Storybook tiene huella
`12f02309ff8ecce263df26a4910f33882ada9d4519a2ccdebeeb98683e49ef17`.
Autoriza únicamente `.storybook/preview.ts` y `.storybook/typings.d.ts`:
delegación tipada al subpath público del renderer y copia local del contexto.
No se modifican dependencias, node_modules, títulos, exports ni IDs públicos.

`reparto-final-v3.json` conserva 38 rutas exactas disjuntas: trece de tipado,
doce de accesibilidad, dos de previsualización, siete de cierre documental y
cuatro de gobierno. Su captura previa devuelve cero. El índice compartido
tiene reparto y respaldo separados. Compodoc se conserva en TEMP como
`documentation-generado-003.json` y `documentation-generado-definitivo.json`;
el archivo seguido por Git recupera los bytes exactos anteriores.

## Resultados sobre el producto definitivo

| Criterio | Originales en TEMP | Resultado |
|---|---|---|
| Lint de src | `lint-definitivo.log` y `.exit.txt` | 0; cero errores y cero avisos |
| Previsualización | `previsualizacion-tsc.log`, `previsualizacion-eslint.log`, códigos asociados y repeticiones del juez | 0; tipado y lint estricto de las dos configuraciones |
| Suite | `karma-definitivo.log` y `.exit.txt` | 0; 762/762, con 54 regresiones adicionales |
| App, biblioteca e historias | `build-app-definitivo`, `build-lib-definitivo`, `build-storybook-definitivo`, logs y códigos | Tres códigos 0 |
| Gobierno Atomic completo | `governance-cierre.log` y `.exit.txt` | 0; cadena completa hasta check:focus |
| Distribución | Resultados literales del generador y verificaciones independientes `juez-manifiesto-definitivo.*` | 0; 337 fuentes, SHA-256 `72ade64e0804d6687d2c1afbeac57c5c9362232fb1950518298417df0735c0fe` |
| Índice de historias | Índices anterior/final y cotejo independiente | 623 entradas idénticas en id/type/title/name/importPath; 524 historias, 407 con inicio numérico |
| Navegador | JSON `navegador-*-definitivo`, `navegador-*-final`, `navegador-docs-props` y capturas definitivas | App visible sin errores nuevos; teclado y cierres; tonos; nueve instancias Docs y actualización aislada de props |
| Geometría | `navegador-geometria-definitiva.json`, PNG de 375 y 1280 | Exterior 12px, borde 1px, interiores 11px; sin recorte ni puntas; controles y foco conservados |
| ADN frontend | `adn-frontend.log` y `.exit.txt` | 0; alcance R1–R10 declarado por la compuerta |

Los dos intentos anticipados de gobierno que encontraron un manifiesto todavía
no actualizado conservan código uno y sus salidas. No se convierten en verde.
La ejecución completa final sí termina con cero. La instalación reproducible
de dependencias pertenece a la unidad 001; esta unidad conserva sus catorce
archivos protegidos y no presenta una instalación nueva.

## Conservación de negativas por obligación

Los manifiestos amplios de las negativas capturaron también documentación,
roadmap y configuración Storybook que no entran en los tres specs de Karma.
Sus siete grupos amplios **no son idénticos** al árbol final; no se recalculan
hashes antiguos para simular igualdad. Se conservan originales y diferencias.
`juez-equivalencia-negativas.json` registra el contraste independiente de
hashes originales/actuales y la justificación por obligación.

Las fuentes relevantes de extracción y ordenación de DataTable se conservan.
En accesibilidad, los cambios del spec se limitan a imports y al caso de
reentrada; los otros casos se contrastan byte por byte. Para emisión única
solo se utiliza `negativa-emision-unica-corregida-*`, con defecto detectado y
restauración correcta. La primera negativa que pasó es evidencia del hueco,
nunca de protección. Los cuatro radios no cambian DOM, rectángulo, foco ni
emisiones, comprobados mediante geometría y Karma definitivos. Preview y sus
tipos quedan fuera de tsconfig.spec. Esa revisión conserva la evidencia
válida de esta misma asignación, conforme a §17.0.3, sin afirmar una ejecución
nueva ni la igualdad del inventario amplio.

## Compuertas globales y cambios concurrentes

La corrida completa del ecosistema descubre 24 verificadores y ejecuta 17.
Devuelve **1**, con catorce PASA y tres DEFECTO. La salida íntegra se conserva
en `compuertas-completas.log`. Dos defectos corresponden al cierre documental:
una línea vacía al final de continuidad, ya corregida, y un índice compartido
desactualizado por documentación nueva. Se repiten ambos controles y las
rápidas sobre el cierre definitivo; no se elimina ni desactiva una compuerta.

El tercer defecto pertenece a `verificar-secretos.ps1`: 34 registros REAL y
10 DEBIL fuera de Atomic UI, en camas-nfc-movil, citas-medicas-back y
cxc-ventas-back. Se conserva el informe original sin reproducir valores. No
se modifican esos productos ni se afirma que el ecosistema esté limpio.

El sondeo de las 19:01:58 compara los mismos 38 repositorios: 69 diferencias,
sin cambios de rama, HEAD, remotos ni referencias. Las 37 rutas modificadas
de Atomic quedan cubiertas por su reparto; el índice es un derivado propio.
Las diferencias compartidas de ventas-cxc se atribuyen a los repartos
conservados de VCXC-20261102-001 y VCXC-20261102-002. El helper descubre los
repartos y sus rutas, conserva sus hashes y no certifica su implementación.

Se observan además cambios externos en `pdf-tool/src-tauri/Cargo.lock`,
`pdf-tool/src-tauri/Cargo.toml` y `pdf-tool/src-tauri/src/main.rs`, relacionados
con fusión PDF. Permanecen intactos y fuera del encargo. No se infiere autor
individual ni se certifica ese producto. El usuario confirmó en esta
conversación que pertenecen a trabajo paralelo. Esa atribución no amplía el
alcance ni autoriza escrituras en ese repositorio.
`atribucion-cambios.json` conserva el detalle por ruta, sin cobertura faltante
de cambios propios o del árbol compartido. El cierre repetirá la captura y
el confinamiento después de la última escritura documental.

## Cierre acreditado

El juez independiente aprueba los doce criterios locales sin hallazgos
abiertos. `juez-dictamen-final.json` conserva 67 referencias y SHA-256
`ee88fb776702ac634ef9b80960c174e7fb737b7f86183952c660b98b9d2f5b69`.
Recalculó las siete huellas y sus 765 entradas, descubrió las 747 fuentes
correspondientes y verificó 252 originales antes de emitir el dictamen.
La equivalencia negativa queda en su artefacto independiente con SHA-256
`bca1792ad8193f78e1e56bb9881a3398eef5f91b46304ef7c76dc10e265c4f74`.

La repetición documental de Atomic, diff y las doce compuertas rápidas
terminan con cero. El índice final contiene 2351 Markdown en 44 ámbitos.
El confinamiento del producto y del índice compartido termina con cero.
El sondeo de las 19:29:14 mantiene 69 diferencias explicadas en tres
repositorios y los mismos 38 repositorios, sin cambios en referencias.
El usuario confirma el trabajo paralelo de PDF; todas sus rutas se preservan.

Las interacciones públicas de Storybook muestran estado persistente Pass:
ocho pasos en ConfirmacionConFondo y 23 en ConfirmacionAccesible, todos
correctos y sin errores de consola. Las capturas y JSON se conservan junto
con la aplicación visible. El servidor temporal propio de Storybook se
cerró después de acreditar esas observaciones; el servidor del usuario en
4200 se conserva.

Los catorce archivos protegidos de las unidades previas y las 25 entradas de
la primera fase de gobierno permanecen idénticos. Rama `main`, OID
`7633d4c81384cfda10d6e7108750870ca44b8dc0` y versión `5.22.0` se conservan.
Los cambios permanecen en el árbol de trabajo bajo el congelamiento vigente.
Los consumidores y la publicación no forman parte del cierre. La corrida
global conserva código uno por los secretos externos descritos, sin
degradarlos a aviso ni certificar limpieza global.

Después de esta fijación únicamente se ejecuta la acreditación documental,
el inventario final de desviaciones y la captura final de sondeo; no se cambia
producto ni se repiten pruebas cuyas entradas se mantienen.
