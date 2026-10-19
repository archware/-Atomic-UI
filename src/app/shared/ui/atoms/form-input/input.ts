/**
 * Alias de compatibilidad. `InputComponent` (`atoms/input/input.component`) es la entrada canonica.
 *
 * `Input` y los selectores `prest-input` y `app-form-input` se conservan para los consumidores que
 * ya los importan; ya no existe una segunda implementacion ni un segundo `app-input`.
 */
export { InputComponent as Input } from '../input/input.component';
export type { InputMode, InputType } from '../input/input.component';