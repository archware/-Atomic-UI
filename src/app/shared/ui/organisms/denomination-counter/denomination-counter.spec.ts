import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DenominationCounter,
  DenominationDefinition,
} from './denomination-counter';

@Component({
  standalone: true,
  imports: [DenominationCounter, ReactiveFormsModule],
  template: `
    <prest-denomination-counter
      title="Efectivo recibido"
      [open]="true"
      [denominations]="denominations"
      [formControl]="control"
    />
  `,
})
class TestHost {
  readonly denominations: readonly DenominationDefinition[] = [
    { code: 'PEN_200', value: 200, label: 'S/ 200', description: 'Billete' },
    { code: 'PEN_050_COIN', value: 0.5, label: 'S/ 0.50', description: 'Moneda' },
  ];
  readonly control = new FormControl([{ code: 'PEN_200', quantity: 2 }]);
}

describe('DenominationCounter', () => {
  let fixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('renders consumer-provided denominations inside the canonical Accordion', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('app-accordion')).not.toBeNull();
    expect(host.textContent).toContain('S/ 200');
    expect(host.textContent).toContain('S/ 0.50');
    expect(host.textContent).toContain('S/ 400.00');
  });

  it('updates the CVA value and total when a quantity changes', () => {
    const inputs = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
      'input[type="number"]',
    );

    inputs[1].value = '3';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toEqual([
      { code: 'PEN_200', quantity: 2 },
      { code: 'PEN_050_COIN', quantity: 3 },
    ]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('S/ 401.50');
  });

  it('removes invalid and duplicate definitions without emitting fractional quantities', () => {
    const component = fixture.debugElement.children[0].componentInstance as DenominationCounter;
    const emitted: unknown[] = [];
    component.valueChange.subscribe((value) => emitted.push(value));

    component.denominations = [
      { code: 'PEN_1', value: 1, label: 'S/ 1' },
      { code: 'PEN_1', value: 1, label: 'Duplicada' },
      { code: 'INVALID', value: 0, label: 'Inválida' },
    ];
    component.setQuantity('PEN_1', 2.9);
    fixture.detectChanges();

    expect(component.rows().map((row) => row.code)).toEqual(['PEN_1']);
    expect(emitted.at(-1)).toEqual([{ code: 'PEN_1', quantity: 2 }]);
  });
});
