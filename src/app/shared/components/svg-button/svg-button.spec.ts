import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgButton } from './svg-button';

describe('SvgButton', () => {
  let component: SvgButton;
  let fixture: ComponentFixture<SvgButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
