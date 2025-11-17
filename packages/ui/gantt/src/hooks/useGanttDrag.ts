import {Task} from '@wms/core';
import dayjs from 'dayjs';
import {useCallback, useRef, useState} from 'react';

/**
 * Calculate task duration in days from start and end dates
 * This matches the calculation used in GanttTimeLine.tsx for consistency
 *
 * @param task - Task object with startDate and endDate
 * @returns Duration in days (minimum 1 day)
 */
const calculateTaskDuration = (task: Task): number => {
  return Math.max(
    1, // Minimum duration is 1 day
    dayjs(task.endDate).diff(dayjs(task.startDate), 'day') + 1, // +1 for inclusive dates
  );
};

// UI Constants for drag functionality
const UI_CONSTANTS = {
  DRAG_THRESHOLD_PX: 5, // Minimum pixel movement to start dragging (vs clicking)
};

/**
 * Information stored when drag operation starts
 */
interface DragInfo {
  id: string; // Task ID being dragged
  startX: number; // Initial mouse X coordinate
  initDate: string; // Initial start date of the task
  initDuration: number; // Initial duration in days
  type: 'move' | 'resize-left' | 'resize-right'; // Type of drag operation
}

/**
 * Current drag preview state for visual feedback
 */
interface DragPreview {
  id: string; // Task ID being previewed
  type: 'move' | 'resize-left' | 'resize-right'; // Type of operation
  deltaDays: number; // Number of days moved/resized (can be negative)
}

/**
 * Custom hook for handling Gantt chart drag operations
 *
 * This hook manages the complete drag lifecycle:
 * 1. Starting drag operations (move, resize-left, resize-right)
 * 2. Tracking mouse movement and calculating day deltas
 * 3. Providing real-time preview feedback
 * 4. Committing changes when drag completes
 * 5. Handling cancellation and cleanup
 *
 * @param currentDayWidth - Width of one day in pixels (varies by zoom level)
 * @param projectStart - Project start date for coordinate calculations
 * @param projectEnd - Project end date for boundary constraints
 * @param onCommitDrag - Callback to execute when drag operation completes
 * @param onSelectTask - Callback to execute when task is clicked (not dragged)
 */
