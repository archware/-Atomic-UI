import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ChipComponent, ChipVariant, ChipSize } from './chip.component';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

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
        setInput('variant', variant);

        const chip = fixture.nativeElement.querySelector('.chip');
        expect(chip.classList.contains(`chip-${variant}`)).toBeTrue();
      });
    });
  });

  describe('size classes', () => {
    const sizes: ChipSize[] = ['sm', 'md', 'lg'];

    sizes.forEach(size => {
      it(`should apply chip-${size} class when size is ${size}`, () => {
        setInput('size', size);

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
      setInput('removable', true);

      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      expect(removeBtn).toBeTruthy();
    });

    it('should emit remove event when remove button is clicked', () => {
      setInput('removable', true);

      spyOn(component.remove, 'emit');

      const removeBtn = fixture.nativeElement.querySelector('.chip-remove');
      removeBtn.click();

      expect(component.remove.emit).toHaveBeenCalled();
    });

    it('should have aria-label on remove button', () => {
      setInput('removable', true);

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
      setInput('clickable', true);

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.classList.contains('chip-interactive')).toBeTrue();
    });

    it('should have role="button" when clickable', () => {
      setInput('clickable', true);

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.getAttribute('role')).toBe('button');
    });

    it('should emit chipClick when clicked and clickable', () => {
      setInput('clickable', true);

      spyOn(component.chipClick, 'emit');

      const chip = fixture.nativeElement.querySelector('.chip');
      chip.click();

      expect(component.chipClick.emit).toHaveBeenCalled();
    });
  });

  describe('icon', () => {
    it('should display icon when provided', () => {
      setInput('icon', '✓');

      const iconSpan = fixture.nativeElement.querySelector('.chip-icon');
      expect(iconSpan?.textContent?.trim()).toBe('✓');
    });
  });

  describe('selected state', () => {
    it('should add selected class when selected', () => {
      setInput('selected', true);

      const chip = fixture.nativeElement.querySelector('.chip');
      expect(chip.classList.contains('chip-selected')).toBeTrue();
    });
  });

  describe('contrast and theme tokens', () => {
    function parseCssColor(value: string): [number, number, number] | null {
      const rgbMatch = value.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
      }
      const hexMatch = value.trim().match(/^#([0-9a-fA-F]{6})$/);
      if (hexMatch) {
        const hex = hexMatch[1];
        return [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }
      return null;
    }

    function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
      const lum = (rgb: [number, number, number]) => {
        const [r, g, b] = rgb.map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const l1 = lum(fg);
      const l2 = lum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    it('maintains >= 4.5 contrast and crisp borders across light, dark, and brand-dark themes', () => {
      const root = document.documentElement;
      const previousTheme = root.getAttribute('data-theme');
      const variants = ['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info', 'outline'] as const;
      const themes = ['light', 'dark', 'brand-dark'] as const;

      try {
        for (const theme of themes) {
          root.setAttribute('data-theme', theme);
          for (const variant of variants) {
            setInput('selected', false);
            setInput('variant', variant);
            const chip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
            chip.style.transition = 'none';

            const style = getComputedStyle(chip);
            const fgRaw = style.color;
            const bgRaw = style.backgroundColor;
            const borderRaw = style.borderTopColor || style.borderColor;

            if (bgRaw.startsWith('var(') || fgRaw.startsWith('var(')) {
              const expectedToken = (part: string) => ['var(', '--chip-', variant, '-', part, ')'].join('');
              expect(bgRaw).toBe(expectedToken('bg'));
              expect(fgRaw).toBe(expectedToken('text'));
            } else {
              expect(parseFloat(style.borderTopWidth)).toBeGreaterThanOrEqual(1);
              expect(borderRaw).not.toBe('rgba(0, 0, 0, 0)');
              expect(borderRaw).not.toBe('transparent');

              const fg = parseCssColor(fgRaw);
              const surfaceToken = getComputedStyle(root).getPropertyValue('--surface-background').trim();
              const bg = variant === 'outline' ? parseCssColor(surfaceToken) : parseCssColor(bgRaw);
              expect(fg).not.toBeNull();
              expect(bg).not.toBeNull();
              expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
            }
          }

          setInput('selected', true);
          const selectedChip = fixture.nativeElement.querySelector('.chip') as HTMLElement;
          selectedChip.style.transition = 'none';
          const selectedStyle = getComputedStyle(selectedChip);
          if (selectedStyle.backgroundColor.startsWith('var(')) {
            expect(selectedStyle.backgroundColor).toBe('var(--badge-primary-bg)');
            expect(selectedStyle.color).toBe('var(--badge-primary-text)');
          } else {
            const fg = parseCssColor(selectedStyle.color);
            const bg = parseCssColor(selectedStyle.backgroundColor);
            expect(fg).not.toBeNull();
            expect(bg).not.toBeNull();
            expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
          }
        }
      } finally {
        if (previousTheme === null) {
          root.removeAttribute('data-theme');
        } else {
          root.setAttribute('data-theme', previousTheme);
        }
      }
    });
  });
});
