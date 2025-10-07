import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./full-calendar-ng.component').then(m => m.FullCalendarNgComponent),
    data: {
      title: 'FullCalendar'
    }
  }
];
