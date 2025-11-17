import {Task} from '@wms/core';
import React from 'react';

interface ResizeHandleProps {
  task: Task;
  taskDuration: number;
  type: 'resize-left' | 'resize-right';
  onStartDrag: (
    e: {stopPropagation?: () => void; clientX: number},
    task: Task,
    type: 'resize-left' | 'resize-right',
  ) => void;
  onFinish: (task?: Task) => void;
  onCommitDrag: (payload: {
    id: string;
    initDate: string;
    initDuration: number;
    type: 'resize-left' | 'resize-right';
    deltaDays: number;
  }) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  task,
  taskDuration,
  type,
  onStartDrag,
  onFinish,
  onCommitDrag,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const step = e.shiftKey ? 7 : 1;
    const deltaDays = e.key === 'ArrowLeft' ? -step : step;
    onCommitDrag({
      id: task.id,
      initDate: task.startDate,
      initDuration: taskDuration,
      type,
      deltaDays,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onStartDrag({stopPropagation: () => e.stopPropagation(), clientX: e.clientX}, task, type);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFinish();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    onStartDrag({stopPropagation: () => e.stopPropagation(), clientX: e.touches[0].clientX}, task, type);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    onFinish();
  };

  return (
    <div
      className={`${type} resize-handle`}
      role="slider"
      aria-label={`Resize ${type === 'resize-left' ? 'left' : 'right'}: ${task.name}`}
      aria-orientation="horizontal"
      aria-valuemin={1}
      aria-valuemax={taskDuration + 365}
      aria-valuenow={taskDuration}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
};
