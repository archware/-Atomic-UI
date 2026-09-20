import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionMenuComponent } from './action-menu.component';

describe('ActionMenuComponent', () => {
  let component: ActionMenuComponent;
  let fixture: ComponentFixture<ActionMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionMenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('actions', [
      { id: 'edit', label: 'Edit', icon: 'fa-solid fa-pen' },
      { id: 'delete', label: 'Delete', icon: 'fa-solid fa-trash' }
    ]);
    fixture.detectChanges();
  });

  afterEach(() => {
    // ensure menu is closed to clean up portals
    if (component.isOpen()) {
      component.toggleMenu(new Event('click'));
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the menu on toggle', () => {
    expect(component.isOpen()).toBeFalse();
    const triggerBtn = fixture.nativeElement.querySelector('.action-menu-trigger');
    triggerBtn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBeTrue();
    
    // Portal should be created in body
    const portal = document.querySelector('.action-menu-portal');
    expect(portal).toBeTruthy();

    triggerBtn.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBeFalse();
    expect(document.querySelector('.action-menu-portal')).toBeFalsy();
  });

  it('should emit actionClick when an action is selected', () => {
    spyOn(component.actionClick, 'emit');
    const triggerBtn = fixture.nativeElement.querySelector('.action-menu-trigger');
    triggerBtn.click();
    fixture.detectChanges();

    const portal = document.querySelector('.action-menu-portal');
    const menuItems = portal?.querySelectorAll('.menu-item');
    expect(menuItems?.length).toBe(2);

    (menuItems?.[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(component.actionClick.emit).toHaveBeenCalledWith('edit');
    expect(component.isOpen()).toBeFalse();
  });
});
