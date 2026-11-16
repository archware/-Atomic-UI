import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <app-badge id="default-badge" variant="default" size="md">Neutral</app-badge>
    <app-badge id="text-badge" variant="primary" size="md">Doctrina Canonica</app-badge>
    <app-badge id="secondary-badge" variant="secondary" size="md">100% OnPush</app-badge>
    <app-badge id="success-badge" variant="success" size="md">Activo</app-badge>
    <app-badge id="warning-badge" variant="warning" size="md">Pendiente</app-badge>
    <app-badge id="count-badge" [count]="12" variant="danger" size="sm"></app-badge>
    <app-badge id="error-badge" variant="error" size="md">Inactivo</app-badge>
    <app-badge id="info-badge" variant="info" size="md">En Revision</app-badge>
    <app-badge id="outline-badge" variant="outline" size="md">Outline</app-badge>
    <app-badge id="dot-badge" variant="success" [dot]="true"></app-badge>
    <app-badge id="overlay-badge" variant="primary" [count]="3" [overlay]="true" position="top-right"></app-badge>
  `
})
class BadgeHostComponent {}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent, BadgeHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeHostComponent);
    fixture.detectChanges();
  });

  it('projects textual content inside standalone badges when count is null', () => {
    const textBadge = fixture.nativeElement.querySelector('#text-badge .badge') as HTMLElement;
    expect(textBadge).toBeTruthy();
    expect(textBadge.textContent?.trim()).toBe('Doctrina Canonica');
  });

  it('renders numeric count when count input is provided', () => {
    const countBadge = fixture.nativeElement.querySelector('#count-badge .badge') as HTMLElement;
    expect(countBadge).toBeTruthy();
    expect(countBadge.textContent?.trim()).toBe('12');
  });

  it('uses high-contrast readable colors on secondary badges across themes', () => {
    const secondaryBadge = fixture.nativeElement.querySelector('#secondary-badge .badge') as HTMLElement;
    expect(secondaryBadge).toBeTruthy();
    const style = getComputedStyle(secondaryBadge);
    if (style.color.startsWith('var(')) {
      expect(style.color).toBe('var(--badge-secondary-text)');
      expect(style.backgroundColor).toBe('var(--badge-secondary-bg)');
    } else {
      expect(style.color).toBe('rgb(255, 255, 255)');
      expect(style.backgroundColor).toBe('rgb(180, 83, 9)');
    }
  });

  it('maps error variant to danger badge classes and supports outline variant', () => {
    const errorBadge = fixture.nativeElement.querySelector('#error-badge .badge') as HTMLElement;
    const outlineBadge = fixture.nativeElement.querySelector('#outline-badge .badge') as HTMLElement;
    expect(errorBadge.classList.contains('badge--danger')).toBe(true);
    expect(errorBadge.classList.contains('badge--error')).toBe(true);
    expect(outlineBadge.classList.contains('badge--outline')).toBe(true);
  });

  it('maintains >= 4.5 contrast, visible borders, and dot/overlay cascade across all themes', () => {
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

    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme');
    const hostEl = fixture.nativeElement as HTMLElement;
    const cases = [
      { id: '#default-badge .badge', tokenKey: 'default', isOutline: false },
      { id: '#text-badge .badge', tokenKey: 'primary', isOutline: false },
      { id: '#secondary-badge .badge', tokenKey: 'secondary', isOutline: false },
      { id: '#success-badge .badge', tokenKey: 'success', isOutline: false },
      { id: '#warning-badge .badge', tokenKey: 'warning', isOutline: false },
      { id: '#count-badge .badge', tokenKey: 'danger', isOutline: false },
      { id: '#error-badge .badge', tokenKey: 'danger', isOutline: false },
      { id: '#info-badge .badge', tokenKey: 'info', isOutline: false },
      { id: '#outline-badge .badge', tokenKey: 'outline', isOutline: true },
    ] as const;

    try {
      for (const theme of ['light', 'dark', 'brand-dark'] as const) {
        root.setAttribute('data-theme', theme);
        for (const item of cases) {
          const badge = hostEl.querySelector(item.id) as HTMLElement;
          expect(badge).toBeTruthy();
          const style = getComputedStyle(badge);
          const fgRaw = style.color;
          const bgRaw = style.backgroundColor;
          const borderRaw = style.borderTopColor || style.borderColor;

          if (bgRaw.startsWith('var(') || fgRaw.startsWith('var(')) {
            const expectedToken = (part: string) => ['var(', '--badge-', item.tokenKey, '-', part, ')'].join('');
            expect(bgRaw).toBe(expectedToken('bg'));
            expect(fgRaw).toBe(expectedToken('text'));
          } else {
            expect(parseFloat(style.borderTopWidth)).toBeGreaterThanOrEqual(1);
            expect(borderRaw).not.toBe('rgba(0, 0, 0, 0)');
            expect(borderRaw).not.toBe('transparent');

            const fg = parseCssColor(fgRaw);
            const surfaceToken = getComputedStyle(root).getPropertyValue('--surface-background').trim();
            const bg = item.isOutline ? parseCssColor(surfaceToken) : parseCssColor(bgRaw);
            expect(fg).not.toBeNull();
            expect(bg).not.toBeNull();
            expect(contrastRatio(fg!, bg!)).toBeGreaterThanOrEqual(4.5);
          }
        }
      }

      const dotBadge = hostEl.querySelector('#dot-badge .badge') as HTMLElement;
      const overlayBadge = hostEl.querySelector('#overlay-badge .badge') as HTMLElement;
      const dotStyle = getComputedStyle(dotBadge);
      const overlayStyle = getComputedStyle(overlayBadge);
      expect(dotStyle.borderTopWidth).toBe('0px');
      expect(overlayBadge.classList.contains('badge--overlay')).toBe(true);
      expect(overlayStyle.position).toBe('absolute');
      if (!overlayStyle.color.startsWith('var(')) {
        expect(parseFloat(overlayStyle.borderTopWidth)).toBeGreaterThanOrEqual(3);
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
