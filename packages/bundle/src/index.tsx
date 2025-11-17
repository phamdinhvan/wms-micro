import {Board} from '@wms/board';
import {appConfig} from '@wms/core';
import {Gantt} from '@wms/gantt';
import {List} from '@wms/list';
import {
  ListProjects,
  ProjectDetail,
  ProjectForm,
  ProjectRoute,
  Projects,
} from '@wms/projects';
import {createApp, MountOptions} from './runtime/mount';

type MountCompOptions = Omit<MountOptions, 'render'>;

// URL routing utilities
function parseProjectRoute(pathname: string): ProjectRoute {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] !== 'projects') {
    return {type: 'list'};
  }

  if (segments.length === 1) {
    return {type: 'list'};
  }

  if (segments[1] === 'create') {
    return {type: 'create'};
  }

  if (segments[1] && segments[2] === 'edit') {
    return {type: 'edit', projectId: segments[1]};
  }

  // Default fallback
  return {type: 'list'};
}

function routeToPath(route: ProjectRoute): string {
  switch (route.type) {
    case 'list':
      return '/projects';
    case 'create':
      return '/projects/create';
    case 'edit':
      return `/projects/${route.projectId}/edit`;
    default:
      return '/projects';
  }
}

// URL-aware project mount function
function mountProjectsWithRouter(
  container: HTMLElement,
  opts?: {
    lang?: string;
    theme?: any;
    appId?: string;
    code?: string;
    basePath?: string; // e.g., '/admin' if projects are at /admin/projects
    onNavigate?: (path: string) => void; // callback for navigation
  },
) {
  const basePath = opts?.basePath || '';

  // Get initial route from current URL
  const getCurrentRoute = (): ProjectRoute => {
    const pathname = window.location.pathname;
    const relativePath = pathname.startsWith(basePath)
      ? pathname.slice(basePath.length)
      : pathname;
    return parseProjectRoute(relativePath);
  };

  // Handle route changes
  const handleRouteChange = (route: ProjectRoute) => {
    const newPath = basePath + routeToPath(route);

    if (opts?.onNavigate) {
      opts.onNavigate(newPath);
    } else {
      // Default: use History API
      window.history.pushState({}, '', newPath);
    }
  };

  // Handle browser back/forward
  const handlePopState = () => {
    // Re-render with new route
    app.render({});
  };

  window.addEventListener('popstate', handlePopState);

  const app = createApp({
    lang: opts?.lang,
    theme: opts?.theme,
    render: () => (
      <Projects
        appId={opts?.appId}
        code={opts?.code}
        route={getCurrentRoute()}
        onRouteChange={handleRouteChange}
      />
    ),
  });

  const unmount = app.mount(container);

  // Return enhanced unmount function
  return () => {
    window.removeEventListener('popstate', handlePopState);
    unmount();
  };
}

/** API công khai: mount nhanh từng view */
function mountGantt(
  container: HTMLElement,
  opts?: {
    lang?: string;
    theme?: any;
    appId?: string;
    code?: string;
    contextKey?: string;
    assignees?: any[];
    eventCallbacks?: any;
    bus?: any;
    taskFieldsConfig?: any; // ✅ Add taskFieldsConfig to opts type
  },
) {
  // Initialize appConfig BEFORE creating app
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...(opts || {}),
    render: () => (
      <Gantt
        locale={opts?.lang as 'en' | 'vi' | 'ja'}
        contextKey={opts?.contextKey}
        assignees={opts?.assignees}
        eventCallbacks={opts?.eventCallbacks}
        bus={opts?.bus}
        taskFieldsConfig={opts?.taskFieldsConfig} // ✅ Pass taskFieldsConfig to Gantt
      />
    ),
  });
  return app.mount(container);
}

function mountBoard(container: HTMLElement, opts?: MountCompOptions) {
  const app = createApp({
    ...(opts || {}),
    render: () => <Board />,
  });
  return app.mount(container);
}

function mountList(container: HTMLElement, opts?: MountCompOptions) {
  const app = createApp({
    ...(opts || {}),
    render: () => <List />,
  });
  return app.mount(container);
}

// Project mount functions
function mountProjects(
  container: HTMLElement,
  opts?: MountCompOptions & {appId?: string; code?: string},
) {
  // Initialize appConfig BEFORE creating app
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...opts,
    render: () => <Projects appId={opts?.appId} code={opts?.code} />,
  });
  return app.mount(container);
}

