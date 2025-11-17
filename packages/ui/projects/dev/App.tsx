import {Loader, Stack, Text, Title} from '@mantine/core';
import {AppCredentialsProvider, WmsProvider, useNavigation} from '@wms/core';
import {useMemo} from 'react';
import {ProjectBreadcrumb, ProjectRouter} from './components';

// Route parsing helper
function parseProjectRoute(pathname: string): {
  type: 'list' | 'create' | 'update' | 'detail';
  projectId: string | null;
} {
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

const App = () => {
  // Sử dụng navigation hook mới
  const {currentPath} = useNavigation();

  // Mock credentials
  const mockAppId = '0199c1cb-20f3-76eb-adcb-3614128c72f5';
  const mockCode = '55059ac48c98dc5372e2e8bccec6a8f2';

  // Optional contextKey - can be passed from props or URL params
  const mockContextKey = '9fd38075-1c29-4bdc-bd3d-afd8f03fd8ad';

  // Parse current route từ path
  const currentRoute = useMemo(
    () => parseProjectRoute(currentPath),
    [currentPath],
  );

  // Custom paths configuration - có thể được truyền từ props
  const customPaths = {
    list: '/projects',
    create: '/projects/create',
    edit: '/projects/{projectId}/update',
    view: '/projects/{projectId}/detail',
    detail: '/projects/{projectId}/detail',
  };

  if (!mockAppId || !mockCode) {
    return <Loader />;
  }

  return (
    <WmsProvider>
      <AppCredentialsProvider appId={mockAppId} code={mockCode}>
        <div className="wms-h-screen wms-p-4 wms-grid wms-grid-rows-[auto_1fr] wms-gap-4 wms-overflow-hidden">
          {/* Navigation Header */}
          <div>
            <Stack gap="md">
              <Title order={1}>🚀 Project Management System</Title>

              {/* Breadcrumb Navigation */}
              <ProjectBreadcrumb
                currentRoute={currentRoute}
                paths={customPaths}
              />

              <Text size="sm" c="dimmed">
                <strong>Current URL:</strong> <code>{currentPath}</code>
              </Text>
            </Stack>
          </div>

          {/* Router - Render appropriate page based on route */}
          <div className="wms-min-h-0 wms-overflow-hidden">
            <ProjectRouter contextKey={mockContextKey} paths={customPaths} />
          </div>
        </div>
      </AppCredentialsProvider>
    </WmsProvider>
  );
};

export default App;
