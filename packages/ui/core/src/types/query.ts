import {
  CustomFieldType,
  ItemResponse,
  ListResponse,
  TaskResponse,
  TProject,
  TProjectListResponse,
} from './common';
import {TMountainChartResponse} from './gantt';
import {TaskDetail} from './task';
import {GanttThemeApiResponse} from './theme';

// Master data types for external APIs
export type TUser = {
  id: string;
  name: string;
  email: string;
};

export type TUserListResponse = {
  success: boolean;
  statusCode: number;
  data: TUser[];
};

export type TStatus = {
  id: string;
  name: string;
  value: string;
};

export type TStatusListResponse = {
  success: boolean;
  statusCode: number;
  data: TStatus[];
};

export type ApiQueryType = {
  getMe: {
    url: {
      baseUrl: '/profile';
    };
    response: {
      id: string;
      name: string;
      email: string;
      role?: string;
    };
  };
  getProfile: {
    url: {
      baseUrl: '/auth/profile';
    };
    response: any;
  };
  getAllUsers: {
    url: {
      baseUrl: '/users';
      queryParams?: {
        page?: number;
        limit?: number;
        keyword?: string;
      };
    };
    response: {
      data: {
        id: string;
        name: string;
        email: string;
      }[];
      total: number;
    };
  };

  getUserById: {
    url: {
      baseUrl: '/users/:id';
      urlParams: {
        id: string;
      };
    };
    response: {
      id: string;
      name: string;
      email: string;
      createdAt: string;
    };
  };
  /** PROJECTS */
  ganttGetProjects: {
    response: TProjectListResponse;
    url: {
      baseUrl: '/gantt/projects';
      queryParams?: {
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
        priority?: string;
        assignee?: string;
        startFrom?: string;
        endTo?: string;
        contextKey?: string;
        [k: string]: any;
      };
    };
  };
  ganttGetProjectById: {
    response: ItemResponse<TProject>;
    url: {
      baseUrl: '/gantt/projects/:projectId';
      urlParams: {projectId: string};
    };
  };
  ganttGetProjectStats: {
    response: any;
    url: {
      baseUrl: '/gantt/projects/:projectId/stats';
      urlParams: {projectId: string};
    };
  };

  /** TASKS */
  ganttGetTasks: {
    response: ListResponse<TaskResponse>;
    url: {
      baseUrl: '/gantt/:projectId/tasks';
      urlParams: {projectId: string};
      queryParams?: {
        status?: string;
        assignee?: string;
        from?: string; // ISO8601 format
        to?: string; // ISO8601 format
        page?: number;
        limit?: number;
        search?: string;
        [k: string]: any;
      };
    };
  };

  getPossibleTargetsTasks: {
    response: {data: TaskResponse[]};
    url: {
      baseUrl: '/gantt/:projectId/tasks/possible-targets-tasks';
      urlParams: {projectId: string};
      queryParams?: {
        taskId?: string;
        parentId?: string;
      };
    };
  };

  ganttGetTaskById: {
    response: {data: TaskDetail};
    url: {
      baseUrl: '/gantt/:projectId/tasks/:taskId';
      urlParams: {projectId: string; taskId: string};
    };
  };
  ganttChart: {
    response: ListResponse<TaskResponse>;
    url: {
      baseUrl: '/gantt/:projectId/gantt-chart';
      urlParams: {projectId: string};
      queryParams?: {
        status?: string;
        assignee?: string;
        from?: string; // ISO8601 format
        to?: string; // ISO8601 format
        search?: string;
        [k: string]: any;
      };
    };
  };
  ganttConfig: {
    response: any;
    url: {
      baseUrl: '/gantt/:projectId/task-config';
      urlParams: {projectId: string};
      queryParams?: {
        [k: string]: any;
      };
    };
  };

  /** UI (optional) */
  ganttGetUiData: {
    response: any;
    url: {baseUrl: '/gantt/ui/:appId/data'; urlParams: {appId: string}};
  };
  ganttGetUiTasks: {
    response: ListResponse<any>;
    url: {
      baseUrl: '/gantt/ui/:appId/tasks';
      urlParams: {appId: string};
      queryParams?: Record<string, any>;
    };
  };

  /** THEME */
  ganttGetTheme: {
    response: GanttThemeApiResponse;
    url: {
      baseUrl: '/gantt/:projectId/theme';
      urlParams: {projectId: string};
    };
  };

  /** EXTERNAL MASTER DATA APIs */
  externalUsers: {
    response: TUserListResponse;
    url: {
      baseUrl: '/external/users';
      queryParams?: {contractId?: string};
    };
  };

  externalStatus: {
    response: TStatusListResponse;
    url: {
      baseUrl: '/external/status';
      queryParams?: {contextKey?: string};
    };
  };

  ganttCustomFieldTypes: {
    response: ListResponse<CustomFieldType>;
    url: {
      baseUrl: '/gantt/custom-field-types';
      queryParams?: {contextKey?: string};
    };
  };

  ganttMountainChart: {
    response: TMountainChartResponse;
    url: {
      baseUrl: '/gantt/:projectId/chart-bar';
      urlParams: {projectId: string};
      queryParams?: {
        startDate?: string; // ISO8601 format
        duration?: number; // months
        [k: string]: any;
      };
    };
  };
};
