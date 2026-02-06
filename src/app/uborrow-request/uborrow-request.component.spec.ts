import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UborrowRequestComponent } from './uborrow-request.component';

describe('UborrowRequestComponent', () => {
  let component: UborrowRequestComponent;
  let fixture: ComponentFixture<UborrowRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UborrowRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UborrowRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
