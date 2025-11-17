import {ViewMode} from '@wms/core';
import {useCallback} from 'react';

interface GanttModals {
  createProject: boolean;
  taskModal: boolean;
  themeModal: boolean;
  themeConfig: boolean;
  parentUpdate: boolean;
}

interface UseGanttCallbacksProps {
  replaceParams: (params: Record<string, string | undefined>) => void;
  setModals: React.Dispatch<React.SetStateAction<GanttModals>>;
  setTaskModalMode: React.Dispatch<React.SetStateAction<'create' | 'edit'>>;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  refetchTasks: () => void;
}

export function useGanttCallbacks({
  replaceParams,
  setModals,
  setTaskModalMode,
  setSelectedTaskId,
  refetchTasks,
}: UseGanttCallbacksProps) {
  const handleFilterChange = useCallback(
    (filterType: string, value: string | null) => {
      replaceParams({[filterType]: value});
    },
    [replaceParams],
  );

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      replaceParams({view: newViewMode});
    },
    [replaceParams],
  );

  const handleCreateProject = useCallback(() => {
    setModals(prev => ({...prev, createProject: true}));
  }, [setModals]);

  const handleCloseCreateProject = useCallback(() => {
    setModals(prev => ({...prev, createProject: false}));
  }, [setModals]);

  const handleCloseTaskModal = useCallback(() => {
    setModals(prev => ({...prev, taskModal: false}));
    setSelectedTaskId(null);
  }, [setModals, setSelectedTaskId]);

  const handleTaskCreated = useCallback(() => {
    refetchTasks();
  }, [refetchTasks]);

  const handleTaskUpdated = useCallback(() => {
    refetchTasks();
  }, [refetchTasks]);

  const handleOpenCreateTaskModal = useCallback(() => {
    setTaskModalMode('create');
    setModals(prev => ({...prev, taskModal: true}));
  }, [setTaskModalMode, setModals]);

  return {
    handleFilterChange,
    handleViewModeChange,
    handleCreateProject,
    handleCloseCreateProject,
    handleCloseTaskModal,
    handleTaskCreated,
    handleTaskUpdated,
    handleOpenCreateTaskModal,
  };
}
