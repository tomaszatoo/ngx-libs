import { Routes } from '@angular/router';
import { NgxWpApiComponent } from './components/ngx-wp-api/ngx-wp-api.component';
import { NgxTimerComponent } from './components/ngx-timer/ngx-timer.component';
import { GraphComponent } from './components/graph/graph.component';

export const routes: Routes = [
    { path: 'wp-api', component: NgxWpApiComponent },
    { path: 'timer', component: NgxTimerComponent },
    { path: 'graph', component: GraphComponent }
];
