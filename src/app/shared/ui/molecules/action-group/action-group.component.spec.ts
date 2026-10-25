import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionGroupComponent, type ActionItem } from './action-group.component';

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
    fixture.componentRef.setInput('actions', [
      { id: 'view', icon: 'fa-solid fa-eye', label: 'Ver detalle' },
      { id: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'primary' },
    ]);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('renders accessible labels and preserves the 28px small variant', () => {
    fixture.componentRef.setInput('size', 'sm');
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

  it('stops row propagation and keeps a single emission for a direct action', () => {
    const actionClick = jasmine.createSpy('actionClick');
    const stopPropagation = jasmine.createSpy('stopPropagation');
    const event = { stopPropagation } as unknown as Event;
    component.actionClick.subscribe(actionClick);

    component.onActionClick({ id: 'view', action: 'view', label: 'Ver' }, event);

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(actionClick).toHaveBeenCalledOnceWith('view');
  });

  it('shows up to three actions without an overflow trigger', () => {
    fixture.componentRef.setInput('actions', [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.action-btn')).toHaveSize(3);
    expect(fixture.nativeElement.querySelector('.action-btn--more')).toBeNull();
  });

  it('keeps three actions visible and moves the fourth behind a caret menu', () => {
    const actionClick = jasmine.createSpy('actionClick');
    component.actionClick.subscribe(actionClick);
    fixture.componentRef.setInput('actions', [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
      { id: 'reverse', action: 'reverse', label: 'Revertir' },
    ]);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    const visible = fixture.nativeElement.querySelectorAll('.action-btn:not(.action-btn--more)');
    expect(visible).toHaveSize(3);
    expect(trigger.querySelector('.fa-caret-down')).not.toBeNull();
    expect(trigger.querySelector('.fa-ellipsis, .fa-ellipsis-vertical')).toBeNull();

    trigger.click();

    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const menuItems = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menuItems).toHaveSize(1);
    expect(menuItems[0].getAttribute('aria-label')).toBe('Revertir');
    expect(menuItems[0].querySelector('.fa-rotate-left')).not.toBeNull();

    menuItems[0].click();
    expect(actionClick).toHaveBeenCalledOnceWith('reverse');
    expect(document.body.querySelector(`#${component.menuId}`)).toBeNull();
  });

  it('moves an isMenuOnly action to the menu even when it is first', () => {
    fixture.componentRef.setInput('actions', [
      { id: 'deactivate', action: 'deactivate', label: 'Desactivar', isMenuOnly: true },
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
    ]);
    fixture.detectChanges();

    const visible = fixture.nativeElement.querySelectorAll('.action-btn:not(.action-btn--more)');
    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    expect(visible).toHaveSize(2);
    expect(visible[0].getAttribute('aria-label')).toBe('Ver');
    expect(visible[1].getAttribute('aria-label')).toBe('Editar');

    trigger.click();
    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const menuItems = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(menuItems).toHaveSize(1);
    expect(menuItems[0].getAttribute('aria-label')).toBe('Desactivar');
  });

  it('preserves the catalog trash icon and danger tone for a menu-only deactivation', () => {
    const actions: ActionItem[] = [
      { id: 'view', action: 'view', icon: 'fa-solid fa-eye', label: 'Ver', variant: 'default' },
      { id: 'edit', action: 'edit', icon: 'fa-solid fa-pen', label: 'Editar', variant: 'info' },
      { id: 'delete', action: 'deactivate', icon: 'fa-solid fa-trash', label: 'Desactivar', variant: 'danger', isMenuOnly: true },
    ];
    fixture.componentRef.setInput('actions', actions);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    trigger.click();

    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const deactivation = menu.querySelector('[aria-label="Desactivar"]') as HTMLButtonElement;
    expect(deactivation.querySelector('.fa-trash')).not.toBeNull();
    expect(deactivation.classList).toContain('menu-item--danger');
  });

  it('does not render an empty overflow trigger', () => {
    fixture.componentRef.setInput('actions', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.action-btn--more')).toBeNull();
  });

  it('keeps every action in the menu in compact mode', () => {
    fixture.componentRef.setInput('actions', [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'deactivate', action: 'deactivate', label: 'Desactivar', isMenuOnly: true },
    ]);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    expect(fixture.nativeElement.querySelectorAll('.action-btn:not(.action-btn--more)')).toHaveSize(0);
    trigger.click();

    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveSize(3);
  });

  it('filters disabled menu items from keyboard focus and restores the trigger on Escape', () => {
    fixture.componentRef.setInput('actions', [
      { id: 'view', action: 'view', label: 'Ver' },
      { id: 'edit', action: 'edit', label: 'Editar' },
      { id: 'print', action: 'print', label: 'Imprimir' },
      { id: 'reverse', action: 'reverse', label: 'Revertir', disabled: true },
      { id: 'channels', action: 'channels', label: 'Canales' },
    ]);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.action-btn--more') as HTMLButtonElement;
    trigger.click();
    const menu = document.body.querySelector(`#${component.menuId}`) as HTMLElement;
    const enabled = menu.querySelectorAll<HTMLButtonElement>('.menu-item:not(:disabled)');
    expect(enabled).toHaveSize(1);

    component.onEscape();
    expect(document.activeElement).toBe(trigger);
  });
});
