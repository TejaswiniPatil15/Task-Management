import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  subscription!: Subscription;
  allTasks: Task[] = [];

  // UI state
  searchTerm = '';
  page = 1;
  pageSize = 20;
  showFormModal = false;
  selectedTask: Task | null = null;
  showDeleteConfirm = false;
  taskToDelete: Task | null = null;

  openMenuTaskId: string | null = null;
  private clickListener: (() => void) | null = null;

  filteredTasksList: Task[] = [];
  pagedTasksList: Task[] = [];

  constructor(public taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.subscription = this.taskService.getAll().subscribe((list: Task[]) => {
      this.tasks = list;
      this.allTasks = list;
      this.applySearchFilter();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.removeClickListener();
  }


  openNew(): void {
    this.selectedTask = null;
    this.showFormModal = true;
  }

  openEdit(task: Task): void {
    this.selectedTask = task;
    this.showFormModal = true;
    this.openMenuTaskId = null;
  }

  onSaved(_: Task): void {
    this.showFormModal = false;
    this.selectedTask = null;
    this.refreshTasks();
  }

  onClosed(): void {
    this.showFormModal = false;
    this.selectedTask = null;
  }

  openDeleteConfirm(task: Task): void {
    this.selectedTask = task;
    this.showDeleteConfirm = true;
    this.openMenuTaskId = null;
  }

  confirmDelete(yes: boolean): void {
    if (yes && this.selectedTask) {
      this.taskService.delete(this.selectedTask.id).subscribe(() => this.refreshTasks());
    }
    this.showDeleteConfirm = false;
    this.selectedTask = null;
  }

  toggleComplete(task: Task): void {
    this.taskService.toggleComplete(task.id).subscribe(() => this.refreshTasks());
  }


  toggleRowMenu(id: string): void {
    if (this.openMenuTaskId === id) {
      this.openMenuTaskId = null;
      this.removeClickListener();
    } else {
      this.openMenuTaskId = id;
      setTimeout(() => this.addClickListener(), 0);
    }
  }

  closeRowMenu(event: Event): void {
    event.preventDefault();
    this.openMenuTaskId = null;
    this.removeClickListener();
  }

  private addClickListener(): void {
    if (this.clickListener) return;
    const handler = (event: MouseEvent) => {
      const menu = document.querySelector('.slds-dropdown-trigger.slds-is-open');
      if (!menu) return;
      const target = event.target as HTMLElement;
      if (!menu.contains(target)) {
        this.openMenuTaskId = null;
        this.removeClickListener();
      }
    };
    document.addEventListener('mousedown', handler);
    this.clickListener = () => document.removeEventListener('mousedown', handler);
  }

  private removeClickListener(): void {
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = null;
    }
  }


  refreshTasks(): void {
    this.page = 1;
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getAll().subscribe((tasks: Task[]) => {
      this.allTasks = tasks || [];
      this.applySearchFilter();
    });
  }

  applySearchFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredTasksList = [...this.allTasks];
    } else {
      this.filteredTasksList = this.allTasks.filter(
        t =>
          (t.assignedTo && t.assignedTo.toLowerCase().includes(term)) ||
          (t.status && t.status.toLowerCase().includes(term))
      );
    }

    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.page - 1) * this.pageSize;
    this.pagedTasksList = this.filteredTasksList.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    const total = Math.ceil(this.filteredTasksList.length / this.pageSize);
    if (page < 1 || page > total) return;
    this.page = page;
    this.updatePagination();
  }


  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTasksList.length / this.pageSize));
  }
}
