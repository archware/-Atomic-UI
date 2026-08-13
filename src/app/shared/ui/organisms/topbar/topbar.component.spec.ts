import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TopbarComponent } from './topbar.component';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TranslateService, useValue: { use: jasmine.createSpy('use') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  it('can hide optional language and notification controls', () => {
    component.showLanguageSwitcher = false;
    component.showNotifications = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-language-switcher')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fa-bell')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-user-menu')).not.toBeNull();
  });

  it('renders action icons without static inline styles', () => {
    component.showLanguageSwitcher = false;
    component.showNotifications = true;
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const icons = Array.from(element.querySelectorAll<HTMLElement>('.topbar-icon'));

    expect(icons.length).toBe(2);
    expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBeTrue();
    expect(element.querySelectorAll('.topbar-icon[style]').length).toBe(0);
  });

  it('passes the user role to the session menu', () => {
    component.showLanguageSwitcher = false;
    component.userRole = 'Administrador';
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.user-menu__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.user-menu__role')?.textContent?.trim()).toBe(
      'Administrador',
    );
  });

  it('emits notification clicks', () => {
    component.showLanguageSwitcher = false;
    component.showNotifications = true;
    const notificationClick = jasmine.createSpy('notificationClick');
    component.notificationClick.subscribe(notificationClick);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('app-icon-button button');
    (buttons[1] as HTMLButtonElement).click();

    expect(notificationClick).toHaveBeenCalledTimes(1);
  });
});
