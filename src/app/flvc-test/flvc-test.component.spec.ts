import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlvcTestComponent } from './flvc-test.component';

describe('FlvcTestComponent', () => {
  let component: FlvcTestComponent;
  let fixture: ComponentFixture<FlvcTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlvcTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlvcTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
