import {TaskResponse} from './common';
import {GanttThemeApiResponse, GanttThemeConfig} from './theme';

export type ApiMutationType = {
  signIn: {
    url: {
      baseUrl: '/auth/login';
    };
    method: 'post';
    payload: {
      authCode: string;
    };
    response: any;
  };
  login: {
    url: {
      baseUrl: '/auth/login';
    };
    method: 'post';
    payload: {
      email: string;
      password: string;
    };
    response: {
      accessToken: string;
    };
  };
  register: {
    url: {
      baseUrl: '/auth/register';
    };
    method: 'post';
    payload: {
      name: string;
      email: string;
      password: string;
    };
    response: {
      message: string;
    };
  };
  logout: {
    url: {
      baseUrl: '/auth/logout';
    };
    method: 'post';
    payload: {token: string};
    response: boolean;
  };
  forgotPWD: {
    url: {
      baseUrl: '/auth/forgot-password';
    };
    method: 'post';
    payload: {
      email: string;
    };
    response: any;
  };
  verifyResetPWDToken: {
    url: {
      baseUrl: '/auth/reset-password/verify';
    };
    method: 'post';
    payload: {
      token: string;
    };
    response: any;
  };
  setPWD: {
    url: {
      baseUrl: '/auth/reset-password';
    };
    method: 'post';
    payload: {
      token: string;
      password: string;
    };
    response: any;
  };
  updateProfile: {
    url: {
      baseUrl: '/profile/update';
    };
    method: 'put';
    payload: {
      name?: string;
      email?: string;
      password?: string;
    };
    response: {
      message: string;
    };
  };

  deleteUser: {
    url: {
      baseUrl: '/users/:id';
      urlParams: {
        id: string;
      };
    };
    method: 'delete';
    response: {
      message: string;
    };
  };
  exportCompany: {
    url: {
      baseUrl: '/companies/download-excel';
      queryParams?: {
        search?: string | null;
        industryCode?: string;
        getOptions?: boolean;
        roleCompany?: string;
      };
    };
    type: 'crm';
    method: 'get';
    response: any;
  };
  /** REGISTER APP */
  ganttRegisterApp: {
    url: {baseUrl: '/gantt/register'};
    method: 'post';
    payload: {
      appId: string;
      appName: string;
      description?: string;
      schema?: Record<string, any>;
      transformationRules?: Record<string, any>;
      webhookUrl?: string;
      apiKey?: string;
    };
    response: {appId: string; createdAt?: string};
  };

  /** PROJECTS */
  ganttCreateProject: {
    url: {
      baseUrl: '/gantt/projects';
    };
    method: 'post';
    payload: {
      externalId?: string;
      name: string;
      assignee?: {
        id: string;
        name?: string;
        email?: string;
      };
      description: string;
      key: string;
      contextKey?: string;
      startDate: string; // ISO string format
      endDate: string; // ISO string format
      actualStartDate?: string;
      actualEndDate?: string;
      status: 'active' | 'inactive' | 'completed' | 'on-hold';
    };
    response: any;
  };
  ganttUpdateProject: {
    url: {
      baseUrl: '/gantt/projects/:projectId';
      urlParams: {projectId: string};
    };
    method: 'put';
    payload: Partial<{
      externalId?: string;
      name: string;
      assignee?: {
        id: string;
        name?: string;
        email?: string;
      };
      description: string;
      key: string;
      contextKey?: string;
      startDate: string; // ISO string format
      endDate: string; // ISO string format
      actualStartDate?: string;
      actualEndDate?: string;
      status: 'active' | 'inactive' | 'completed' | 'on-hold';
    }>;
    response: any;
  };
  ganttDeleteProject: {
    url: {
      baseUrl: '/gantt/projects/:projectId';
      urlParams: {projectId: string};
    };
    method: 'delete';
    response: any;
  };

  /** TASKS */
  ganttCreateTask: {
    url: {
      baseUrl: '/gantt/:projectId/tasks';
      urlParams: {projectId: string};
    };
    method: 'post';
    payload: {
      externalId?: string;
      name: string;
      description?: string;
      notes?: string;
      startDate: string; // ISO8601 format
      endDate: string; // ISO8601 format
      status?: string;
      progress?: number;
      priority?: string;
      manager?: string;
      parentId?: string;
      tags?: string[];
      // New fields for modern task structure
      attributes?: {
        status: string;
        priority: string;
        assignee?: {
          id: string;
          name?: string;
          email?: string;
        };
      };
      customFields?: {
        typeId: string;
        name: string;
        key: string;
        description?: string;
        value: any;
        orderIndex: number;
        isRequired: boolean;
      }[];
    };
    response: TaskResponse;
  };
  ganttUpdateTask: {
    url: {
      baseUrl: '/gantt/:projectId/tasks/:taskId';
      urlParams: {projectId: string; taskId: string};
    };
    method: 'put' | 'patch';
    payload: Partial<{
      externalId: string;
      name: string;
      description: string;
      notes: string;
      startDate: string; // ISO8601 format
      endDate: string; // ISO8601 format
      status: string;
      progress: number;
      priority: string;
      manager: string;
      parentId: string;
      tags: string[];
      // New fields for modern task structure
      attributes: {
        status: string;
        priority: string;
        assignee?: {
          id: string;
          name?: string;
          email?: string;
        };
      };
      customFields: {
        typeId: string;
        name: string;
        key: string;
        description?: string;
        value: any;
        orderIndex: number;
        isRequired: boolean;
      }[];
    }>;
    response: TaskResponse;
  };
  ganttUpdateFieldTask: {
    url: {
      baseUrl: '/gantt/:projectId/tasks/:taskId';
      urlParams: {projectId: string; taskId: string};
    };
    method: 'patch';
    payload: {
      assignee?: {id: string} | null;
      status?: string;
      startDate?: string;
      endDate?: string;
    };
    response: TaskResponse;
  };
  ganttDeleteTask: {
    url: {
      baseUrl: '/gantt/:projectId/tasks/:taskId';
      urlParams: {projectId: string; taskId: string};
    };
    method: 'delete';
    response: {success?: boolean};
  };
  ganttCreateRelation: {
    url: {
      baseUrl: '/task-relations';
    };
    method: 'post';
    payload: {
      projectId?: string;
      sourceTaskId?: string;
      targetTaskId?: string;
      relationType?: string;
      delayDays?: number;
    };
    response: any;
  };
  exportExcel: {
    url: {
      baseUrl: '/gantt/excel/:projectId';
      urlParams: {projectId: string};
    };
    method: 'post';
    payload: {
      projectId?: string;
      startDate?: string;
      endDate?: string;
      taskIds?: string[];
      includeSubtasks?: boolean;
      statusFilter?: string[];
      assigneeFilter?: string[];
    };
    response: any;
  };

  /** THEME */
  ganttUpdateTheme: {
    url: {
      baseUrl: '/gantt/:projectId/theme';
      urlParams: {projectId: string};
    };
    method: 'put';
    payload: GanttThemeConfig;
    response: GanttThemeApiResponse;
  };
};
