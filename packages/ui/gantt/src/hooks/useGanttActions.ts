import {notifications} from '@mantine/notifications';
import {
  GanttEventCallbacks,
  Task,
  TaskEventData,
  TaskResponse,
  useTranslation,
} from '@wms/core';
import {useCallback} from 'react';
import {GanttBusEvents, GanttEmitter} from '../bus';
import {baseProjectEnd, baseProjectStart} from '../constants';
import {calculateDragResult, taskToTaskResponse} from '../utils/ganttUtils';

export interface GanttActionsConfig {
  tasks: Task[];
  tasksData?: TaskResponse[];
  projectId: string | null;
  eventCallbacks?: GanttEventCallbacks;
  bus?: GanttEmitter<GanttBusEvents>;
  onUserAction?: (action: any) => void;
  updateTaskMutation: any;
  refetchTasks: () => void;
  setOptimisticUpdates: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  setPendingUpdates: React.Dispatch<React.SetStateAction<Set<string>>>;
  setPendingParentUpdate: React.Dispatch<React.SetStateAction<any>>;
  setParentUpdateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit') => void;
}

export function useGanttActions(config: GanttActionsConfig) {
  const {t} = useTranslation('gantt');
  const {
    tasks,
    tasksData = [],
    projectId,
    eventCallbacks,
    bus,
    onUserAction,
    updateTaskMutation,
    refetchTasks,
    setOptimisticUpdates,
    setPendingUpdates,
    setPendingParentUpdate,
    setParentUpdateModalOpen,
    setSelectedTaskId,
    openTaskModal,
  } = config;

  // Emit helpers
  const emitUserAction = useCallback(
    (type: string, payload: any) => {
      const action = {
        type,
        payload,
        timestamp: new Date().toISOString(),
      };
      onUserAction?.(action);
    },
    [onUserAction],
  );

  const emitTaskEvent = useCallback(
    (
      task: TaskResponse,
      eventType: TaskEventData['eventType'],
      changes?: Partial<TaskResponse>,
    ) => {
      const eventData: TaskEventData = {
        task,
        eventType,
        timestamp: new Date().toISOString(),
        changes,
      };
      eventCallbacks?.onTaskEvent?.(eventData);
      bus?.emit('task:event', eventData);
      emitUserAction(eventType as any, {task, changes});
    },
    [eventCallbacks, bus, emitUserAction],
  );

  // Task selection
  const handleTaskSelect = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);

      const localTask = tasks.find(t => t.id === taskId);
      const apiTask = tasksData.find(t => t.id === taskId);

      if (localTask && apiTask) {
        eventCallbacks?.onTaskSelect?.(apiTask);
        bus?.emit('task:select', apiTask);
        emitUserAction('task:select', {task: apiTask});
      }

      // Open modal
      if (apiTask) {
        openTaskModal(apiTask, 'edit');
      }
    },
    [
      tasks,
      tasksData,
      setSelectedTaskId,
      eventCallbacks,
      bus,
      emitUserAction,
      openTaskModal,
    ],
  );

  // Task field updates
  const handleTaskFieldUpdate = useCallback(
    async (taskId: string, field: string, value: string) => {
      try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const isDateField = field === 'startDate' || field === 'endDate';
        const isDurationField = field === 'duration';
        const taskHasChildren = tasks.some(t => t.parentId === taskId);

        if (taskHasChildren && (isDateField || isDurationField)) {
          setPendingParentUpdate({
            taskId,
            taskName: task.name,
            field,
            value,
            updateType: isDurationField ? 'duration' : 'dates',
          });
          setParentUpdateModalOpen(true);
          return;
        }

        await updateTaskMutation({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId: task.projectId, taskId},
          },
          method: 'put',
          payload: {[field]: value || null},
        });

        refetchTasks();
      } catch (error) {
        console.error(`Failed to update task ${field}:`, error);
      }
    },
    [
      tasks,
      updateTaskMutation,
      refetchTasks,
      setPendingParentUpdate,
      setParentUpdateModalOpen,
    ],
  );

  // Drag operations
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
        baseProjectStart,
        baseProjectEnd,
      );
      const task = tasks.find(t => t.id === id);
      const taskHasChildren = tasks.some(t => t.parentId === id);

      if (taskHasChildren && task) {
        setPendingParentUpdate({
          taskId: id,
          taskName: task.name,
          field: 'dates',
          value: {startDate: newStartDate, endDate: newEndDate},
          updateType: 'dates',
        });
        setParentUpdateModalOpen(true);
        return;
      }

      setOptimisticUpdates(prev => ({
        ...prev,
        [id]: {
          startDate: newStartDate,
          endDate: newEndDate,
          duration: newDuration,
        },
      }));
      setPendingUpdates(prev => new Set(prev).add(id));

      try {
        await updateTaskMutation({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId: projectId || '', taskId: id},
          },
          method: 'put',
          payload: {startDate: newStartDate, endDate: newEndDate},
        });

        await refetchTasks();

        setOptimisticUpdates(prev => {
          const {[id]: _, ...rest} = prev;
          return rest;
        });
        setPendingUpdates(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });

        const updatedTask = tasks.find(t => t.id === id);
        const updatedTaskResponse = updatedTask
          ? taskToTaskResponse(updatedTask)
          : null;
        if (updatedTaskResponse) {
          emitTaskEvent(updatedTaskResponse, 'updated', {
            startDate: newStartDate,
            endDate: newEndDate,
          });
        }

        notifications.show({
          message: t('task.notification.update'),
          color: 'green',
        });
      } catch (error) {
        setOptimisticUpdates(prev => {
          const {[id]: _, ...rest} = prev;
          return rest;
        });
        setPendingUpdates(prev => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }
    },
    [
      tasks,
      projectId,
      updateTaskMutation,
      refetchTasks,
      setOptimisticUpdates,
      setPendingUpdates,
      setPendingParentUpdate,
      setParentUpdateModalOpen,
      emitTaskEvent,
      t,
    ],
  );

  return {
    handleTaskSelect,
    handleTaskFieldUpdate,
    onCommitDrag,
    emitUserAction,
    emitTaskEvent,
  };
}
