import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NicheAcademyComponent } from './niche-academy.component';

describe('NicheAcademyComponent', () => {
  let component: NicheAcademyComponent;
  let fixture: ComponentFixture<NicheAcademyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NicheAcademyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NicheAcademyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
