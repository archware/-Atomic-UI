import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select2Component } from './select2.component';

describe('Select2Component', () => {
  let fixture: ComponentFixture<Select2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('options', [{ label: 'Ayacucho', value: 'AYA' }]);
    fixture.detectChanges();
  });

  it('elevates its wrapper while the option list is open', () => {
    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();

    const wrapper = (fixture.nativeElement as HTMLElement).querySelector(
      '.select2-wrapper',
    ) as HTMLElement;
    expect(wrapper.classList).toContain('open');
    expect(getComputedStyle(wrapper).zIndex).toBe('1000');
  });
});
