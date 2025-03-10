import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import {FormsModule} from '@angular/forms';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([])), // HTTP-Anfragen
    provideRouter(routes), // Routing
    importProvidersFrom(FormsModule)]
};
/*export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
};
*/
