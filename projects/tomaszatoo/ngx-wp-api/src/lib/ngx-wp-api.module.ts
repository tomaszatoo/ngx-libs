import { NgModule, ModuleWithProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { NgxWpApiService } from './ngx-wp-api.service';
import { NgxWpApiConfig, NGX_WP_API_CONFIG } from './ngx-wp-api.config';

@NgModule({
  // imports: [],
  // providers: [NgxWpApiService, provideHttpClient()]
})
export class NgxWpApiModule {
  static forRoot(config: NgxWpApiConfig): ModuleWithProviders<NgxWpApiModule> {
    return {
      ngModule: NgxWpApiModule,
      providers: [
        { provide: NGX_WP_API_CONFIG, useValue: config },
        provideHttpClient(),
        NgxWpApiService,
      ]
    };
  }
}
