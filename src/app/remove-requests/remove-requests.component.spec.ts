import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveRequestsComponent } from './remove-requests.component';

describe('RemoveRequestsComponent', () => {
  let component: RemoveRequestsComponent;
  let fixture: ComponentFixture<RemoveRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
