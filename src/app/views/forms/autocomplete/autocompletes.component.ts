import { Component } from '@angular/core';
import {
  AutocompleteDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormFeedbackComponent,
  FormLabelDirective,
  FormTextDirective,
  RowComponent
} from '@coreui/angular-pro';
import { DocsComponentsComponent } from '@docs-components/docs-components/docs-components.component';
import { DocsExampleComponent } from '@docs-components/docs-example/docs-example.component';

@Component({
  selector: 'app-autocomplete',
  imports: [CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, DocsComponentsComponent, DocsExampleComponent, RowComponent, AutocompleteDirective, FormLabelDirective, FormFeedbackComponent, FormTextDirective],
  templateUrl: './autocompletes.component.html'
})
export class AutocompletesComponent {
  readonly programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin'];
  readonly frameworks = ['Angular', 'Bootstrap', 'React.js', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'jQuery'];
  readonly countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Poland', 'Netherlands', 'Belgium'];
  readonly cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  readonly technologies = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Redis'];
  readonly colors = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple', 'Pink', 'Cyan', 'Magenta', 'Lime'];
  readonly basicOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
}
