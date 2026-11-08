---
title: "Recuperación del arnés de entradas y pruebas"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-11-02"
last_updated: "2026-11-02"
document_type: "desviación"
status: "corregida"
version: "1.0.0"
id: "DESVIACION-ATOMIC-20261102-003-001"
asignacion: "ATOMIC-20261102-003"
repositorio: "-Atomic-UI"
fecha: "2026-11-02"
estado: "corregida"
severidad: "media"
apartado_roto: "§17.0.3"
---

# Recuperación del arnés de entradas y pruebas

## Qué se esperaba

El §5 de orquestación exige descubrir entradas no vacías; el §17.0.3 exige
identificarlas para conservar evidencia válida durante cambios del árbol.

## Qué se observó

El comando preliminar añadió `./-Atomic-UI` aunque ya estaba dentro del
proyecto, y después supuso `_components.css` en vez del archivo real
`_tokens-components.css`. La primera captura quedó vacía y la segunda lectura
falló. No se había lanzado ningún constructor ni editado producto.

Después, la primera prueba específica de DataTable terminó con código uno
porque esbuild no pudo leer el directorio `../../..` en el entorno restringido.
La compilación no llegó a ejecutarse. El constructor conservó la salida
original y solicitó reejecución con acceso de lectura suficiente.

## Evidencia

Desde la raíz de Atomic UI, `Test-Path -LiteralPath './-Atomic-UI'` devuelve
`False`. `Test-Path -LiteralPath 'src/styles/themes/_components.css'` devuelve
`False`, mientras que `_tokens-components.css` existe. La captura inválida se
conserva en `TEMP/atomic-avisos-20261102-003/gobierno-entradas-llamada-fallida.json`.

`tipado-datatable-positivo.log` y su código original registran
`Cannot read directory "../../..": Acceso denegado` y los errores derivados
de resolución de estilos y polyfills. La fixture estricta positiva final
termina con código cero; no sustituye la prueba de navegador.

## Corrección mínima que preserva la doctrina

Se leyó `tools/test-consumer-governance.js`, se descubrieron recursivamente
los archivos de gobierno y ChoiceControl, y se incluyeron las rutas realmente
consumidas. `gobierno-entradas-antes.json` conserva 25 entradas con SHA-256 y
hora de captura anterior a la construcción. Se verificará su igualdad final.
Se repite la prueba específica con permiso de lectura ampliado, sin modificar
configuración ni fuentes para eludir el aislamiento. El resultado final de
esa repetición es código cero y 79 pruebas correctas de DataTable. La suite
integrada posterior también completa 762 casos con código cero; los originales
`karma-cierre.log` y `karma-cierre.exit.txt` conservan esa medición.

En el arnés temporal de negativas se corrigió además la comparación de LF con
fuentes CRLF antes de inyectar defectos. Las mutaciones y restauraciones se
ejecutaron en la copia aislada; sus manifiestos conservan los hashes y no se
modificó el árbol servido para acomodar una medición.

En la acreditación documental posterior al dictamen, una salida tabular se
interpretó inicialmente como cinco códigos uno. La lectura explícita de los
archivos originales demuestra que los cinco contienen cero; el juez detectó
esa discrepancia documental. Las repeticiones `*-acreditacion-correcta*`
también terminan con cero. Se conservan todos los originales y la redacción
equivocada en TEMP; `acreditacion-codigos-lectura-explicita.json` registra los
valores reales. La corrección afecta a la interpretación y su registro, sin
fallo de esas compuertas ni cambios de producto o criterios.

## Lo que NO se debe hacer

No reutilizar la captura vacía ni anunciar equivalencia a partir de ella.
No cambiar la prueba, inventar archivos de componentes ni reconstruir el
estado anterior desde el producto terminado.
