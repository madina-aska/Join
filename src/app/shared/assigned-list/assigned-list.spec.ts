import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedList } from './assigned-list';

describe('AssignedList', () => {
  let component: AssignedList;
  let fixture: ComponentFixture<AssignedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
