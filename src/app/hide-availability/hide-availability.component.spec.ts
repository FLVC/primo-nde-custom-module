import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideAvailabilityComponent } from './hide-availability.component';

describe('HideAvailabilityComponent', () => {
  let component: HideAvailabilityComponent;
  let fixture: ComponentFixture<HideAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HideAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
