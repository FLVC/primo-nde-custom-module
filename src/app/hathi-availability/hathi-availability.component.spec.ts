import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiAvailabilityComponent } from './hathi-availability.component';

describe('HathiAvailabilityComponent', () => {
  let component: HathiAvailabilityComponent;
  let fixture: ComponentFixture<HathiAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HathiAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HathiAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
