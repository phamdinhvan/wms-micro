'use client';

import {
  TaskAssignee,
  TaskPriority,
  TaskStatus,
  TProject,
  ViewMode,
} from '@wms/core';
import {Dayjs} from 'dayjs';
import React from 'react';
import {GanttFilters} from './GanttFilters';
import {GanttToolbar} from './GanttToolbar';

interface GanttControlsProps {
  currentProjectId: string;
  projects: TProject[];
  isProjectsLoading: boolean;
  isExporting: boolean;
  filters: {
    status: string | null;
    priority: string | null;
    assignee: string | null;
  };
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assignees: TaskAssignee[];
  viewMode: ViewMode;
  isFlatView: boolean;
  showMountainChart: boolean;
  currentDateRange: {start: Dayjs; end: Dayjs};
  onProjectSelect: (projectId: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onCreateProject: () => void;
  onFilterChange: (filterType: string, value: string | null) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  onViewTypeChange: (isFlatView: boolean) => void;
  onMountainChartToggle: (show: boolean) => void;
  onDateRangeChange: (start: Dayjs, end: Dayjs) => void;
  onResetToProject: () => void;
  onDateFilterChange: (from: string | null, to: string | null) => void;
  t: (key: string) => string;
  hideFilters: boolean;
}

export const GanttControls = React.memo(function GanttControls({
  currentProjectId,
  projects,
  isProjectsLoading,
  isExporting,
  filters,
  statuses,
  priorities,
  assignees,
  viewMode,
  isFlatView,
  showMountainChart,
  currentDateRange,
  onProjectSelect,
  onRefresh,
  onExport,
  onCreateProject,
  onFilterChange,
  onViewModeChange,
  onViewTypeChange,
  onMountainChartToggle,
  onDateRangeChange,
  onResetToProject,
  onDateFilterChange,
  t,
  hideFilters,
}: GanttControlsProps) {
  return (
    <div className="wms-shrink-0">
      {/* Top toolbar */}
      <GanttToolbar
        projectId={currentProjectId}
        projects={projects}
        isProjectsLoading={isProjectsLoading}
        isExporting={isExporting}
        onProjectSelect={onProjectSelect}
        onRefresh={onRefresh}
        onExport={onExport}
        onCreateProject={onCreateProject}
        t={t}
      />

      {/* Filters */}
      <GanttFilters
        filters={filters}
        statuses={statuses}
        priorities={priorities}
        assignees={assignees}
        viewMode={viewMode}
        isFlatView={isFlatView}
        showMountainChart={showMountainChart}
        currentDateRange={currentDateRange}
        onFilterChange={onFilterChange}
        onViewModeChange={onViewModeChange}
        onViewTypeChange={onViewTypeChange}
        onMountainChartToggle={onMountainChartToggle}
        onDateRangeChange={onDateRangeChange}
        onResetToProject={onResetToProject}
        onDateFilterChange={onDateFilterChange}
        t={t}
        hideFilters={hideFilters}
      />
    </div>
  );
});
