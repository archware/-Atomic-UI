import { TestBed } from '@angular/core/testing';
import { SummaryListComponent } from './summary-list.component';

describe('SummaryListComponent', () => {
  it('conserva summary como valor predeterminado y los datos originales', () => {
    const fixture = TestBed.createComponent(SummaryListComponent);
    fixture.componentRef.setInput('items', [{ label: 'Nombre', value: 'Café Mixto' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dl').classList).not.toContain('summary-list--detail');
    expect(fixture.nativeElement.querySelector('dd').textContent).toBe('Café Mixto');
  });

  it('presenta detail sin formulario, entradas ni valores truncados en el DOM', () => {
    const fixture = TestBed.createComponent(SummaryListComponent);
    const texto = 'Descripción extensa\nSegunda línea con tildes';
    fixture.componentRef.setInput('layout', 'detail');
    fixture.componentRef.setInput('items', [{ label: 'Descripción', value: texto }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dl').classList).toContain('summary-list--detail');
    expect(fixture.nativeElement.querySelector('dt').textContent.trim()).toBe('Descripción');
    expect(fixture.nativeElement.querySelector('dd').textContent).toBe(texto);
    expect(fixture.nativeElement.querySelector('form,input,textarea,select')).toBeNull();
  });

  it('conserva y retira el color dinámico por la directiva canónica', () => {
    const fixture = TestBed.createComponent(SummaryListComponent);
    fixture.componentRef.setInput('items', [{ label: 'Total', value: 42, valueColor: 'var(--success-color-text)' }]);
    fixture.detectChanges();
    const valor: HTMLElement = fixture.nativeElement.querySelector('dd');
    expect(valor.style.getPropertyValue('--summary-value-color')).toBe('var(--success-color-text)');
    expect(valor.style.color).toBe('');
    fixture.componentRef.setInput('items', [{ label: 'Total', value: 43 }]);
    fixture.detectChanges();
    expect(valor.style.getPropertyValue('--summary-value-color')).toBe('');
  });
});
