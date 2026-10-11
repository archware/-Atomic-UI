import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Input } from '../../atoms/form-input/input';
import { TransactionEditor } from './transaction-editor';
@Component({
  imports: [TransactionEditor, Input, ReactiveFormsModule],
  template: '<app-transaction-editor><div transactionLine><app-input label="Cantidad" [formControl]="cantidad" type="number" /></div></app-transaction-editor>',
})
class Host { readonly cantidad = new FormControl(1); }
describe('TransactionEditor', () => {
  it('proyecta el control conservando CVA y el valor numérico inicial', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.value).toBe('1');
    fixture.componentInstance.cantidad.setValue(12.5);
    fixture.detectChanges();
    expect(input.value).toBe('12.5');
    input.value = '3';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(Number(fixture.componentInstance.cantidad.value)).toBe(3);
  });
});
