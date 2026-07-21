import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent, SidebarMenuItem } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('keeps flat items navigable and renders their FontAwesome icon', () => {
    const item: SidebarMenuItem = {
      id: 'home',
      label: 'Inicio',
      icon: 'fa-solid fa-house',
      route: '/home',
    };
    component.menuItems = [item];
    const navigate = jasmine.createSpy('navigate');
    component.navigate.subscribe(navigate);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.nav-link') as HTMLButtonElement;
    const icon = button.querySelector('.nav-icon') as HTMLElement;
    button.click();

    expect(icon.classList).toContain('fa-house');
    expect(navigate).toHaveBeenCalledOnceWith(item);
  });

  it('toggles a group and emits navigation only for the selected child', () => {
    const child: SidebarMenuItem = {
      id: 'interest',
      label: 'Interés',
      icon: 'fa-solid fa-percent',
      route: '/interest',
    };
    component.menuItems = [
      {
        id: 'maintenance',
        label: 'Mantenimiento',
        icon: 'fa-solid fa-screwdriver-wrench',
        children: [child],
      },
    ];
    const navigate = jasmine.createSpy('navigate');
    component.navigate.subscribe(navigate);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('.nav-link') as HTMLButtonElement;
    expect(group.getAttribute('aria-expanded')).toBe('false');

    group.click();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll(
      '.nav-link',
    ) as NodeListOf<HTMLButtonElement>;
    expect(group.getAttribute('aria-expanded')).toBe('true');
    expect(links.length).toBe(2);
    expect(navigate).not.toHaveBeenCalled();

    links[1].click();
    expect(navigate).toHaveBeenCalledOnceWith(child);
  });

  it('expands the ancestor of an active descendant and forwards the profile photo', () => {
    component.menuItems = [
      {
        id: 'security',
        label: 'Seguridad',
        icon: 'fa-solid fa-shield-halved',
        children: [
          {
            id: 'users',
            label: 'Usuarios',
            icon: 'fa-solid fa-users',
            active: true,
          },
        ],
      },
    ];
    component.user = {
      name: 'Usuario Demo',
      role: 'Administrador',
      photo: '/avatar.png',
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.nav-link').length).toBe(2);
    expect(fixture.nativeElement.querySelector('app-avatar img')?.getAttribute('src')).toBe(
      '/avatar.png',
    );
  });
});
