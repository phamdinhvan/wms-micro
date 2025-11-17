import {Task, TaskResponse, TaskStatusCode, ViewMode} from '@wms/core';
import dayjs from 'dayjs';

// Status mapping from API to UI
export const statusMap: Record<string, TaskStatusCode> = {
  completed: 'completed',
  in_progress: 'in_progress',
  new: 'new',
  cancelled: 'cancelled',
  // on_hold: "on_hold",
};

// Convert new API response directly to Task (no conversion needed as API returns Task format)
export function enrichTaskResponse(t: Task, idx: number): Task {
  // The new API already returns Task format, so just return it
  return t;
}

// Convert old TaskResponse to Task with UI enhancements (for backward compatibility)
export function convertTaskResponseToTask(t: TaskResponse, idx: number): Task {
  const duration = Math.max(
    1,
    dayjs(t.endDate).diff(dayjs(t.startDate), 'day') + 1,
  );

  // Convert old API response to new Task interface structure
  return {
    id: t.id,
    projectId: t.projectId,
    projectKey: t.projectId, // fallback if not provided
    projectName: t.name || '', // fallback if not provided
    projectIcon: null,
    parentId: t.parentId || null,
    key: t.id, // fallback if not provided
    name: t.name,
    workDays: duration,
    status: {
      code: t.status || 'new',
      color: '#6c757d', // default color
      label: '',
    },
    assignee: t.assignee ? {id: t.assignee} : null,
    reporter: null,
    progress: t.progress,
    priority: {
      code: t.priority || 'normal',
      color: '#6c757d', // default color
      label: '',
    },
    timeTracking: {
      originalEstimate: '0m',
      remainingEstimate: '0m',
      timeSpent: '0m',
    },
    description: t.description || '',
    created: t.createdAt,
    updated: t.updatedAt,
    resolution: null,
    startDate: t.startDate,
    endDate: t.endDate,
  };
}

// Enrich flat task list with UI fields (now works with Task objects directly)
export function enrichTaskList(flatTasks: Task[]): Task[] {
  return flatTasks.map((apiTask, idx) => enrichTaskResponse(apiTask, idx));
}

// Convert Task to GanttTask format for callbacks
export function toGanttTask(task: Task) {
  return {
    id: task.id,
    name: task.name,
    start: task.startDate,
    end: task.endDate,
    progress: task.progress,
  };
}

// Convert Task back to TaskResponse format for compatibility
export function taskToTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    projectId: task.projectId,
    parentId: task.parentId,
    name: task.name,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    progress: task.progress,
    priority: task.priority?.code,
    status: task.status?.code,
    assignee: task.assignee?.id || null,
    manager: null,
    tags: [],
    level: 0,
    createdAt: task.created,
    updatedAt: task.updated,
    externalId: null,
    category: null,
    lastSyncedAt: null,
    externalUpdatedAt: null,
    syncVersion: '0',
  };
}

// Convert Task to new API payload format for create/update operations
export function taskToApiPayload(task: Task): {
  name: string;
  externalId?: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  assignee?: {
    email?: string;
    id: string;
  };
  priority: string;
  type?: string;
  parentId?: string | null;
} {
  return {
    name: task.name,
    externalId: task.key,
    description: task.description,
    startDate: task.startDate,
    endDate: task.endDate,
    progress: task.progress,
    status: task.status.code,
    assignee: task.assignee
      ? {
          email: task.assignee.email,
          id: task.assignee.id,
        }
      : undefined,
    priority: task.priority.code,
    parentId: task.parentId,
  };
}

// Get day width based on view mode
export function getDayWidth(mode: ViewMode): number {
  return mode === 'days' ? 25 : mode === 'weeks' ? 20 : 7;
}

// Find task by ID in task list
export function findTaskById(list: Task[], targetId: string): Task | null {
  return list.find(task => task.id === targetId) || null;
}

// Get visible tasks with hierarchy (flat structure with level info)
export function getVisibleTasksFlat(
  tasks: Task[],
  collapsed: Record<string, boolean>,
): {task: Task; level: number}[] {
  const result: {task: Task; level: number}[] = [];
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => taskMap.set(task.id, task));

  const isTaskVisible = (task: Task): boolean => {
    let current = task;
    while (current.parentId) {
      const parent = taskMap.get(current.parentId);
      if (!parent) break;
      if (collapsed[parent.id]) return false;
      current = parent;
    }
    return true;
  };

  const addTasksInOrder = (taskList: Task[], level: number) => {
    if (level > 4) return; // Support up to 5 levels (0-4)
    taskList.forEach(task => {
      if (isTaskVisible(task)) {
        result.push({task, level});
        if (!collapsed[task.id] && level < 4) {
          const children = tasks.filter(t => t.parentId === task.id);
          addTasksInOrder(children, level + 1);
        }
      }
    });
  };

  const rootTasks = tasks.filter(t => !t.parentId);
  addTasksInOrder(rootTasks, 0);
  return result;
}

// Clamp date within project bounds
export function clampDate(
  date: dayjs.Dayjs,
  start: dayjs.Dayjs,
  end: dayjs.Dayjs,
): dayjs.Dayjs {
  if (date.isBefore(start)) return start;
  if (date.isAfter(end)) return end;
  return date;
}

// Calculate drag result with constraints
export function calculateDragResult(
  type: 'move' | 'resize-left' | 'resize-right',
  initDate: string,
  initDuration: number,
  deltaDays: number,
  projectStart: dayjs.Dayjs,
  projectEnd: dayjs.Dayjs,
) {
  let newStartDate: string;
  let newEndDate: string;
  let newDuration: number;
  if (type === 'move') {
    const newStart = clampDate(
      dayjs(initDate, 'YYYY-MM-DD').add(deltaDays, 'day'),
      projectStart,
      projectEnd,
    );
    const newEnd = newStart.add(initDuration - 1, 'day');
    newStartDate = newStart.format('YYYY-MM-DD');
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = initDuration;
  } else if (type === 'resize-left') {
    let calculatedStart = clampDate(
      dayjs(initDate, 'YYYY-MM-DD').add(deltaDays, 'day'),
      projectStart,
      projectEnd,
    );
    let calculatedDuration = initDuration - deltaDays;
    if (calculatedDuration < 1) {
      calculatedDuration = 1;
      calculatedStart = dayjs(initDate, 'YYYY-MM-DD').add(
        initDuration - 1,
        'day',
      );
    }
    const newEnd = calculatedStart.add(calculatedDuration - 1, 'day');
    newStartDate = calculatedStart.format('YYYY-MM-DD');
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = calculatedDuration;
  } else {
    let calculatedDuration = initDuration + deltaDays;
    if (calculatedDuration < 1) calculatedDuration = 1;

    // Convert initDate to YYYY-MM-DD format for consistent calculation
    const startDate = dayjs(initDate).format('YYYY-MM-DD');
    const newEnd = clampDate(
      dayjs(startDate, 'YYYY-MM-DD').add(calculatedDuration - 1, 'day'),
      projectStart,
      projectEnd,
    );
    newStartDate = startDate;
    newEndDate = newEnd.format('YYYY-MM-DD');
    newDuration = calculatedDuration;
  }

  return {newStartDate, newEndDate, newDuration};
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}
