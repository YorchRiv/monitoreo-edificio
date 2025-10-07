import { Component } from '@angular/core';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, RangeSliderComponent, RowComponent } from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-range-sliders',
  imports: [
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    DocsComponentsComponent,
    DocsExampleComponent,
    RangeSliderComponent,
    RowComponent,
  ],
  templateUrl: './range-sliders.component.html',
  styleUrl: './range-sliders.component.scss'
})
export class RangeSlidersComponent {

}
