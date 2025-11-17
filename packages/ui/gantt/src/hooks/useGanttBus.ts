// src/lib/hooks/useGanttBus.ts
import {useRef} from 'react';
import {createEmitter, GanttBusEvents, GanttEmitter} from '../bus/ganttBus';

/**
 * Hook to create and manage a Gantt event bus instance
 * This allows external components to communicate with the Gantt chart
 *
 * @returns GanttEmitter instance for event communication
 */
export function useGanttBus(): GanttEmitter<GanttBusEvents> {
  const busRef = useRef<GanttEmitter<GanttBusEvents>>(null);

  if (!busRef.current) {
    busRef.current = createEmitter<GanttBusEvents>();
  }

  return busRef.current;
}

/**
 * Create a standalone bus instance (for non-React usage)
 */
export function createGanttBus(): GanttEmitter<GanttBusEvents> {
  return createEmitter<GanttBusEvents>();
}
