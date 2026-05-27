/**
 * Auth Guards Blueprint — Archivos de autenticación listos para copiar.
 *
 * INSTRUCCIONES:
 * 1. Copia los archivos de src/app/shared/ui/ que necesites:
 *    - guards/auth.guard.ts
 *    - interceptors/auth.interceptor.ts
 *    - services/auth.service.ts
 *    - services/token.service.ts
 *
 * O impórtalos directamente desde @shared/ui (más recomendado):
 *    import { authGuard, authInterceptor, AuthService, TokenService } from '@shared/ui';
 *
 * Este archivo es solo el punto de entrada del blueprint.
 * Los archivos reales están en shared/ui para evitar duplicación.
 */

// Re-exportaciones convenientes para este blueprint
export { authGuard, guestGuard, passwordChangeGuard } from '@shared/ui';
export { authInterceptor } from '@shared/ui';
export { AuthService } from '@shared/ui';
export { TokenService } from '@shared/ui';
export type { LoginRequest, LoginResponse, UserProfile } from '@shared/ui';
