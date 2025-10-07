import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PasswordInputsComponent } from './password-inputs.component';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

describe('PasswordInputsComponent', () => {
  let component: PasswordInputsComponent;
  let fixture: ComponentFixture<PasswordInputsComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputsComponent],
      providers: [provideRouter([]), IconSetService]
    })
      .compileComponents();
    iconSetService = getTestBed().inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(PasswordInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
