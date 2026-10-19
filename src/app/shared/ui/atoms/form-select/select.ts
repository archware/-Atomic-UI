/**
 * Alias de compatibilidad. `SelectComponent` (`atoms/select/select.component`) es la seleccion
 * canonica.
 *
 * `Select` y los selectores `prest-select` y `app-form-select` se conservan para los consumidores
 * que ya los importan; ya no existe una segunda implementacion ni un segundo `app-select`.
 */
export { SelectComponent as Select } from '../select/select.component';
export type { SelectOption } from '../select/select.component';