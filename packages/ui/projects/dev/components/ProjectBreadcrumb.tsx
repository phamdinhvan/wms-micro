import {Button, Group, Text} from '@mantine/core';
import {useNavigation} from '@wms/core';

interface ProjectBreadcrumbProps {
  currentRoute: {
    type: 'list' | 'create' | 'update' | 'detail';
    projectId: string | null;
  };
  paths?: {
    list?: string;
    create?: string;
    edit?: string;
    view?: string;
    detail?: string;
  };
}

export function ProjectBreadcrumb({
  currentRoute,
  paths,
}: ProjectBreadcrumbProps) {
  const {navigate} = useNavigation();

  const handleNavigateToList = () => {
    const listPath = paths?.list || '/projects';
    navigate(listPath, {reload: true});
  };

  const handleNavigateToDetail = () => {
    if (!currentRoute.projectId) return;
    const detailPath =
      paths?.detail?.replace('{projectId}', currentRoute.projectId) ||
      `/projects/${currentRoute.projectId}/detail`;
    navigate(detailPath);
  };

  return (
    <Group gap="xs">
      <Button
        variant={currentRoute.type === 'list' ? 'filled' : 'outline'}
        size="sm"
        onClick={handleNavigateToList}>
        📋 Projects
      </Button>

      {currentRoute.type === 'create' && (
        <>
          <Text size="sm" c="dimmed">
            /
          </Text>
          <Button variant="filled" size="sm">
            ➕ Create
          </Button>
        </>
      )}

      {(currentRoute.type === 'update' || currentRoute.type === 'detail') && (
        <>
          <Text size="sm" c="dimmed">
            /
          </Text>
          <Button
            variant={currentRoute.type === 'detail' ? 'filled' : 'outline'}
            size="sm"
            onClick={handleNavigateToDetail}>
            📄 {currentRoute.projectId}
          </Button>

          {currentRoute.type === 'update' && (
            <>
              <Text size="sm" c="dimmed">
                /
              </Text>
              <Button variant="filled" size="sm">
                ✏️ Update
              </Button>
            </>
          )}
        </>
      )}
    </Group>
  );
}
