import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, RatingComponent, RowComponent, TemplateIdDirective } from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-ratings',
  imports: [
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    DocsComponentsComponent,
    DocsExampleComponent,
    RowComponent,
    RatingComponent,
    TemplateIdDirective,
    IconDirective,
    NgClass
  ],
  templateUrl: './ratings.component.html'
})
export class RatingsComponent {
  readonly value = signal(3);

  tooltips = ['Very bad', 'Bad', 'Meh', 'Good', 'Very good'];
  icons = ['cilMoodVeryBad', 'cilMoodBad', 'cilMeh', 'cilMoodGood', 'cilMoodVeryGood'];
  activeIcons = this.icons.map((icon) => `active_${icon}`);
  activeClass = ['text-dark', 'text-danger', 'text-warning', 'text-info', 'text-success'];
}
