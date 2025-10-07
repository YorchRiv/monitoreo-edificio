import { Component } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  DropdownCloseDirective,
  RowComponent,
  TemplateIdDirective,
  TimePickerComponent as TimePickerComponent_1
} from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TimePickerComponent_1, TemplateIdDirective, ButtonDirective, DropdownCloseDirective, DocsComponentsComponent]
})
export class TimePickerComponent {

  time? = new Date();

}
