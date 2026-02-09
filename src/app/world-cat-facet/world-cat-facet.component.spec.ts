import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldCatFacetComponent } from './world-cat-facet.component';

describe('WorldCatFacetComponent', () => {
  let component: WorldCatFacetComponent;
  let fixture: ComponentFixture<WorldCatFacetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldCatFacetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldCatFacetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
