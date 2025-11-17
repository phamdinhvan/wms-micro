import {Task} from '@wms/core';
import dayjs from 'dayjs';
import React from 'react';
import {ConnectionNode, ConnectionPoint} from './ConnectionNode';
import {ResizeHandle} from './ResizeHandle';
import {
  applyDragPreview,
  calculateTaskDimensions,
  calculateTaskPosition,
  getTaskHeight,
} from './taskCalculations';

/* eslint-disable react/prop-types */
interface TaskBarProps {
  task: Task;
  index: number;
  tasks: Task[];
  selectedTaskId: string | null;
  baseProjectStart: dayjs.Dayjs;
  currentDayWidth: number;
  rowHeight: number;
  isFlatView: boolean;
  pendingUpdates: Set<string>;
  dragPreview: {
    id: string;
    type: 'move' | 'resize-left' | 'resize-right';
    deltaDays: number;
  } | null;
  virtualTop?: number;
  onStartDrag: (
    e: {stopPropagation?: () => void; clientX: number},
    task: Task,
    type: 'move' | 'resize-left' | 'resize-right',
  ) => void;
  onFinishPointer: (task?: Task) => void;
  onCommitDrag: (payload: {
    id: string;
    initDate: string;
    initDuration: number;
    type: 'move' | 'resize-left' | 'resize-right';
    deltaDays: number;
  }) => void;
  /** holidays (ISO format strings, e.g. '2025-01-01') to exclude from working days */
  holidays?: string[];
  /** Relation drag state - whether any drag is in progress */
  isRelationDragging?: boolean;
  /** Source task ID of current relation drag */
  relationDragSourceId?: string | null;
  /** Hovered target task ID during relation drag */
  relationDragTargetId?: string | null;
  /** Hovered target point during relation drag */
  relationDragTargetPoint?: ConnectionPoint | null;
  /** Callback when relation drag starts from connection node */
  onRelationDragStart?: (
    e: React.MouseEvent | React.TouchEvent,
    taskId: string,
    point: ConnectionPoint,
  ) => void;
  /** Callback when mouse enters a connection node during drag */
  onRelationNodeHover?: (
    taskId: string | null,
    point: ConnectionPoint | null,
  ) => void;
}

