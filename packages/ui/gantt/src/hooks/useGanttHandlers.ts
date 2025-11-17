import {notifications} from '@mantine/notifications';
import {Task, useAppMutation} from '@wms/core';
import {useCallback} from 'react';

interface GanttModals {
  createProject: boolean;
  taskModal: boolean;
  themeModal: boolean;
  themeConfig: boolean;
  parentUpdate: boolean;
}

interface PendingParentUpdate {
  taskId: string;
  taskName: string;
  field: string;
  value: string;
  updateType: 'duration' | 'dates';
}

interface UseGanttHandlersConfig {
  projectId?: string | null;
  tasks: Task[];
  refetchTasks: () => void;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setTaskModalMode: React.Dispatch<React.SetStateAction<'create' | 'edit'>>;
  setModals: React.Dispatch<React.SetStateAction<GanttModals>>;
  setPendingParentUpdate: React.Dispatch<React.SetStateAction<PendingParentUpdate>>;
  replaceParams: (params: Record<string, string | undefined>) => void;
  t: (key: string) => string;
}

/**
 * Custom hook for handling Gantt chart user interactions
 * Manages project selection, task updates, and modal operations
 */
export function useGanttHandlers(config: UseGanttHandlersConfig) {
  const {
    projectId,
    tasks,
    refetchTasks,
    setSelectedTaskId,
    setTaskModalMode,
    setModals,
    setPendingParentUpdate,
    replaceParams,
    t,
  } = config;

  const {mutateAsync: updateTaskField} = useAppMutation('ganttUpdateFieldTask');

  // Project selection handler
  const handleProjectSelect = useCallback((newProjectId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProjectId', newProjectId);
    }
    // Update URL parameter
    replaceParams?.({ projectId: newProjectId });
  }, [replaceParams]);

  const handleProjectSelectWithEvents = useCallback(
    (newProjectId: string) => {
      handleProjectSelect(newProjectId);
      setSelectedTaskId(null);
    },
    [handleProjectSelect, setSelectedTaskId],
  );

  // Task selection handler
  const handleTaskSelect = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
      
      // TaskFormModal sẽ tự fetch data dựa trên selectedTaskId
      setTaskModalMode('edit');
      setModals(prev => ({...prev, taskModal: true}));
    },
    [setSelectedTaskId, setTaskModalMode, setModals],
  );

  // Task field update handler
  const handleTaskFieldUpdate = useCallback(
    async (taskId: string, field: string, value: string) => {
      try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const isDateField = field === 'startDate' || field === 'endDate';
        const isDurationField = field === 'duration';
        const hasChildren = tasks.some(t => t.parentId === taskId);

        if (hasChildren && (isDateField || isDurationField)) {
          setPendingParentUpdate({
            taskId,
            taskName: task.name,
            field,
            value,
            updateType: isDurationField ? 'duration' : 'dates',
          });
          setModals(prev => ({...prev, parentUpdate: true}));
          return;
        }

        if (field !== 'assignee') {
          await updateTaskField({
            url: {
              baseUrl: '/gantt/:projectId/tasks/:taskId',
              urlParams: {projectId: task.projectId, taskId},
            },
            method: 'patch',
            payload: {[field]: value || null},
          });
        } else {
          await updateTaskField({
            url: {
              baseUrl: '/gantt/:projectId/tasks/:taskId',
              urlParams: {projectId: task.projectId, taskId},
            },
            method: 'patch',
            payload: {
              assignee: {
                id: value,
              },
            },
          });
        }
        refetchTasks();
      } catch (error) {
        console.error(`Failed to update task ${field}:`, error);
      }
    },
    [tasks, updateTaskField, refetchTasks, setPendingParentUpdate, setModals],
  );

  // Excel export handler
  const handleExportExcel = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (exportFile: any, cancelExport: () => void, currentDateRange: any) => {
      if (!projectId) {
        notifications.show({
          message: t('project.selectRequired'),
          color: 'red',
        });
        return;
      }

      try {
        const startDate = currentDateRange.start.toISOString();
        const endDate = currentDateRange.end.toISOString();
        const exportPayload = {
          projectId,
          startDate,
          endDate,
          taskIds: [] as string[],
          includeSubtasks: true,
        };

        await exportFile({
          url: {
            baseUrl: '/gantt/excel/:projectId',
            urlParams: {projectId},
          },
          method: 'post',
          payload: exportPayload,
        });
      } finally {
        cancelExport();
      }
    },
    [projectId, t],
  );

  return {
    handleProjectSelect,
    handleProjectSelectWithEvents,
    handleTaskSelect,
    handleTaskFieldUpdate,
    handleExportExcel,
  };
}
