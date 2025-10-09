import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverMobile } from '@main/board/popover-mobile/popover-mobile';

describe('PopoverMobile', () => {
  let component: PopoverMobile;
  let fixture: ComponentFixture<PopoverMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopoverMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
