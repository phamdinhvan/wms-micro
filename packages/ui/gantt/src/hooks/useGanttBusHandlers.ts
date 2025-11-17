import {notifications} from '@mantine/notifications';
import {Task, TaskResponse, useAppMutation} from '@wms/core';
import {useEffect} from 'react';
import {GanttBusEvents, GanttEmitter} from '../bus';
import {taskToTaskResponse} from '../utils/ganttUtils';

interface UseGanttBusHandlersConfig {
  bus?: GanttEmitter<GanttBusEvents>;
  projectId?: string | null;
  allApiTasks: Task[];
  tasks: Task[];
  handleProjectSelect: (projectId: string) => void;
  handleTaskSelect: (taskId: string) => void;
  refetchTasks: () => void;
  setOptimisticUpdates: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >;
  setPendingUpdates: React.Dispatch<React.SetStateAction<Set<string>>>;
  openTaskModal: (task: TaskResponse | null, mode: 'create' | 'edit') => void;
  emitTaskEvent: (
    task: TaskResponse,
    eventType: any,
    changes?: Partial<TaskResponse>,
  ) => void;
  t: (key: string) => string;
}

/**
 * Custom hook for handling Gantt chart event bus subscriptions
 * Manages all bus command handlers and their lifecycle
 */
export function useGanttBusHandlers(config: UseGanttBusHandlersConfig) {
  const {
    bus,
    projectId,
    allApiTasks,
    tasks,
    handleProjectSelect,
    handleTaskSelect,
    refetchTasks,
    setOptimisticUpdates,
    setPendingUpdates,
    openTaskModal,
    emitTaskEvent,
    t,
  } = config;

  const {mutateAsync: updateTaskField} = useAppMutation('ganttUpdateFieldTask');

  useEffect(() => {
    if (!bus) return;

    const handlers = [
      // Set project command
      bus.on(
        'cmd:setProject',
        ({projectId: newProjectId}) =>
          newProjectId && handleProjectSelect(newProjectId),
      ),

      // Select task command
      bus.on(
        'cmd:selectTask',
        ({taskId}) => taskId && handleTaskSelect(taskId),
      ),

      // Refresh command
      bus.on('cmd:refresh', () => refetchTasks()),

      // Update task dates command
      bus.on('cmd:updateTaskDates', async ({taskId, startDate, endDate}) => {
        if (!taskId || !startDate || !endDate) return;
        try {
          await updateTaskField({
            url: {
              baseUrl: '/gantt/:projectId/tasks/:taskId',
              urlParams: {projectId: projectId || '', taskId},
            },
            method: 'patch',
            payload: {startDate, endDate},
          });

          await refetchTasks();

          setTimeout(() => {
            setOptimisticUpdates(prev => {
              const {[taskId]: _, ...rest} = prev;
              return rest;
            });
            setPendingUpdates(prev => {
              const s = new Set(prev);
              s.delete(taskId);
              return s;
            });
          }, 100);

          const updatedTask = tasks.find(t => t.id === taskId);
          if (updatedTask) {
            emitTaskEvent(taskToTaskResponse(updatedTask), 'updated', {
              startDate,
              endDate,
            });
          }

          notifications.show({
            message: t('task.notification.update'),
            color: 'green',
          });
        } catch (e) {
          console.error(e);
        }
      }),

      // Open create task modal command
      bus.on('cmd:openCreateTask', payload => {
        const parentId = (payload as any)?.parentId;
        if (parentId) {
          const parentApiTask = allApiTasks.find(t => t.id === parentId);
          if (parentApiTask) {
            openTaskModal(
              {
                ...taskToTaskResponse(parentApiTask),
                parentId: parentApiTask.id,
              },
              'create',
            );
            bus?.emit('ui:openTaskModal', {mode: 'create'});
            return;
          }
        }
        openTaskModal(null, 'create');
        bus?.emit('ui:openTaskModal', {mode: 'create'});
      }),
    ];

    return () => handlers.forEach(off => off());
  }, [
    bus,
    projectId,
    allApiTasks,
    tasks,
    handleProjectSelect,
    handleTaskSelect,
    refetchTasks,
    updateTaskField,
    setOptimisticUpdates,
    setPendingUpdates,
    openTaskModal,
    emitTaskEvent,
    t,
  ]);
}
