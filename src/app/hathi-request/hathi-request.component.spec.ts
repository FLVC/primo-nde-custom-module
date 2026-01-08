import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiRequestComponent } from './hathi-request.component';

describe('HathiRequestComponent', () => {
  let component: HathiRequestComponent;
  let fixture: ComponentFixture<HathiRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HathiRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HathiRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
