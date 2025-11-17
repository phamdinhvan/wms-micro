'use client';

// React & External Libraries
import dayjs from 'dayjs';
import React, {useCallback, useRef, useState} from 'react';

// Mantine
import {Loader} from '@mantine/core';

// WMS Core
import {
  TaskAssignee,
  TProject,
  useControlParams,
  useExportApi,
  useTranslation,
  ViewMode,
} from '@wms/core';

// Gantt-specific
import {HEADER_HEIGHT, rowHeight} from '../constants';

// Hooks
import {useGanttCallbacks} from '../hooks/useGanttCallbacks';
import {useGanttComputed} from '../hooks/useGanttComputed';
import {useGanttConfig} from '../hooks/useGanttConfig';
import {useGanttDateRange} from '../hooks/useGanttDateRange';
import {useGanttDragCommit} from '../hooks/useGanttDragCommit';
import {useGanttHandlers} from '../hooks/useGanttHandlers';
import {useGanttHeight} from '../hooks/useGanttHeight';
import {useGanttLayout} from '../hooks/useGanttLayout';
import {useGanttMountainChart} from '../hooks/useGanttMoutainChart';
import {useGanttScrollPan} from '../hooks/useGanttScrollPan';
import {useGanttState} from '../hooks/useGanttState';
import {useGanttTasks} from '../hooks/useGanttTasks';
import {useProjectSelection} from '../hooks/useProjectSelection';

// Utils
import {getDayWidth} from '../utils/ganttUtils';

// Components
import {GanttControls} from './GanttControls';
import {GanttEmptyState} from './GanttEmptyState';
import {renderHeader} from './GanttHeader';
import {GanttModals} from './GanttModals';
import {GanttScrollbar} from './GanttScrollbar';
import {GanttSplitter} from './GanttSplitter';
import GanttTimeline from './GanttTimeLine';
import GanttTreePanel from './GanttTreePanel';
import {MountainChart} from './MountainChart';

interface GanttChartProps {
  projectId?: string | null;
  projects?: TProject[];
  isProjectsLoading?: boolean;
  assignees?: TaskAssignee[];
  className?: string;
  /** holidays (ISO format strings, e.g. '2025-01-01') to exclude from working days */
  holidays?: string[];
}

