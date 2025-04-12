import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = '@tomaszatoo/examples';

  libs: any[] = [
    {name: 'WP API', path: 'wp-api' },
    {name: 'Timer', path: 'timer' },
    {name: 'Graph', path: 'graph' }
  ]
}
