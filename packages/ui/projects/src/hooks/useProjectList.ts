import {
  useCreateProject,
  useDeleteProject,
  useGetProject,
  useGetProjects,
  useUpdateProject,
} from '@wms/core';
import {useMemo} from 'react';

export interface UseProjectListParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  startFrom?: string;
  endTo?: string;
  contextKey?: string;
}

export const useGetProjectList = (params?: UseProjectListParams) => {
  const {data, isLoading, isFetching, error, refetch} = useGetProjects({
    ...params,
  });

  // Transform the data to match the expected format
  const transformedData = useMemo(() => {
    if (!data?.data) return null;

    return {
      items: data.data.items || [],
      total: data.data.total || 0,
      page: data.data.page || 1,
      limit: data.data.limit || 10,
      totalPages: data.data.totalPages || 0,
    };
  }, [data]);

  return {
    data: transformedData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

// Export all project hooks from core
export {useCreateProject, useDeleteProject, useGetProject, useUpdateProject};
