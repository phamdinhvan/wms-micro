import {Task} from '@wms/core';
import dayjs from 'dayjs'; // Import dayjs library
import {useCallback, useMemo, useRef} from 'react';
import {convertTaskResponseToTask, enrichTaskList} from '../utils/ganttUtils';
import {useGetTasks} from './useGanttApi';

interface UseGanttTasksProps {
  projectId: string | null;
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
  optimisticUpdates: Record<
    string,
    {startDate: string; endDate: string; duration: number}
  >;
  dateRange?: {
    startDate?: string;
  };
}

export function useGanttTasks({
  projectId,
  filters,
  optimisticUpdates,
  dateRange,
}: UseGanttTasksProps) {
  // Task data
  const tasksQ = useGetTasks({
    projectId: projectId || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    assignee: filters.assignee || undefined,
    startDate: dateRange?.startDate || undefined,
  });

  // Track data version to handle race conditions
  const dataVersionRef = useRef(0);
  const lastOptimisticUpdateRef = useRef<Record<string, any>>({});

  // Memoize date formatting function to prevent recreating on every render
  const formatTaskDate = useCallback((dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
  }, []);

  // Extract tasks from ganttGroups structure or fallback to items - optimized
  const allApiTasks: Task[] = useMemo(() => {
    const responseData = tasksQ.data?.data as any;

    // Increment data version when new data arrives
    if (responseData) {
      dataVersionRef.current += 1;
    }

    // Try to get from ganttGroups first (new API structure)
    if (responseData?.ganttGroups && Array.isArray(responseData.ganttGroups)) {
      const allTasks: Task[] = [];
      responseData.ganttGroups.forEach((group: any) => {
        if (group.items && Array.isArray(group.items)) {
          allTasks.push(...group.items);
        }
      });
      return allTasks;
    }

    // Fallback to items (legacy structure) - convert TaskResponse to Task
    if (responseData?.items && Array.isArray(responseData.items)) {
      return responseData.items.map((taskResponse: any, idx: number) =>
        convertTaskResponseToTask(taskResponse, idx),
      );
    }

    return [];
  }, [tasksQ.data?.data]);

  // Memoize optimistic updates check to prevent unnecessary recalculations
  const optimisticUpdatesChanged = useMemo(() => {
    const currentKeys = Object.keys(optimisticUpdates);
    const lastKeys = Object.keys(lastOptimisticUpdateRef.current);

    if (currentKeys.length !== lastKeys.length) return true;

    return currentKeys.some(
      key =>
        JSON.stringify(optimisticUpdates[key]) !==
        JSON.stringify(lastOptimisticUpdateRef.current[key]),
    );
  }, [optimisticUpdates]);

  // Local tasks derived from API with flat structure, applying optimistic updates - optimized
  const tasks: Task[] = useMemo(() => {
    const baseTasks = enrichTaskList(allApiTasks);

    // Update ref only when optimistic updates actually changed
    if (optimisticUpdatesChanged) {
      lastOptimisticUpdateRef.current = {...optimisticUpdates};
    }

    return baseTasks.map(task => {
      const optimisticUpdate = optimisticUpdates[task.id];
      if (optimisticUpdate) {
        // Only apply optimistic update if it's more recent than API data
        return {
          ...task,
          startDate: optimisticUpdate.startDate,
          endDate: optimisticUpdate.endDate,
        };
      }
      // Ensure consistent date format for all tasks (YYYY-MM-DD) - use memoized function
      return {
        ...task,
        startDate: formatTaskDate(task.startDate),
        endDate: formatTaskDate(task.endDate),
      };
    });
  }, [
    allApiTasks,
    optimisticUpdates,
    optimisticUpdatesChanged,
    formatTaskDate,
  ]);

  // Enhanced tasks with parent-child synchronization - optimized with early returns
  const synchronizedTasks: Task[] = useMemo(() => {
    // Early return if no tasks
    if (tasks.length === 0) return [];

    // Create task map for O(1) lookups
    const taskMap = new Map(tasks.map(task => [task.id, task]));
    const childrenMap = new Map<string, Task[]>();

    // Pre-calculate children for each task to avoid repeated filtering
    tasks.forEach(task => {
      if (task.parentId) {
        if (!childrenMap.has(task.parentId)) {
          childrenMap.set(task.parentId, []);
        }
        childrenMap.get(task.parentId)!.push(task);
      }
    });

    return tasks.map(task => {
      // Skip parent date calculation if task has optimistic updates (during drag)
      // This prevents child tasks from being recalculated during parent drag operations
      if (optimisticUpdates[task.id]) {
        return task; // Return task as-is during optimistic updates
      }

      // If this task has children, calculate dates based on children
      const children = childrenMap.get(task.id) || [];
      if (children.length > 0) {
        // Only calculate parent dates from children that are NOT being dragged
        const stableChildren = children.filter(
          child => !optimisticUpdates[child.id],
        );

        // If all children are being dragged, keep parent as-is to prevent flicker
        if (stableChildren.length === 0) {
          return task;
        }

        const childStartDates = stableChildren.map(
          child => new Date(child.startDate),
        );
        const childEndDates = stableChildren.map(
          child => new Date(child.endDate),
        );

        const earliestStart = new Date(
          Math.min(...childStartDates.map(d => d.getTime())),
        );
        const latestEnd = new Date(
          Math.max(...childEndDates.map(d => d.getTime())),
        );

        return {
          ...task,
          startDate: earliestStart.toISOString().split('T')[0],
          endDate: latestEnd.toISOString().split('T')[0],
        };
      }

      return task;
    });
  }, [tasks, optimisticUpdates]);

  return {
    tasksQ,
    allApiTasks,
    tasks: synchronizedTasks,
    isLoading: tasksQ.isLoading,
  };
}
