import { Component } from '@angular/core';
import { CardBodyComponent, CardComponent, CardHeaderComponent } from '@coreui/angular-pro';

@Component({
  templateUrl: 'typography.component.html',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent
  ]
})
export class TypographyComponent {}
