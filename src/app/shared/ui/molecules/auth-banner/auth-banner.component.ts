import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-auth-banner',
  standalone: true,
  templateUrl: './auth-banner.component.html',
  styleUrl: './auth-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthBannerComponent {}
