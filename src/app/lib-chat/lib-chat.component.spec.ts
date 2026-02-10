import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibChatComponent } from './lib-chat.component';

describe('LibChatComponent', () => {
  let component: LibChatComponent;
  let fixture: ComponentFixture<LibChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
