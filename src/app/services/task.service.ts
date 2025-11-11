import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { STORAGE_KEYS } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>(this.loadFromStorage());
  public tasks$ = this.tasksSubject.asObservable();

  constructor() {}

  // simple lists used by form selects (mocked)
  getUsers(): Observable<string[]> {
    return of(['User 1', 'User 2', 'User 3', 'User 4']).pipe(delay(100));
  }

  getStatuses(): Observable<string[]> {
    return of(['Not Started', 'In Progress', 'Completed']).pipe(delay(50));
  }

  getPriorities(): Observable<string[]> {
    return of(['Low', 'Normal', 'High']).pipe(delay(50));
  }

  private loadFromStorage(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  private generateId(): string {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


  getAll(): Observable<Task[]> {
    return this.tasks$.pipe(map(list => list));
  }

  getById(id: string): Observable<Task | undefined> {
    return this.tasks$.pipe(map(list => list.find(t => t.id === id)));
  }

  create(taskData: Partial<Task>): Observable<Task> {
    const tasks = [...this.tasksSubject.getValue()];
    const now = new Date().toISOString();
    const newTask: Task = {
      id: this.generateId(),
      description: taskData.description || '',
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo,
      status: taskData.status || 'Not Started',
      priority: taskData.priority || 'Normal',
      createdAt: now,
      updatedAt: now
    };
    tasks.unshift(newTask);
    this.saveToStorage(tasks);
    return of(newTask);
  }

  update(id: string, changes: Partial<Task>): Observable<Task | undefined> {
    const tasks = [...this.tasksSubject.getValue()];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return of(undefined);
    }
    const updated: Task = {
      ...tasks[idx],
      ...changes,
      updatedAt: new Date().toISOString()
    };
    tasks[idx] = updated;
    this.saveToStorage(tasks);
    return of(updated);
  }

  delete(id: string): Observable<boolean> {
    const tasks = this.tasksSubject.getValue().filter(t => t.id !== id);
    this.saveToStorage(tasks);
    return of(true);
  }

  toggleComplete(id: string): Observable<Task | undefined> {
    const tasks = [...this.tasksSubject.getValue()];
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return of(undefined);
    tasks[idx] = {
      ...tasks[idx],
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage(tasks);
    return of(tasks[idx]);
  }
}
