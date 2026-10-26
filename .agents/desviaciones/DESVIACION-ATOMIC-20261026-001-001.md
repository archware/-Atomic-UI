---
id: DESVIACION-ATOMIC-20261026-001-001
asignacion: ATOMIC-20261026-001
repositorio: -Atomic-UI
fecha: "2026-10-26"
estado: corregida
severidad: media
apartado_roto: "§8"
title: "Permiso de lectura en el ensayo Angular aislado"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
---

## Qué se esperaba

El ensayo aislado debía distinguir errores del candidato de un arnés sin
acceso suficiente y conservar salida y código, conforme a orquestación §8.
La compilación debía utilizar el HEAD fijado y las dependencias existentes,
sin modificar configuración ni árbol compartido.

## Qué se observó

El primer baseline devuelve 1 y reproduce los seis errores TS2345 previstos.
También informa `Cannot read directory` y `Acceso denegado` durante el barrido
de esbuild, seguidos de módulos y estilos no resueltos que existen en la copia.
El constructor detiene la escritura; las cuatro pruebas siguen intactas.
No se interpreta esa ejecución como una medición final del producto.

## Evidencia

Los comandos, directorio, códigos y salidas íntegros quedan en
`C:/Users/cotaha/AppData/Local/Temp/codex-atomic-20261026-001/constructor/`,
archivos `baseline-comando.json`, `baseline-resultado.json`,
`baseline.stdout.txt` y `baseline.stderr.txt`. La ruta exacta de cada original
se conserva en el recibo del constructor y se verifica antes de archivar.
La copia contiene `src/styles.css` y conserva su versión de HEAD.

## Corrección mínima que preserva la doctrina

Se repite exactamente el baseline con permiso de ejecución suficiente,
conservando entradas, comando, directorio y el fallo anterior. Solo si el
ensayo recuperado confirma el bloqueo de las seis expectativas se corrigen
esas cuatro pruebas. El permiso no autoriza escrituras fuera del reparto.
La revisión independiente contrasta fuentes, aislamiento y los originales.

## Recuperación comprobada y límite documental

El baseline con acceso suficiente devuelve 1 exclusivamente por las seis
expectativas TS2345. Tras corregirlas, el mismo comando devuelve 0 y 70/70
casos; la revisión independiente aprueba las cuatro pruebas sin repetirlas.
Los originales se conservan en la evidencia coordinadora DOC-20261026-001.

La codificación de nueve archivos finales devuelve 1 por 150 faltas de tilde.
La misma guarda sobre las cuatro copias documentales previas también devuelve
1 por las mismas 150 faltas: la deuda es anterior. Los fragmentos nuevos se
comprueban por separado sin eliminar ni normalizar el historial. La guarda
del directorio de desviaciones devuelve 1 por DESVIACION-20260929-005.md,
que cita un apartado §3.1 inexistente en orquestación; la desviación propia
no figura como fallo. Ninguno de esos dos códigos se convierte en verde.
## Lo que NO se debe hacer

No cambiar `include` o `exclude` de TypeScript, omitir suites, eliminar estilos,
instalar dependencias o escribir en el destino del enlace compartido. No
convertir un error del sandbox en una corrección de componente. No editar los
45 cambios ajenos de Atomic ni publicar un checkpoint para superar el ensayo.

## Escalado

El reintento de la misma ejecución ya autorizada no amplía el alcance. Un fallo
nuevo fuera de las cuatro especificaciones detiene el frente y se agrupa antes
de cualquier cambio adicional.
