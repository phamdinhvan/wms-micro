'use client';

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendar,
  IconChartBar,
  IconClock,
  IconEdit,
  IconFileText,
  IconFlag,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import {LayoutDetail, useNavigation, useTranslation} from '@wms/core';
import {useMemo} from 'react';
import {useGetProject} from '../hooks/useProjectList';

export interface ProjectDashboardProps {
  projectId: string;
  contextKey?: string;
  // Path configuration - có thể override từ props
  paths?: {
    list?: string; // Default: '/projects'
    detail?: string; // Default: '/projects/{projectId}/detail'
    edit?: string; // Default: '/projects/{projectId}/update'
  };
  onBack?: () => void;
  onEdit?: (projectId: string) => void;
}

export function ProjectDashboard({
  projectId,
  contextKey,
  paths,
  onBack,
  onEdit,
}: ProjectDashboardProps) {
  const [t] = useTranslation('gantt');
  const {navigate, smartBack} = useNavigation();

  // Fetch project data
  const {
    data: projectResponse,
    isLoading,
    error,
  } = useGetProject(projectId, {
    enabled: !!projectId,
  });

  // Extract project from response
  const project = projectResponse?.data;

  // Resolved paths với defaults
  const resolvedPaths = useMemo(() => {
    const defaultPaths = {
      list: '/projects',
      detail: '/projects/{projectId}/detail',
      edit: '/projects/{projectId}/update',
    };

    return {
      ...defaultPaths,
      ...paths,
    };
  }, [paths]);

  // Navigation handlers
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      smartBack({
        defaultPath: resolvedPaths.list,
        fallbackPaths: {
          [`/projects/${projectId}/detail`]: resolvedPaths.list,
          [`/projects/${projectId}`]: resolvedPaths.list,
        },
      });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(projectId);
    } else {
      const editPath = resolvedPaths.edit.replace('{projectId}', projectId);
      navigate(editPath, {reload: true});
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <LayoutDetail
        title={t('project.table.loading')}
        backText={t('button.back')}
        onBack={handleBack}>
        <Stack gap="md">
          <Card>
            <Text>{t('project.table.loading')}</Text>
          </Card>
        </Stack>
      </LayoutDetail>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <LayoutDetail
        title={t('project.notFound')}
        backText={t('button.back')}
        onBack={handleBack}>
        <Stack gap="md">
          <Card>
            <Text c="red">
              {error ? t('project.loadError') : t('project.notFound')}
            </Text>
          </Card>
        </Stack>
      </LayoutDetail>
    );
  }

  // Calculate progress (mock calculation)
  const progress = Math.floor(Math.random() * 100);
  const daysLeft = project?.endDate
    ? Math.floor(
        (new Date(project.endDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'on-hold':
        return 'yellow';
      case 'archived':
        return 'gray';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <LayoutDetail
      title={
        <Group gap="md" align="center">
          <div>
            <Title order={1} size="h2">
              {project?.name || t('project.untitled')}
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              {t('project.id')}: {project?.id || projectId}
            </Text>
          </div>
        </Group>
      }
      description={project?.description}
      backText={t('button.backToList')}
      onBack={handleBack}
      actions={
        <Group gap="sm">
          <Tooltip label={t('project.actions.edit')}>
            <ActionIcon variant="outline" size="lg" onClick={handleEdit}>
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<IconEdit size={16} />}
            variant="filled"
            onClick={handleEdit}>
            {t('project.actions.edit')}
          </Button>
        </Group>
      }
      aside={
        <Stack gap="md">
          {/* Quick Stats */}
          <Card withBorder>
            <Title order={4} size="h5" mb="sm">
              📊 {t('project.dashboard.quickStats')}
            </Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">{t('project.table.progress')}</Text>
                <Text size="sm" fw={500}>
                  {progress}%
                </Text>
              </Group>
              <Progress value={progress} size="sm" />

              <Group justify="space-between" mt="sm">
                <Text size="sm">{t('project.dashboard.daysLeft')}</Text>
                <Text size="sm" fw={500} c={daysLeft < 0 ? 'red' : 'blue'}>
                  {daysLeft < 0
                    ? t('project.dashboard.overdue')
                    : `${daysLeft} ${t('project.dashboard.days')}`}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Project Info */}
          <Card withBorder>
            <Title order={4} size="h5" mb="sm">
              ℹ️ {t('project.dashboard.projectInfo')}
            </Title>
            <Stack gap="xs">
              <Group gap="xs">
                <IconFlag size={16} />
                <Text size="sm">{t('project.table.priority')}:</Text>
                <Badge
                  color={getPriorityColor(
                    (project as any)?.priority || 'medium',
                  )}
                  size="sm">
                  {t(
                    `project.priority.${(project as any)?.priority || 'medium'}`,
                  )}
                </Badge>
              </Group>

              <Group gap="xs">
                <IconChartBar size={16} />
                <Text size="sm">{t('project.table.status')}:</Text>
                <Badge
                  color={getStatusColor(project?.status || 'active')}
                  size="sm">
                  {t(`project.status.${project?.status || 'active'}`)}
                </Badge>
              </Group>

              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">{t('project.dashboard.created')}:</Text>
                <Text size="sm">
                  {project?.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Actions */}
          <Card withBorder>
            <Title order={4} size="h5" mb="sm">
              ⚡ {t('project.dashboard.quickActions')}
            </Title>
            <Stack gap="xs">
              <Button
                variant="light"
                size="sm"
                fullWidth
                leftSection={<IconUsers size={16} />}>
                {t('project.dashboard.manageTeam')}
              </Button>
              <Button
                variant="light"
                size="sm"
                fullWidth
                leftSection={<IconFileText size={16} />}>
                {t('project.dashboard.viewTasks')}
              </Button>
              <Button
                variant="light"
                size="sm"
                fullWidth
                leftSection={<IconSettings size={16} />}>
                {t('project.dashboard.settings')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      }>
      <Stack gap="lg">
        {/* Overview Cards */}
        <SimpleGrid cols={{base: 1, sm: 2, lg: 3}} spacing="md">
          {/* Timeline Card */}
          <Card withBorder>
            <Group gap="sm" mb="md">
              <IconCalendar size={20} color="var(--mantine-color-blue-6)" />
              <Title order={4} size="h5">
                {t('project.dashboard.timeline')}
              </Title>
            </Group>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('project.table.startDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {project?.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('project.table.endDate')}
                </Text>
                <Text size="sm" fw={500}>
                  {project?.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('project.dashboard.duration')}
                </Text>
                <Text size="sm" fw={500}>
                  {project?.startDate && project?.endDate
                    ? Math.ceil(
                        (new Date(project.endDate).getTime() -
                          new Date(project.startDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )
                    : 'N/A'}{' '}
                  {t('project.dashboard.days')}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Progress Card */}
          <Card withBorder>
            <Group gap="sm" mb="md">
              <IconChartBar size={20} color="var(--mantine-color-green-6)" />
              <Title order={4} size="h5">
                {t('project.table.progress')}
              </Title>
            </Group>
            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">
                    {t('project.dashboard.overallProgress')}
                  </Text>
                  <Text size="sm" fw={500}>
                    {progress}%
                  </Text>
                </Group>
                <Progress value={progress} size="lg" />
              </div>
              <SimpleGrid cols={2} spacing="xs">
                <div>
                  <Text size="xs" c="dimmed">
                    {t('project.dashboard.tasks')}
                  </Text>
                  <Text size="sm" fw={500}>
                    12/20
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    {t('project.dashboard.milestones')}
                  </Text>
                  <Text size="sm" fw={500}>
                    3/5
                  </Text>
                </div>
              </SimpleGrid>
            </Stack>
          </Card>

          {/* Team Card */}
          <Card withBorder>
            <Group gap="sm" mb="md">
              <IconUsers size={20} color="var(--mantine-color-orange-6)" />
              <Title order={4} size="h5">
                {t('project.dashboard.team')}
              </Title>
            </Group>
            <Stack gap="sm">
              <Group gap="sm">
                <Avatar size="sm" />
                <div>
                  <Text size="sm" fw={500}>
                    {t('project.dashboard.projectManager')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {project?.assignee?.name || 'N/A'}
                  </Text>
                </div>
              </Group>
              <Group gap="sm">
                <Avatar.Group spacing="xs">
                  <Avatar size="sm" />
                  <Avatar size="sm" />
                  <Avatar size="sm" />
                  <Avatar size="sm">+3</Avatar>
                </Avatar.Group>
                <Text size="sm" c="dimmed">
                  {t('project.dashboard.teamMembers', {count: 6})}
                </Text>
              </Group>
            </Stack>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* Detailed Sections */}
        <SimpleGrid cols={{base: 1, lg: 2}} spacing="lg">
          {/* Description */}
          <Card withBorder>
            <Title order={3} size="h4" mb="md">
              📝 {t('project.table.description')}
            </Title>
            <Text size="sm" style={{whiteSpace: 'pre-wrap'}}>
              {project?.description || t('project.noDescription')}
            </Text>
          </Card>

          {/* Recent Activity */}
          <Card withBorder>
            <Title order={3} size="h4" mb="md">
              🕒 {t('project.dashboard.recentActivity')}
            </Title>
            <Stack gap="sm">
              <Group gap="sm">
                <IconClock size={16} />
                <div>
                  <Text size="sm" fw={500}>
                    {t('project.dashboard.taskCompleted')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('project.dashboard.hoursAgo', {hours: 2})}
                  </Text>
                </div>
              </Group>
              <Group gap="sm">
                <IconUsers size={16} />
                <div>
                  <Text size="sm" fw={500}>
                    {t('project.dashboard.memberJoined')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('project.dashboard.daysAgo', {days: 1})}
                  </Text>
                </div>
              </Group>
              <Group gap="sm">
                <IconEdit size={16} />
                <div>
                  <Text size="sm" fw={500}>
                    {t('project.dashboard.detailsUpdated')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('project.dashboard.daysAgo', {days: 3})}
                  </Text>
                </div>
              </Group>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Tasks Section */}
        <Card withBorder>
          <Title order={3} size="h4" mb="md">
            📋 {t('project.dashboard.tasksOverview')}
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            {t('project.dashboard.tasksDescription')}
          </Text>
          <Button variant="outline" leftSection={<IconFileText size={16} />}>
            {t('project.dashboard.viewAllTasks')}
          </Button>
        </Card>

        {/* Files & Documents */}
        <Card withBorder>
          <Title order={3} size="h4" mb="md">
            📁 {t('project.dashboard.filesDocuments')}
          </Title>
          <Text size="sm" c="dimmed" mb="md">
            {t('project.dashboard.filesDescription')}
          </Text>
          <Button variant="outline" leftSection={<IconFileText size={16} />}>
            {t('project.dashboard.browseFiles')}
          </Button>
        </Card>
      </Stack>
    </LayoutDetail>
  );
}
