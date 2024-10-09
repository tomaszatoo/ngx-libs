import { Injectable, inject, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NgxWpApiConfig, NGX_WP_API_CONFIG, WP_API_PATH, WP_MENUS_PATH } from './ngx-wp-api.config';
import { Post, Category, Tag, Media, User, Page, MenuItem, Menu, SiteInfo } from './interfaces';

export function provideNgxWpApi(config: NgxWpApiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGX_WP_API_CONFIG,
      useValue: config
    }
  ]);
}


@Injectable({
  providedIn: 'root'
})
export class NgxWpApiService {
  private headers: HttpHeaders;
  private wpApiUrl: string;
  private wpMenusApiUrl: string;

  constructor(
    private http: HttpClient
  ) {
    // Injecting configuration directly here
    const config = inject(NGX_WP_API_CONFIG);
    this.wpApiUrl = config.wpRootUrl + WP_API_PATH;
    this.wpMenusApiUrl = config.wpRootUrl + WP_MENUS_PATH;
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      // 'Authorization': config.applicationPassword ? `Basic ${btoa(config.applicationPassword)}` : ''
    });
  }

  // SET CUSTOM HEADERS (Option to merge headers instead of replace)
  setCustomHeaders(headers: { [header: string]: string | string[] }): void {
    // Constructing the headers using a dictionary of strings or string arrays
    Object.keys(headers).forEach(key => {
      this.headers = this.headers.set(key, headers[key]);
    });
  }

  /* 
  // EXAMPLE OF CALL IN THE APP 
  this.ngxWpApiService.setCustomHeaders({
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json',
    'Custom-Header': ['value1', 'value2']  // This can also be an array of strings
  });
  
  */

  // CRUD METHODS
  // CREATE
  createItem<T>(endpoint: string, body: T): Observable<T> {
    return this.http.post<T>(`${this.wpApiUrl}/${endpoint}`, body, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // READ
  getItems<T>(endpoint: string, args?: string, observeResponse: boolean = false): Observable<T[]> {
    const httpOptions: Object = observeResponse ? { hteaders: this.headers, observe: 'response' } : { hteaders: this.headers }
    return this.http.get<T[]>(`${this.wpApiUrl}/${endpoint}${args ? `?${args}` : ''}`, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getItem<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${this.wpApiUrl}/${endpoint}/${id}`, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // UPDATE
  updateItem<T>(endpoint: string, id: number, body: T): Observable<T> {
    return this.http.put<T>(`${this.wpApiUrl}/${endpoint}/${id}`, body, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE
  deleteItem(endpoint: string, id: number): Observable<any> {
    return this.http.delete(`${this.wpApiUrl}/${endpoint}/${id}`, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // SEARCH
  search(query: string): Observable<any> {
    return this.getItems<any>('search', `search=${query}`);
  }

  // SITE INFO
  getSiteInfo(): Observable<any> {
    return this.read('', true);
  }

  // Menus API Methods
  // NOTE: this methods can be only used if wp plugin
  // [WP-REST-API V2 Menus](https://wordpress.org/plugins/wp-rest-api-v2-menus/)
  // is installed 

  // Get all available menus
  getMenus(): Observable<any> {
    // if (!this.menuPluginInstalled) throw new Error('Menus can be used only if the ')
    return this.http.get<any>(`${this.wpMenusApiUrl}/menus`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // Get menu items by menu ID or slug
  getMenu(idOrSlug: string | number): Observable<Menu> {
    return this.http.get<Menu>(`${this.wpMenusApiUrl}/menus/${idOrSlug}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // Get menu locations
  getMenuLocations(): Observable<any> {
    return this.http.get<any>(`${this.wpMenusApiUrl}/menu-locations`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // Get a menu by its location
  getMenuByLocation(location: string): Observable<any> {
    return this.http.get<any>(`${this.wpMenusApiUrl}/menu-locations/${location}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // READ HELPER
  private read(endpoint: string, root: boolean = false): Observable<any> {
    const url = !root ? `${this.wpApiUrl}/${endpoint}` : this.wpApiUrl.replace('/wp/v2', '');
    return this.http.get<any>(url, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ERROR HANDLING
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Error occurred: ${error.message}`);
    return throwError(() => error);
  }

  /* EXAMPLE OF ERROR HANDLING IN APP */
  /* 
  this.ngxWpApiService.getPosts()
  .pipe(
    catchError(error => {
      // Handle the error in the component (log it, show a message, etc.)
      console.error('Error fetching posts:', error.message);
      // Return an empty array or some fallback
      return of([]); // Continue the stream with an empty array
    })
  )
  .subscribe(posts => {
    // Continue with the fetched posts
    console.log('Fetched posts:', posts);
  });
  
  */

  // Method to authenticate user with username and application password
  authenticate(username: string, password: string): void {
    const authToken = btoa(`${username}:${password}`);
    this.headers = this.headers.set('Authorization', `Basic ${authToken}`);
  }

  // Example of a method using authentication
  getAuthenticatedUser(): Observable<User> {
    return this.http.get<User>(`${this.wpApiUrl}/users/me`, { headers: this.headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Specific Endpoints for WordPress Resources
  getCategories(args?: string, observeResponse: boolean = false): Observable<Category[]> {
    return this.getItems('categories', args, observeResponse);
  }

  getCategory(id: number): Observable<Category> {
    return this.getItem('categories', id);
  }

  getPosts(args?: string, observeResponse: boolean = false): Observable<Post[]> {
    return this.getItems('posts', args, observeResponse);
  }

  getPost(id: number): Observable<Post> {
    return this.getItem('posts', id);
  }

  getTags(args?: string, observeResponse: boolean = false): Observable<Tag[]> {
    return this.getItems('tags', args, observeResponse);
  }

  getTag(id: number): Observable<Tag> {
    return this.getItem('tags', id);
  }

  getMedias(args?: string, observeResponse: boolean = false): Observable<Media[]> {
    return this.getItems('media', args, observeResponse);
  }

  getMedia(id: number): Observable<Media> {
    return this.getItem('media', id);
  }

  getUsers(args?: string, observeResponse: boolean = false): Observable<User[]> {
    return this.getItems('users', args, observeResponse);
  }

  getUser(id: number): Observable<User> {
    return this.getItem('users', id);
  }

  getPages(args?: string, observeResponse: boolean = false): Observable<Page[]> {
    return this.getItems('pages', args, observeResponse);
  }

  getPage(id: number): Observable<Page> {
    return this.getItem('pages', id);
  }
}
