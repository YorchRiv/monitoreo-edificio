import { Component } from '@angular/core';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, LoadingButtonComponent, RowComponent } from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';

@Component({
  selector: 'app-loading-buttons',
  templateUrl: './loading-buttons.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, LoadingButtonComponent, DocsComponentsComponent]
})
export class LoadingButtonsComponent {

  states = ['normal', 'active', 'disabled'];
  colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];

  public loading = new Array(36);

  onClick(idx: number) {

    if (!!this.loading[idx]) {
      clearTimeout(this.loading[idx]);
      this.loading[idx] = undefined;
    } else {
      this.loading[idx] = setTimeout(() => {
        this.loading[idx] = undefined;
      }, 3000);
    }
  }
}
