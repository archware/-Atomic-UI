import {
  Directive,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';

export type ValorVariableCss = string | number | null | undefined;
export type VariablesCss = Readonly<Record<`--${string}`, ValorVariableCss>>;

/**
 * Aplica únicamente propiedades personalizadas. La hoja externa conserva la
 * propiedad visual real; la directiva transporta valores dinámicos que CSS no
 * puede obtener por sí mismo desde una entrada Angular.
 */
@Directive({
  selector: '[appVariablesCss]',
  standalone: true,
})
export class VariablesCssDirective {
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderizador = inject(Renderer2);
  private readonly nombresAplicados = new Set<string>();

  readonly appVariablesCss = input<VariablesCss>({});

  private readonly sincronizarVariables = effect(() => {
    const variables = this.appVariablesCss();
    untracked(() => this.aplicarVariables(variables));
  });

  private aplicarVariables(variables: VariablesCss): void {
    const nombresActuales = new Set<string>();

    for (const [nombre, valor] of Object.entries(variables)) {
      if (!nombre.startsWith('--')) {
        throw new Error(`appVariablesCss solo admite propiedades personalizadas: ${nombre}.`);
      }
      nombresActuales.add(nombre);
      if (valor === null || valor === undefined) {
        this.renderizador.removeStyle(
          this.elemento.nativeElement,
          nombre,
          RendererStyleFlags2.DashCase,
        );
      } else {
        this.renderizador.setStyle(
          this.elemento.nativeElement,
          nombre,
          String(valor),
          RendererStyleFlags2.DashCase,
        );
      }
    }

    for (const nombreAnterior of this.nombresAplicados) {
      if (!nombresActuales.has(nombreAnterior)) {
        this.renderizador.removeStyle(
          this.elemento.nativeElement,
          nombreAnterior,
          RendererStyleFlags2.DashCase,
        );
      }
    }

    this.nombresAplicados.clear();
    for (const nombre of nombresActuales) this.nombresAplicados.add(nombre);
  }
}
