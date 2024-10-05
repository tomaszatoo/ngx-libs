import { Injectable } from '@angular/core';
import { NgxWpApiService } from '@tomaszatoo/ngx-wp-api';
// http
import { HttpResponse } from '@angular/common/http';
// rxjs
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WpApiService {

  constructor(
    private service: NgxWpApiService
  ) { }

  getSiteInfo(): Observable<HttpResponse<any>> {
    return this.service.getSiteInfo();
  }

  getPosts(params?: string): Observable<any> {
    return this.service.getPosts(params ? params : '');
  }

  getCategories(page: number = 1, params?: string): Observable<any> {
    return this.service.getCategories(`orderby=count&order=asc&page=${page}` + (params ? `&${params}` : ''));
  }

  getMenus(): Observable<any> {
    return this.service.getMenus();
  }


}