export function useGanttDrag(
  currentDayWidth: number,
  projectStart: dayjs.Dayjs,
  projectEnd: dayjs.Dayjs,
  onCommitDrag: (payload: {
    id: string;
    initDate: string;
    initDuration: number;
    type: 'move' | 'resize-left' | 'resize-right';
    deltaDays: number;
  }) => void,
  onSelectTask: (id: string) => void,
) {
  // Drag state management
  const dragInfo = useRef<DragInfo | null>(null); // Current drag operation info
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null); // Preview state for UI
  const [isDragging, setIsDragging] = useState(false); // Whether actively dragging (past threshold)

  /**
   * Start a drag operation
   *
   * This initializes the drag state but doesn't immediately start dragging.
   * Actual dragging begins when mouse movement exceeds the threshold.
   *
   * @param e - Mouse or touch event with clientX coordinate
   * @param task - Task being dragged
   * @param type - Type of drag operation (move, resize-left, resize-right)
   */
  const startDrag = useCallback(
    (
      e: {stopPropagation?: () => void; clientX: number},
      task: Task,
      type: 'move' | 'resize-left' | 'resize-right',
    ) => {
      e.stopPropagation?.(); // Prevent event bubbling to parent elements

      // Store initial drag information
      dragInfo.current = {
        id: task.id,
        startX: e.clientX, // Mouse X position when drag started
        initDate: task.startDate, // Original start date
        initDuration: calculateTaskDuration(task), // Original duration
        type, // Drag operation type
      };

      // Initialize preview with zero delta (no movement yet)
      setDragPreview({id: task.id, type, deltaDays: 0});
      setIsDragging(false); // Not yet dragging (waiting for threshold)
    },
    [],
  );

  /**
   * Handle mouse/touch movement during potential or active drag
   *
   * This function:
   * 1. Calculates how far the mouse has moved
   * 2. Converts pixel movement to day delta
   * 3. Starts actual dragging if threshold is exceeded
   * 4. Updates preview state for visual feedback
   *
   * @param clientX - Current mouse X coordinate
   */
  const onPointerMove = useCallback(
    (clientX: number) => {
      if (!dragInfo.current) return; // No drag operation in progress

      const {startX, id, type} = dragInfo.current;

      // Calculate pixel movement from start position
      const deltaX = clientX - startX;

      // Check if we've exceeded the drag threshold (start actual dragging)
      if (!isDragging && Math.abs(deltaX) > UI_CONSTANTS.DRAG_THRESHOLD_PX) {
        setIsDragging(true); // Now officially dragging
      }

      // Convert pixel movement to day delta
      // Positive deltaDays = moving right/extending, Negative = moving left/shrinking
      const deltaDays = Math.round(deltaX / currentDayWidth);

      // Update preview state for visual feedback
      setDragPreview({id, type, deltaDays});
    },
    [isDragging, currentDayWidth],
  );

  /**
   * Cancel current drag operation and reset all state
   * Used when drag is interrupted (mouse leave, escape key, etc.)
   */
  const cancelDrag = useCallback(() => {
    dragInfo.current = null;
    setDragPreview(null);
    setIsDragging(false);
  }, []);

  /**
   * Complete drag operation or handle task selection
   *
   * This function handles multiple scenarios:
   * 1. No drag in progress + task clicked = select task
   * 2. Drag in progress but no movement = select task (if move operation)
   * 3. Drag in progress with movement = commit drag changes
   *
   * @param clickedTask - Task that was clicked (for selection)
   */
  const finishPointer = useCallback(
    (clickedTask?: Task) => {
      // No drag operation in progress - handle as task selection
      if (!dragInfo.current || !dragPreview) {
        if (clickedTask) {
          onSelectTask(clickedTask.id);
        }
        cancelDrag();
        return;
      }

      const {id, initDate, initDuration, type} = dragInfo.current;
      const {deltaDays} = dragPreview;

      // Special case: Move operation with no actual dragging = task selection
      if (!isDragging && type === 'move' && clickedTask) {
        onSelectTask(clickedTask.id);
        cancelDrag();
        return;
      }

      // Commit drag changes if there was actual movement
      if (deltaDays !== 0) {
        onCommitDrag({id, initDate, initDuration, type, deltaDays});
      }

      // Clean up drag state
      cancelDrag();
    },
    [dragPreview, isDragging, onCommitDrag, onSelectTask, cancelDrag],
  );

  /**
   * Clamp task position and width within timeline boundaries
   *
   * This ensures tasks don't get positioned outside the visible timeline
   * and maintains minimum width requirements.
   *
   * @param left - Desired left position in pixels
   * @param width - Desired width in pixels
   * @param totalDays - Total days in the timeline
   * @returns Clamped position and width
   */
  const clampPx = useCallback(
    (left: number, width: number, totalDays: number) => {
      const minLeft = 0; // Left boundary
      const maxRight = totalDays * currentDayWidth; // Right boundary

      // Clamp left position to boundaries
      let newLeft = Math.max(minLeft, left);
      let newRight = Math.min(maxRight, newLeft + width);

      // Ensure minimum width (at least one day visible)
      if (newRight - newLeft < currentDayWidth) {
        if (newLeft + currentDayWidth <= maxRight) {
          // Extend right if possible
          newRight = newLeft + currentDayWidth;
        } else {
          // Otherwise, move left to fit minimum width
          newLeft = Math.max(minLeft, maxRight - currentDayWidth);
          newRight = maxRight;
        }
      }

      return {left: newLeft, width: newRight - newLeft};
    },
    [currentDayWidth],
  );

  // Return drag state and control functions
  return {
    dragPreview, // Current preview state (null if not dragging)
    isDragging, // Whether actively dragging (past threshold)
    startDrag, // Function to start drag operation
    onPointerMove, // Function to handle mouse movement
    cancelDrag, // Function to cancel drag operation
    finishPointer, // Function to complete drag or select task
    clampPx, // Function to clamp positions within bounds
  };
}
