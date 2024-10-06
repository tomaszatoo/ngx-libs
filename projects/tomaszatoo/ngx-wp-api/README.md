# ngx-wp-api

`ngx-wp-api` is an Angular library that provides a convenient way to interact with the WordPress REST API v2. This library simplifies the process of retrieving and managing WordPress content, including posts, categories, tags, users, and menus, using Angular's HttpClient.

## Installation

To install the library, use npm:

```bash
npm install @tomaszatoo/ngx-wp-api
```

## Usage

### Importing the Library and configuring the API URL

You can configure the library by providing the WordPress with REST API URL in your app.config:

```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideNgxWpApi } from '@tomaszatoo/ngx-wp-api';
// ...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    /* NGX-WP-API REQUIRED SETUP */
    provideHttpClient(),
    provideNgxWpApi({
      wpRootUrl: 'https://your-wordpress-site.com'
    })
  ]
};
```

### Authenticating Users

To authenticate users using Basic Authentication, you can use the `authenticate` method:

```typescript
import { NgxWpApiService } from '@tomaszatoo/ngx-wp-api';

constructor(private wpApiService: NgxWpApiService) {}

this.wpApiService.authenticate('your_username', 'your_password');
```

### Using the API

You can use the library to interact with various WordPress endpoints:

#### Get Posts

```typescript
this.wpApiService.getPosts().subscribe(posts => {
  console.log(posts);
});
```

#### Get Categories

```typescript
this.wpApiService.getCategories().subscribe(categories => {
  console.log(categories);
});
```

#### Get Menus

```typescript
this.wpApiService.getMenus().subscribe(menus => {
  console.log(menus);
});
```

### Available Methods

The following methods are available in the `NgxWpApiService`:

- **Post Methods**
  - `getPosts(params?: string): Observable<any>`
  - `getPost(id: number): Observable<any>`

- **Category Methods**
  - `getCategories(params?: string): Observable<any>`
  - `getCategory(id: number): Observable<any>`

- **Tag Methods**
  - `getTags(params?: string): Observable<any>`
  - `getTag(id: number): Observable<any>`

- **Media Methods**
  - `getMedias(params?: string): Observable<any>`
  - `getMedia(id: number): Observable<any>`

- **User Methods**
  - `getUsers(params?: string): Observable<any>`
  - `getUser(id: number): Observable<any>`

- **Page Methods**
  - `getPages(params?: string): Observable<any>`
  - `getPage(id: number): Observable<any>`

- **Menu Methods**
  - `getMenus(params?: string): Observable<any>`
  - `getMenu(id: number): Observable<any>`

- **Site Info**
  - `getSiteInfo(): Observable<any>`

## License

This library is licensed under the MIT [License](./LICENSE).
