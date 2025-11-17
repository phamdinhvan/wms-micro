'use client';

import {notifications} from '@mantine/notifications';
import {useQueryClient} from '@tanstack/react-query';
import {
  AppQueryOptions,
  useAppMutation,
  useAppQuery,
  useGetProjects as useCoreGetProjects,
  useGetMountainChart,
  useTranslation,
} from '@wms/core';
import {useCallback} from 'react';

// Types
type ProjectCreate = {
  externalId?: string;
  name: string;
  key: string;
  description: string;
  startDate: string; // ISO8601 format
  endDate: string; // ISO8601 format
  status: 'active' | 'inactive' | 'completed' | 'on-hold';
  assignee?: {
    id: string;
    name?: string;
    email?: string;
  };
  contextKey?: string;
  actualStartDate?: string;
  actualEndDate?: string;
};

type TaskCreate = {
  name: string;
  startDate: string;
  endDate: string;
  status?: string;
  priority?: string;
  assignee?: {email?: string; id: string};
  type?: string;
  category?: string;
  description?: string;
  externalId?: string;
};

type TaskUpdate = {
  name?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  assignee?: {email?: string; id: string};
  priority?: string;
  type?: string;
  description?: string;
  progress?: number;
};

type GetProjectsParams = {
  pageSize?: number;
  contextKey?: string;
  options?: AppQueryOptions<'ganttGetProjects'>;
};

type GetTasksParams = {
  projectId?: string;
  type?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  startDate?: string;
  options?: AppQueryOptions<'ganttChart'>;
};

// Query hooks
export const useGetProjects = (props: GetProjectsParams) => {
  const {pageSize = 500, contextKey, options = {}} = props;

  return useCoreGetProjects({
    limit: pageSize.toString(),
    contextKey,
    ...options,
  });
};

export const useGetTasks = (props: GetTasksParams) => {
  const {
    projectId,
    type,
    status,
    priority,
    assignee,
    startDate,
    options = {},
  } = props;
  const queryParams: Record<string, any> = {};
  if (type) queryParams.type = type;
  if (status) queryParams.status = status;
  if (priority) queryParams.priority = priority;
  if (assignee) queryParams.assignee = assignee;
  if (startDate) queryParams.startDate = startDate;

  return useAppQuery({
    key: 'ganttChart',
    url: {
      baseUrl: '/gantt/:projectId/gantt-chart',
      urlParams: {projectId: projectId || ''},
      queryParams,
    },
    options: {
      enabled: !!projectId,
      ...options,
    },
  });
};

export const useGetConfig = (projectId: string) => {
  return useAppQuery({
    key: 'ganttConfig',
    url: {
      baseUrl: '/gantt/:projectId/task-config',
      urlParams: {projectId},
    },
    options: {
      enabled: !!projectId,
    },
  });
};

export const useProjectConfig = (projectId?: string) => {
  const {data} = useGetConfig(projectId ?? '');

  const config = data?.data;
  const statuses = config?.fields?.status?.options ?? {};
  const priorities = config?.fields?.priority?.options ?? {};

  return {config, statuses, priorities};
};

