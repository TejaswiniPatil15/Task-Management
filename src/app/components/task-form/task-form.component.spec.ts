import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TaskService } from '../../services/task.service';
import 'jasmine';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let service: TaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [TaskFormComponent],
      providers: [TaskService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TaskService);
    fixture.detectChanges();
  });

  it('should create form with default values', () => {
    expect(component.taskForm).toBeTruthy();
    const value = component.taskForm.value;
    expect(value.title).toBe('');
    expect(value.description).toBe('');
  });

  it('should mark form invalid when title missing', () => {
    component.taskForm.controls.title.setValue('');
    expect(component.taskForm.invalid).toBeTrue();
  });
});
