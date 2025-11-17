import {ProjectDetail} from '../../src';

interface ProjectDetailPageProps {
  projectId: string;
  contextKey?: string;
  paths?: {
    list?: string;
    detail?: string;
    edit?: string;
  };
}

export function ProjectDetailPage({projectId, contextKey, paths}: ProjectDetailPageProps) {
  return (
    <ProjectDetail 
      projectId={projectId}
      contextKey={contextKey}
      paths={paths}
    />
  );
}
