import {ActionIcon, Text} from '@mantine/core';
import {IconChevronDown, IconChevronRight, IconPlus} from '@tabler/icons-react';
import {
  AssigneeSelect,
  StatusSelect,
  Task,
  TaskAssignee,
  TaskStatus,
} from '@wms/core';
import React, {useMemo} from 'react';

interface TreeTaskRendererProps {
  task: Task;
  allTasks: Task[];
  level: number;
  collapsed: Record<string, boolean>;
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onCreateChildTask: (parentId: string) => void;
  onTaskFieldUpdate: (taskId: string, field: string, value: string) => void;
  statusOptions: TaskStatus[];
  assigneeOptions: TaskAssignee[];
  t: (key: string) => string;
  hideParentUI?: boolean;
  treeWidth?: number;
  isMinimized?: boolean; // New prop to hide task content when minimized
}

// Convert to a proper React component
const TaskRow = ({
  task,
  allTasks,
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
  hideParentUI = false,
  treeWidth = 300,
  isMinimized = false,
}: TreeTaskRendererProps) => {
  const isCollapsed = collapsed[task.id];
  const children = useMemo(
    () => allTasks.filter(t => t.parentId === task.id),
    [allTasks, task.id],
  );
  const hasChildren = children.length > 0;

  // Memoize responsive styles to prevent recalculation on every render
  const containerClassName = useMemo(
    () => (treeWidth > 350 ? 'wms-max-w-[140px]' : 'wms-w-[32px]'),
    [treeWidth],
  );

  const assigneeMaxWidth = useMemo(
    () => (treeWidth > 350 ? 140 : 32),
    [treeWidth],
  );

  return (
    <div
      className={`wms-group wms-flex wms-items-center wms-justify-between wms-h-[40px] wms-cursor-pointer wms-px-0 ${
        selectedTaskId === task.id ? 'wms-bg-blue-100' : 'wms-bg-white'
      } ${!isMinimized ? 'wms-border-b wms-border-gray-200 hover:wms-bg-blue-50' : ''}`}
      style={{paddingLeft: `${level * 25}px`}}>
      <span className="wms-pl-2"></span> {/* Collapse/Expand Button */}
      {/* Hide task content when minimized, but keep the container for scroll synchronization */}
      {!isMinimized && (
        <>
          {!hideParentUI && hasChildren && level < 4 && (
            <span
              className="wms-m-0 wms-p-0 wms-cursor-pointer wms-flex wms-items-center"
              onClick={e => {
                e.stopPropagation();
                onToggleCollapse(task.id);
              }}>
              <ActionIcon
                className="m-0 p-0"
                size="xs"
                variant="transparent"
                color="black">
                {isCollapsed ? <IconChevronRight /> : <IconChevronDown />}
              </ActionIcon>
            </span>
          )}
          {/* Task Name */}
          <Text
            onClick={() => onSelectTask(task.id)}
            className="wms-truncate wms-flex-1 wms-cursor-pointer wms-font-semibold hover:wms-underline wms-text-[var(--gantt-tailwind-primary)]"
            style={{
              fontSize: '14px',
              lineHeight: '17px',
              fontFamily: 'var(--gantt-font-primary, sans-serif)',
            }}>
            {task.name}
          </Text>
          {/* Controls */}
          <div className="wms-flex wms-mr-1 wms-items-center wms-gap-1">
            {/* Assignee Select */}
            <div className={containerClassName}>
              <AssigneeSelect
                value={task?.assignee?.id}
                onChange={v => onTaskFieldUpdate(task.id, 'assignee', v)}
                assigneeOptions={assigneeOptions}
                variant="auto"
                maxWidth={assigneeMaxWidth}
              />
            </div>

            {/* Status Select */}
            <StatusSelect
              value={task?.status?.code}
              onChange={value => {
                if (value) onTaskFieldUpdate(task.id, 'status', value);
              }}
              statusOptions={statusOptions}
            />

            {/* Add Child Button (for tasks up to level 3, so children can be created up to level 4) */}
            {!hideParentUI && (
              <div className="wms-flex wms-items-center">
                <ActionIcon
                  size="xs"
                  variant="primary"
                  className={`wms-opacity-0 ${level < 1 ? 'group-hover:wms-opacity-100 wms-pointer-events-auto' : 'wms-pointer-events-none'}`}
                  onClick={e => {
                    e.stopPropagation();
                    onCreateChildTask(task.id);
                  }}
                  title={t('tree.addChild')}>
                  <IconPlus />
                </ActionIcon>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Keep the old function for backward compatibility, but now it just renders the component
export function renderTaskRow(
  props: TreeTaskRendererProps,
): React.ReactElement {
  return <TaskRow key={props.task.id} {...props} />;
}

export function renderTasksRecursively(
  taskList: Task[],
  allTasks: Task[],
  level: number,
  collapsed: Record<string, boolean>,
  selectedTaskId: string | null,
  onSelectTask: (id: string) => void,
  onToggleCollapse: (id: string) => void,
  onCreateChildTask: (parentId: string) => void,
  onTaskFieldUpdate: (taskId: string, field: string, value: string) => void,
  statusOptions: TaskStatus[],
  assigneeOptions: TaskAssignee[],
  t: (key: string) => string,
  treeWidth?: number,
  isMinimized?: boolean,
): React.ReactElement[] {
  if (level > 4) return []; // Support up to 5 levels (0-4)

  return taskList.flatMap(task => {
    const isCollapsed = collapsed[task.id];
    const children = allTasks.filter(t => t.parentId === task.id);
    const childElements =
      level < 4
        ? renderTasksRecursively(
            children,
            allTasks,
            level + 1,
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
          )
        : [];

    return [
      <TaskRow
        key={task.id}
        task={task}
        allTasks={allTasks}
        level={level}
        collapsed={collapsed}
        selectedTaskId={selectedTaskId}
        onSelectTask={onSelectTask}
        onToggleCollapse={onToggleCollapse}
        onCreateChildTask={onCreateChildTask}
        onTaskFieldUpdate={onTaskFieldUpdate}
        statusOptions={statusOptions}
        assigneeOptions={assigneeOptions}
        t={t}
        treeWidth={treeWidth}
        isMinimized={isMinimized}
      />,
      ...(isCollapsed || level >= 4 ? [] : childElements),
    ];
  });
}
