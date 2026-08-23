---
title: "Blueprint histórico de guardas de autenticación"
document_type: "referencia histórica"
status: "histórico"
date: "2026-06-01"
last_updated: "2026-08-20"
superseded_by: "../../../docs/ATOMIC_UI_AGENT_RUNTIME.md"
owner: "Hospital Regional de Ayacucho"
---

# Blueprint histórico de guardas de autenticación

> **No usar en productos ni como ejemplo de seguridad.**
> `blueprints.manifest.json` clasifica este directorio como `legacy-demo`. Los
> archivos se preservan para evidencia y pruebas negativas de la compuerta, pero
> no se copian, importan ni publican como API de Atomic UI.

## Razón del retiro

La demostración mezcló servicios de login, DTO, cookies, guardas, interceptor y
endpoints dentro del sistema visual. También incluyó credenciales literales en
un componente. Esa arquitectura contradice la frontera vigente:

- Atomic UI contiene presentación, tokens, variantes y accesibilidad.
- El consumidor contiene autenticación, permisos, rutas, DTO, endpoints,
  credenciales, sesiones y reglas de negocio.
- Ninguna contraseña, token o identidad de usuario se incluye en un componente,
  blueprint o documentación ejecutable.

## Evidencia conservada

| Archivo | Significado histórico |
|---|---|
| `token.service.ts` | Demostración heredada de almacenamiento de tokens. |
| `auth.service.ts` | Demostración heredada de login y renovación. |
| `auth.guard.ts` | Demostración heredada de guardas de rutas. |
| `auth.interceptor.ts` | Demostración heredada de interceptor HTTP. |

Estos archivos solo pueden modificarse para mantener aislamiento, pruebas
negativas o metadata histórica. No definen endpoints esperados ni un contrato
reutilizable.

## Ruta vigente

Una UI de autenticación se genera como presentación sin integración implícita.
El consumidor aporta un puerto tipado y su implementación de seguridad:

```powershell
npm run generate:ui -- --spec .\ruta\requisito-ui.json --output .\consumidor --dry-run
```

El contrato debe declarar los campos y estados de interfaz; no contiene valores
de credenciales ni inventa un endpoint. La salida se valida con
`npm run check:atomic`, las pruebas del consumidor y su build.
