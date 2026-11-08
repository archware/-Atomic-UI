import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { InputComponent } from '../../../../shared/ui/atoms/input/input.component';
import { Select2Component } from '../../../../shared/ui/molecules/select2/select2.component';
import { ShowcaseTemplatesComponent } from './showcase-templates.component';

describe('ShowcaseTemplatesComponent: Búsqueda en Cascada (Pagina CRUD)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShowcaseTemplatesComponent],
      providers: [provideTranslateService()],
    });
  });

  it('inicia con un solo select, muestra el subfiltro en cascada al elegir criterio y restablece al volver a Seleccionar...', () => {
    const fixture = TestBed.createComponent(ShowcaseTemplatesComponent);
    fixture.detectChanges();

    const contenedorCascada = () =>
      fixture.debugElement.query(By.css('.pagina-crud__filtros-cascada'));

    let selectores = contenedorCascada().queryAll(By.directive(Select2Component));
    expect(selectores.length).toBe(1);
    expect(contenedorCascada().query(By.directive(InputComponent))).toBeNull();
    expect(fixture.componentInstance.tipoBusquedaActual()).toBeNull();
    expect(fixture.componentInstance.filasCrud().length).toBe(2);

    const selectorCriterio = selectores[0].componentInstance as Select2Component;
    expect(selectorCriterio.selectedOption()).toBeNull();

    // 1. Elige Categoría -> aparece segundo Select2 y filtra la tabla
    selectorCriterio.selectOption({ value: 'categoria', label: 'Categoría' });
    fixture.detectChanges();
    expect(fixture.componentInstance.tipoBusquedaActual()).toBe('categoria');
    selectores = contenedorCascada().queryAll(By.directive(Select2Component));
    expect(selectores.length).toBe(2);

    const selectorCategoria = selectores[1].componentInstance as Select2Component;
    selectorCategoria.selectOption({ value: 'ropa', label: 'Ropa' });
    fixture.detectChanges();
    expect(fixture.componentInstance.filasCrud().map(f => f.nombre)).toEqual(['Camisa']);

    // 2. Elige Nombre -> cambia segundo control a InputComponent y filtra por nombre
    selectorCriterio.selectOption({ value: 'nombre', label: 'Nombre' });
    fixture.detectChanges();
    expect(fixture.componentInstance.tipoBusquedaActual()).toBe('nombre');
    expect(fixture.componentInstance.filasCrud().length).toBe(2);
    expect(contenedorCascada().queryAll(By.directive(Select2Component)).length).toBe(1);

    const inputNombre = contenedorCascada().query(By.directive(InputComponent))
      .componentInstance as InputComponent;
    inputNombre.valueChange.emit('lap');
    fixture.detectChanges();
    expect(fixture.componentInstance.filasCrud().map(f => f.nombre)).toEqual(['Laptop']);

    // 3. Vuelve a Seleccionar... (null) -> oculta el segundo control y restablece las filas
    selectorCriterio.selectOption({ value: null, label: 'Seleccionar...' });
    fixture.detectChanges();
    expect(fixture.componentInstance.tipoBusquedaActual()).toBeNull();
    expect(contenedorCascada().queryAll(By.directive(Select2Component)).length).toBe(1);
    expect(contenedorCascada().query(By.directive(InputComponent))).toBeNull();
    expect(fixture.componentInstance.filasCrud().length).toBe(2);
  });
});
