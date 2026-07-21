import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiMetric, MetricsGridComponent } from './metrics-grid.component';

describe('MetricsGridComponent', () => {
  let component: MetricsGridComponent;
  let fixture: ComponentFixture<MetricsGridComponent>;

  const metrics: readonly KpiMetric[] = [
    { id: 'income', title: 'Ingresos', value: 120, displayValue: 'S/ 120.00' },
    { id: 'expense', title: 'Egresos', value: 40, displayValue: 'S/ 40.00' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricsGridComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricsGridComponent);
    component = fixture.componentInstance;
  });

  it('renders the supplied metrics and exposes an accessible section name', () => {
    component.metrics = metrics;
    component.ariaLabel = 'Indicadores financieros';
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.metrics-grid') as HTMLElement;
    const cards = fixture.nativeElement.querySelectorAll('app-kpi-card');

    expect(grid.getAttribute('aria-label')).toBe('Indicadores financieros');
    expect(cards.length).toBe(2);
    expect(grid.style.getPropertyValue('--min-col-width')).toBe('13.75rem');
  });

  it('tracks cards by stable id when their order changes', () => {
    fixture.componentRef.setInput('metrics', metrics);
    fixture.detectChanges();
    const before = Array.from(
      fixture.nativeElement.querySelectorAll('app-kpi-card'),
    ) as HTMLElement[];

    fixture.componentRef.setInput('metrics', [metrics[1], metrics[0]]);
    fixture.detectChanges();
    const after = Array.from(
      fixture.nativeElement.querySelectorAll('app-kpi-card'),
    ) as HTMLElement[];

    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
  });

  it('passes authoritative display values and omits absent trends', () => {
    fixture.componentRef.setInput('metrics', metrics);
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('app-kpi-card') as HTMLElement;
    expect(firstCard.querySelector('.kpi-card__value')?.textContent?.trim()).toBe('S/ 120.00');
    expect(firstCard.querySelector('.kpi-card__trend')).toBeNull();
  });
});
