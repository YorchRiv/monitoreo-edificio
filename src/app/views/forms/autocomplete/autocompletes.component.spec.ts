import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutocompletesComponent } from './autocompletes.component';
import { provideRouter } from '@angular/router';

describe('AutocompleteComponent', () => {
  let component: AutocompletesComponent;
  let fixture: ComponentFixture<AutocompletesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutocompletesComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutocompletesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
