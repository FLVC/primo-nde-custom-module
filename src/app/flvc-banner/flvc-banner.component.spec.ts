import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlvcBannerComponent } from './flvc-banner.component';

describe('FlvcBannerComponent', () => {
  let component: FlvcBannerComponent;
  let fixture: ComponentFixture<FlvcBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlvcBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlvcBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
