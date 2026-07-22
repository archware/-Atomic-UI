import { Injectable, signal } from '@angular/core';

export interface AppVersionInfo {
  appName: string;
  version: string;
  environment: string;
  buildDate: string;
  isNative: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  readonly versionInfo = signal<AppVersionInfo>({
    appName: '',
    version: 'v1.1.0',
    environment: 'BETA',
    buildDate: '',
    isNative: false
  });

  constructor() {
    this.initVersion();
  }

  private async initVersion(): Promise<void> {
    try {
      // 1. Intentar cargar datos de environment.ts dinámicamente
      const envModule = await import('../../../../environments/environment').catch(() => null);
      if (envModule?.environment) {
        const env = envModule.environment;
        this.versionInfo.set({
          appName: env.appName || '',
          version: env.version?.startsWith('v') ? env.version : `v${env.version || '1.1.0'}`,
          environment: env.environment || 'BETA',
          buildDate: env.buildDate || '',
          isNative: false
        });
      }

      // 2. Autodetectar si corre en Tauri
      const tauriApp = await import('@tauri-apps/api/app').catch(() => null);
      if (tauriApp?.getVersion) {
        const nativeVer = await tauriApp.getVersion();
        if (nativeVer) {
          this.versionInfo.update((prev) => ({
            ...prev,
            version: nativeVer.startsWith('v') ? nativeVer : `v${nativeVer}`,
            isNative: true
          }));
        }
      }

      // 3. Autodetectar si corre en PyWebView / Wails
      if ((window as any).pywebview || (window as any).runtime || (window as any).go) {
        this.versionInfo.update((prev) => ({
          ...prev,
          isNative: true
        }));
      }
    } catch {
      // Mantener valores estáticos por defecto (v1.1.0 BETA)
    }
  }
}
