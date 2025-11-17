import {notifications} from '@mantine/notifications';
import {Task, useAppMutation} from '@wms/core';
import dayjs from 'dayjs';
import {useCallback} from 'react';
import {calculateDragResult} from '../utils/ganttUtils';

interface UseGanttDragCommitConfig {
  projectId?: string | null;
  tasks: Task[];
  currentDateRange: {start: dayjs.Dayjs; end: dayjs.Dayjs};
  refetchTasks: () => void;
  setOptimisticUpdates: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  setPendingUpdates: React.Dispatch<React.SetStateAction<Set<string>>>;
  t: (key: string) => string;
}

/**
 * Custom hook for handling Gantt chart drag commit operations
 * Manages optimistic updates, API calls, and related task updates
 */
export function useGanttDragCommit(config: UseGanttDragCommitConfig) {
  const {
    projectId,
    tasks,
    currentDateRange,
    refetchTasks,
    setOptimisticUpdates,
    setPendingUpdates,
    t,
  } = config;

  const {mutateAsync: updateTaskField} = useAppMutation('ganttUpdateFieldTask');

  const onCommitDrag = useCallback(
    async ({
      id,
      initDate,
      initDuration,
      type,
      deltaDays,
    }: {
      id: string;
      initDate: string;
      initDuration: number;
      type: 'move' | 'resize-left' | 'resize-right';
      deltaDays: number;
    }) => {
      const {newStartDate, newEndDate, newDuration} = calculateDragResult(
        type,
        initDate,
        initDuration,
        deltaDays,
        currentDateRange.start,
        currentDateRange.end,
      );

      const draggedTask = tasks.find(t => t.id === id);
      if (!draggedTask) return;

      // Calculate optimistic updates for related tasks
      const relatedUpdates: Record<
        string,
        {startDate: string; endDate: string; duration: number}
      > = {};

      // Apply optimistic update to the primary task
      relatedUpdates[id] = {
        startDate: newStartDate,
        endDate: newEndDate,
        duration: newDuration,
      };

      // If dragging a child task, update parent optimistically
      if (draggedTask.parentId) {
        const parent = tasks.find(t => t.id === draggedTask.parentId);
        if (parent) {
          const siblings = tasks.filter(
            t => t.parentId === draggedTask.parentId && t.id !== id,
          );

          const allChildDates = [
            {
              startDate: dayjs(newStartDate, 'YYYY-MM-DD'),
              endDate: dayjs(newEndDate, 'YYYY-MM-DD'),
            },
            ...siblings.map(s => ({
              startDate: dayjs(s.startDate, 'YYYY-MM-DD'),
              endDate: dayjs(s.endDate, 'YYYY-MM-DD'),
            })),
          ];

          const earliestStart = allChildDates.reduce(
            (earliest, current) =>
              current.startDate.isBefore(earliest)
                ? current.startDate
                : earliest,
            allChildDates[0].startDate,
          );

          const latestEnd = allChildDates.reduce(
            (latest, current) =>
              current.endDate.isAfter(latest) ? current.endDate : latest,
            allChildDates[0].endDate,
          );

          const parentStartDate = earliestStart.format('YYYY-MM-DD');
          const parentEndDate = latestEnd.format('YYYY-MM-DD');

          relatedUpdates[parent.id] = {
            startDate: parentStartDate,
            endDate: parentEndDate,
            duration: latestEnd.diff(earliestStart, 'day') + 1,
          };
        }
      }

      // If dragging a parent task, update children optimistically
      if (tasks.some(t => t.parentId === id)) {
        const children = tasks.filter(t => t.parentId === id);
        const deltaMs =
          new Date(newStartDate).getTime() -
          new Date(draggedTask.startDate).getTime();

        children.forEach(child => {
          const newChildStart = new Date(
            new Date(child.startDate).getTime() + deltaMs,
          );
          const newChildEnd = new Date(
            new Date(child.endDate).getTime() + deltaMs,
          );

          relatedUpdates[child.id] = {
            startDate: newChildStart.toISOString().split('T')[0],
            endDate: newChildEnd.toISOString().split('T')[0],
            duration:
              Math.ceil(
                (newChildEnd.getTime() - newChildStart.getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1,
          };
        });
      }

      // Apply all optimistic updates at once
      setOptimisticUpdates(prev => ({
        ...prev,
        ...relatedUpdates,
      }));

      // Mark all affected tasks as pending
      setPendingUpdates(prev => {
        const newSet = new Set(prev);
        Object.keys(relatedUpdates).forEach(taskId => newSet.add(taskId));
        return newSet;
      });

      try {
        await updateTaskField({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId: projectId || '', taskId: id},
          },
          method: 'patch',
          payload: {startDate: newStartDate, endDate: newEndDate},
        });

        await refetchTasks();

        // Clear optimistic updates after successful API call
        setTimeout(() => {
          setOptimisticUpdates(prev => {
            const updated = {...prev};
            Object.keys(relatedUpdates).forEach(taskId => {
              delete updated[taskId];
            });
            return updated;
          });
          setPendingUpdates(prev => {
            const s = new Set(prev);
            Object.keys(relatedUpdates).forEach(taskId => s.delete(taskId));
            return s;
          });
        }, 100);

        // Task đã được update thành công

        notifications.show({
          message: t('task.notification.update'),
          color: 'green',
        });
      } catch (error) {
        console.error('Error updating task:', error);
        // Revert optimistic updates on error
        setOptimisticUpdates(prev => {
          const updated = {...prev};
          Object.keys(relatedUpdates).forEach(taskId => {
            delete updated[taskId];
          });
          return updated;
        });
        setPendingUpdates(prev => {
          const s = new Set(prev);
          Object.keys(relatedUpdates).forEach(taskId => s.delete(taskId));
          return s;
        });
        notifications.show({
          message: t('task.notification.updateError'),
          color: 'red',
        });
      }
    },
    [
      projectId,
      tasks,
      currentDateRange,
      updateTaskField,
      refetchTasks,
      setOptimisticUpdates,
      setPendingUpdates,
      t,
    ],
  );

  return {onCommitDrag};
}
