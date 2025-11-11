export interface Task {
  id: string;          
  description?: string;
  dueDate?: string;    
  createdAt: string;   
  updatedAt?: string;  
  assignedTo?: string;
  status?: 'Not Started' | 'In Progress' | 'Completed' | string;
  priority?: 'Low' | 'Normal' | 'High' | string;
}