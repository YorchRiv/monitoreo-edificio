import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { CalendarsComponent } from './calendars.component';
import { provideRouter } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

describe('CalendarsComponent', () => {
  let component: CalendarsComponent;
  let fixture: ComponentFixture<CalendarsComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarsComponent],
      providers: [provideRouter([]), IconSetService]
    })
      .compileComponents();

    iconSetService = getTestBed().inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(CalendarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
