import React from 'react';

export type ConnectionPoint = 'start' | 'end';

interface ConnectionNodeProps {
  /** Position type: 'start' (left side) or 'end' (right side) */
  position: ConnectionPoint;
  /** Task ID this node belongs to */
  taskId: string;
  /** Whether the task bar is currently hovered */
  isTaskHovered: boolean;
  /** Whether any relation drag is in progress */
  isDragging: boolean;
  /** Whether this node is the drag source */
  isSource: boolean;
  /** Whether this node is being hovered during drag */
  isHoveredTarget: boolean;
  /** Callback when drag starts from this node */
  onDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    taskId: string,
    point: ConnectionPoint,
  ) => void;
}

export const ConnectionNode: React.FC<ConnectionNodeProps> = ({
  position,
  taskId,
  isTaskHovered,
  isDragging,
  isSource,
  isHoveredTarget,
  onDragStart,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDragStart(e, taskId, position);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDragStart(e, taskId, position);
  };

  // Calculate position: 10px outside the edge
  // Node is 10px wide, so center it 10px from edge means position at -15px
  // (10px outside + 5px to center = 15px from inner edge)
  const positionStyle = position === 'start' ? {left: '-8px'} : {right: '-8px'};

  // Determine visibility and styling
  const isVisible = isTaskHovered || isDragging;
  const isHighlighted = (isDragging && !isSource) || isHoveredTarget;

  return (
    <div
      className={`wms-connection-node ${position} ${isVisible ? 'visible' : ''} ${isHighlighted ? 'highlighted' : ''} ${isSource ? 'source' : ''}`}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: isSource
          ? '#1971c2'
          : isHighlighted
            ? '#1971c2'
            : '#495057',
        border: isHighlighted ? '2px solid #1c7ed6' : '2px solid #fff',
        cursor: 'crosshair',
        zIndex: 100,
        opacity: isVisible ? 1 : 0,
        transition:
          'opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isHighlighted
          ? '0 0 8px 2px rgba(25, 113, 194, 0.6)'
          : isVisible
            ? '0 2px 4px rgba(0,0,0,0.2)'
            : 'none',
        pointerEvents: isVisible ? 'auto' : 'none',
        ...positionStyle,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={e => {
        if (isHighlighted) {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
      }}
      aria-label={`Connection point: ${position} of task`}
      role="button"
      tabIndex={isVisible ? 0 : -1}
    />
  );
};

ConnectionNode.displayName = 'ConnectionNode';
