import {useCallback, useEffect, useRef, useState} from 'react';

interface UseGanttScrollPanConfig {
  totalWidth: number;
  viewportWidth: number;
  scrollX: number;
  setScrollX: (x: number) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  headerContentRef: React.RefObject<HTMLDivElement | null>;
  timelineContentRef: React.RefObject<HTMLDivElement | null>;
  mountainContentRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook for handling Gantt chart scroll and pan interactions
 * Manages both scrollbar and mouse/touch pan gestures with smooth visual updates
 */
export function useGanttScrollPan(config: UseGanttScrollPanConfig) {
  const {
    totalWidth,
    viewportWidth,
    scrollX,
    setScrollX,
    bottomRef,
    headerContentRef,
    timelineContentRef,
    mountainContentRef,
  } = config;

  // Scroll syncing state
  const scrollSyncingRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);

  // Pan state
  const lastVisualXRef = useRef<number>(scrollX);
  const panActiveRef = useRef(false);
  const panStartXRef = useRef(0);
  const panStartScrollRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Clamp scroll position to valid range
  const clamp = useCallback(
    (x: number) =>
      Math.min(Math.max(0, x), Math.max(0, totalWidth - viewportWidth)),
    [totalWidth, viewportWidth],
  );

  // Apply visual transform to header, timeline and mountain chart
  const applyTransform = useCallback(
    (x: number) => {
      lastVisualXRef.current = x;

      // Apply visual translate to header, timeline and mountain chart
      if (headerContentRef.current) {
        headerContentRef.current.style.transform = `translate3d(-${x}px,0,0)`;
      }
      if (timelineContentRef.current) {
        timelineContentRef.current.style.transform = `translate3d(-${x}px,0,0)`;
      }
      if (mountainContentRef?.current) {
        mountainContentRef.current.style.transform = `translate3d(-${x}px,0,0)`;
      }

      // Sync bottom scrollbar position
      if (bottomRef.current) {
        scrollSyncingRef.current = true;
        requestAnimationFrame(() => {
          if (bottomRef.current) bottomRef.current.scrollLeft = x;
          Promise.resolve().then(() => (scrollSyncingRef.current = false));
        });
      }
    },
    [bottomRef, headerContentRef, timelineContentRef, mountainContentRef],
  );

  // Keep DOM in sync when scrollX changes
  useEffect(() => {
    applyTransform(scrollX);
  }, [scrollX, applyTransform]);

  // Begin pan gesture
  const beginPan = useCallback((clientX: number, target: HTMLElement) => {
    // Don't hijack task or resize interactions
    if (target.closest('.wms-task') || target.closest('.resize-handle')) return;

    panActiveRef.current = true;
    setIsPanning(true);
    panStartXRef.current = clientX;
    panStartScrollRef.current = lastVisualXRef.current;
  }, []);

  // Update pan position
  const doPan = useCallback(
    (clientX: number) => {
      if (!panActiveRef.current) return;
      const next = panStartScrollRef.current - (clientX - panStartXRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        applyTransform(clamp(next));
      });
    },
    [applyTransform, clamp],
  );

  // End pan gesture
  const endPan = useCallback(() => {
    if (!panActiveRef.current) return;
    panActiveRef.current = false;
    setIsPanning(false);
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Commit final state
    setScrollX(clamp(lastVisualXRef.current));
  }, [setScrollX, clamp]);

  // Handle bottom scrollbar scroll
  const onBottomScrollSmooth: React.UIEventHandler<HTMLDivElement> = e => {
    if (scrollSyncingRef.current) return;
    const el = e.currentTarget;
    const next = clamp(el.scrollLeft);

    // Visual-only update
    if (scrollRafRef.current != null)
      cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => applyTransform(next));

    // Commit once user stops scrolling
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = window.setTimeout(() => {
      setScrollX(clamp(lastVisualXRef.current));
    }, 80);
  };

  return {
    isPanning,
    beginPan,
    doPan,
    endPan,
    onBottomScrollSmooth,
    panActiveRef,
  };
}
