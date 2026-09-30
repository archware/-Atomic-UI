import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Alert } from '../../../../shared/ui/molecules/alert/alert.component';
import { ShowcaseFeedbackComponent } from './showcase-feedback.component';

describe('ShowcaseFeedback: misma alerta que el consumidor', () => {
  it('renderiza las cuatro variantes mediante Alert, sin alertas paralelas', () => {
    const fixture = TestBed.createComponent(ShowcaseFeedbackComponent);
    fixture.detectChanges();
    const alerts = fixture.debugElement.queryAll(By.directive(Alert));
    expect(alerts.length).toBe(4);
    expect(alerts.map(alert => (alert.componentInstance as Alert).kind()))
      .toEqual(['info', 'success', 'warning', 'danger']);
    expect(fixture.nativeElement.querySelectorAll('.alert').length).toBe(4);
    expect(fixture.nativeElement.querySelector('.alert-info')).toBeNull();
  });
});
