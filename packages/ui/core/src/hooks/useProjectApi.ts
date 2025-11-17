import {useQueryClient} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {useAppMutation} from './useAppMutation';
import {useAppQuery} from './useAppQuery';

/**
 * Custom hook for project ID management
 * Tracks project ID from props or localStorage with real-time updates
 */
export function useProjectIdTracking(projectId?: string) {
  const [localStorageProjectId, setLocalStorageProjectId] = useState<
    string | null
  >(
    typeof window !== 'undefined'
      ? localStorage.getItem('selectedProjectId')
      : null,
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const newProjectId = localStorage.getItem('selectedProjectId');
      setLocalStorageProjectId(newProjectId);
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return projectId || localStorageProjectId || null;
}

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

export const useGetProjects = (params?: {
  appId?: string;
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  startFrom?: string;
  endTo?: string;
  contextKey?: string;
}) => {
  return useAppQuery({
    key: 'ganttGetProjects',
    url: {
      baseUrl: '/gantt/projects',
      queryParams: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        status: params?.status,
        priority: params?.priority,
        assignee: params?.assignee,
        startFrom: params?.startFrom,
        endTo: params?.endTo,
        contextKey: params?.contextKey,
      },
    },
  });
};

// Individual project hook using real API
export const useGetProject = (
  projectId: string,
  options?: {enabled?: boolean},
) => {
  return useAppQuery({
    key: 'ganttGetProjectById',
    url: {
      baseUrl: '/gantt/projects/:projectId',
      urlParams: {projectId},
    },
    options: {
      enabled: options?.enabled !== false && !!projectId,
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const {mutateAsync, isPending} = useAppMutation('ganttCreateProject');

  const onCreateProject = async (data: any) => {
    const result = await mutateAsync({
      url: {
        baseUrl: '/gantt/projects',
      },
      method: 'post',
      payload: data,
    });

    // Invalidate all queries that contain the projects endpoint
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes('/gantt/projects')
        );
      },
    });
    return result;
  };

  return {onCreateProject, isCreating: isPending};
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const {mutateAsync, isPending} = useAppMutation('ganttUpdateProject');

  const onUpdateProject = async (
    projectId: string,
    data: any,
    method: 'put',
  ) => {
    const result = await mutateAsync({
      url: {
        baseUrl: '/gantt/projects/:projectId',
        urlParams: {projectId},
      },
      method,
      payload: data,
    });

    // Invalidate all queries that contain the projects endpoint
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes('/gantt/projects')
        );
      },
    });
    // Also invalidate individual project queries
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes('/gantt/projects/')
        );
      },
    });
    return result;
  };

  return {onUpdateProject, isUpdating: isPending};
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const {mutateAsync, isPending} = useAppMutation('ganttDeleteProject');

  const onDeleteProject = async (projectId: string) => {
    const result = await mutateAsync({
      url: {
        baseUrl: '/gantt/projects/:projectId',
        urlParams: {projectId},
      },
      method: 'delete',
    });

    // Invalidate all queries that contain the projects endpoint
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(key => 
          typeof key === 'string' && key.includes('/gantt/projects')
        );
      },
    });
    return result;
  };

  return {onDeleteProject, isDeleting: isPending};
};
