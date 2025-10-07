import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./google-maps.component').then(m => m.GoogleMapsComponent),
    data: {
      title: 'Google Maps'
    },
    providers: [
      provideHttpClient(withJsonpSupport()),
    ]
  }
];
