import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
  });

  it('renders the card preset without static inline styles', () => {
    component.variant = 'card';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.skeleton-card-media')).not.toBeNull();
    expect(element.querySelector('.skeleton-card-title')).not.toBeNull();
    expect(element.querySelectorAll('[style]').length).toBe(0);
  });

  it('renders the avatar preset with token-driven semantic classes', () => {
    component.variant = 'avatar-text';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.skeleton-avatar')).not.toBeNull();
    expect(element.querySelector('.skeleton-avatar-title')).not.toBeNull();
    expect(element.querySelector('.skeleton-avatar-subtitle')).not.toBeNull();
    expect(element.querySelectorAll('[style]').length).toBe(0);
  });

  it('marks the host as decorative for assistive technology', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-hidden')).toBe('true');
  });
});
