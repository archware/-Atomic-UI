import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionGroupComponent } from './action-group.component';

describe('ActionGroupComponent', () => {
  let component: ActionGroupComponent;
  let fixture: ComponentFixture<ActionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionGroupComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionGroupComponent);
    component = fixture.componentInstance;
    component.actions = [
      { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalle' },
      { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    ];
  });

  it('renders accessible labels and preserves the 28px small variant', () => {
    component.size = 'sm';
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('.action-group') as HTMLElement;
    const buttons = fixture.nativeElement.querySelectorAll(
      '.action-btn',
    ) as NodeListOf<HTMLButtonElement>;

    expect(group.classList).toContain('action-group--sm');
    expect(getComputedStyle(buttons[0]).width).toBe('28px');
    expect(buttons[0].getAttribute('aria-label')).toBe('Ver detalle');
    expect(buttons[1].getAttribute('aria-label')).toBe('Editar');
  });

  it('emits a single action for native button activation', () => {
    const actionClick = jasmine.createSpy('actionClick');
    component.actionClick.subscribe(actionClick);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement).click();

    expect(actionClick).toHaveBeenCalledOnceWith('view');
  });
});
