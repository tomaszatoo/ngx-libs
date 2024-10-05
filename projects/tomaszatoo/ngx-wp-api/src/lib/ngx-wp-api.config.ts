import { InjectionToken } from '@angular/core';

// Define an InjectionToken for the configuration
export const NGX_WP_API_CONFIG = new InjectionToken<NgxWpApiConfig>('NgxWpApiConfig');

export const WP_API_PATH = '/wp-json/wp/v2';
export const WP_MENUS_PATH = '/wp-json/menus/v1';

export interface NgxWpApiConfig {
  wpRootUrl: string;
  // applicationPassword?: string;
}
