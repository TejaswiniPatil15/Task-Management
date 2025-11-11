import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    dueDate: new Date().toISOString(),
    status: 'Not Started',
    priority: 'Normal',
    completed: false,
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new task', (done) => {
    service.create(mockTask).subscribe(task => {
      expect(task.id).toBeTruthy();
      expect(task.title).toBe(mockTask.title);
      done();
    });
  });

  it('should get all tasks', (done) => {
    service.create(mockTask).subscribe(() => {
      service.getAll().subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe(mockTask.title);
        done();
      });
    });
  });

  it('should update a task', (done) => {
    const updatedTitle = 'Updated Task';
    service.create(mockTask).subscribe(addedTask => {
      service.update(addedTask.id, { title: updatedTitle }).subscribe(result => {
        expect(result?.title).toBe(updatedTitle);
        done();
      });
    });
  });

  it('should delete a task', (done) => {
    service.create(mockTask).subscribe(addedTask => {
      service.delete(addedTask.id).subscribe(() => {
        service.getAll().subscribe(tasks => {
          expect(tasks.length).toBe(0);
          done();
        });
      });
    });
  });

  it('should get task statuses', (done) => {
    service.getStatuses().subscribe(statuses => {
      expect(statuses).toContain('Not Started');
      expect(statuses).toContain('In Progress');
      expect(statuses).toContain('Completed');
      done();
    });
  });

  it('should get task priorities', (done) => {
    service.getPriorities().subscribe(priorities => {
      expect(priorities).toContain('Low');
      expect(priorities).toContain('Normal');
      expect(priorities).toContain('High');
      done();
    });
  });
});