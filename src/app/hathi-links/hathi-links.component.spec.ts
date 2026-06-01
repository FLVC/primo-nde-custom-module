import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiLinksComponent } from './hathi-links.component';

describe('HathiLinksComponent', () => {
  let component: HathiLinksComponent;
  let fixture: ComponentFixture<HathiLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HathiLinksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HathiLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
