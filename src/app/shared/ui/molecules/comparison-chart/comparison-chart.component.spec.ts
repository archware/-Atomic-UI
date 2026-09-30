import { TestBed } from '@angular/core/testing';
import { ComparisonChartComponent } from './comparison-chart.component';

describe('ComparisonChartComponent: valores dinámicos', () => {
  it('conserva el porcentaje de ambas series y su actualización', () => {
    const fixture = TestBed.createComponent(ComparisonChartComponent);
    const item = { label: 'Enero', seriesA: 20, seriesB: 30, seriesAWidth: 40, seriesBWidth: 60 };
    fixture.componentRef.setInput('items', [item]);
    fixture.detectChanges();
    const bars: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.monthly-chart__bar');
    expect(bars[0].style.getPropertyValue('--comparison-width')).toBe('40%');
    expect(bars[1].style.getPropertyValue('--comparison-width')).toBe('60%');
    expect(bars[0].style.width).toBe('');
    fixture.componentRef.setInput('items', [{ ...item, seriesAWidth: 0 }]);
    fixture.detectChanges();
    expect(bars[0].style.getPropertyValue('--comparison-width')).toBe('0%');
  });
});
