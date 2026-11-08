import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <app-badge id="text-badge" variant="primary" size="md">Doctrina Canonica</app-badge>
    <app-badge id="secondary-badge" variant="secondary" size="md">100% OnPush</app-badge>
    <app-badge id="count-badge" [count]="12" variant="danger" size="sm"></app-badge>
  `
})
class BadgeHostComponent {}

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent, BadgeHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeHostComponent);
    fixture.detectChanges();
  });

  it('projects textual content inside standalone badges when count is null', () => {
    const textBadge = fixture.nativeElement.querySelector('#text-badge .badge') as HTMLElement;
    expect(textBadge).toBeTruthy();
    expect(textBadge.textContent?.trim()).toBe('Doctrina Canonica');
  });

  it('renders numeric count when count input is provided', () => {
    const countBadge = fixture.nativeElement.querySelector('#count-badge .badge') as HTMLElement;
    expect(countBadge).toBeTruthy();
    expect(countBadge.textContent?.trim()).toBe('12');
  });

  it('uses dark high-contrast text on secondary amber badges instead of white', () => {
    const secondaryBadge = fixture.nativeElement.querySelector('#secondary-badge .badge') as HTMLElement;
    expect(secondaryBadge).toBeTruthy();
    const color = getComputedStyle(secondaryBadge).color;
    expect(color).not.toBe('rgb(255, 255, 255)');
  });
});
