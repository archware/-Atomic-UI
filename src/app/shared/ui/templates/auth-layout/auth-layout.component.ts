import { Component } from '@angular/core';
import { AuthBannerComponent } from '../../molecules/auth-banner/auth-banner.component';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';


@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [ScrollOverlayComponent, AuthBannerComponent],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent { }

