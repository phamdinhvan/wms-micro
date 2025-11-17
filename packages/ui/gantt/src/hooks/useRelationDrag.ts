import {useCallback, useEffect, useRef, useState} from 'react';
import {ConnectionPoint} from '../components/timeline/ConnectionNode';

export interface RelationDragState {
  /** Whether a drag operation is in progress */
  isDragging: boolean;
  /** Source task ID */
  sourceTaskId: string | null;
  /** Source connection point */
  sourcePoint: ConnectionPoint | null;
  /** Starting position when drag began */
  startX: number;
  startY: number;
  /** Current mouse/touch position */
  currentX: number;
  currentY: number;
  /** Hovered target task ID (if any) */
  hoveredTargetTaskId: string | null;
  /** Hovered target connection point (if any) */
  hoveredTargetPoint: ConnectionPoint | null;
}

export interface RelationDragHandlers {
  dragState: RelationDragState;
  startDrag: (
    taskId: string,
    point: ConnectionPoint,
    clientX: number,
    clientY: number,
  ) => void;
  updateDragPosition: (clientX: number, clientY: number) => void;
  setHoveredTarget: (
    taskId: string | null,
    point: ConnectionPoint | null,
  ) => void;
  endDrag: (
    onComplete?: (
      sourceTaskId: string,
      sourcePoint: ConnectionPoint,
      targetTaskId: string,
      targetPoint: ConnectionPoint,
    ) => void,
  ) => void;
  cancelDrag: () => void;
}

export const useRelationDrag = (): RelationDragHandlers => {
  const [dragState, setDragState] = useState<RelationDragState>({
    isDragging: false,
    sourceTaskId: null,
    sourcePoint: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    hoveredTargetTaskId: null,
    hoveredTargetPoint: null,
  });

  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const startDrag = useCallback(
    (
      taskId: string,
      point: ConnectionPoint,
      clientX: number,
      clientY: number,
    ) => {
      setDragState({
        isDragging: true,
        sourceTaskId: taskId,
        sourcePoint: point,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        hoveredTargetTaskId: null,
        hoveredTargetPoint: null,
      });
    },
    [],
  );

  const updateDragPosition = useCallback((clientX: number, clientY: number) => {
    setDragState(prev => {
      if (!prev.isDragging) return prev;
      return {
        ...prev,
        currentX: clientX,
        currentY: clientY,
      };
    });
  }, []);

  const setHoveredTarget = useCallback(
    (taskId: string | null, point: ConnectionPoint | null) => {
      setDragState(prev => {
        if (!prev.isDragging) return prev;
        return {
          ...prev,
          hoveredTargetTaskId: taskId,
          hoveredTargetPoint: point,
        };
      });
    },
    [],
  );

  const endDrag = useCallback(
    (
      onComplete?: (
        sourceTaskId: string,
        sourcePoint: ConnectionPoint,
        targetTaskId: string,
        targetPoint: ConnectionPoint,
      ) => void,
    ) => {
      const state = dragStateRef.current;

      if (
        state.isDragging &&
        state.sourceTaskId &&
        state.sourcePoint &&
        state.hoveredTargetTaskId &&
        state.hoveredTargetPoint &&
        state.sourceTaskId !== state.hoveredTargetTaskId
      ) {
        onComplete?.(
          state.sourceTaskId,
          state.sourcePoint,
          state.hoveredTargetTaskId,
          state.hoveredTargetPoint,
        );
      }

      setDragState({
        isDragging: false,
        sourceTaskId: null,
        sourcePoint: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        hoveredTargetTaskId: null,
        hoveredTargetPoint: null,
      });
    },
    [],
  );

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      sourceTaskId: null,
      sourcePoint: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      hoveredTargetTaskId: null,
      hoveredTargetPoint: null,
    });
  }, []);

  // Handle global mouse/touch move during drag
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateDragPosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateDragPosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleTouchEnd = () => {
      endDrag();
    };

    // Handle Escape key to cancel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelDrag();
      }
    };

    // Handle right click to cancel
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      cancelDrag();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [dragState.isDragging, updateDragPosition, endDrag, cancelDrag]);

  return {
    dragState,
    startDrag,
    updateDragPosition,
    setHoveredTarget,
    endDrag,
    cancelDrag,
  };
};
