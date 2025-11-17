import {Task} from '@wms/core';
import {baseProjectEnd, baseProjectStart} from '../constants/gantt';

export interface DragInfo {
  id: string;
  startX: number;
  initDate: string;
  initDuration: number;
  type: 'move' | 'resize-left' | 'resize-right';
}

export interface DragPreview {
  id: string;
  type: 'move' | 'resize-left' | 'resize-right';
  deltaDays: number;
}

export const DRAG_THRESHOLD_PX = 3; // <= this is a click, > this is a drag/resize

// Clamp task position within timeline bounds
export function clampTaskPosition(
  left: number,
  width: number,
  currentDayWidth: number,
): {left: number; width: number} {
  const minLeft = 0;
  const totalDays = baseProjectEnd.diff(baseProjectStart, 'day') + 1;
  const maxRight = totalDays * currentDayWidth;
  let newLeft = Math.max(minLeft, left);
  let newRight = Math.min(maxRight, newLeft + width);

  // Keep at least 1 day visible
  if (newRight - newLeft < currentDayWidth) {
    if (newLeft + currentDayWidth <= maxRight) {
      newRight = newLeft + currentDayWidth;
    } else {
      newLeft = Math.max(minLeft, maxRight - currentDayWidth);
      newRight = maxRight;
    }
  }
  return {left: newLeft, width: newRight - newLeft};
}

// Calculate preview position during drag
export function calculateDragPreview(
  task: Task,
  dragPreview: DragPreview,
  baseLeft: number,
  baseWidth: number,
  currentDayWidth: number,
): {leftPx: number; widthPx: number} {
  const dPx = dragPreview.deltaDays * currentDayWidth;

  if (dragPreview.type === 'move') {
    const {left, width} = clampTaskPosition(
      baseLeft + dPx,
      baseWidth,
      currentDayWidth,
    );
    return {leftPx: left, widthPx: width};
  } else if (dragPreview.type === 'resize-left') {
    const newLeft = baseLeft + dPx;
    const newWidth = baseWidth - dPx;
    const {left, width} = clampTaskPosition(
      newLeft,
      Math.max(newWidth, currentDayWidth),
      currentDayWidth,
    );
    return {leftPx: left, widthPx: width};
  } else if (dragPreview.type === 'resize-right') {
    const newWidth = baseWidth + dPx;
    const {left, width} = clampTaskPosition(
      baseLeft,
      Math.max(newWidth, currentDayWidth),
      currentDayWidth,
    );
    return {leftPx: left, widthPx: width};
  }

  return {leftPx: baseLeft, widthPx: baseWidth};
}

// Calculate delta days from pixel movement
export function calculateDeltaDays(
  deltaX: number,
  currentDayWidth: number,
): number {
  return Math.round(deltaX / currentDayWidth);
}

// Check if movement exceeds drag threshold
export function isDragMovement(deltaX: number): boolean {
  return Math.abs(deltaX) > DRAG_THRESHOLD_PX;
}
