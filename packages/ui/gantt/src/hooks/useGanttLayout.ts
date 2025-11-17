import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const UI_CONSTANTS = {
  DEFAULT_TREE_WIDTH: 400,
  MIN_TREE_WIDTH: 300,
  MAX_TREE_WIDTH: 800,
  SCROLLBAR_HEIGHT: 17,
};

export function useGanttLayout(totalWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [treeWidth, setTreeWidth] = useState<number>(
    UI_CONSTANTS.DEFAULT_TREE_WIDTH,
  );
  const [containerWidth, setContainerWidth] = useState(1200);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const maxScroll = Math.max(0, totalWidth - containerWidth);

  // Immediate tree width change handler for smooth dragging
  const handleTreeWidthChange = useCallback((newWidth: number) => {
    // Apply constraints immediately
    const constrainedWidth = Math.max(
      UI_CONSTANTS.MIN_TREE_WIDTH,
      Math.min(UI_CONSTANTS.MAX_TREE_WIDTH, newWidth),
    );

    setTreeWidth(constrainedWidth);
  }, []);

  const onBottomScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const x = (e.currentTarget as HTMLDivElement).scrollLeft;
      setScrollX(Math.min(Math.max(0, x), maxScroll));
    },
    [maxScroll],
  );

  // Handle vertical scroll sync between timeline and tree
  const handleScrollY = useCallback((newScrollY: number) => {
    setScrollY(newScrollY);
  }, []);

  // Container width tracking
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current)
        setContainerWidth(containerRef.current.offsetWidth);
    };
    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  // Viewport width tracking
  useLayoutEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver(() => setViewportWidth(el.clientWidth));
    setViewportWidth(el.clientWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll synchronization
  useEffect(() => {
    setScrollX((x) =>
      Math.min(Math.max(0, x), Math.max(0, totalWidth - viewportWidth)),
    );
  }, [totalWidth, viewportWidth]);

  useEffect(() => {
    if (
      bottomRef.current &&
      Math.abs(bottomRef.current.scrollLeft - scrollX) > 1
    ) {
      bottomRef.current.scrollLeft = scrollX;
    }
  }, [scrollX]);

  return {
    // Refs
    containerRef,
    bottomRef,
    viewportRef,

    // State
    treeWidth,
    containerWidth,
    viewportWidth,
    scrollX,
    scrollY,

    // Handlers
    handleTreeWidthChange,
    onBottomScroll,
    setScrollX,
    handleScrollY,

    // Constants
    UI_CONSTANTS,
  };
}
