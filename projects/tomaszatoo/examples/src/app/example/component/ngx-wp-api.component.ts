import { Component, OnInit } from '@angular/core';
// services 
import { WpApiService } from '../service/wp-api.service';
import { HttpResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-ngx-wp-api',
  standalone: true,
  imports: [],
  templateUrl: './ngx-wp-api.component.html',
  styleUrl: './ngx-wp-api.component.scss'
})
export class NgxWpApiComponent implements OnInit {

  siteInfo: any;
  posts: any;
  categories: any;
  menus: any;

  constructor(
    private wpApiService: WpApiService
  ) { }

  ngOnInit(): void {
    const siteInfoSub = this.wpApiService.getSiteInfo()
    .pipe(
      catchError(error => {
        console.error(error.message);
        return of()
      })
    )
    .subscribe({
      next: (res: HttpResponse<any>) => {
        console.log('siteInfo', res);
        // if (res && res.ok) {
          // console.log('siteInfo', res);
          this.siteInfo = res;
        // }
        siteInfoSub.unsubscribe();
      },
      error: (e: any) => {
        console.error(e);
        siteInfoSub.unsubscribe();
      }
    });

    const getPostsSub = this.wpApiService.getPosts('per_page=3&page=1')
    .pipe(
      catchError(error => {
        console.error(error.message);
        return of([])
      })
    )
    .subscribe({
      next: (res: HttpResponse<any>) => {
        console.log('posts', res);
        this.posts = res;
        getPostsSub.unsubscribe();
      },
      error: (e: any) => {
        console.error(e);
        getPostsSub.unsubscribe();
      }
    });

    const getCategoriesSub = this.wpApiService.getCategories(1, 'per_page=3')
    .pipe(
      catchError(error => {
        console.error(error.message);
        return of([])
      })
    )
    .subscribe({
      next: (res: HttpResponse<any>) => {
        console.log('categories', res);
        this.categories = res;
        getCategoriesSub.unsubscribe();
      },
      error: (e: any) => {
        console.error(e);
        getCategoriesSub.unsubscribe();
      }
    });

    const getMenusSub = this.wpApiService.getMenus()
    .pipe(
      catchError(error => {
        console.error(error.message);
        return of([])
      })
    )
    .subscribe({
      next: (res: HttpResponse<any>) => {
        console.log('menus', res);
        this.menus = res;
        getMenusSub.unsubscribe();
      },
      error: (e: any) => {
        console.warn('Menus can be used only if the wordpress site has installed WP-REST-API V2 Menus plugin.');
        console.error(e);
        getMenusSub.unsubscribe();
      }
    })
  }

}
