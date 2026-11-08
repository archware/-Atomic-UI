import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { FloatingInputComponent } from '../../../../shared/ui/atoms/floating-input/floating-input.component';
import { Select2Component } from '../../../../shared/ui/molecules/select2/select2.component';
import { ShowcaseFormsComponent } from './showcase-forms.component';

describe('ShowcaseFormsComponent: Búsqueda en Cascada', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShowcaseFormsComponent],
      providers: [provideTranslateService()],
    });
  });

  it('inicia con un solo select en reposo, despliega el segundo control al elegir criterio y lo oculta al volver a Seleccionar...', () => {
    const fixture = TestBed.createComponent(ShowcaseFormsComponent);
    fixture.detectChanges();

    const barraCascada = () =>
      fixture.debugElement.query(By.css('app-query-toolbar[accessibleLabel="Búsqueda en cascada"]'));

    let selectores = barraCascada().queryAll(By.directive(Select2Component));
    expect(selectores.length).toBe(1);
    expect(barraCascada().query(By.directive(FloatingInputComponent))).toBeNull();
    expect(fixture.componentInstance.cascadeFilterType).toBeNull();
    expect(fixture.componentInstance.filteredCascadeItems.length).toBe(3);

    const selectorCriterio = selectores[0].componentInstance as Select2Component;
    expect(selectorCriterio.selectedOption()).toBeNull();
    expect(selectorCriterio.options.map(op => op.value)).toEqual([null, 'status', 'category', 'name']);

    // 1. Selecciona Estado -> aparece el segundo Select2 y filtra por estado
    selectorCriterio.selectOption({ value: 'status', label: 'Estado' });
    fixture.detectChanges();
    selectores = barraCascada().queryAll(By.directive(Select2Component));
    expect(selectores.length).toBe(2);

    const selectorEstado = selectores[1].componentInstance as Select2Component;
    selectorEstado.selectOption({ value: 'inactive', label: 'Inactivo' });
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredCascadeItems.map(i => i.name)).toEqual([
      'Monitor Clínico 4K',
    ]);

    // 2. Cambia a Categoría -> limpia subfiltro previo y filtra por categoría
    selectorCriterio.selectOption({ value: 'category', label: 'Categoría' });
    fixture.detectChanges();
    expect(fixture.componentInstance.cascadeSearchValue).toBeNull();
    expect(fixture.componentInstance.filteredCascadeItems.length).toBe(3);

    selectores = barraCascada().queryAll(By.directive(Select2Component));
    expect(selectores.length).toBe(2);
    const selectorCategoria = selectores[1].componentInstance as Select2Component;
    selectorCategoria.selectOption({ value: 'ropa', label: 'Ropa' });
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredCascadeItems.map(i => i.name)).toEqual([
      'Guardapolvo Quirúrgico',
    ]);

    // 3. Cambia a Nombre -> conmuta el segundo control a FloatingInput y filtra por texto
    selectorCriterio.selectOption({ value: 'name', label: 'Nombre' });
    fixture.detectChanges();
    expect(barraCascada().queryAll(By.directive(Select2Component)).length).toBe(1);
    const inputNombre = barraCascada().query(By.directive(FloatingInputComponent));
    expect(inputNombre).not.toBeNull();

    fixture.componentInstance.cascadeSearchText = 'laptop';
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredCascadeItems.map(i => i.name)).toEqual([
      'Laptop Pro 15',
    ]);

    // 4. Vuelve a Seleccionar... (null) -> desaparece el segundo control y restablece coincidencias
    selectorCriterio.selectOption({ value: null, label: 'Seleccionar...' });
    fixture.detectChanges();
    expect(fixture.componentInstance.cascadeFilterType).toBeNull();
    expect(barraCascada().queryAll(By.directive(Select2Component)).length).toBe(1);
    expect(barraCascada().query(By.directive(FloatingInputComponent))).toBeNull();
    expect(fixture.componentInstance.filteredCascadeItems.length).toBe(3);
  });
});
