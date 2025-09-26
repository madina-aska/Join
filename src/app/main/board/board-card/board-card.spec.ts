import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCard } from './board-card';

describe('BoardCard', () => {
  let component: BoardCard;
  let fixture: ComponentFixture<BoardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
