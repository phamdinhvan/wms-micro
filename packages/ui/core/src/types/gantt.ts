import {
  ExternalLinkRequest,
  TProject,
  TaskEventData,
  TaskResponse,
} from './common';

export type GanttEventCallbacks = {
  onTaskEvent?: (eventData: TaskEventData) => void;
  onExternalLinkRequest?: (linkData: ExternalLinkRequest) => void;
  onTaskSelect?: (task: TaskResponse | null) => void;
  onProjectChange?: (project: TProject | null) => void;
};

export type GanttChartResponse = {
  data: {
    ganttGroups: GanttGroup[];
    grouping: {
      id: number;
      name: string;
    };
    // Backward compatibility fields
    items?: TaskResponse[];
    total?: number;
  };
};

export type GanttGroup = {
  items: TaskResponse[];
  type: string;
  key?: string;
  name?: string;
};

export type TMountainChartItemWorkforce = {
  date: string;
  totalWorkforce: number;
  statusWorkforce: {
    new: number;
    progress: number;
    completed: number;
    closed: number;
  };
};

export type TMountainChartResponse = {
  data: {
    averageTotalWorkforce: number;
    items: TMountainChartItemWorkforce[];
    totalDays: number;
  };
};