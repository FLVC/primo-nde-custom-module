import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindingAidComponent } from './finding-aid.component';

describe('FindingAidComponent', () => {
  let component: FindingAidComponent;
  let fixture: ComponentFixture<FindingAidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindingAidComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindingAidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
