import { TestBed } from '@angular/core/testing';
import { RowComponent } from './row.component';

describe('RowComponent: variables de disposición', () => {
  it('mantiene columnas y separación dinámicas sin propiedades visuales en plantilla', () => {
    const fixture = TestBed.createComponent(RowComponent);
    fixture.componentRef.setInput('columns', '3');
    fixture.componentRef.setInput('gap', 'var(--space-5)');
    fixture.detectChanges();
    const row: HTMLElement = fixture.nativeElement.querySelector('.row');
    expect(row.style.getPropertyValue('--row-columns')).toBe('repeat(3, 1fr)');
    expect(row.style.getPropertyValue('--row-gap')).toBe('var(--space-5)');
    expect(row.style.gridTemplateColumns).toBe('');
    fixture.componentRef.setInput('columns', '1fr 2fr');
    fixture.detectChanges();
    expect(row.style.getPropertyValue('--row-columns')).toBe('1fr 2fr');
  });

  it('conserva el cálculo responsive existente', () => {
    const fixture = TestBed.createComponent(RowComponent);
    fixture.componentRef.setInput('responsive', true);
    fixture.componentRef.setInput('minColumnWidth', '12rem');
    fixture.detectChanges();
    const row: HTMLElement = fixture.nativeElement.querySelector('.row');
    expect(row.style.getPropertyValue('--row-columns')).toBe('repeat(auto-fit, minmax(12rem, 1fr))');
  });
});
