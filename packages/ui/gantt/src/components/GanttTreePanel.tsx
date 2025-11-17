import {ActionIcon, Button, Tooltip} from '@mantine/core';
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
} from '@tabler/icons-react';
import {Task, TaskStatus} from '@wms/core';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {HEADER_HEIGHT} from '../constants';
import {useVirtualList} from '../hooks/useVirtualList';
import {renderTaskRow, renderTasksRecursively} from './TreeTaskRenderer';
import { IconChartBar } from '@tabler/icons-react';

type AssigneeOption = {
  id: string;
  name: string;
};

interface GanttTreePanelProps {
  tasks: Task[];
  collapsed: Record<string, boolean>;
  selectedTaskId: string | null;
  treeWidth: number;
  setTreeWidth: (val: number) => void;
  onSelectTask: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onCreateChildTask: (parentId: string) => void;
  onCreateTask?: () => void;
  onTaskFieldUpdate: (taskId: string, field: string, value: string) => void;
  t: (key: string) => string;
  assigneeOptions?: AssigneeOption[];
  bodyRef?: React.RefObject<HTMLDivElement>;
  onBodyScroll?: React.UIEventHandler<HTMLDivElement>;
  isFlatView?: boolean;
  statusOptions?: TaskStatus[];
  stickyTop?: number;
  enableVirtualization?: boolean;
  overscan?: number;
  scrollY?: number;
  onScrollY?: (scrollTop: number) => void;
  containerHeight?: number;
  setContainerHeight?: (height: number) => void;
  isMinimized?: boolean; // New prop for gantt-only mode
  hideFilters?: boolean;
  onToggleMinimized?: (minimized: boolean) => void; // Callback to toggle minimized state
  onToggleHideFilters?: (hideControls: boolean) => void; // Callback to toggle hideControls
  showMountainChart?: boolean; // Show mountain chart section
  mountainChartHeight?: number; // Height of mountain chart
}

