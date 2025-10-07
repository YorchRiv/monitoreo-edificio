import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  DatePickerComponent as DatePickerComponent_1,
  DropdownCloseDirective,
  RowComponent,
  TemplateIdDirective
} from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, DatePickerComponent_1, TemplateIdDirective, ButtonDirective, DropdownCloseDirective, DatePipe, DocsComponentsComponent]
})
export class DatePickerComponent {

  public date?: Date | null = new Date();
  public calendarDate = new Date();

  public dateDisabledExample = new Date(2024, 2, 1);
  public disabledDates: (Date[] | Date)[] = [
    [new Date(2024, 2, 4), new Date(2024, 2, 7)], // range of dates that cannot be selected
    new Date(2024, 2, 16), // single date that cannot be selected
    new Date(2024, 3, 16),
    [new Date(2024, 4, 2), new Date(2024, 4, 8)]
  ];
  public maxDate = new Date(2033, 6, 15, 0, 0, 0);
  public minDate = new Date(2024, 1, 15);

  onToday() {
    this.calendarDate = new Date();
  }

  onCancel() {
    this.date = null;
  }

}
