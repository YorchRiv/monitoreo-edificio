import { Component, signal } from '@angular/core';
import { CalendarComponent, CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, RowComponent } from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-calendar',
  imports: [
    ColComponent,
    CalendarComponent,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    DocsComponentsComponent,
    DocsExampleComponent,
    RowComponent
  ],
  templateUrl: './calendars.component.html',
})
export class CalendarsComponent {
  #today = new Date();
  readonly startDate = signal(new Date(this.#today.getFullYear(), this.#today.getMonth(), 3));
  readonly endDate = signal<Date | null>(new Date(this.startDate().getFullYear(), this.startDate().getMonth(), this.startDate().getDate() + 7));
}
