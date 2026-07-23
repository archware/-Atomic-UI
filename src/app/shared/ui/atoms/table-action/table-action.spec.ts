import { TestBed } from '@angular/core/testing';
import { TableAction } from './table-action';

describe('TableAction', () => {
  it('mantiene las tres variantes de tamaño y un nombre accesible', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Editar registro');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Editar registro');
    expect(button.classList).toContain('table-action--lg');
  });
});
