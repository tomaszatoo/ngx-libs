import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// ngx-wp-api
import { provideNgxWpApi } from '@tomaszatoo/ngx-wp-api';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    /* NGX-WP-API REQUIRED SETUP */
    provideHttpClient(),
    provideNgxWpApi({
      wpRootUrl: 'https://screensaver.metazoa.org'
    })
  ]
};
