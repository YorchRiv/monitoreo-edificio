import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { CardModule, DateRangePickerModule, DropdownService, GridModule } from '@coreui/angular-pro';
import { DateRangePickerComponent } from './date-range-picker.component';
import { provideRouter } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardModule, GridModule, DateRangePickerModule, DateRangePickerComponent],
      providers: [provideRouter([]), DropdownService, IconSetService]
    })
      .compileComponents();

    iconSetService = getTestBed().inject(IconSetService);
    iconSetService.icons = { ...iconSubset };
    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
