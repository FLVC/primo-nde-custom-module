import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitizationLinksComponent } from './digitization-links.component';

describe('DigitizationLinksComponent', () => {
  let component: DigitizationLinksComponent;
  let fixture: ComponentFixture<DigitizationLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitizationLinksComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DigitizationLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
