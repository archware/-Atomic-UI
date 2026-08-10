import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComboboxComponent } from './combobox.component';

describe('ComboboxComponent', () => {
  let fixture: ComponentFixture<ComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComboboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboboxComponent);
    fixture.componentRef.setInput('options', [{ label: 'Ayacucho', value: 'AYA' }]);
    fixture.detectChanges();
  });

  it('elevates its container while the option list is open', () => {
    fixture.componentInstance.onFocus();
    fixture.detectChanges();

    const combobox = (fixture.nativeElement as HTMLElement).querySelector(
      '.combobox',
    ) as HTMLElement;
    expect(combobox.classList).toContain('combobox-open');
    expect(getComputedStyle(combobox).zIndex).toBe('1000');
  });
});
