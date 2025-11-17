'use client';

import {TProject} from '@wms/core';
import {ListProjects} from './ListProjects';
import {ProjectForm} from './ProjectForm';

// Route types for project navigation
export type ProjectRoute =
  | {type: 'list'}
  | {type: 'create'}
  | {type: 'edit'; projectId: string};

export interface ProjectRouterProps {
  route?: ProjectRoute;
  onRouteChange?: (route: ProjectRoute) => void;
  contextKey?: string;
  paths?: {
    list?: string;
    create?: string;
    edit?: string;
    view?: string;
    detail?: string;
  };
}

/**
 * ProjectRouter component for navigation between project pages
 */
export function ProjectRouter({
  route = {type: 'list'},
  onRouteChange,
  contextKey,
  paths,
}: ProjectRouterProps) {
  const handleNavigateToCreate = () => onRouteChange?.({type: 'create'});
  const handleNavigateToEdit = (projectId: string) => {
    console.log(
      '🔄 ProjectRouter: handleNavigateToEdit called with:',
      projectId,
    );
    onRouteChange?.({type: 'edit', projectId});
  };

  switch (route.type) {
    case 'create':
      return (
        <ProjectForm
          mode="create"
          onBack={() => onRouteChange?.({type: 'list'})}
          onProjectCreated={(_project: TProject) =>
            onRouteChange?.({type: 'list'})
          }
        />
      );

    case 'edit':
      return (
        <ProjectForm
          mode="edit"
          projectId={route.projectId}
          onBack={() => onRouteChange?.({type: 'list'})}
          onProjectUpdated={(_project: TProject) =>
            onRouteChange?.({type: 'list'})
          }
          onProjectDeleted={(_projectId: string) =>
            onRouteChange?.({type: 'list'})
          }
        />
      );

    case 'list':
    default:
      return (
        <ListProjects
          contextKey={contextKey}
          paths={paths}
          onCreateProject={handleNavigateToCreate}
          onEditProject={handleNavigateToEdit}
          onViewProject={handleNavigateToEdit}
        />
      );
  }
}
