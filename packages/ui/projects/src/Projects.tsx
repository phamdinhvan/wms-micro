'use client';
import {AppCredentialsProvider} from '@wms/core';
import {useState} from 'react';
import {ProjectRoute, ProjectRouter} from './components/ProjectRouter';

export interface ProjectsProps {
  route?: ProjectRoute;
  onRouteChange?: (route: ProjectRoute) => void;
  appId?: string;
  code?: string;
  contextKey?: string;
  paths?: {
    list?: string;
    create?: string;
    edit?: string;
    view?: string;
    detail?: string;
  };
}

export function Projects({route, onRouteChange, appId, code, contextKey, paths}: ProjectsProps) {
  const [internalRoute, setInternalRoute] = useState<ProjectRoute>({
    type: 'list',
  });

  const currentRoute = route || internalRoute;
  const handleRouteChange = onRouteChange || setInternalRoute;

  return (
    <AppCredentialsProvider appId={appId} code={code}>
      <ProjectRouter 
        route={currentRoute} 
        onRouteChange={handleRouteChange}
        contextKey={contextKey}
        paths={paths}
      />
    </AppCredentialsProvider>
  );
}
