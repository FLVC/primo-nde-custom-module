import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UborrowVolumeComponent } from './uborrow-volume.component';

describe('UborrowVolumeComponent', () => {
  let component: UborrowVolumeComponent;
  let fixture: ComponentFixture<UborrowVolumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UborrowVolumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UborrowVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