export default function GanttTreePanel({
  tasks,
  collapsed,
  selectedTaskId,
  treeWidth,
  onSelectTask,
  onToggleCollapse,
  onCreateChildTask,
  onCreateTask,
  onTaskFieldUpdate,
  t,
  assigneeOptions = [],
  isFlatView = false,
  statusOptions = [],
  stickyTop = 0,
  enableVirtualization = false,
  overscan = 5,
  scrollY = 0,
  onScrollY,
  containerHeight,
  setContainerHeight,
  isMinimized = false,
  hideFilters = false,
  onToggleMinimized,
  onToggleHideFilters,
  showMountainChart = false,
  mountainChartHeight = 100,
}: GanttTreePanelProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeight = 40; // Fixed item height
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic height calculation
  useEffect(() => {
    const updateHeight = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top;

      // Subtract header height and some padding
      const contentHeight = Math.max(100, availableHeight - HEADER_HEIGHT - 20);
      setContainerHeight(contentHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [hideFilters]);

  // Flatten tasks for virtual rendering
  const flatTasks = useMemo(() => {
    if (isFlatView) {
      return tasks;
    }

    // Simple flattening - render visible tasks based on collapsed state
    const result: Task[] = [];

    const addTasksRecursively = (taskList: Task[]) => {
      for (const task of taskList) {
        result.push(task);

        // Add children if not collapsed
        if (!collapsed[task.id]) {
          const children = tasks.filter(t => t.parentId === task.id);
          if (children.length > 0) {
            addTasksRecursively(children);
          }
        }
      }
    };

    const rootTasks = tasks.filter(task => !task.parentId);
    addTasksRecursively(rootTasks);
    return result;
  }, [tasks, collapsed, isFlatView]);

  // Virtual list hook
  const virtualList = useVirtualList({
    itemCount: flatTasks.length,
    itemSize: itemHeight,
    containerHeight,
    scrollTop,
    overscan,
  });

  // Ref to prevent scroll sync loop
  const isSyncingRef = React.useRef(false);

  // Handle scroll and sync with timeline
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isSyncingRef.current) {
        isSyncingRef.current = false;
        return;
      }
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      // Sync scroll with timeline
      if (onScrollY) {
        onScrollY(newScrollTop);
      }
    },
    [onScrollY],
  );

  // Sync scroll from external (timeline) - instant sync with useLayoutEffect
  // useLayoutEffect runs synchronously BEFORE browser paint, ensuring smooth scroll sync
  React.useLayoutEffect(() => {
    const scrollContainer = document.querySelector('.gantt-tree-scroll') as HTMLDivElement;
    if (scrollContainer && scrollY !== scrollTop) {
      isSyncingRef.current = true;
      // Use direct scrollTop property assignment for truly instant sync
      scrollContainer.scrollTop = scrollY;
      setScrollTop(scrollY);
    }
  }, [scrollY, scrollTop]);

  // Helper function to get task level
  const getTaskLevel = useCallback((task: Task, allTasks: Task[]): number => {
    let level = 0;
    let currentTask = task;

    while (currentTask.parentId) {
      const parent = allTasks.find(t => t.id === currentTask.parentId);
      if (!parent) break;
      level++;
      currentTask = parent;
    }

    return level;
  }, []);

  // Render virtual task
  const renderVirtualTask = useCallback(
    (virtualItem: {index: number; start: number; size: number}) => {
      const task = flatTasks[virtualItem.index];
      if (!task) return null;

      const level = isFlatView ? 0 : getTaskLevel(task, tasks);

      return (
        <div
          key={task.id}
          style={{
            position: 'absolute',
            top: virtualItem.start,
            left: 0,
            right: 0,
            height: virtualItem.size,
          }}>
          {renderTaskRow({
            task,
            allTasks: tasks,
            level,
            collapsed,
            selectedTaskId,
            onSelectTask,
            onToggleCollapse,
            onCreateChildTask,
            onTaskFieldUpdate,
            statusOptions,
            assigneeOptions,
            t,
            hideParentUI: isFlatView,
            treeWidth,
            isMinimized,
          })}
        </div>
      );
    },
    [
      flatTasks,
      tasks,
      collapsed,
      selectedTaskId,
      onSelectTask,
      onToggleCollapse,
      onCreateChildTask,
      onTaskFieldUpdate,
      statusOptions,
      assigneeOptions,
      t,
      isFlatView,
      treeWidth,
      isMinimized,
      getTaskLevel,
    ],
  );

  // Should use virtual rendering
  const shouldUseVirtual = enableVirtualization && flatTasks.length > 50;

  return (
    <div
      ref={containerRef}
      className={`wms-flex wms-flex-col wms-bg-white ${
        isMinimized ? '' : 'wms-border-r wms-border-gray-300'
      }`}>
      {/* Header with Add Task button - hidden in minimized mode */}

      <div
        className="wms-flex wms-justify-between wms-items-center wms-px-1 wms-border-b wms-border-gray-300 wms-sticky wms-bg-white"
        style={{
          height: HEADER_HEIGHT,
          top: `${0}px`,
          zIndex: 20,
        }}>
        {/* Left side controls */}
        <div className="wms-flex wms-flex-col wms-items-center wms-gap-1">
          <Tooltip
            label={
              hideFilters
                ? t('controls.showFilters') || 'Show filters'
                : t('controls.hideFilters') || 'Hide filters'
            }>
            <ActionIcon
              variant={hideFilters ? 'filled' : 'light'}
              color="grey"
              size="sm"
              onClick={() => {
                if (onToggleHideFilters) {
                  onToggleHideFilters(!hideFilters);
                }
              }}
              className="wms-rotate-90">
              {hideFilters ? (
                <IconLayoutSidebarLeftExpand size={16} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={16} />
              )}
            </ActionIcon>
          </Tooltip>

          {/* Tree Toggle Button */}
          <Tooltip
            label={
              isMinimized
                ? t('controls.expandTree') || 'Expand tree panel'
                : t('controls.minimizeTree') ||
                  'Minimize tree panel (scroll only)'
            }>
            <ActionIcon
              variant={isMinimized ? 'filled' : 'light'}
              color="grey"
              size="sm"
              onClick={() => {
                // We need to get the setGanttOnlyMode function from parent
                // For now, we'll use a prop callback
                if (onToggleMinimized) {
                  onToggleMinimized(!isMinimized);
                }
              }}>
              {isMinimized ? (
                <IconLayoutSidebarLeftExpand size={16} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        </div>

        {/* Add Task Button - Right side */}
        {onCreateTask && !isMinimized && (
          <Button
            size="xs"
            variant="outline"
            onClick={onCreateTask}
            leftSection={<IconPlus size={12} />}>
            {t('gantt.addTask')}
          </Button>
        )}
      </div>

      {/* Tree Panel Content - Scrollable */}
      <div
        className="wms-relative wms-overflow-auto gantt-tree-scroll"
        onScroll={handleScroll}
        style={{
          height: showMountainChart
            ? containerHeight - mountainChartHeight
            : containerHeight,
        }}>
        {shouldUseVirtual ? (
          // Virtual rendering for large datasets
          <div
            style={{
              height: virtualList.totalSize,
              position: 'relative',
            }}>
            {virtualList.items.map(renderVirtualTask)}
          </div>
        ) : (
          // Regular rendering for small datasets
          <div>
            {isFlatView
              ? // Flat view: render all tasks at level 0 without hierarchy
                tasks.map(task =>
                  renderTaskRow({
                    task,
                    allTasks: tasks,
                    level: 0,
                    collapsed: {},
                    selectedTaskId,
                    onSelectTask,
                    onToggleCollapse,
                    onCreateChildTask,
                    onTaskFieldUpdate,
                    statusOptions,
                    assigneeOptions,
                    t,
                    hideParentUI: true,
                    treeWidth,
                    isMinimized,
                  }),
                )
              : // Tree view: render with hierarchy
                renderTasksRecursively(
                  tasks.filter(task => !task.parentId),
                  tasks,
                  0,
                  collapsed,
                  selectedTaskId,
                  onSelectTask,
                  onToggleCollapse,
                  onCreateChildTask,
                  onTaskFieldUpdate,
                  statusOptions,
                  assigneeOptions,
                  t,
                  treeWidth,
                  isMinimized,
                )}
          </div>
        )}
      </div>

      {/* Mountain Chart */}
      {showMountainChart && (
        <div
          className="wms-border-t-2 wms-border-gray-300 wms-bg-gray-50 wms-flex wms-items-center wms-justify-center wms-relative wms-overflow-hidden"
          style={{
            height: mountainChartHeight,
            background: 'linear-gradient(to bottom, #f9fafb, #ffffff)',
          }}>
          <div
            className="wms-absolute wms-inset-0"
            style={{
              opacity: 0.03,
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
            }}
          />

          {!isMinimized && (
            <div className="wms-flex wms-items-center wms-gap-3 wms-px-4 wms-py-3 wms-bg-white wms-rounded-lg wms-border wms-border-gray-200 wms-shadow-md wms-relative wms-z-10">
              <div
                className="wms-flex wms-items-center wms-justify-center wms-w-10 wms-h-10 wms-rounded-md wms-shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                }}>
                <IconChartBar size={20} color="white" strokeWidth={2} />
              </div>
              <div className="wms-flex wms-flex-col">
                <span className="wms-text-sm wms-font-semibold wms-text-gray-800 wms-leading-tight">
                  {t('controls.mountainChart')}
                </span>
                <span className="wms-text-xs wms-text-gray-500 wms-leading-tight">
                  {t('controls.mountainChartDescription') || 'Workload visualization'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
