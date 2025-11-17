import {ProjectForm} from '../../src';

interface ProjectUpdatePageProps {
  projectId: string;
  contextKey?: string;
  paths?: {
    list?: string;
    detail?: string;
    edit?: string;
  };
}

export function ProjectUpdatePage({
  projectId,
  contextKey,
  paths,
}: ProjectUpdatePageProps) {
  return (
    <ProjectForm
      mode="edit"
      projectId={projectId}
      contextKey={contextKey}
      paths={paths}
    />
  );
}
