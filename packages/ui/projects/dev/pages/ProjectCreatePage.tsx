import {Stack, Title} from '@mantine/core';
import {ProjectForm} from '../../src';

interface ProjectCreatePageProps {
  contextKey?: string;
  paths?: {
    list?: string;
    detail?: string;
    edit?: string;
  };
}

export function ProjectCreatePage({contextKey, paths}: ProjectCreatePageProps) {
  return (
    <Stack gap="md">
      <Title order={2}>➕ Create New Project</Title>
      <ProjectForm mode="create" contextKey={contextKey} paths={paths} />
    </Stack>
  );
}
