import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'invoice',
    loadComponent: () => import('./invoice/invoice.component').then(m => m.InvoiceComponent),
    data: {
      title: 'Invoice'
    }
  }
];

