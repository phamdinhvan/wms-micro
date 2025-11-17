import {Task} from '@wms/core';
import {useCallback, useMemo} from 'react';
import {getVisibleTasksFlat} from '../utils/ganttUtils';

interface UseGanttComputedProps {
  tasks: Task[];
  isFlatView: boolean;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function useGanttComputed({
  tasks,
  isFlatView,
  collapsed,
  setCollapsed,
}: UseGanttComputedProps) {
  const toggleCollapse = useCallback(
    (id: string) => setCollapsed(prev => ({...prev, [id]: !prev[id]})),
    [setCollapsed],
  );

  const visibleTasks = useMemo(() => {
    if (isFlatView) {
      return tasks.map((task, index) => ({task, depth: 0, index}));
    }
    return getVisibleTasksFlat(tasks, collapsed);
  }, [tasks, isFlatView, collapsed]);

  return {
    toggleCollapse,
    visibleTasks,
  };
}
