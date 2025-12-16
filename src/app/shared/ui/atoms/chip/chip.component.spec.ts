import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ChipComponent, ChipVariant, ChipSize } from './chip.component';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant classes', () => {
    const variants: ChipVariant[] = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline'];

    variants.forEach(variant => {
      it(`should apply chip-${variant} class when variant is ${variant}`, () => {
        component.variant = variant;
        fixture.detectChanges();

        const chip = fixture.nativeElement.querySelector('.chip');
        expect(chip.classList.contains(`chip-${variant}`)).toBeTrue();
      });
    });
  });

  describe('size classes', () => {
    const sizes: ChipSize[] = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      it(`should apply chip-${size} class when size is ${size}`, () => {
        component.size = size;
        fixture.detectChanges();

        const chip = fixture.nativeElement.querySelector('.chip');
        expect(chip.classList.contains(`chip-${size}`)).toBeTrue();
      });
    });
  });

  describe('removable', () => {
    it('should not show remove button by default', () => {
      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      expect(removeBtn).toBeNull();
    });

    it('should show remove button when removable is true', () => {
      component.removable = true;
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      expect(removeBtn).toBeTruthy();
    });

    it('should emit remove event when remove button is clicked', () => {
      component.removable = true;
      fixture.detectChanges();

      spyOn(component.remove, 'emit');

      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      removeBtn.click();

      expect(component.remove.emit).toHaveBeenCalled();
    });

    it('should have aria-label on remove button', () => {
      component.removable = true;
      fixture.detectChanges();

      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      expect(removeBtn.getAttribute('aria-label')).toBe('Eliminar');
    });
  });

  describe('clickable', () => {
    it('should not be interactive by default', () => {
      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.classList.contains('chip-interactive')).toBeFalse();
    });

    it('should add interactive class when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.classList.contains('chip-interactive')).toBeTrue();
    });

    it('should have role="button" when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.getAttribute('role')).toBe('button');
    });

    it('should emit chipClick when clicked and clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      spyOn(component.chipClick, 'emit');

      const chip = fixture.nativeElement.querySelector('.chip');
      chip.click();

      expect(component.chipClick.emit).toHaveBeenCalled();
    });
  });

  describe('icon', () => {
    it('should display icon when provided', () => {
      component.icon = '✓';
      fixture.detectChanges();

      const iconSpan = fixture.nativeElement.querySelector('.chip-icon');
      expect(iconSpan?.textContent?.trim()).toBe('✓');
    });
  });

  describe('selected state', () => {
    it('should add selected class when selected', () => {
      component.selected = true;
      fixture.detectChanges();

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.classList.contains('chip-selected')).toBeTrue();
    });
  });
});
