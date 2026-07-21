import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
  });

  it('prefers an authoritative display value and does not invent a trend', () => {
    component.title = 'Saldo reportado';
    component.value = 999999;
    component.displayValue = 'S/ 1,234.56';
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.kpi-card') as HTMLElement;
    const value = fixture.nativeElement.querySelector('.kpi-card__value') as HTMLElement;

    expect(value.textContent?.trim()).toBe('S/ 1,234.56');
    expect(card.getAttribute('aria-label')).toContain('Saldo reportado: S/ 1,234.56');
    expect(fixture.nativeElement.querySelector('.kpi-card__trend')).toBeNull();
  });

  it('keeps two currency decimals by default and allows an explicit precision', () => {
    component.value = 1234.5;
    component.format = 'currency';
    component.currency = 'PEN';
    fixture.detectChanges();

    expect(component.formattedValue).toContain('1,234.50');

    component.fractionDigits = 3;
    fixture.detectChanges();
    expect(component.formattedValue).toContain('1,234.500');
  });

  it('renders a lightweight finite SVG sparkline and restores intended dimensions', () => {
    component.iconClass = 'fa-solid fa-wallet';
    component.series = [10, Number.NaN, 12, Number.POSITIVE_INFINITY, 15];
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('.kpi-card__icon') as HTMLElement;
    const polyline = fixture.nativeElement.querySelector('polyline') as SVGPolylineElement;
    const points = polyline.getAttribute('points') ?? '';

    expect(getComputedStyle(icon).width).toBe('32px');
    expect(getComputedStyle(icon).height).toBe('32px');
    expect(points).not.toContain('NaN');
    expect(points).not.toContain('Infinity');
    expect(points.split(' ').length).toBe(3);
  });

  it('renders comparison metadata only when it was explicitly supplied', () => {
    component.trend = 'up';
    component.trendValue = '+4.2%';
    component.comparisonLabel = 'frente al periodo anterior';
    fixture.detectChanges();

    const meta = fixture.nativeElement.querySelector('.kpi-card__meta') as HTMLElement;
    expect(meta.textContent).toContain('+4.2%');
    expect(meta.textContent).toContain('frente al periodo anterior');
  });
});
