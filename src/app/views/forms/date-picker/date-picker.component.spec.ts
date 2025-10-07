import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CardModule, DatePickerModule, DropdownService, GridModule } from '@coreui/angular-pro';
import { DatePickerComponent } from './date-picker.component';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;
  let iconSetService: IconSetService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CardModule, GridModule, DatePickerModule, DatePickerComponent],
      providers: [provideRouter([]), DropdownService, IconSetService],

    })
    .compileComponents();
    iconSetService = getTestBed().inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
