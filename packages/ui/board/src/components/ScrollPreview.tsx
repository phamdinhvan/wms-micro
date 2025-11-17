import React, {useEffect, useRef, useState} from 'react';

interface HorizontalScrollPreviewProps {
  children: React.ReactNode;
  isLoading?: boolean;
  thumbWidth?: number;
  previewWidth?: number;
  previewHeight?: number;
  totalColumn?: number;
  subtractHeight?: number;
}

const HorizontalScrollPreview: React.FC<HorizontalScrollPreviewProps> = ({
  children,
  isLoading = false,
  thumbWidth = 40,
  previewWidth = 100,
  previewHeight = 60,
  totalColumn = 10,
  subtractHeight = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        setHasScroll(
          containerRef.current.scrollWidth > containerRef.current.clientWidth,
        );
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  // Show scrollbar when hovering or scrolling
  const handleMouseEnter = () => {
    clearHideTimeout();
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHideTimeout();
    }
  };

  const setHideTimeout = () => {
    clearHideTimeout();
  };

  const clearHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Handle scroll events
  const handleScroll = () => {
    clearHideTimeout();
    setHideTimeout();
  };

  // Handle click/drag on the scrollbar
  const handleScrollbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleScrollbarDrag);
    document.addEventListener('mouseup', handleScrollbarMouseUp);
    // Start the scroll position at the position of the click
    handleScrollJump(e);
  };

  const handleScrollbarMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleScrollbarDrag);
    document.removeEventListener('mouseup', handleScrollbarMouseUp);
    setHideTimeout();
  };

  const handleScrollbarDrag = (e: MouseEvent) => {
    handleScrollJump({
      clientX: e.clientX,
      currentTarget: scrollbarRef.current,
    } as any);
  };

  // Jump to a specific scroll position when clicking on the scrollbar
  const handleScrollJump = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !scrollbarRef.current) return;

    const scrollbarRect = scrollbarRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - scrollbarRect.left;
    const scrollbarWidth = scrollbarRect.width;
    const scrollPercentage = clickPosition / scrollbarWidth;

    const {scrollWidth, clientWidth} = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const newScrollLeft = maxScroll * scrollPercentage;

    containerRef.current.scrollLeft = newScrollLeft;
  };

  // Clean up event listeners and timeouts
  useEffect(() => {
    return () => {
      clearHideTimeout();
      document.removeEventListener('mousemove', handleScrollbarDrag);
      document.removeEventListener('mouseup', handleScrollbarMouseUp);
    };
  }, []);

  const ScrollPreviewSkeleton: React.FC = () => {
    return (
      <div className="wms-flex wms-size-full wms-flex-col wms-gap-1">
        <div className="wms-flex wms-size-full wms-gap-[2px]">
          {Array.from({length: totalColumn}).map((_, index) => (
            <div
              key={index}
              className="wms-size-full wms-rounded-sm wms-bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="wms-relative wms-size-full"
      ref={scrollRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`wms-w-full wms-overflow-x-auto wms-overflow-y-hidden`}
        style={{height: `calc(100vh - ${subtractHeight}px)`}}>
        {children}
      </div>

      {/* Custom Horizontal Scrollbar */}
      <div
        ref={scrollbarRef}
        className={`wms-fixed wms-bottom-8 wms-right-8 wms-h-6 wms-rounded-lg wms-bg-white wms-p-1 wms-shadow-md wms-transition-opacity wms-duration-300 ${
          isLoading || !hasScroll ? 'wms-opacity-0' : 'wms-opacity-100'
        }`}
        style={{
          width: previewWidth,
          height: previewHeight,
          zIndex: 100,
        }}>
        <div className="wms-relative wms-size-full">
          <div className="wms-pointer-events-auto wms-absolute wms-inset-0 wms-overflow-hidden">
            <div className="wms-relative wms-size-full">
              <ScrollPreviewSkeleton />
            </div>
          </div>

          <HorizontalScrollThumb
            containerRef={containerRef}
            thumbWidth={thumbWidth}
            onMouseDown={handleScrollbarMouseDown}
          />
        </div>
      </div>
    </div>
  );
};

// Separate component for the scrollbar thumb
interface HorizontalScrollThumbProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  thumbWidth?: number;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const HorizontalScrollThumb: React.FC<HorizontalScrollThumbProps> = ({
  containerRef,
  thumbWidth = 40,
  onMouseDown,
}) => {
  const [thumbStyle, setThumbStyle] = useState({
    left: '0%',
    width: '30%',
  });

  // Update the thumb position and size based on scroll
  useEffect(() => {
    const updateThumb = () => {
      if (!containerRef.current) return;

      const {scrollLeft, scrollWidth, clientWidth} = containerRef.current;

      // Calculate thumb width based on viewport ratio
      const viewportRatio = clientWidth / scrollWidth;
      const dynamicThumbWidth = Math.max(viewportRatio * 100, 10); // Minimum 10% width

      // Calculate scroll percentage for positioning
      const maxScroll = scrollWidth - clientWidth;
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;

      // Calculate left position accounting for dynamic width
      const maxLeftPosition = 100 - dynamicThumbWidth;
      const leftPosition = scrollPercentage * maxLeftPosition;

      setThumbStyle({
        left: `${leftPosition}%`,
        width: `${dynamicThumbWidth}%`,
      });
    };

    // Initial update
    updateThumb();

    // Add scroll event listener to the container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateThumb);
      // Add resize observer to handle container size changes
      const resizeObserver = new ResizeObserver(updateThumb);
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener('scroll', updateThumb);
        resizeObserver.disconnect();
      };
    }
  }, [containerRef.current]); // Add containerRef.current as dependency

  return (
    <div
      onMouseDown={onMouseDown}
      className={`wms-pointer-events-auto wms-absolute wms-h-full wms-cursor-move wms-border-2 wms-border-blue-500 wms-transition-colors`}
      style={thumbStyle}
    />
  );
};

export default HorizontalScrollPreview;
