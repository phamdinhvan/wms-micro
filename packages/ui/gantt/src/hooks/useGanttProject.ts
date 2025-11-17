import {TProject, useGetProjects} from '@wms/core';
import {useEffect, useState} from 'react';

export function useGanttProject(propsProjectId?: string) {
  const [projectId, setProjectId] = useState<string | null>(
    propsProjectId || null,
  );

  // Get all projects
  const {data, isLoading: isProjectsLoading} = useGetProjects({
    limit: '500',
  });
  const projects: TProject[] = data?.data?.items ?? [];

  // Update projectId when propsProjectId changes
  useEffect(() => {
    if (propsProjectId !== undefined) {
      setProjectId(propsProjectId);
    }
  }, [propsProjectId]);

  // Handle localStorage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const newProjectId = localStorage.getItem('selectedProjectId');
      if (newProjectId !== projectId && !propsProjectId) {
        setProjectId(newProjectId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [projectId, propsProjectId]);

  const handleProjectSelect = (newProjectId: string) => {
    setProjectId(newProjectId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProjectId', newProjectId);
    }
  };

  return {
    projectId,
    setProjectId,
    projects,
    isProjectsLoading,
    handleProjectSelect,
  };
}
