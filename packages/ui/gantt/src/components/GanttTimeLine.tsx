import {notifications} from '@mantine/notifications';
import {Task, ViewMode} from '@wms/core';
import dayjs from 'dayjs';
import React, {useCallback, useState} from 'react';
import {useCreateRelation} from '../hooks/useCreateRelation';
import {useGanttDrag} from '../hooks/useGanttDrag';
import {useRelationDrag} from '../hooks/useRelationDrag';
import {useVirtualList} from '../hooks/useVirtualList';
import {renderVerticalGrid} from '../utils';
import {ConnectionPoint} from './timeline/ConnectionNode';
import {DraggedRelationLine} from './timeline/DraggedRelationLine';
import {TaskBar} from './timeline/TaskBar';
import {TaskRelations} from './timeline/TaskRelations';

interface GanttTimelineProps {
  tasks: Task[];
  selectedTaskId: string | null;
  baseProjectStart: dayjs.Dayjs;
  baseProjectEnd: dayjs.Dayjs;
  rowHeight: number;
  currentDayWidth: number;
  viewMode: ViewMode;
  totalDays: number;
  onSelectTask: (id: string) => void;
  onCommitDrag: (payload: {
    id: string;
    initDate: string;
    initDuration: number;
    type: 'move' | 'resize-left' | 'resize-right';
    deltaDays: number;
  }) => void;
  viewportRef?: React.RefObject<HTMLDivElement | null>;
  scrollX: number;
  scrollY: number;
  onScrollY?: (scrollTop: number) => void;
  pendingUpdates?: Set<string>;
  isFlatView?: boolean;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  enableVirtualization?: boolean;
  containerHeight?: number;
  overscan?: number;
  /** holidays (ISO format strings, e.g. '2025-01-01') to exclude from working days */
  holidays?: string[];
  /** Project ID for creating relations */
  projectId?: string;
  /** Callback after relation created successfully */
  onRelationCreated?: () => void;
}

/**
 * GanttTimeline Component
 *
 * This component renders the main timeline area of the Gantt chart where tasks are displayed as bars.
 * It handles:
 * - Task positioning based on dates and duration
 * - Drag and drop operations (move, resize-left, resize-right)
 * - Real-time preview during drag operations
 * - Background panning when not dragging tasks
 * - Task selection and interaction
 */
