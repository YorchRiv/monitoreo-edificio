import { Component } from '@angular/core';
import { CardBodyComponent, CardComponent, CardHeaderComponent, ColComponent, RowComponent } from '@coreui/angular-pro';
import { DocsComponentsComponent, DocsExampleComponent } from '@docs-components/public-api';
import { SmartTablesDownloadableExampleComponent } from './smart-tables-downloadable-example/smart-tables-downloadable-example.component';
import { SmartTablesSelectableExampleComponent } from './smart-tables-selectable-example/smart-tables-selectable-example.component';
import { SmartTablesBasicExampleComponent } from './smart-tables-basic-example/smart-tables-basic-example.component';

@Component({
  selector: 'app-smart-tables',
  templateUrl: './smart-tables.component.html',
  imports: [RowComponent, ColComponent, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, SmartTablesBasicExampleComponent, SmartTablesSelectableExampleComponent, SmartTablesDownloadableExampleComponent, DocsComponentsComponent]
})
export class SmartTablesComponent {
}
