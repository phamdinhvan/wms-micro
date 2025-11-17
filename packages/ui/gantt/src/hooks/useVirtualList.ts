import {useMemo} from 'react';

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export interface UseVirtualListOptions {
  itemCount: number;
  itemSize: number;
  containerHeight: number;
  scrollTop: number;
  overscan?: number;
}

export interface UseVirtualListResult {
  items: VirtualItem[];
  totalSize: number;
}

/**
 * Simple virtual list hook - original approach
 * Renders only visible items + overscan buffer for performance
 */
export function useVirtualList({
  itemCount,
  itemSize,
  containerHeight,
  scrollTop,
  overscan = 5,
}: UseVirtualListOptions): UseVirtualListResult {
  return useMemo(() => {
    if (itemCount === 0) {
      return {
        items: [],
        totalSize: 0,
      };
    }

    const totalSize = itemCount * itemSize;

    // Calculate visible range
    const startIndex = Math.floor(scrollTop / itemSize);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemSize),
    );

    // Add overscan
    const overscanStartIndex = Math.max(0, startIndex - overscan);
    const overscanEndIndex = Math.min(itemCount - 1, endIndex + overscan);

    // Generate virtual items
    const items: VirtualItem[] = [];
    for (let i = overscanStartIndex; i <= overscanEndIndex; i++) {
      items.push({
        index: i,
        start: i * itemSize,
        size: itemSize,
      });
    }

    return {
      items,
      totalSize,
    };
  }, [itemCount, itemSize, containerHeight, scrollTop, overscan]);
}
