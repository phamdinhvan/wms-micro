import {useState} from 'react';

interface GanttModals {
  createProject: boolean;
  taskModal: boolean;
  themeModal: boolean;
  themeConfig: boolean;
  parentUpdate: boolean;
}

export function useGanttState() {
  // UI State
  const [modals, setModals] = useState<GanttModals>({
    createProject: false,
    taskModal: false,
    themeModal: false,
    themeConfig: false,
    parentUpdate: false,
  });

  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>(
    'create',
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // View State (viewMode now managed by URL params)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [treeWidth, setTreeWidth] = useState<number>(400);
  const [isFlatView, setIsFlatView] = useState<boolean>(false);
  const [masterData, setMasterData] = useState<any>(null);

  // Filter State now managed by URL params - removed local state

  // Update State
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, {startDate: string; endDate: string; duration: number}>
  >({});
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [pendingParentUpdate, setPendingParentUpdate] = useState<{
    taskId: string;
    taskName: string;
    field: string;
    value: any;
    updateType: 'duration' | 'dates';
  } | null>(null);

  // Layout State
  const [containerWidth, setContainerWidth] = useState(1200);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  return {
    // UI State
    modals,
    setModals,
    taskModalMode,
    setTaskModalMode,
    selectedTaskId,
    setSelectedTaskId,

    // View State (viewMode and filters now managed by URL params)
    collapsed,
    setCollapsed,
    treeWidth,
    setTreeWidth,
    isFlatView,
    setIsFlatView,
    masterData,
    setMasterData,

    // Update State
    optimisticUpdates,
    setOptimisticUpdates,
    pendingUpdates,
    setPendingUpdates,
    pendingParentUpdate,
    setPendingParentUpdate,

    // Layout State
    containerWidth,
    setContainerWidth,
    viewportWidth,
    setViewportWidth,
    scrollX,
    setScrollX,
  };
}
