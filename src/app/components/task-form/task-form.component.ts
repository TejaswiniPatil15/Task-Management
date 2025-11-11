import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() task?: Task | null = null; // if provided, form is edit
  @Output() saved = new EventEmitter<Task>();
  @Output() closed = new EventEmitter<void>();

  taskForm!: FormGroup;
  users: string[] = [];
  statuses: string[] = [];
  priorities: string[] = [];
  
  get isEdit(): boolean {
    return !!this.task;
  }

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      description: [''],
      dueDate: [''],
      assignedTo: ['',Validators.required],
      status: ['Not Started', Validators.required],
      priority: ['Normal', Validators.required],
    });

    this.taskService.getUsers().subscribe(list => this.users = list);
    this.taskService.getStatuses().subscribe(list => this.statuses = list);
    this.taskService.getPriorities().subscribe(list => this.priorities = list);

    if (this.task) {
      this.patchForm(this.task);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && this.taskForm) {
      if (this.task) this.patchForm(this.task);
      else this.taskForm.reset({ status: 'Not Started', priority: 'Normal', completed: false });
    }
  }

  private patchForm(t: Task) {
    this.taskForm.patchValue({
      description: t.description,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      assignedTo: t.assignedTo || '',
      status: t.status || 'Not Started',
      priority: t.priority || 'Normal',
    });
  }

  onSubmit() {
  if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched();
    return; 
  }

  const f = this.taskForm.value;
  const payload: Partial<Task> = {
    description: f.description,
    dueDate: f.dueDate ? new Date(f.dueDate).toISOString() : undefined,
    assignedTo: f.assignedTo,
    status: f.status,
    priority: f.priority,
  };

  if (this.task && this.task.id) {
    this.taskService.update(this.task.id, payload).subscribe(updated => {
      if (updated) this.saved.emit(updated);
    });
  } else {
    this.taskService.create(payload).subscribe(created => this.saved.emit(created));
  }
}

  onCancel() {
    this.closed.emit();
  }
}
