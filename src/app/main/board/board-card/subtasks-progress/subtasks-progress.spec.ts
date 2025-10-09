import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtasksProgress } from '@main/board/board-card/subtasks-progress/subtasks-progress';

describe('SubtasksProgress', () => {
  let component: SubtasksProgress;
  let fixture: ComponentFixture<SubtasksProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtasksProgress]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtasksProgress);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
