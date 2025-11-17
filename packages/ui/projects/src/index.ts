// Main Components
export {ProjectDashboard} from './components/ProjectDashboard';
export {ProjectDetail} from './components/ProjectDetail';
export {ProjectForm} from './components/ProjectForm';
export {ProjectRouter} from './components/ProjectRouter';
export {Projects} from './Projects';
export type {ProjectsProps} from './Projects';

// List Components
export {ListProjects} from './components/ListProjects';
export {RenderRowAction} from './components/RenderRowActions';

// Hooks
export {
  useCreateProject,
  useDeleteProject,
  useGetProject,
  useGetProjectList,
  useUpdateProject,
} from './hooks/useProjectList';
export type {UseProjectListParams} from './hooks/useProjectList';

// Types
export type {ProjectRoute} from './components/ProjectRouter';

// Re-export types from core for convenience
export type {TProject, TProjectListResponse} from '@wms/core';
