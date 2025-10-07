import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CardModule, GridModule, TimePickerModule } from '@coreui/angular-pro';
import { TimePickerComponent } from './time-picker.component';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardModule, GridModule, TimePickerModule, TimePickerComponent],
      providers: [provideRouter([]), IconSetService]
    })
      .compileComponents();

    iconSetService = getTestBed().inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
