'use client';

import {
  ProjectFormModal,
  TaskAssignee,
  TaskFormModal,
  TaskPriority,
  TaskStatus,
  TProject,
} from '@wms/core';
import React from 'react';
import {appId} from '../constants';

interface GanttModals {
  createProject: boolean;
  taskModal: boolean;
  themeModal: boolean;
  themeConfig: boolean;
  parentUpdate: boolean;
}

interface GanttModalsProps {
  modals: GanttModals;
  currentProjectId: string | null;
  currentProject?: TProject;
  selectedTaskId: string | null;
  taskModalMode: 'create' | 'edit';
  parentTaskId?: string | null; // ID of parent task when creating child task
  assignees: TaskAssignee[];
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  onCloseCreateProject: () => void;
  onCloseTaskModal: () => void;
  onTaskCreated: (task: unknown) => void;
  onTaskUpdated: (task: unknown) => void;
}

export const GanttModals = React.memo(function GanttModals({
  modals,
  currentProjectId,
  currentProject,
  selectedTaskId,
  taskModalMode,
  parentTaskId,
  assignees,
  statuses,
  priorities,
  onCloseCreateProject,
  onCloseTaskModal,
  onTaskCreated,
  onTaskUpdated,
}: GanttModalsProps) {
  return (
    <>
      {/* Create Project Modal */}
      <ProjectFormModal
        opened={modals.createProject}
        onClose={onCloseCreateProject}
        appId={appId}
        onCreated={() => {}}
      />

      {/* Task Modal */}
      <TaskFormModal
        opened={modals.taskModal}
        onClose={onCloseTaskModal}
        projectId={currentProjectId || ''}
        assigneeOptions={assignees}
        statusOptions={statuses}
        priorityOptions={priorities}
        projectStartDate={currentProject?.startDate}
        taskId={taskModalMode === 'edit' ? selectedTaskId : undefined}
        isEdit={taskModalMode === 'edit'}
        parentId={taskModalMode === 'create' ? parentTaskId : undefined}
        onCreated={onTaskCreated}
        onUpdated={onTaskUpdated}
      />
    </>
  );
});
