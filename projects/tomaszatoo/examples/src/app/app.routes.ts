import { Routes } from '@angular/router';
import { NgxWpApiComponent } from './components/ngx-wp-api/ngx-wp-api.component';
import { NgxTimerComponent } from './components/ngx-timer/ngx-timer.component';

export const routes: Routes = [
    { path: 'ngx-wp-api', component: NgxWpApiComponent },
    { path: 'ngx-timer', component: NgxTimerComponent }
];
