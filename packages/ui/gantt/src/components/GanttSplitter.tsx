import React, {useCallback, useEffect, useRef, useState} from 'react';

interface GanttSplitterProps {
  /** Current width of the left panel */
  width: number;
  /** Callback when width changes */
  onWidthChange: (newWidth: number) => void;
  /** Minimum width constraint */
  minWidth?: number;
  /** Maximum width constraint */
  maxWidth?: number;
  /** Container width for calculating max width */
  containerWidth?: number;
}

export const GanttSplitter: React.FC<GanttSplitterProps> = ({
  width,
  onWidthChange,
  minWidth = 200,
  maxWidth,
  containerWidth = 1200,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const splitterRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(undefined);
  const lastUpdateRef = useRef<number>(0);

  // Calculate effective max width
  const effectiveMaxWidth = maxWidth || Math.min(containerWidth * 0.6, 600);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartWidth(width);

      // Add cursor style to body during drag
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Cancel previous RAF if still pending
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use RAF for smooth updates
      rafRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - dragStartX;
        const newWidth = dragStartWidth + deltaX;

        // Apply constraints
        const constrainedWidth = Math.max(
          minWidth,
          Math.min(effectiveMaxWidth, newWidth),
        );

        // Throttle updates - only update if significant change (> 2px)
        if (Math.abs(constrainedWidth - lastUpdateRef.current) > 2) {
          onWidthChange(constrainedWidth);
          lastUpdateRef.current = constrainedWidth;
        }
      });
    },
    [
      isDragging,
      dragStartX,
      dragStartWidth,
      minWidth,
      effectiveMaxWidth,
      onWidthChange,
    ],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }

    // Remove cursor style from body
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, {
        passive: true,
      });
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <div
      ref={splitterRef}
      className={`wms-relative wms-w-1 wms-bg-gray-400 wms-cursor-col-resize wms-select-none hover:wms-bg-blue-500 wms-transition-colors wms-duration-150 ${isDragging ? 'wms-bg-blue-600' : ''} `}
      onMouseDown={handleMouseDown}
      style={{
        minHeight: '100%',
        zIndex: 10,
      }}>
      {/* Visual indicator */}
      <div
        className={`wms-absolute wms-inset-y-0 wms-left-0 wms-w-1 wms-bg-transparent ${isDragging ? 'wms-shadow-lg' : ''} `}
      />

      {/* Hover area for better UX */}
      <div
        className="wms-absolute wms-inset-y-0 wms--left-1 wms-w-3 wms-cursor-col-resize"
        title="Drag to resize panel"
      />
    </div>
  );
};
