import {useMemo} from 'react';
import {useNavigation} from '@wms/core';
import {
  ProjectListPage,
  ProjectCreatePage,
  ProjectUpdatePage,
  ProjectDetailPage,
} from '../pages';

// Route parsing helper
function parseProjectRoute(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);

  // Default to projects list if not projects route
  if (segments[0] !== 'projects') {
    return {type: 'list', projectId: null};
  }

  // /projects
  if (segments.length === 1) {
    return {type: 'list', projectId: null};
  }

  // /projects/create
  if (segments[1] === 'create') {
    return {type: 'create', projectId: null};
  }

  // /projects/:projectId/update
  if (segments[1] && segments[2] === 'update') {
    return {type: 'update', projectId: segments[1]};
  }

  // /projects/:projectId/detail
  if (segments[1] && segments[2] === 'detail') {
    return {type: 'detail', projectId: segments[1]};
  }

  // /projects/:projectId (default to detail)
  if (segments[1]) {
    return {type: 'detail', projectId: segments[1]};
  }

  return {type: 'list', projectId: null};
}

interface ProjectRouterProps {
  contextKey?: string;
  paths?: {
    list?: string;
    create?: string;
    edit?: string;
    view?: string;
    detail?: string;
  };
}

export function ProjectRouter({contextKey, paths}: ProjectRouterProps) {
  const {currentPath} = useNavigation();

  // Parse current route từ path
  const currentRoute = useMemo(() => parseProjectRoute(currentPath), [currentPath]);

  // Render appropriate page based on route
  switch (currentRoute.type) {
    case 'list':
      return <ProjectListPage contextKey={contextKey} paths={paths} />;

    case 'create':
      return <ProjectCreatePage contextKey={contextKey} paths={paths} />;

    case 'update':
      return (
        <ProjectUpdatePage
          projectId={currentRoute.projectId!}
          contextKey={contextKey}
          paths={paths}
        />
      );

    case 'detail':
      return (
        <ProjectDetailPage
          projectId={currentRoute.projectId!}
          contextKey={contextKey}
          paths={paths}
        />
      );

    default:
      return <ProjectListPage contextKey={contextKey} paths={paths} />;
  }
}
