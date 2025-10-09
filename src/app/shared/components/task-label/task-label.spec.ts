import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskLabel } from '@shared/components/task-label/task-label';

describe('TaskLabel', () => {
  let component: TaskLabel;
  let fixture: ComponentFixture<TaskLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskLabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskLabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