const GanttChart = React.memo(function GanttChart({
  projectId,
  projects,
  isProjectsLoading,
  assignees,
  className,
  holidays = [],
}: GanttChartProps) {
  // ============================================================
  // 1️⃣ TRANSLATION & I18N
  // ============================================================
  const [t, i18n] = useTranslation('gantt');

  // ============================================================
  // 2️⃣ URL PARAMETERS & ROUTING STATE
  // ============================================================
  const {queryParams, replaceParams} = useControlParams();
  const {pStatus, pPriority, pAssignee, pView, pProjectId, pMountainChart} =
    queryParams;

  // Derived state: viewMode and filters from URL params
  const viewMode: ViewMode = (pView as ViewMode) || 'days';
  const filters = {
    status: pStatus || null,
    priority: pPriority || null,
    assignee: pAssignee || null,
  };

  // ============================================================
  // 3️⃣ PROJECT SELECTION & VALIDATION
  // ============================================================
  const {currentProjectId, currentProject} = useProjectSelection({
    pProjectId,
    projectId,
    projects,
    replaceParams,
  });

  // ============================================================
  // 4️⃣ UI STATE MANAGEMENT (Modals, Toggles, Selections)
  // ============================================================
  const {
    modals,
    setModals,
    taskModalMode,
    setTaskModalMode,
    selectedTaskId,
    setSelectedTaskId,
    collapsed,
    setCollapsed,
    isFlatView,
    setIsFlatView,
    optimisticUpdates,
    setOptimisticUpdates,
    pendingUpdates,
    setPendingUpdates,
    setPendingParentUpdate,
  } = useGanttState();

  // Local UI toggles: hide controls & gantt-only mode & mountain chart
  const [hideFilters, setHideFilters] = useState(false);
  const [ganttOnlyMode, setGanttOnlyMode] = useState(false);
  const [showMountainChart, setShowMountainChart] = useState(
    pMountainChart === 'true',
  );

  // Parent task ID for creating child tasks
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

  // ============================================================
  // 5️⃣ LAYOUT & DIMENSIONS (Height, Refs, Container)
  // ============================================================
  // Dynamic height management
  const {parentRef, height} = useGanttHeight();
  const stickyHeaderHeight = 0; // No sticky header currently

  // Refs for scroll/pan synchronization
  const headerContentRef = useRef<HTMLDivElement | null>(null);
  const timelineContentRef = useRef<HTMLDivElement | null>(null);
  const mountainContentRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  // Mountain chart configuration - dynamic height (1/3 of container)
  const mountainChartHeight = React.useMemo(() => {
    if (!showMountainChart) return 0;
    // Calculate 1/3 of container height with min/max constraints
    const calculatedHeight = Math.floor(containerHeight / 3);
    // Min 120px, Max 200px for better UX
    return Math.max(120, Math.min(200, calculatedHeight));
  }, [showMountainChart, containerHeight]);

  // ============================================================
  // 6️⃣ DATE RANGE MANAGEMENT
  // ============================================================
  // Project date boundaries (fallback to defaults if not set)
  const projectStartDate = currentProject?.startDate
    ? dayjs(currentProject.startDate)
    : dayjs();
  const projectEndDate = currentProject?.endDate
    ? dayjs(currentProject.endDate)
    : dayjs().add(6, 'month');

  // Date range hook with handlers
  const {
    currentDateRange,
    handleDateRangeChange,
    handleResetToProject,
    handleDateFilterChange,
  } = useGanttDateRange(projectStartDate, projectEndDate);

  // ============================================================
  // 7️⃣ DATA FETCHING (Tasks, Config, Export)
  // ============================================================
  // Tasks data with filters and optimistic updates
  const {tasksQ, tasks} = useGanttTasks({
    projectId: currentProjectId!,
    filters,
    optimisticUpdates,
    dateRange: {
      startDate: currentDateRange.start.format('YYYY-MM-DD'),
    },
  });

  // Project config: statuses and priorities with i18n
  const {statuses, priorities} = useGanttConfig(
    currentProjectId,
    i18n.language,
  );

  // Excel export functionality
  const {exportFile, cancelExport, isExporting} = useExportApi('exportExcel');

  const {
    data: mountainChartApiData,
    refetch: refetchMountainChart,
    invalidate: invalidateMountainChart,
  } = useGanttMountainChart({
    projectId: currentProjectId,
    baseProjectStart: currentDateRange.start,
    baseProjectEnd: currentDateRange.end,
    enabled: showMountainChart && !!currentProjectId,
  });

  // Debounced refetch for mountain chart
  const debouncedRefetchMountainChart = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (showMountainChart && currentProjectId) {
        invalidateMountainChart();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [showMountainChart, currentProjectId, invalidateMountainChart]);

  // ============================================================
  // 8️⃣ LAYOUT CALCULATIONS (Dimensions, Scroll, Width)
  // ============================================================
  // Timeline dimensions based on date range and view mode
  const totalDays =
    currentDateRange.end.diff(currentDateRange.start, 'day') + 1;
  const currentDayWidth = getDayWidth(viewMode);
  const totalWidth = totalDays * currentDayWidth;

  // Layout hook: tree width, scroll positions, dimensions
  const {
    containerRef,
    bottomRef,
    viewportRef,
    treeWidth,
    containerWidth,
    viewportWidth,
    scrollX,
    scrollY,
    handleTreeWidthChange,
    setScrollX,
    handleScrollY,
    UI_CONSTANTS,
  } = useGanttLayout(totalWidth);

  // ============================================================
  // 9️⃣ COMPUTED VALUES & DERIVED STATE
  // ============================================================
  // Compute visible tasks based on collapse state and view type
  const {toggleCollapse, visibleTasks} = useGanttComputed({
    tasks,
    isFlatView,
    collapsed,
    setCollapsed,
  });

  // ============================================================
  // 🔟 EVENT HANDLERS & CALLBACKS
  // ============================================================
  // Primary handlers: project, task, field updates, export
  const {
    handleProjectSelectWithEvents,
    handleTaskSelect,
    handleTaskFieldUpdate,
    handleExportExcel,
  } = useGanttHandlers({
    projectId: currentProjectId,
    tasks,
    refetchTasks: () => tasksQ.refetch(),
    setSelectedTaskId,
    setTaskModalMode,
    setModals,
    setPendingParentUpdate,
    replaceParams,
    t,
  });

  // UI callbacks: filters, view mode, modals
  const {
    handleFilterChange,
    handleViewModeChange,
    handleCreateProject,
    handleCloseCreateProject,
    handleCloseTaskModal: originalHandleCloseTaskModal,
    handleTaskCreated,
    handleTaskUpdated,
    handleOpenCreateTaskModal,
  } = useGanttCallbacks({
    replaceParams,
    setModals,
    setTaskModalMode,
    setSelectedTaskId,
    refetchTasks: () => tasksQ.refetch(),
  });

  // Custom handler to reset parentTaskId when closing task modal
  const handleCloseTaskModal = useCallback(() => {
    setParentTaskId(null); // Reset parent task ID
    originalHandleCloseTaskModal(); // Call original handler
  }, [originalHandleCloseTaskModal]);

  // Wrap task callbacks to refetch mountain chart
  const handleTaskCreatedWithMountainRefetch = useCallback(() => {
    handleTaskCreated();
    debouncedRefetchMountainChart();
  }, [handleTaskCreated, debouncedRefetchMountainChart]);

  const handleTaskUpdatedWithMountainRefetch = useCallback(() => {
    handleTaskUpdated();
    debouncedRefetchMountainChart();
  }, [handleTaskUpdated, debouncedRefetchMountainChart]);

  // Drag & drop: commit task position/duration changes
  const {onCommitDrag: originalOnCommitDrag} = useGanttDragCommit({
    projectId: currentProjectId,
    tasks,
    currentDateRange,
    refetchTasks: () => tasksQ.refetch(),
    setOptimisticUpdates,
    setPendingUpdates,
    t,
  });

  const onCommitDrag = useCallback(
    async (payload: {
      id: string;
      initDate: string;
      initDuration: number;
      type: 'move' | 'resize-left' | 'resize-right';
      deltaDays: number;
    }) => {
      await originalOnCommitDrag(payload);
      debouncedRefetchMountainChart();
    },
    [originalOnCommitDrag, debouncedRefetchMountainChart],
  );

  // Scroll & pan: timeline horizontal scrolling with mouse/touch
  const {
    isPanning,
    beginPan,
    doPan,
    endPan,
    onBottomScrollSmooth,
    panActiveRef,
  } = useGanttScrollPan({
    totalWidth,
    viewportWidth,
    scrollX,
    setScrollX,
    bottomRef,
    headerContentRef,
    timelineContentRef,
    mountainContentRef,
  });

  // ============================================================
  // 🎨 RENDER LOGIC
  // ============================================================

  // If no project is selected, show empty state
  if (!currentProjectId) {
    return (
      <GanttEmptyState
        projects={projects}
        isProjectsLoading={isProjectsLoading}
        isExporting={isExporting}
        modals={modals}
        onProjectSelect={handleProjectSelectWithEvents}
        onRefresh={() => tasksQ.refetch()}
        onExport={() =>
          handleExportExcel(exportFile, cancelExport, currentDateRange)
        }
        onCreateProject={() =>
          setModals(prev => ({...prev, createProject: true}))
        }
        onCloseCreateModal={() =>
          setModals(prev => ({...prev, createProject: false}))
        }
        t={t}
        className={className}
        scrollbarHeight={UI_CONSTANTS.SCROLLBAR_HEIGHT}
      />
    );
  }

  // Render condition for no project, loading, and no tasks
  const condition = {
    noProject: !currentProjectId,
    loading: currentProjectId && tasksQ.isLoading,
    noTasks: currentProjectId && !tasksQ.isLoading && tasks.length === 0,
  };
  const showChartSection =
    !condition.noTasks && !condition.loading && !condition.noProject;

  const renderCondition = () => {
    if (condition.noProject) {
      return (
        <div className="wms-absolute wms-top-14 wms-left-0 wms-px-3 wms-py-2 wms-text-xs wms-text-gray-600 wms-bg-transparent wms-z-10">
          {t('gantt.messages.noProject')}
        </div>
      );
    }

    if (condition.loading) {
      return (
        <div className="wms-absolute wms-top-14 wms-left-0 wms-px-3 wms-py-2 wms-flex wms-items-center wms-gap-2 wms-bg-transparent wms-z-10">
          <Loader size="xs" />
          <span className="wms-text-xs wms-text-gray-600">
            {t('gantt.messages.loadingTasks')}
          </span>
        </div>
      );
    }

    if (condition.noTasks) {
      return (
        <div className="wms-absolute wms-top-14 wms-left-0 wms-px-3 wms-py-2 wms-text-xs wms-text-gray-600 wms-bg-transparent wms-rounded wms-z-10">
          {t('gantt.messages.noTasks')}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={parentRef}
      style={{height}}
      className={`gantt-chart-container wms-flex wms-flex-col wms-relative ${className || ''}`}>
      {/* ============================================================
          📋 TOOLBAR & FILTERS (Collapsible)
          ============================================================ */}
      <GanttControls
        currentProjectId={currentProjectId!}
        projects={projects ?? []}
        isProjectsLoading={!!isProjectsLoading}
        isExporting={isExporting}
        filters={filters}
        statuses={statuses}
        priorities={priorities}
        assignees={assignees || []}
        viewMode={viewMode}
        isFlatView={isFlatView}
        showMountainChart={showMountainChart}
        currentDateRange={currentDateRange}
        onProjectSelect={handleProjectSelectWithEvents}
        onRefresh={() => tasksQ.refetch()}
        onExport={() =>
          handleExportExcel(exportFile, cancelExport, currentDateRange)
        }
        onCreateProject={handleCreateProject}
        onFilterChange={handleFilterChange}
        onViewModeChange={handleViewModeChange}
        onViewTypeChange={setIsFlatView}
        onMountainChartToggle={setShowMountainChart}
        onDateRangeChange={handleDateRangeChange}
        onResetToProject={handleResetToProject}
        onDateFilterChange={handleDateFilterChange}
        t={t}
        hideFilters={hideFilters}
      />

      {/* ============================================================
          🗂️ MODALS (Project Create, Task Create/Edit)
          ============================================================ */}
      <GanttModals
        modals={modals}
        currentProjectId={currentProjectId}
        currentProject={currentProject}
        selectedTaskId={selectedTaskId}
        taskModalMode={taskModalMode}
        parentTaskId={parentTaskId}
        assignees={assignees || []}
        statuses={statuses}
        priorities={priorities}
        onCloseCreateProject={handleCloseCreateProject}
        onCloseTaskModal={handleCloseTaskModal}
        onTaskCreated={handleTaskCreatedWithMountainRefetch}
        onTaskUpdated={handleTaskUpdatedWithMountainRefetch}
      />

      {/* ============================================================
          📊 MAIN GANTT GRID: Tree + Splitter + Timeline
          ============================================================ */}
      <div className="wms-flex-1">
        <div
          ref={containerRef}
          className="wms-grid wms-min-h-full wms-[contain:layout_paint] wms-isolate"
          style={{
            gridTemplateColumns: ganttOnlyMode
              ? '28px 1fr' // Gantt-only: minimal tree width, timeline takes rest
              : `${treeWidth}px auto 1fr`, // Normal: tree + splitter + timeline
            willChange: 'grid-template-columns',
          }}>
          {/* ------------------------------------------------------------
              🌳 LEFT PANEL: Task Tree (can be minimized)
              ------------------------------------------------------------ */}
          <div className="wms-relative">
            <GanttTreePanel
              statusOptions={statuses}
              assigneeOptions={assignees || []}
              tasks={tasks}
              collapsed={collapsed}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleTaskSelect}
              onToggleCollapse={toggleCollapse}
              onCreateChildTask={(parentId: string) => {
                setParentTaskId(parentId);
                setTaskModalMode('create');
                setModals(prev => ({...prev, taskModal: true}));
              }}
              onTaskFieldUpdate={handleTaskFieldUpdate}
              onCreateTask={handleOpenCreateTaskModal}
              treeWidth={ganttOnlyMode ? 28 : treeWidth}
              setTreeWidth={handleTreeWidthChange}
              isFlatView={isFlatView}
              t={t}
              stickyTop={stickyHeaderHeight}
              enableVirtualization={tasks.length > 50}
              overscan={5}
              scrollY={scrollY}
              onScrollY={handleScrollY}
              containerHeight={containerHeight}
              setContainerHeight={setContainerHeight}
              isMinimized={ganttOnlyMode}
              hideFilters={hideFilters}
              onToggleMinimized={setGanttOnlyMode}
              onToggleHideFilters={setHideFilters}
              showMountainChart={showMountainChart}
              mountainChartHeight={mountainChartHeight}
            />
          </div>

          {/* ------------------------------------------------------------
              📏 SPLITTER: Draggable divider (hidden in gantt-only mode)
              ------------------------------------------------------------ */}
          {!ganttOnlyMode && (
            <GanttSplitter
              width={treeWidth}
              onWidthChange={handleTreeWidthChange}
              minWidth={UI_CONSTANTS.MIN_TREE_WIDTH}
              maxWidth={UI_CONSTANTS.MAX_TREE_WIDTH}
              containerWidth={containerWidth}
            />
          )}

          {/* ------------------------------------------------------------
              📅 RIGHT PANEL: Timeline Header + Task Bars
              ------------------------------------------------------------ */}
          <div
            className="wms-flex wms-flex-col wms-min-w-0 wms-min-h-0 wms-relative"
            style={{
              gridColumn: ganttOnlyMode ? '2' : '3',
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
            onMouseMove={e => {
              if (panActiveRef.current) doPan(e.clientX);
            }}
            onTouchMove={e => {
              const x = e.touches[0]?.clientX ?? 0;
              if (panActiveRef.current) doPan(x);
            }}
            onMouseUp={endPan}
            onTouchEnd={endPan}
            onMouseLeave={endPan}
            onTouchCancel={endPan}
            onMouseDown={e => {
              beginPan(e.clientX, e.target as HTMLElement);
              if (panActiveRef.current) e.preventDefault();
            }}
            onTouchStart={e => {
              const x = e.touches[0]?.clientX ?? 0;
              beginPan(x, e.target as HTMLElement);
              if (panActiveRef.current) e.preventDefault();
            }}>
            {/* Date Header (sticky, synchronized with timeline scroll) */}
            <div
              className="wms-sticky wms-z-10 wms-bg-white wms-border-b wms-border-gray-300"
              style={{height: HEADER_HEIGHT, top: `${0}px`}}>
              <div className="wms-overflow-hidden">
                <div
                  ref={headerContentRef}
                  style={{
                    width: totalWidth,
                    transform: `translate3d(-${scrollX}px,0,0)`,
                    willChange: 'transform',
                    height: HEADER_HEIGHT,
                  }}>
                  {renderHeader(
                    viewMode,
                    currentDayWidth,
                    t,
                    currentDateRange.start,
                    currentDateRange.end,
                  )}
                </div>
              </div>
            </div>

            {renderCondition()}

            {/* Timeline Task */}
            {showChartSection && (
              <div className="wms-flex wms-flex-col wms-flex-1">
                <GanttTimeline
                  isFlatView={isFlatView}
                  tasks={visibleTasks.map(({task}) => task)}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={handleTaskSelect}
                  baseProjectStart={currentDateRange.start}
                  baseProjectEnd={currentDateRange.end}
                  rowHeight={rowHeight}
                  currentDayWidth={currentDayWidth}
                  totalDays={totalDays}
                  viewMode={viewMode}
                  onCommitDrag={onCommitDrag}
                  viewportRef={viewportRef}
                  scrollX={scrollX}
                  scrollY={scrollY}
                  onScrollY={handleScrollY}
                  pendingUpdates={pendingUpdates}
                  contentRef={timelineContentRef}
                  enableVirtualization={tasks.length > 50}
                  containerHeight={
                    showMountainChart
                      ? containerHeight - mountainChartHeight
                      : containerHeight
                  }
                  overscan={5}
                  holidays={holidays}
                  projectId={currentProjectId}
                  onRelationCreated={() => tasksQ.refetch()}
                />

                {/* Mountain Chart */}
                {showMountainChart && (
                  <MountainChart
                    baseProjectStart={currentDateRange.start}
                    baseProjectEnd={currentDateRange.end}
                    currentDayWidth={currentDayWidth}
                    viewMode={viewMode}
                    scrollX={scrollX}
                    height={mountainChartHeight}
                    containerWidth={viewportWidth}
                    contentRef={mountainContentRef}
                    apiData={mountainChartApiData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          📜 BOTTOM SCROLLBAR (Horizontal sync with timeline)
          ============================================================ */}
      <div className="wms-shrink-0">
        <GanttScrollbar
          treeWidth={ganttOnlyMode ? 28 : treeWidth}
          totalWidth={totalWidth}
          scrollX={scrollX}
          onScroll={onBottomScrollSmooth}
          bottomRef={bottomRef}
        />
      </div>

      {/* ============================================================
          👁️ TOGGLE CONTROLS BUTTON (Show/Hide toolbar)
          ============================================================ */}
      {/* <GanttToggleButton
        hideControls={hideControls}
        onToggle={() => setHideControls(!hideControls)}
        t={t}
      /> */}
    </div>
  );
});

export default GanttChart;
