import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ModalContainerComponent } from './shared/ui/molecules/modal/modal-container.component';
import { PopupContainerComponent } from './shared/ui/molecules/popup/popup-container.component';
import { ToastComponent } from './shared/ui/molecules/toast/toast.component';
import { ThemeService } from './shared/ui/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, PopupContainerComponent, ModalContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);

  constructor() {
    const savedLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('app-language')
      : null;
    this.translate.use(savedLang || 'es');
  }
}