// Consolidated API operations hook
export function useGanttApi() {
  const {t} = useTranslation('gantt');
  const queryClient = useQueryClient();

  // Mutations
  const createProjectMutation = useAppMutation('ganttCreateProject');
  const createTaskMutation = useAppMutation('ganttCreateTask');
  const updateTaskMutation = useAppMutation('ganttUpdateTask');
  const deleteTaskMutation = useAppMutation('ganttDeleteTask');
  const updateThemeMutation = useAppMutation('ganttUpdateTheme');

  // Project operations
  const createProject = useCallback(
    async (
      data: ProjectCreate,
      onSuccess?: (res: any) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await createProjectMutation.mutateAsync({
          url: {baseUrl: '/gantt/projects'},
          method: 'post',
          payload: data,
        });

        onSuccess?.(res);
        notifications.show({
          message: t('messages.project.create', {name: data.name}),
          color: 'green',
        });

        await queryClient.invalidateQueries({
          predicate: q => q.queryKey?.[1] === 'ganttGetProjects',
        });
      } catch (error) {
        console.error('Error creating project:', error);
        onError?.(error);
        notifications.show({
          message: t('messages.project.error'),
          color: 'red',
        });
      }
    },
    [createProjectMutation, queryClient, t],
  );

  // Task operations
  const createTask = useCallback(
    async (
      projectId: string,
      data: TaskCreate,
      onSuccess?: (res: any) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await createTaskMutation.mutateAsync({
          url: {baseUrl: '/gantt/:projectId/tasks', urlParams: {projectId}},
          method: 'post',
          payload: data,
        });

        onSuccess?.(res);
        notifications.show({
          message: t('messages.task.create', {name: data.name}),
          color: 'green',
        });

        await queryClient.invalidateQueries({
          predicate: q => q.queryKey?.[1] === 'ganttChart',
        });
      } catch (error) {
        console.error('Error creating task:', error);
        onError?.(error);
        notifications.show({
          message: t('messages.task.error'),
          color: 'red',
        });
      }
    },
    [createTaskMutation, queryClient, t],
  );

  const updateTask = useCallback(
    async (
      projectId: string,
      taskId: string,
      data: TaskUpdate,
      onSuccess?: (res: any) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await updateTaskMutation.mutateAsync({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId, taskId},
          },
          method: 'put',
          payload: data,
        });

        onSuccess?.(res);
        notifications.show({
          message: t('messages.task.update'),
          color: 'green',
        });

        await queryClient.invalidateQueries({
          predicate: q => q.queryKey?.[1] === 'ganttChart',
        });
      } catch (error) {
        console.error('Error updating task:', error);
        onError?.(error);
        notifications.show({
          message: t('messages.task.error'),
          color: 'red',
        });
      }
    },
    [updateTaskMutation, queryClient, t],
  );

  const deleteTask = useCallback(
    async (
      projectId: string,
      taskId: string,
      onSuccess?: (res: any) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await deleteTaskMutation.mutateAsync({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId, taskId},
          },
          method: 'delete',
        });

        onSuccess?.(res);
        notifications.show({
          message: t('messages.task.delete'),
          color: 'green',
        });

        await queryClient.invalidateQueries({
          predicate: q => q.queryKey?.[1] === 'ganttChart',
        });
      } catch (error) {
        console.error('Error deleting task:', error);
        onError?.(error);
        notifications.show({
          message: t('messages.task.error'),
          color: 'red',
        });
      }
    },
    [deleteTaskMutation, queryClient, t],
  );

  // Theme operations
  const updateTheme = useCallback(
    async (
      projectId: string,
      data: any,
      onSuccess?: (res: any) => void,
      onError?: (error: any) => void,
    ) => {
      try {
        const res = await updateThemeMutation.mutateAsync({
          url: {baseUrl: '/gantt/:projectId/theme', urlParams: {projectId}},
          method: 'put',
          payload: data,
        });

        onSuccess?.(res);
        notifications.show({
          message: t('theme.notification.update', 'Theme updated successfully'),
          color: 'green',
        });

        await queryClient.invalidateQueries({
          predicate: q => q.queryKey?.[1] === 'ganttGetTheme',
        });
      } catch (error) {
        console.error('Error updating theme:', error);
        onError?.(error);
        notifications.show({
          message: t('theme.notification.error', 'Failed to update theme'),
          color: 'red',
        });
      }
    },
    [updateThemeMutation, queryClient, t],
  );

  return {
    // Operations
    createProject,
    createTask,
    updateTask,
    deleteTask,
    updateTheme,

    // Queries
    getProjects: useGetProjects,
    getTasks: useGetTasks,
    getConfig: useGetConfig,
    getProjectConfig: useProjectConfig,
    getMountainChart: useGetMountainChart,

    // Loading states
    isCreatingProject: createProjectMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isUpdatingTheme: updateThemeMutation.isPending,
  };
}
