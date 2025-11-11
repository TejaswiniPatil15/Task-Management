import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../models/task.model';
import { FormsModule } from '@angular/forms';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 'Not Started',
      priority: 'Normal',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: 'In Progress',
      priority: 'High',
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getAll', 'delete', 'update']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    taskServiceSpy.getAll.and.returnValue(new BehaviorSubject(mockTasks));
    taskServiceSpy.delete.and.returnValue(new BehaviorSubject(undefined));
    taskServiceSpy.update.and.returnValue(new BehaviorSubject(mockTasks[0]));

    await TestBed.configureTestingModule({
      declarations: [ 
        TaskListComponent,
        TaskFormComponent 
      ],
      imports: [ FormsModule ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(taskService.getAll).toHaveBeenCalled();
    expect(component.tasks.length).toBe(2);
  });

  it('should filter tasks by search term', () => {
    component.searchTerm = 'Task 1';
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].title).toContain('Task 1');
  });

  it('should handle task deletion', () => {
    const taskToDelete = mockTasks[0];
    component.openDeleteConfirm(taskToDelete);
    expect(component.selectedTask).toBe(taskToDelete);
    expect(component.showDeleteConfirm).toBeTrue();

    component.confirmDelete(true);
    expect(taskService.delete).toHaveBeenCalledWith(taskToDelete.id);
  });

  it('should toggle task completion', () => {
    const task = { ...mockTasks[0] };
    component.toggleComplete(task);
    expect(taskService.update).toHaveBeenCalledWith(task.id, {
      ...task,
      completed: !task.completed
    });
  });

  it('should handle pagination correctly', () => {
    // Setup
    component.pageSize = 1;
    component.page = 1;
    fixture.detectChanges(); // Trigger change detection
    
    // First page
    expect(component.pagedTasks.length).toBe(1);
    expect(component.totalPages).toBe(2);
    expect(component.pagedTasks[0]).toEqual(mockTasks[0]);
    
    // Second page
    component.goToPage(2);
    expect(component.pagedTasks[0]).toEqual(mockTasks[1]);
  });

  it('should open new task form', () => {
    component.openNew();
    expect(component.showFormModal).toBeTrue();
    expect(component.selectedTask).toBeNull();
  });

  it('should open edit task form', () => {
    const taskToEdit = mockTasks[0];
    component.openEdit(taskToEdit);
    expect(component.showFormModal).toBeTrue();
    expect(component.selectedTask).toEqual(taskToEdit);
  });

  it('should close form modal on save', () => {
    component.showFormModal = true;
    component.onSaved(mockTasks[0]);
    expect(component.showFormModal).toBeFalse();
    expect(taskService.getAll).toHaveBeenCalled();
  });

  it('should close form modal on cancel', () => {
    component.showFormModal = true;
    component.onClosed();
    expect(component.showFormModal).toBeFalse();
  });
});