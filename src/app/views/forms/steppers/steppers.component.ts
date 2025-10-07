import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal, TemplateRef, viewChildren } from '@angular/core';
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormLabelDirective,
  FormPasswordDirective,
  FormSelectDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  StepperComponent,
  StepperStepComponent
} from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-steppers',
  imports: [
    StepperComponent,
    StepperStepComponent,
    ButtonDirective,
    RowComponent,
    ColComponent,
    FormLabelDirective,
    FormControlDirective,
    InputGroupComponent,
    FormSelectDirective,
    FormPasswordDirective,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormDirective,
    NgTemplateOutlet,
    InputGroupTextDirective,
    CardBodyComponent,
    CardComponent,
    CardHeaderComponent,
    DocsComponentsComponent,
    DocsExampleComponent
  ],
  templateUrl: './steppers.component.html'
})
export class SteppersComponent {
  readonly finished = signal(false);

  handleReset() {
    console.log('- handleReset');
    this.finished.set(false);
  }

  handleFinish(value: boolean) {
    console.log('- handleFinish', value);
    this.finished.set(value);
  }

  labels = ['Step 1', 'Step 2', 'Step 3'];

  readonly stepTemplates = viewChildren('stepTpl', { read: TemplateRef });
  readonly steps = computed(() => {
    const stepTemplates = this.stepTemplates();
    return stepTemplates.map((step, index) => {
      return { label: `Step ${index + 1}`, template: step };
    });
  });

}
