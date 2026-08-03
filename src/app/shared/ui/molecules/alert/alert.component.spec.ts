import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
  });

  it('uses semantic warning and default flow classes without changing the message', () => {
    component.variant = 'warning';
    component.title = 'Atención';
    component.message = 'El cuerpo conserva su capitalización.';
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    const message = fixture.nativeElement.querySelector('.alert__message') as HTMLElement;

    expect(alert.classList).toContain('alert--warning');
    expect(alert.classList).toContain('alert--flow-default');
    expect(message.textContent?.trim()).toBe('El cuerpo conserva su capitalización.');
  });

  it('supports compact and no flow spacing', () => {
    fixture.componentRef.setInput('flowSpacing', 'compact');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert').classList).toContain(
      'alert--flow-compact',
    );

    fixture.componentRef.setInput('flowSpacing', 'none');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert').classList).toContain('alert--flow-none');
  });

  it('emits closed and removes a dismissible alert', () => {
    component.closable = true;
    const closed = jasmine.createSpy('closed');
    component.closed.subscribe(closed);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.alert__close') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();
  });
});