export default function GanttTimeline({
  tasks,
  selectedTaskId,
  baseProjectStart,
  baseProjectEnd,
  rowHeight,
  currentDayWidth,
  viewMode,
  totalDays,
  onSelectTask,
  onCommitDrag,
  viewportRef,
  scrollX,
  scrollY,
  onScrollY,
  pendingUpdates = new Set(),
  isFlatView = false,
  contentRef,
  enableVirtualization = true,
  containerHeight = 600,
  overscan = 5,
  holidays = [],
  projectId,
  onRelationCreated,
}: GanttTimelineProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const isSyncingRef = React.useRef(false);
  const totalWidth = totalDays * currentDayWidth;

  const {dragPreview, startDrag, onPointerMove, cancelDrag, finishPointer} =
    useGanttDrag(
      currentDayWidth,
      baseProjectStart,
      baseProjectEnd,
      onCommitDrag,
      onSelectTask,
    );

  // Relation drag & drop
  const {
    dragState,
    startDrag: startRelationDrag,
    setHoveredTarget,
    endDrag: endRelationDrag,
  } = useRelationDrag();
  const createRelationMutation = useCreateRelation();

  // Determine relation type from connection points
  const determineRelationType = (
    sourcePoint: ConnectionPoint,
    targetPoint: ConnectionPoint,
  ): 'SS' | 'FS' | 'SF' | 'FF' => {
    if (sourcePoint === 'start' && targetPoint === 'start') return 'SS';
    if (sourcePoint === 'end' && targetPoint === 'end') return 'FF';
    if (sourcePoint === 'start' && targetPoint === 'end') return 'SF';
    return 'FS'; // sourcePoint === 'end' && targetPoint === 'start'
  };

  // Check if relation already exists
  const relationExists = (
    sourceTaskId: string,
    targetTaskId: string,
  ): boolean => {
    const sourceTask = tasks.find(t => t.id === sourceTaskId);
    if (!sourceTask || !sourceTask.relations) return false;
    return sourceTask.relations.some(rel => rel.targetTask.id === targetTaskId);
  };

  // Handle relation drag start from connection node
  const handleRelationDragStart = useCallback(
    (
      e: React.MouseEvent | React.TouchEvent,
      taskId: string,
      point: ConnectionPoint,
    ) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startRelationDrag(taskId, point, clientX, clientY);
    },
    [startRelationDrag],
  );

  // Handle relation creation
  const handleRelationCreate = useCallback(
    (
      sourceTaskId: string,
      sourcePoint: ConnectionPoint,
      targetTaskId: string,
      targetPoint: ConnectionPoint,
    ) => {
      // Validation 1: Cannot create relation to self
      if (sourceTaskId === targetTaskId) {
        notifications.show({
          message: 'Cannot create relation',
          color: 'red',
        });
        return;
      }

      // Validation 2: Check if relation already exists
      if (relationExists(sourceTaskId, targetTaskId)) {
        notifications.show({
          message: 'Relation already exists',
          color: 'red',
        });
        return;
      }

      // Determine relation type
      const relationType = determineRelationType(sourcePoint, targetPoint);

      // Call API
      createRelationMutation.mutate(
        {
          method: 'post',
          url: {baseUrl: '/task-relations'},
          payload: {
            projectId,
            sourceTaskId,
            targetTaskId,
            relationType,
            delayDays: 0,
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              message: `${relationType} relation created successfully`,
              color: 'green',
            });
            onRelationCreated?.();
          },
          onError: (error: unknown) => {
            notifications.show({
              message:
                error instanceof Error
                  ? `Failed to create relation: ${error.message}`
                  : 'Failed to create relation',
              color: 'red',
            });
          },
        },
      );
    },
    [
      projectId,
      tasks,
      createRelationMutation,
      onRelationCreated,
      relationExists,
      determineRelationType,
    ],
  );

  // End relation drag with completion callback
  const handleRelationDragEnd = useCallback(() => {
    endRelationDrag(handleRelationCreate);
  }, [endRelationDrag, handleRelationCreate]);

  const virtualList = useVirtualList({
    itemCount: tasks.length,
    itemSize: 40,
    containerHeight,
    scrollTop,
    overscan,
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isSyncingRef.current) {
        isSyncingRef.current = false;
        return;
      }
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScrollY?.(newScrollTop);
    },
    [onScrollY],
  );

  React.useLayoutEffect(() => {
    const scrollContainer = document.querySelector(
      '.gantt-timeline-scroll',
    ) as HTMLDivElement;
    if (scrollContainer && scrollY !== scrollTop) {
      isSyncingRef.current = true;
      scrollContainer.scrollTop = scrollY;
      setScrollTop(scrollY);
    }
  }, [scrollY, scrollTop]);

  const renderTaskBar = useCallback(
    (task: Task, index: number, virtualTop?: number) => (
      <TaskBar
        task={task}
        index={index}
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        baseProjectStart={baseProjectStart}
        currentDayWidth={currentDayWidth}
        rowHeight={rowHeight}
        isFlatView={isFlatView}
        pendingUpdates={pendingUpdates}
        dragPreview={dragPreview}
        virtualTop={virtualTop}
        onStartDrag={startDrag}
        onFinishPointer={finishPointer}
        onCommitDrag={onCommitDrag}
        holidays={holidays}
        isRelationDragging={dragState.isDragging}
        relationDragSourceId={dragState.sourceTaskId}
        relationDragTargetId={dragState.hoveredTargetTaskId}
        relationDragTargetPoint={dragState.hoveredTargetPoint}
        onRelationDragStart={handleRelationDragStart}
        onRelationNodeHover={setHoveredTarget}
      />
    ),
    [
      tasks,
      selectedTaskId,
      baseProjectStart,
      currentDayWidth,
      rowHeight,
      isFlatView,
      pendingUpdates,
      dragPreview,
      startDrag,
      finishPointer,
      onCommitDrag,
      holidays,
      dragState.isDragging,
      dragState.sourceTaskId,
      dragState.hoveredTargetTaskId,
      dragState.hoveredTargetPoint,
      handleRelationDragStart,
      setHoveredTarget,
    ],
  );

  const renderVirtualTask = useCallback(
    (virtualItem: {index: number; start: number; size: number}) => {
      const task = tasks[virtualItem.index];
      if (!task) return null;
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
          {renderTaskBar(task, virtualItem.index, 0)}
        </div>
      );
    },
    [tasks, renderTaskBar],
  );

  const shouldUseVirtual = enableVirtualization && tasks.length > 50;

  // Calculate minimum rows needed to fill the container height
  const minRowsToFillScreen = Math.ceil(containerHeight / rowHeight);
  const gridRowCount = Math.max(tasks.length, minRowsToFillScreen);

  // Calculate actual content height - only show scroll if tasks exceed container
  const actualTasksHeight = tasks.length * rowHeight;
  const contentHeight = Math.max(actualTasksHeight, containerHeight);
  const needsScroll = actualTasksHeight > containerHeight;

  // Note: TaskRelations needs ALL tasks to resolve target task IDs,
  // but will automatically filter to only render visible relations
  // The component internally handles which relations to render based on task positions

  return (
    <div
      ref={viewportRef}
      className="wms-relative wms-flex-1 wms-select-none wms-overflow-x-hidden wms-overflow-y-auto"
      onMouseMove={e => onPointerMove(e.clientX)}
      onTouchMove={e => onPointerMove(e.touches[0]?.clientX ?? 0)}
      onMouseUp={() => {
        finishPointer();
        if (dragState.isDragging) {
          handleRelationDragEnd();
        }
      }}
      onTouchEnd={() => {
        finishPointer();
        if (dragState.isDragging) {
          handleRelationDragEnd();
        }
      }}
      onMouseLeave={() => cancelDrag()}
      onTouchCancel={() => cancelDrag()}>
      {/* Task Timeline with scroll */}
      <div
        className="gantt-timeline-scroll"
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          overflowY: needsScroll ? 'auto' : 'hidden',
          overflowX: 'hidden',
        }}>
        {/* Task Timeline */}
        <div
          ref={contentRef}
          className="wms-relative wms-select-none"
          style={{
            width: totalWidth,
            height: contentHeight,
            transform: `translate3d(-${scrollX}px,0,0)`,
            willChange: 'transform',
          }}>
          {renderVerticalGrid(
            viewMode,
            gridRowCount,
            currentDayWidth,
            baseProjectStart,
            baseProjectEnd,
          )}

          {/* Task Relations - render connections between tasks */}
          <TaskRelations
            tasks={tasks}
            viewStart={baseProjectStart}
            viewMode={viewMode}
            rowHeight={rowHeight}
            timelineWidth={totalWidth}
            timelineHeight={contentHeight}
          />

          <div className="wms-relative">
            {shouldUseVirtual ? (
              <div
                style={{
                  height: virtualList.totalSize,
                  position: 'relative',
                }}>
                {virtualList.items.map(renderVirtualTask)}
              </div>
            ) : (
              <div className="wms-relative">
                {tasks.map((task, index) => renderTaskBar(task, index))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dragged relation line overlay */}
      {dragState.isDragging &&
        dragState.sourceTaskId &&
        dragState.sourcePoint && (
          <DraggedRelationLine
            startX={dragState.startX}
            startY={dragState.startY}
            endX={dragState.currentX}
            endY={dragState.currentY}
            sourcePoint={dragState.sourcePoint}
            isSnapped={!!dragState.hoveredTargetTaskId}
          />
        )}
    </div>
  );
}
