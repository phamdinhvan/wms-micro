'use client';

import {TaskPriorityCode, TaskStatusCode} from '../types';
import {useAppMutation} from './useAppMutation';
import {AppQueryOptions, useAppQuery} from './useAppQuery';

type GetTasksParams = {
  projectId: string;
  status?: TaskStatusCode;
  priority?: TaskPriorityCode;
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  assignee?: string;
  limit?: number;
  page?: number;
  // additional query params can be added here as needed
  options?: AppQueryOptions<'ganttChart'>;
};

export const useGetTasks = (props: GetTasksParams) => {
  const {
    projectId,
    status,
    priority,
    category,
    search,
    dateFrom,
    dateTo,
    assignee,
    limit,
    page,
    options = {},
  } = props;
  const queryParams: Record<string, any> = {};
  if (status) queryParams.status = status;
  if (priority) queryParams.priority = priority;
  if (assignee) queryParams.assignee = assignee;
  if (category) queryParams.category = category;
  if (search) queryParams.search = search;
  if (dateFrom) queryParams.from = dateFrom;
  if (dateTo) queryParams.to = dateTo;
  if (limit) queryParams.limit = limit;
  if (page) queryParams.page = page;

  return useAppQuery({
    key: 'ganttGetTasks',
    url: {
      baseUrl: '/gantt/:projectId/tasks',
      urlParams: {projectId},
      queryParams,
    },
    options: {
      enabled: !!projectId,
      ...options,
    },
  });
};

type CreateTask = {
  externalId?: string;
  name: string;
  description?: string;
  startDate: string; // ISO8601 format
  endDate: string; // ISO8601 format
  status?: string;
  progress?: number;
  priority?: string;
  assignee?: {
    email?: string;
    id: string;
  };
  manager?: string;
  parentId?: string;
  tags?: string[];
};
export const useCreateTask = (projectId: string) => {
  const {mutateAsync, isPending} = useAppMutation('ganttCreateTask');
  const onCreateTask = async (data: CreateTask) => {
    return mutateAsync({
      url: {
        baseUrl: '/gantt/:projectId/tasks',
        urlParams: {projectId},
      },
      method: 'post',
      payload: data,
    });
  };
  return {onCreateTask, isCreating: isPending};
};

export const useUpdateTask = (projectId: string) => {
  const {mutateAsync, isPending} = useAppMutation('ganttUpdateTask');

  const onUpdateTask = async (
    taskId: string,
    data: Record<string, any>,
    method: 'put' | 'patch',
  ) => {
    return mutateAsync({
      url: {
        baseUrl: '/gantt/:projectId/tasks/:taskId',
        urlParams: {projectId, taskId},
      },
      method,
      payload: data,
    });
  };

  return {onUpdateTask, isUpdating: isPending};
};

export const useGetTaskById = (projectId: string, taskId: string) => {
  const {data, isLoading} = useAppQuery({
    key: 'ganttGetTaskById',
    url: {
      baseUrl: '/gantt/:projectId/tasks/:taskId',
      urlParams: {projectId, taskId},
    },
    options: {
      enabled: !!projectId && !!taskId,
    },
  });
  return {taskDetail: data, isLoading};
};

export const useGetPossibleTargetsTasks = (
  projectId: string,
  taskId: string,
) => {
  const {data, isLoading} = useAppQuery({
    key: 'getPossibleTargetsTasks',
    url: {
      baseUrl: '/gantt/:projectId/tasks/possible-targets-tasks',
      urlParams: {projectId},
      queryParams: {taskId},
    },
    options: {
      enabled: !!projectId && !!taskId,
    },
  });
  return {possibleTargets: data, isLoading};
};
