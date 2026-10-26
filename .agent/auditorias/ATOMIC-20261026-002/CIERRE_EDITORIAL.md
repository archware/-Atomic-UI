---
title: "Cierre editorial de Atomic y referencia material"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-10-26"
last_updated: "2026-10-26"
document_type: "evidencia y checklist"
status: "cerrado"
version: "1.0.0"
change_id: "ATOMIC-20261026-002"
---

# Cierre editorial de Atomic y referencia material

La unidad corrige los 150 hallazgos originales: corresponden a 151
ocurrencias de prosa, 133 en `CHANGELOG.md` y 18 en `LESSONS_LEARNED.md`.
Una fila contiene dos ocurrencias de la misma palabra y la guarda solo
cuenta una por fila. No se modifican contratos ASCII para acentuar la prosa.

El corte parte de `main`, OID
`dd93734a3eea40b87d46b4990976231fe2d6ca19`, con 57 archivos sucios previos.
La ruta estándar, el reparto disjunto, la autorización y el rollback están
en el [roadmap](../../roadmaps/ROADMAP_ATOMIC-20261026-002_tildes_y_referencia.md).
El alcance es documental; no acredita el paquete ni la gobernanza global.

## Checklist y comparación

- [x] Registrar sondeo y copias antes del reparto; conservar el trabajo previo.
- [x] Corregir las 151 ocurrencias de prosa de la matriz original.
- [x] Conservar claves, nombres, literales, versiones, bloques y contratos ASCII.
- [x] Conservar las cinco anclas anteriores afectadas y la secuencia de los
  43 encabezados posteriores ya acentuados. Dos encabezados usan HTML con
  su identificador ASCII anterior para evitar renumerar esa secuencia.
- [x] Mantener separados el hallazgo visual abierto y la corrección de su cita.
- [x] Conservar las salidas históricas y los códigos originales de validación.
- [x] Mantener una ventana de tres cortes; archivar íntegro el corte ACC anterior.
- [x] Incorporar el juicio independiente y la custodia final.
- [x] Registrar la comprobación final del directorio, documentos propios e índice.

La matriz y las huellas de comparación están en
[`comparaciones/`](comparaciones/); la revisión independiente comprueba las
fuentes contra las copias previas, no solo el informe del constructor.
En `DESVIACION-20260929-005.md` se normaliza CRLF a LF sin alterar el contenido
histórico, aparte del campo y la adenda autorizados. Los cuatro documentos
editados quedan en UTF-8 sin BOM.

## Referencia calificada y alcance del cierre

La referencia material correcta es la [Doctrina maestra unificada](C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md),
versión 2.5.0, §3.1, «Promoción visual no destructiva (Atomic-first)».
El verificador de desviaciones comprueba Orquestación, cuyo §3.1 no existe;
no se reemplaza por un apartado de contenido distinto para obtener verde.

La [desviación original](../../../.agents/desviaciones/DESVIACION-20260929-005.md)
conserva su fecha, hechos, evidencia y estado `abierta`. Su campo operativo
pasa a `por-clasificar`, con referencia material explícita a la maestra.
La [incidencia documental posterior](../../../.agents/desviaciones/DESVIACION-20261024-011.md)
queda corregida en ese alcance. No se declara resuelto el hallazgo visual.

## Validación focal y límite conocido

| Medida | Código y resultado | Evidencia original |
|---|---|---|
| Ortografía previa de los dos registros | 1; 150 hallazgos, 0 avisos | [log](originales/codificacion-antes.log), [comando](originales/codificacion-antes.json) |
| Ortografía posterior de los cuatro documentos | 1; un falso positivo en un ID ASCII, 0 avisos | [log](originales/codificacion-despues.log), [comando](originales/codificacion-despues.json) |
| Referencias, primer corte posterior | 0; 11 desviaciones con apartados admitidos | [log](originales/desviaciones-despues.log), [comando](originales/desviaciones-despues.json) |
| Referencias después de registrar el falso positivo | 0; 12 desviaciones con apartados admitidos | [log](originales/desviaciones-final.log), [comando](originales/desviaciones-final.json) |

La alerta posterior corresponde a `CHANGELOG.md:772`, atributo
`id="verificacion"`; el título visible «Verificación» ya lleva tilde.
Su ID debe conservarse en ASCII para mantener el enlace. No se oculta
mediante código, cambios de ID o exclusiones. La
[desviación focal](../../../.agents/desviaciones/DESVIACION-ATOMIC-20261026-002-001.md)
registra el falso positivo y deja abierta la mejora separada del verificador.
La compuerta ortográfica conserva código 1; no se presenta como verde.

Las 70 pruebas válidas de ATOMIC-20261026-001 se reutilizan con su
[juicio y resultado originales](C:/Users/cotaha/source/repos/.agent/auditorias/DOC-20261026-001/atomic-pruebas/veredicto.json).
Se comprueba la identidad de las cuatro especificaciones sin ejecutarlas.
Su resultado corresponde al HEAD aislado más esas pruebas: los otros 802
archivos mantuvieron los bytes de la copia inicial; el cotejo con los blobs
Git normalizó CRLF. No se amplía esa acreditación al árbol móvil actual.
No se ejecutan pruebas Angular, npm, compilaciones ni controles globales.

## Juicio y cierre del corte

El juez independiente, de modelo distinto al constructor, aprueba las cuatro
fuentes con la observación del falso positivo contractual. Recalcula 2323
spans y cuatro bloques de código, las 151 sustituciones y las anclas. Su
[dictamen original](juicio/veredicto.json) conserva el alcance y sus límites.
También comprueba los documentos de continuidad y sus 63 destinos locales.
La única devolución sobre el gobierno fue una línea vacía final nueva en
continuidad: se retira sin alterar los cortes ni el contenido archivado.

El índice documental devuelve 0, con 2271 Markdown en 44 ámbitos, después
de regenerarse. El primer intento, código 2 por falta de acceso del sandbox
al archivo global de exclusiones de Git, se conserva junto a la ejecución
permitida; no se modifica esa configuración. Los controles propios iniciales
conservan sus códigos y la revisión posterior se limita a los textos que
cambiaron. El [recibo final](recibo-final.json) registra los códigos efectivos,
la comparación de custodia y las huellas del corte; no los sustituye por
una afirmación global de verde.

## Reutilización, custodia y reversión

En futuras correcciones se separan primero la prosa y los literales ASCII.
Un encabezado acentuado requiere comprobar sus anclas y colisiones, además
del texto visible. Una cita doctrinal se califica por documento dueño y
contenido; una atribución operativa pendiente no se inventa para la guarda.

Las capturas se conservan completas en `originales/`; el recibo final y el
manifiesto SHA-256 identifican el corte validado. La custodia usa el modo
sucio esperado del reparto (§§6.3–6.4), distingue las escrituras ajenas y
no las incorpora a esta unidad. Solo se añade el índice documental compartido
como artefacto del responsable. No se confirma ni publica ningún cambio.
La reversión aplica únicamente el diff propio contra sus copias iniciales,
contrastando huellas antes de escribir; no restaura archivos completos
sobre trabajo concurrente.
