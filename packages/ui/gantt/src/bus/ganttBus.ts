import {
  GanttEventCallbacks,
  TProject,
  TaskEventData,
  TaskResponse,
} from '@wms/core';

export type GanttBusEvents = {
  /** Fired by the chart when a project is selected or changed */
  'project:change': TProject | null;

  /** Fired by the chart when a task is selected (focus) */
  'task:select': TaskResponse;

  /** Fired by chart for task lifecycle events (updated, created, deleted, etc.) */
  'task:event': TaskEventData;

  /** UI intents */
  'ui:openTaskModal': {mode: 'create' | 'edit'; task?: TaskResponse | null};

  /** COMMANDS (external -> chart) */
  'cmd:setProject': {projectId: string};
  'cmd:selectTask': {taskId: string};
  'cmd:refresh': void;
  'cmd:updateTaskDates': {taskId: string; startDate: string; endDate: string};
  'cmd:openCreateTask': {parentId?: string} | void;
};

type Handler<T> = (payload: T) => void;

export interface GanttEmitter<EvtMap extends Record<string, any>> {
  on<K extends keyof EvtMap>(event: K, handler: Handler<EvtMap[K]>): () => void;
  off<K extends keyof EvtMap>(event: K, handler: Handler<EvtMap[K]>): void;
  emit<K extends keyof EvtMap>(event: K, payload: EvtMap[K]): void;
}

export function createEmitter<
  EvtMap extends Record<string, any>,
>(): GanttEmitter<EvtMap> {
  const map = new Map<keyof EvtMap, Set<Handler<any>>>();
  return {
    on(event, handler) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event)!.add(handler as Handler<any>);
      return () => {
        map.get(event)?.delete(handler as Handler<any>);
      };
    },
    off(event, handler) {
      map.get(event)?.delete(handler as Handler<any>);
    },
    emit(event, payload) {
      map.get(event)?.forEach(h => {
        try {
          h(payload);
        } catch (e) {
          console.error(e);
        }
      });
    },
  };
}

/** Optional helper to bridge props callbacks into the bus (if you ever want to) */
export function wirePropsCallbacksToBus(
  bus: GanttEmitter<GanttBusEvents>,
  cbs?: GanttEventCallbacks,
) {
  if (!cbs) return;
  // Example: If you preferred, you could forward bus -> props here.
  // Kept empty intentionally; we emit to both directly from the chart.
}
