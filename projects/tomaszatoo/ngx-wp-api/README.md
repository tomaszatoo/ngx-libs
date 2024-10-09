# ngx-wp-api

`ngx-wp-api` is an Angular library that provides a convenient way to interact with the WordPress REST API v2. This library simplifies the process of retrieving and managing WordPress content, including **posts, categories, tags, users, and menus**, using Angular's HttpClient.

> Note: To get menus, the WordPress site must have the [WP-REST-API V2 Menus](https://wordpress.org/plugins/wp-rest-api-v2-menus/) plugin installed. Otherwise you will get the 404 error.

## Installation

To install the library, use npm:

```bash
npm install @tomaszatoo/ngx-wp-api
```

## Usage

### Importing the Library and configuring the API URL

You can configure the library by providing the WordPress site URL with active REST API in your app.config:

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

or in your app.module:

```typescript
import { NgxWpApiModule } from '@tomaszatoo/ngx-wp-api';

@NgModule({
  imports: [
    // Other imports
    NgxWpApiModule.forRoot({
      wpRootUrl: 'https://your-wordpress-site.com',
      // other config options
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

### Authenticating Users

To authenticate users using Basic Authentication, you can use the `authenticate` method:

```typescript
import { NgxWpApiService } from '@tomaszatoo/ngx-wp-api';

constructor(private wpApiService: NgxWpApiService) {}

this.wpApiService.authenticate('your_username', 'your_password');
```

### Available Interfaces

The library has defined these interfaces:
```typescript
import {
    Post,
    Category,
    Tag,
    Media,
    User,
    Page,
    MenuItem,
    Menu,
    SiteInfo
} from '@tomaszatoo/ngx-wp-api'
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
> Note: To get menus, the WordPress site must have the [WP-REST-API V2 Menus](https://wordpress.org/plugins/wp-rest-api-v2-menus/) plugin installed. Otherwise you will get the 404 error.

```typescript
this.wpApiService.getMenus().subscribe(menus => {
  console.log(menus);
});
```

### Available Methods

The following methods are available in the `NgxWpApiService`:
> Note: If `observeResponse` is set to `true`, selected methods will return `HttpResponse` with headers. This can be useful to get specific `WordPress REST API v2` headers such as `X-WP-Total` or `X-WP-TotalPages` (see: [Pagination](https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/)). If `observeResponse` is set to default `false`, all methods will only return the response `body` with appropriate objects.

- **Post Methods**
  - `getPosts(args?: string, observeResponse: boolean = false): Observable<Post[] | HttpResponse<any>>`
  - `getPost(id: number): Observable<Post>`
  > See: Post Methods [arguments](https://developer.wordpress.org/rest-api/reference/posts/#arguments)

- **Category Methods**
  - `getCategories(args?: string, observeResponse: boolean = false): Observable<Category[] | HttpResponse<any>>`
  - `getCategory(id: number): Observable<Category>`
  > See: Category Methods [arguments](https://developer.wordpress.org/rest-api/reference/categories/#arguments)

- **Tag Methods**
  - `getTags(args?: string, observeResponse: boolean = false): Observable<Tag[] | HttpResponse<any>>`
  - `getTag(id: number): Observable<Tag>`
  > See: Tag Methods [arguments](https://developer.wordpress.org/rest-api/reference/tags/#arguments)

- **Media Methods**
  - `getMedias(args?: string, observeResponse: boolean = false): Observable<Media[] | HttpResponse<any>>`
  - `getMedia(id: number): Observable<Media>`
  > See: Media Methods [arguments](https://developer.wordpress.org/rest-api/reference/media/#arguments)

- **User Methods**
  - `getUsers(args?: string, observeResponse: boolean = false): Observable<User[] | HttpResponse<any>>`
  - `getUser(id: number): Observable<User>`
  > See: User Methods [arguments](https://developer.wordpress.org/rest-api/reference/users/#arguments)

- **Page Methods**
  - `getPages(args?: string, observeResponse: boolean = false): Observable<Page[] | HttpResponse<any>>`
  - `getPage(id: number): Observable<Page>`
  > See: Page Methods [arguments](https://developer.wordpress.org/rest-api/reference/pages/#arguments)

- **Menu Methods**
  - `getMenus(): Observable<any>`
  - `getMenu(idOrSlug: number | string): Observable<Menu>`

- **Site Info**
  - `getSiteInfo(): Observable<SiteInfo>`

## License

This library is licensed under the MIT [License](./LICENSE).
