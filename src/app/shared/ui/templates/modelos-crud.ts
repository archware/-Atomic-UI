/**
 * Modelos y contratos para los chasis CRUD de Atomic UI.
 *
 * Un agente que construye una pantalla CRUD importa estas interfaces,
 * configura sus columnas y campos, y las pasa al template correspondiente.
 * No necesita escribir HTML ni CSS suelto: todo lo resuelve el chasis.
 *
 * Jerarquía de templates disponibles:
 *   - PaginaCrud          → una sola entidad con grilla + diálogo
 *   - PaginaCrudAccordion → varias entidades agrupadas en acordeón
 *   - PaginaDetallePestanas → vista de detalle con pestañas
 */

import type { TemplateRef } from '@angular/core';

// ============================================================
// PAGINACIÓN
// ============================================================

/** Contrato de respuesta paginada del backend. */
export interface PaginaDto<T> {
  readonly elementos: readonly T[];
  readonly pagina: number;
  readonly tamano: number;
  readonly total: number;
}

/** Parámetros que emite el chasis cuando la tabla necesita datos nuevos. */
export interface SolicitudPagina {
  readonly pagina: number;
  readonly tamano: number;
  readonly busqueda: string;
}

// ============================================================
// MODOS CRUD
// ============================================================

/** Los tres modos que soporta el diálogo CRUD (Doctrina ADR-007). */
export type ModoCrud = 'crear' | 'editar' | 'ver';

/** Contexto que el chasis pasa a la plantilla del formulario proyectado. */
export interface ContextoFormularioCrud<T> {
  /** Referencia implícita para `let-entidad` en la plantilla. */
  readonly $implicit: T | null;
  /** La entidad activa (null en modo crear). */
  readonly entidad: T | null;
  /** Modo actual del diálogo. */
  readonly modo: ModoCrud;
  /** Indica si la operación de guardado está en curso. */
  readonly guardando: boolean;
}

// ============================================================
// CONFIGURACIÓN DE ENTIDAD (para accordion multi-entidad)
// ============================================================

/**
 * Define una entidad dentro de un acordeón CRUD.
 * Cada entrada genera un accordion-item con su propia grilla y diálogo.
 */
export interface EntidadAccordion<T extends object = Record<string, unknown>> {
  /** Identificador único de la entidad dentro del acordeón. */
  readonly clave: string;
  /** Título visible en la cabecera del accordion-item. */
  readonly titulo: string;
  /** Descripción opcional debajo del título. */
  readonly descripcion?: string;
  /** Si el item arranca abierto (solo el principal). */
  readonly abiertoInicial?: boolean;
  /** Etiqueta del botón de acción principal. Por defecto 'Nuevo'. */
  readonly etiquetaNuevo?: string;
  /** Placeholder del campo de búsqueda. */
  readonly placeholderBusqueda?: string;
  /** Título del diálogo CRUD según el modo. */
  readonly titulosDialogo?: Partial<Record<ModoCrud, string>>;
  /** Tamaño del diálogo. Por defecto 'md'. */
  readonly tamanoDialogo?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============================================================
// ACCIONES DE FILA
// ============================================================

/**
 * Acciones estándar disponibles en la columna de acciones de la grilla.
 * Corresponden directamente a los valores de TableActionName de Atomic.
 *
 * Por defecto el chasis habilita: ver, editar, eliminar (Doctrina ADR-007).
 */
export interface AccionesCrud {
  /** Mostrar botón de previsualización (ojo). Por defecto: true. */
  readonly ver?: boolean;
  /** Mostrar botón de edición (lápiz). Por defecto: true. */
  readonly editar?: boolean;
  /** Mostrar botón de eliminación/baja (papelera). Por defecto: true. */
  readonly eliminar?: boolean;
}

/** Acciones por defecto que el chasis utiliza si no se sobreescriben. */
export const ACCIONES_CRUD_DEFECTO: Readonly<Required<AccionesCrud>> = {
  ver: true,
  editar: true,
  eliminar: true,
} as const;

// ============================================================
// CONFIRMACIÓN DE BAJA
// ============================================================

/**
 * Configuración del diálogo de confirmación de baja lógica.
 * Cumple Doctrina de Interfaz §7 y §12:
 *   - El mensaje enumera qué va a cambiar con nombres concretos.
 *   - El botón lleva el verbo del acto ('Desactivar').
 *   - El foco inicial se pone en cancelar.
 */
export interface ConfiguracionConfirmacion {
  /** Función que genera el título del diálogo de confirmación. */
  readonly titulo?: (entidad: unknown) => string;
  /** Función que genera el cuerpo del mensaje. */
  readonly mensaje?: (entidad: unknown) => string;
  /** Texto del botón de confirmación. Por defecto: 'Desactivar'. */
  readonly etiquetaConfirmar?: string;
  /** Texto del botón de cancelación. Por defecto: 'Revisar'. */
  readonly etiquetaCancelar?: string;
}

/** Confirmación por defecto para bajas lógicas. */
export const CONFIRMACION_BAJA_DEFECTO: Readonly<Required<ConfiguracionConfirmacion>> = {
  titulo: () => 'Confirmar desactivación',
  mensaje: () => 'Este registro quedará inactivo. Las referencias existentes se conservarán.',
  etiquetaConfirmar: 'Desactivar',
  etiquetaCancelar: 'Revisar',
} as const;

// ============================================================
// CONTEXTO DE PESTAÑAS (para Chasis C)
// ============================================================

/** Define una pestaña en la vista de detalle. */
export interface PestanaDetalle {
  /** Identificador único de la pestaña. */
  readonly clave: string;
  /** Título visible en la pestaña. */
  readonly titulo: string;
  /** Icono Font Awesome opcional. */
  readonly icono?: string;
  /** Si la pestaña arranca activa. */
  readonly activa?: boolean;
  /** Si la pestaña está deshabilitada. */
  readonly deshabilitada?: boolean;
}
