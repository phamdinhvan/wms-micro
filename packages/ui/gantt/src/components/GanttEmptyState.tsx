'use client';

import {ProjectFormModal, TProject} from '@wms/core';
import React, {useRef} from 'react';
import {appId} from '../constants';
import {GanttToolbar} from './GanttToolbar';

interface GanttEmptyStateProps {
  projects?: TProject[];
  isProjectsLoading?: boolean;
  isExporting: boolean;
  modals: {createProject: boolean};
  onProjectSelect: (projectId: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onCreateProject: () => void;
  onCloseCreateModal: () => void;
  t: (key: string) => string;
  className?: string;
  scrollbarHeight: number;
}

export const GanttEmptyState = React.memo(function GanttEmptyState({
  projects,
  isProjectsLoading,
  isExporting,
  modals,
  onProjectSelect,
  onRefresh,
  onExport,
  onCreateProject,
  onCloseCreateModal,
  t,
  className,
  scrollbarHeight,
}: GanttEmptyStateProps) {
  const stickyHeaderRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className={`gantt-chart-container ${className || ''}`}
      style={{paddingBottom: scrollbarHeight}}>
      <div
        ref={stickyHeaderRef}
        className="wms-sticky wms-top-0 wms-z-30 wms-bg-white">
        {/* Top toolbar - only show project selector */}
        <GanttToolbar
          projectId={null}
          projects={projects ?? []}
          isProjectsLoading={!!isProjectsLoading}
          isExporting={isExporting}
          onProjectSelect={onProjectSelect}
          onRefresh={onRefresh}
          onExport={onExport}
          onCreateProject={onCreateProject}
          t={t}
        />
      </div>

      {/* Message when no project selected */}
      <div className="wms-flex wms-items-center wms-justify-center wms-min-h-[400px] wms-p-8">
        <div className="wms-text-center">
          <div className="wms-text-gray-500 wms-text-lg wms-font-medium">
            {t('gantt.messages.pleaseChooseProject')}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <ProjectFormModal
        opened={modals.createProject}
        onClose={onCloseCreateModal}
        appId={appId}
        onCreated={() => {}}
      />
    </div>
  );
});
