---
id: DESVIACION-ATOMIC-20261026-002-001
asignacion: ATOMIC-20261026-002
repositorio: -Atomic-UI
fecha: 2026-10-26
estado: corregida
severidad: media
apartado_roto: "§10.2.1"
---

# Falso positivo ortográfico en un identificador HTML conservado

## Qué se esperaba

El §10.2.1 de Orquestación conserva los identificadores en ASCII y separa
los contratos de la prosa acentuada. Las correcciones editoriales deben
mantener las anclas históricas y superar el control de la prosa afectada.

## Qué se observó

La primera comprobación posterior devuelve código 1 y un solo hallazgo en
`CHANGELOG.md:772`, por el valor contractual `id="verificacion"` del encabezado
HTML. El título visible ya dice «Verificación». El identificador original
se conserva para no romper su enlace; los otros 150 hallazgos originales
correspondían a 151 ocurrencias de prosa y fueron corregidos.

## Evidencia

```powershell
& 'C:/Users/cotaha/source/repos/.agents/scripts/verificar-codificacion.ps1' -Rutas @('C:/Users/cotaha/source/repos/-Atomic-UI/CHANGELOG.md','C:/Users/cotaha/source/repos/-Atomic-UI/LESSONS_LEARNED.md','C:/Users/cotaha/source/repos/-Atomic-UI/.agents/desviaciones/DESVIACION-20260929-005.md','C:/Users/cotaha/source/repos/-Atomic-UI/.agents/desviaciones/DESVIACION-20261024-011.md') -Detalle
```

Salida original, código 1:

```text
=== Codificación y ortografía (§10): 4 fichero(s) en 4 ruta(s)
=== Resultado
  Fallos: 1   Avisos: 0
  [SIN TILDE] 1
    CHANGELOG.md:772  'verificacion' debe escribirse 'verificación'.
```

El comando, la salida completa y el código quedan en
`../../.agent/auditorias/ATOMIC-20261026-002/originales/codificacion-despues.json`
y su archivo `.log`. La comparación independiente comprueba el contrato y
las anclas; el resultado automático no se presenta como 0.

## Corrección mínima que preserva la doctrina

La unidad conserva el identificador, el título acentuado y el código original
del verificador. La corrección del tratamiento de atributos HTML corresponde
a una unidad separada del verificador compartido, con alcance propio y
pruebas negativas focales. Mientras tanto, esta limitación queda abierta y
no invalida las sustituciones de prosa acreditadas por el diff.

## Lo que NO se debe hacer

No se acentúa el identificador, se codifica artificialmente para ocultarlo,
se convierte prosa en código ni se amplían exclusiones. No se modifica el
verificador compartido dentro de esta unidad editorial, ni se repiten las
70 pruebas de producto. No se restaura un archivo completo sobre trabajo ajeno.

## Escalado

No es un bloqueo de las correcciones solicitadas. La compuerta ortográfica
conserva código 1 por este falso positivo conocido. Su mejora se tramita
separadamente; no se declara aprobado el gobierno completo de Atomic.

## Resolución posterior — DOC-20261026-002

El 26 de octubre se corrige el verificador compartido conservando este
identificador ASCII y las cuatro fuentes documentales de Atomic. El caso
real devuelve 0, sin hallazgos ni avisos, con la fuente
`5A8424A0E41CCEAA762457401BF93067EFE9946535CA273B97B9F4C59E5038A2`.
La negativa integrada cumple 102 aseveraciones y devuelve 1 según su contrato;
el ciclo focal pasa/falla/restaura devuelve 0/1/0 con restauración exacta.
El juez confirma que una apertura escapada sigue exponiendo su prosa.

El estado `corregida` se limita al falso positivo del verificador.
La [evidencia posterior](C:/Users/cotaha/source/repos/.agent/auditorias/DOC-20261026-002/CIERRE_VERIFICADOR.md)
conserva códigos, comandos, huellas y los intentos intermedios. Los códigos 1
de la unidad editorial anterior siguen siendo historia válida; no se
reescriben sus recibos ni se cierra la desviación visual 005. No se ejecutan
las 70 pruebas de producto ni se acredita globalmente Atomic.