export const TaskBar: React.FC<TaskBarProps> = React.memo(
  ({
    task,
    index,
    tasks,
    selectedTaskId,
    baseProjectStart,
    currentDayWidth,
    rowHeight,
    isFlatView,
    pendingUpdates,
    dragPreview,
    virtualTop,
    onStartDrag,
    onFinishPointer,
    onCommitDrag,
    holidays = [],
    isRelationDragging = false,
    relationDragSourceId = null,
    relationDragTargetId = null,
    relationDragTargetPoint = null,
    onRelationDragStart,
    onRelationNodeHover,
  }) => {
    // Track hover state for this task bar
    const [isTaskHovered, setIsTaskHovered] = React.useState(false);
    const dimensions = calculateTaskDimensions(
      task,
      tasks,
      baseProjectStart,
      currentDayWidth,
      isFlatView,
    );

    const {leftPx, widthPx} = applyDragPreview(
      dimensions,
      dragPreview,
      task,
      baseProjectStart,
      currentDayWidth,
    );

    const {taskDuration, isParent, isChild} = dimensions;
    const isPreviewing = dragPreview?.id === task.id;

    const visibleLeft = Math.max(0, leftPx);
    const labelOffset = visibleLeft - leftPx;

    const top = calculateTaskPosition(
      index,
      rowHeight,
      isParent,
      isChild,
      virtualTop,
    );
    const height = getTaskHeight(isParent, isChild);

    // Calculate non-working days
    const holidaySet = React.useMemo(() => new Set(holidays), [holidays]);

    const isWorkingDay = React.useCallback(
      (date: dayjs.Dayjs): boolean => {
        const dayOfWeek = date.day();
        if (dayOfWeek === 0 || dayOfWeek === 6) return false;
        if (holidaySet.has(date.format('YYYY-MM-DD'))) return false;
        return true;
      },
      [holidaySet],
    );

    const nonWorkingDays = React.useMemo(() => {
      if (!task.startDate || !task.endDate) return [];

      const result: Array<{left: number; width: number}> = [];
      const taskStart = dayjs(task.startDate);
      const taskEnd = dayjs(task.endDate);

      let currentDay = taskStart;
      while (
        currentDay.isBefore(taskEnd) ||
        currentDay.isSame(taskEnd, 'day')
      ) {
        if (!isWorkingDay(currentDay)) {
          const dayOffset = currentDay.diff(taskStart, 'day');
          result.push({
            left: dayOffset * currentDayWidth,
            width: currentDayWidth,
          });
        }
        currentDay = currentDay.add(1, 'day');
      }

      return result;
    }, [task.startDate, task.endDate, isWorkingDay, currentDayWidth]);

    const handleMouseDown = (e: React.MouseEvent) => {
      // Don't start task drag if relation drag is in progress
      if (isRelationDragging) return;
      onStartDrag(
        {stopPropagation: () => e.stopPropagation(), clientX: e.clientX},
        task,
        'move',
      );
    };

    const handleMouseUp = () => {
      // Don't finish pointer (which selects task) if relation drag is in progress
      if (isRelationDragging) return;
      onFinishPointer(task);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      // Don't start task drag if relation drag is in progress
      if (isRelationDragging) return;
      onStartDrag(
        {
          stopPropagation: () => e.stopPropagation(),
          clientX: e.touches[0].clientX,
        },
        task,
        'move',
      );
    };

    const handleTouchEnd = () => {
      // Don't finish pointer if relation drag is in progress
      if (isRelationDragging) return;
      onFinishPointer(task);
    };

    // Handlers for task hover (to show/hide connection nodes)
    const handleTaskMouseEnter = () => setIsTaskHovered(true);
    const handleTaskMouseLeave = () => setIsTaskHovered(false);

    // Determine if this task's nodes should be highlighted
    const isSourceTask = relationDragSourceId === task.id;
    const isTargetTask = relationDragTargetId === task.id;

    return (
      <div
        key={task.id}
        role="group"
        aria-label={`Task: ${task.name}. Start ${task.startDate}, duration ${taskDuration} days.`}
        className={`wms-task wms-absolute wms-cursor-pointer ${isPreviewing ? 'preview' : ''} ${
          selectedTaskId === task.id ? 'wms-ring-2 wms-ring-blue-500' : ''
        } ${isParent ? 'wms-parent' : 'wms-leaf'} ${
          pendingUpdates.has(task.id) ? 'wms-opacity-75' : ''
        }`}
        style={{
          top,
          left: leftPx,
          width: widthPx,
          height,
          zIndex: 1,
          ['--wms-bg' as string]: task.status?.color || '#6c757d',
          ['--wms-op-base' as string]: '30%',
          ['--wms-op-center-hover' as string]: '30%',
          ['--wms-op-side-hover' as string]: '60%',
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleTaskMouseEnter}
        onMouseLeave={handleTaskMouseLeave}>
        {/* Connection nodes for relation drag & drop */}
        {onRelationDragStart && onRelationNodeHover && (
          <>
            <div
              onMouseEnter={() =>
                isRelationDragging && onRelationNodeHover(task.id, 'start')
              }
              onMouseLeave={() =>
                isRelationDragging && onRelationNodeHover(null, null)
              }>
              <ConnectionNode
                position="start"
                taskId={task.id}
                isTaskHovered={isTaskHovered}
                isDragging={isRelationDragging}
                isSource={isSourceTask}
                isHoveredTarget={
                  isTargetTask && relationDragTargetPoint === 'start'
                }
                onDragStart={onRelationDragStart}
              />
            </div>
            <div
              onMouseEnter={() =>
                isRelationDragging && onRelationNodeHover(task.id, 'end')
              }
              onMouseLeave={() =>
                isRelationDragging && onRelationNodeHover(null, null)
              }>
              <ConnectionNode
                position="end"
                taskId={task.id}
                isTaskHovered={isTaskHovered}
                isDragging={isRelationDragging}
                isSource={isSourceTask}
                isHoveredTarget={
                  isTargetTask && relationDragTargetPoint === 'end'
                }
                onDragStart={onRelationDragStart}
              />
            </div>
          </>
        )}

        <div className="wms-bar" aria-hidden="true">
          <div className="wms-center" />
        </div>

        {isParent && <span className="wms-notches" aria-hidden="true" />}

        {nonWorkingDays.map((day, idx) => (
          <div
            key={`non-working-${task.id}-${idx}`}
            className="wms-absolute wms-top-0 wms-bottom-0 wms-pointer-events-none"
            style={{
              left: day.left,
              width: day.width,
              background:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.4), rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.25) 2px, rgba(255,255,255,0.25) 6px)',
              borderLeft: '1px solid rgba(0,0,0,0.15)',
              borderRight: '1px solid rgba(0,0,0,0.15)',
              zIndex: 2,
            }}
            aria-hidden="true"
          />
        ))}

        <span
          className="wms-label wms-z-10"
          aria-hidden="true"
          style={{
            left: Math.max(10, labelOffset + 10),
            fontFamily: 'var(--gantt-font-primary, sans-serif)',
          }}>
          {task.name}
        </span>

        <ResizeHandle
          task={task}
          taskDuration={taskDuration}
          type="resize-left"
          onStartDrag={onStartDrag}
          onFinish={onFinishPointer}
          onCommitDrag={onCommitDrag}
        />

        <ResizeHandle
          task={task}
          taskDuration={taskDuration}
          type="resize-right"
          onStartDrag={onStartDrag}
          onFinish={onFinishPointer}
          onCommitDrag={onCommitDrag}
        />
      </div>
    );
  },
);

TaskBar.displayName = 'TaskBar';
