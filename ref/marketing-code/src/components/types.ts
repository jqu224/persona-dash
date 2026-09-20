export interface Task {
  id: string;
  title: string;
  description: string;
  assignees: { name: string; avatar?: string; initials: string }[];
  progress: number;
  priority: 'Low' | 'Medium' | 'High';
  attachments: number;
  comments: number;
}

// 看板列数据类型
export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}
