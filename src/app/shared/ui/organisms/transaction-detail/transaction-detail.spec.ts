import { TestBed } from '@angular/core/testing';
import { TransactionDetail } from './transaction-detail';
describe('TransactionDetail', () => {
  it('renderiza datos y tablas sin formularios ni interpretar el contenido', async () => {
    const fixture = TestBed.createComponent(TransactionDetail);
    fixture.componentRef.setInput('title', 'Documento');
    fixture.componentRef.setInput('groups', [{ label: 'Cliente', values: ['<script>no ejecutar</script>'] }]);
    fixture.componentRef.setInput('tables', [{ title: 'Líneas', columns: [{ key: 'importe', label: 'Importe', align: 'end' }], rows: [{ importe: '23.39' }] }]);
    fixture.componentRef.setInput('total', 'Total: 23.39');
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('table').length).toBe(1);
    expect(root.querySelectorAll('dl dt').length).toBe(1);
    expect(root.querySelector('td')?.textContent).toBe('23.39');
    expect(root.querySelector('td')?.getAttribute('data-label')).toBe('Importe');
    expect(root.querySelector('script, form, input, select')).toBeNull();
    expect(root.querySelector('dd')?.textContent).toContain('<script>');
    expect(root.querySelector('[style]')).toBeNull();
  });
  it('expresa ausencia sin inventar registros', () => {
    const fixture = TestBed.createComponent(TransactionDetail);
    fixture.componentRef.setInput('tables', [{ title: 'Pagos', columns: [{ key: 'monto', label: 'Monto' }], rows: [] }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sin registros.');
  });
});
