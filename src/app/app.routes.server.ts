import { RenderMode, ServerRoute } from '@angular/ssr';

// Dil, URL ön eki ya da (kök adreste) çerez/Accept-Language ile belirlendiği için sayfalar istek anında üretilir.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
