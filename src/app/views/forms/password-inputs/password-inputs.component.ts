import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormDirective,
  FormLabelDirective,
  FormPasswordDirective,
  RowComponent
} from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-password-inputs',
  imports: [
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    ColComponent,
    DocsComponentsComponent,
    DocsExampleComponent,
    RowComponent,
    FormDirective,
    FormLabelDirective,
    FormPasswordDirective,
    FormsModule
  ],
  templateUrl: './password-inputs.component.html',
  styleUrl: './password-inputs.component.scss'
})
export class PasswordInputsComponent {
  readonly secret = signal('SecretPassword');
}
