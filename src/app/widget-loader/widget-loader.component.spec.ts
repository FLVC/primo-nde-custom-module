import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetLoaderComponent } from './widget-loader.component';

describe('WidgetLoaderComponent', () => {
  let component: WidgetLoaderComponent;
  let fixture: ComponentFixture<WidgetLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
