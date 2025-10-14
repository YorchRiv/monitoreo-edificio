import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  BadgeComponent,
  ButtonDirective,
  CollapseDirective,
  IColumn,
  SmartTableComponent,
  TemplateIdDirective,
  TextColorDirective
} from '@coreui/angular-pro';
import { TableRowData, TableDataService } from '../../../services/table-data.service';
import { MedicionData } from '../../../services/parquet-data.service';

@Component({
    selector: 'app-smart-tables-basic-example',
    templateUrl: './smart-tables-basic-example.component.html',
    styleUrls: ['./smart-tables-basic-example.component.scss'],    
    imports: [NgIf, BadgeComponent, ButtonDirective, CollapseDirective, SmartTableComponent, TemplateIdDirective, TextColorDirective]
})
export class SmartTablesBasicExampleComponent implements OnChanges {
  @Input() apiData: MedicionData[] = [];
  @Input() isLoading: boolean = false;

  tableData: TableRowData[] = [];
  columns: IColumn[] = [
    { key: 'edificio', label: 'Edificio', _style: { width: '20%' } },
    { key: 'zona', label: 'Zona', _style: { width: '20%' } },
    { key: 'nivel', label: 'Nivel', _style: { width: '20%' } },
    { key: 'voltaje', label: 'Voltaje', _style: { width: '15%' } },
    { key: 'corriente', label: 'Corriente', _style: { width: '15%' } },
    { key: 'potencia', label: 'Potencia', _style: { width: '15%' } }
  ];
  details_visible = Object.create({});

  constructor(private tableDataService: TableDataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiData'] && this.apiData) {
      this.processTableData();
    }
  }

  private processTableData(): void {
    this.tableData = this.tableDataService.processDataForTable(this.apiData);
  }

  getBadge(status: string) {
    switch (status) {
      case 'Aceptable':
        return 'success';
      case 'Inactivo':
        return 'secondary';
      case 'Precaucion':
        return 'warning';
      case 'Alerta':
        return 'danger';
      default:
        return 'primary';
    }
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }
}