function mountListProjects(
  container: HTMLElement,
  opts?: MountCompOptions & {
    appId?: string;
    code?: string;
    paths?: {
      create?: string;
      edit?: string;
      view?: string;
      list?: string;
      gantt?: string;
    };
    onCreate?: () => void;
    onGantt?: (projectId: string) => void;
    showGanttButton?: boolean;
    apiUrl?: string;
    contextKey?: string;
  },
) {
  console.log('🚀 mountListProjects called with options:', {
    hasMantineProvider: opts?.hasMantineProvider,
    appId: opts?.appId ? `${opts.appId.substring(0, 8)}...` : 'undefined',
    code: opts?.code ? `${opts.code.substring(0, 8)}...` : 'undefined',
    apiUrl: opts?.apiUrl,
    lang: opts?.lang,
    containerInfo: {
      tagName: container.tagName,
      id: container.id,
      className: container.className,
      childrenCount: container.children.length,
    },
  });

  // FORCE initialize appConfig to ensure clean state
  if (opts?.appId || opts?.code) {
    appConfig.forceInitialize({
      appId: opts?.appId,
      code: opts?.code,
      apiUrl: opts?.apiUrl,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...opts,
    render: () => (
      <ListProjects
        onCreateProject={opts?.onCreate}
        onGanttProject={opts?.onGantt}
        showGanttButton={opts?.showGanttButton}
        paths={opts?.paths}
        contextKey={opts?.contextKey}
      />
    ),
  });

  // Mount and add debugging
  const unmount = app.mount(container);

  // Add debugging to check component status
  const checkStatus = () => {
    const wmsScope = container.querySelector('#wms-scope');
    const wmsStyles = container.querySelectorAll('style[data-wms="css"]');
    const wmsStylesContainer = container.querySelector(
      '[data-wms-styles="true"]',
    );

    console.log('🔍 Component status:', {
      timestamp: new Date().toISOString(),
      wmsScope: !!wmsScope,
      wmsScopeContent: wmsScope?.innerHTML?.length || 0,
      stylesCount: wmsStyles.length,
      stylesContainer: !!wmsStylesContainer,
      containerChildren: container.children.length,
      containerVisible: container.offsetWidth > 0 && container.offsetHeight > 0,
    });
  };

  // Check status at different intervals
  setTimeout(checkStatus, 100); // 0.1s
  setTimeout(checkStatus, 500); // 0.5s
  setTimeout(checkStatus, 1000); // 1s
  setTimeout(checkStatus, 2000); // 2s

  return unmount;
}

function mountCreateProject(
  container: HTMLElement,
  opts?: MountCompOptions & {
    appId?: string;
    code?: string;
    contextKey?: string;
    paths?: {
      list?: string;
      detail?: string;
      edit?: string;
    };
    onBack?: () => void;
    onProjectCreated?: (project: any) => void;
  },
) {
  // Initialize appConfig BEFORE creating app
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...opts,
    render: () => (
      <ProjectForm
        mode="create"
        paths={opts?.paths}
        contextKey={opts?.contextKey}
        onBack={opts?.onBack}
        onProjectCreated={opts?.onProjectCreated}
      />
    ),
  });
  return app.mount(container);
}

function mountEditProject(
  container: HTMLElement,
  projectId: string,
  opts?: MountCompOptions & {
    appId?: string;
    code?: string;
    contextKey?: string;
    navigationContext?: {
      source: 'list' | 'detail' | 'unknown';
      returnPath?: string;
    };
    paths?: {
      list?: string;
      detail?: string;
      edit?: string;
    };
    onBack?: () => void;
    onProjectUpdated?: (project: any) => void;
    onProjectDeleted?: (id: string) => void;
  },
) {
  // Initialize appConfig BEFORE creating app
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...opts,
    render: () => (
      <ProjectForm
        mode="edit"
        projectId={projectId}
        contextKey={opts?.contextKey}
        navigationContext={opts?.navigationContext}
        paths={opts?.paths}
        onBack={opts?.onBack}
        onProjectUpdated={opts?.onProjectUpdated}
        onProjectDeleted={opts?.onProjectDeleted}
      />
    ),
  });
  return app.mount(container);
}

// Detail
function mountDetailProject(
  container: HTMLElement,
  projectId: string,
  opts?: MountCompOptions & {
    appId?: string;
    code?: string;
    contextKey?: string;
    paths?: {
      list?: string;
      detail?: string;
      edit?: string;
    };
    onBack?: () => void;
  },
) {
  // Initialize appConfig BEFORE creating app
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...opts,
    render: () => (
      <ProjectDetail
        projectId={projectId}
        paths={opts?.paths}
        contextKey={opts?.contextKey}
        onBack={opts?.onBack}
      />
    ),
  });
  return app.mount(container);
}

// Xuất global (IIFE) và ESM named exports
export const WmsUI = {
  mountGantt,
  mountBoard,
  mountList,
  mountProjects,
  mountProjectsWithRouter, // New URL-aware function
  mountListProjects,
  mountCreateProject,
  mountEditProject,
  mountDetailProject,
  // Utility functions for custom routing
  parseProjectRoute,
  routeToPath,
};

export {
  mountBoard,
  mountCreateProject,
  mountDetailProject,
  mountEditProject,
  mountGantt,
  mountList,
  mountListProjects,
  mountProjects,
  mountProjectsWithRouter,
  parseProjectRoute,
  routeToPath,
};

export default WmsUI;
