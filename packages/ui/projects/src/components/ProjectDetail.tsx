'use client';

import {
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {IconEdit} from '@tabler/icons-react';
import {LayoutDetail, useNavigation, useTranslation} from '@wms/core';
import {useMemo} from 'react';
import {useGetProject} from '../hooks/useProjectList';

export interface ProjectDetailProps {
  projectId: string;
  contextKey?: string;
  paths?: {
    list?: string;
    detail?: string;
    edit?: string;
  };
  onBack?: () => void;
  onEdit?: (projectId: string) => void;
}

export function ProjectDetail({
  projectId,
  contextKey,
  paths,
  onBack,
  onEdit,
}: ProjectDetailProps) {
  const [t] = useTranslation('gantt');
  const {navigate, smartBack} = useNavigation();

  const {
    data: projectResponse,
    isLoading,
    error,
  } = useGetProject(projectId, {
    enabled: !!projectId,
  });

  const project = projectResponse?.data;

  const resolvedPaths = useMemo(() => {
    const defaultPaths = {
      list: '/projects',
      detail: '/projects/{projectId}/detail',
      edit: '/projects/{projectId}/update',
    };
    return {...defaultPaths, ...paths};
  }, [paths]);

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
      const detailPath = resolvedPaths.detail.replace('{projectId}', projectId);
      // Pass navigation context via URL parameters to indicate we're coming from detail
      const editPathWithContext = `${editPath}?from=detail&returnPath=${encodeURIComponent(detailPath)}`;
      navigate(editPathWithContext, {reload: true});
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'gray';
      case 'completed':
        return 'blue';
      case 'on-hold':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <LayoutDetail
        title={t('project.table.loading')}
        backText={t('button.backToList')}
        onBack={handleBack}>
        <Box p="md">
          <Text>{t('project.table.loading')}</Text>
        </Box>
      </LayoutDetail>
    );
  }

  if (error || !project) {
    return (
      <LayoutDetail
        title={t('project.notFound')}
        backText={t('button.backToList')}
        onBack={handleBack}>
        <Box p="md">
          <Text c="red">
            {error ? t('project.loadError') : t('project.notFound')}
          </Text>
        </Box>
      </LayoutDetail>
    );
  }

  // Calculate project stats
  const startDate = project?.startDate ? new Date(project.startDate) : null;
  const endDate = project?.endDate ? new Date(project.endDate) : null;
  const actualStartDate = project?.actualStartDate
    ? new Date(project.actualStartDate)
    : null;
  const today = new Date();

  const totalDays =
    startDate && endDate
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

  const elapsedDays = actualStartDate
    ? Math.ceil(
        (today.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  const delayDays =
    startDate && actualStartDate
      ? Math.max(
          0,
          Math.ceil(
            (actualStartDate.getTime() - startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const progress =
    totalDays > 0
      ? Math.min(100, Math.round((elapsedDays / totalDays) * 100))
      : 0;

  return (
    <LayoutDetail
      title={project?.name || t('project.untitled')}
      backText={t('button.backToList')}
      onBack={handleBack}
      actions={
        <Button leftSection={<IconEdit size={16} />} onClick={handleEdit}>
          {t('project.actions.edit')}
        </Button>
      }>
      {/* Stats Cards - Moved to top */}
      <Group
        gap="2xl"
        wrap="wrap"
        mb="lg"
        align="stretch"
        justify="space-between">
        {/* Total Days */}
        <Box
          bg="gray.0"
          p="md"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 10,
            flex: '0 1 350px',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 60,
          }}>
          <Text size="lg" fw={600} ta="center">
            {t('project.detail.duration') || 'Thời gian'}:{' '}
            <Text component="span" fw={700} c="dark">
              {totalDays}
            </Text>{' '}
            {t('common.days') || 'ngày'}
          </Text>
        </Box>

        {/* Elapsed Days */}
        <Box
          bg="gray.0"
          p="md"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 10,
            flex: '0 1 350px',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 60,
          }}>
          <Text size="lg" fw={600} ta="center">
            {t('project.detail.elapsed') || 'Đã trôi qua'}:{' '}
            <Text component="span" fw={700} c="blue">
              {elapsedDays}
            </Text>{' '}
            {t('common.days') || 'ngày'}
          </Text>
        </Box>

        {/* Progress */}
        <Box
          bg="white"
          p="md"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 10,
            flex: '0 1 350px',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 60,
          }}>
          <Text size="lg" fw={600} ta="center">
            {t('project.detail.progress') || 'Tiến độ'}:{' '}
            <Text component="span" fw={700} c="blue">
              {progress}%
            </Text>
            {delayDays > 0 && (
              <Text component="span" c="orange" ml="sm">
                ({t('project.detail.delay') || 'Độ trễ'}: {delayDays}{' '}
                {t('common.days') || 'ngày'})
              </Text>
            )}
          </Text>
        </Box>
      </Group>

      {/* Main Content */}
      <Stack gap="lg">
        {/* Project Information */}
        <Box
          bg="white"
          p="xl"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 12,
          }}>
          <Title
            order={3}
            size="h5"
            mb="lg"
            pb="sm"
            style={{borderBottom: '1px solid var(--mantine-color-gray-2)'}}>
            {t('project.detail.information')}
          </Title>

          {/* Two-column layout for larger screens, single column for small screens */}
          <Group align="flex-start" gap="xl" wrap="wrap">
            {/* Left Column */}
            <Stack gap="sm" style={{flex: 1, minWidth: 280}}>
              {/* Name */}
              <Group wrap="nowrap" py="xs" style={{width: '100%'}}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.name.label')}
                </Text>
                <Box style={{flex: 1, minWidth: 0}}>
                  <Tooltip label={project?.name}>
                    <Text
                      size="sm"
                      fw={500}
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
                      {project?.name || '--'}
                    </Text>
                  </Tooltip>
                </Box>
              </Group>

              {/* Key */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                  width: '100%',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.key.label')}
                </Text>
                <Box style={{flex: 1, minWidth: 0}}>
                  <Tooltip label={project?.key}>
                    <Text
                      size="sm"
                      fw={500}
                      style={{
                        textAlign: 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
                      {project?.key || '--'}
                    </Text>
                  </Tooltip>
                </Box>
              </Group>

              {/* Assignee */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.assignee.label')}
                </Text>
                <Text size="sm" fw={600} c="blue" style={{textAlign: 'left'}}>
                  {project?.assignee?.name || project?.assignee?.email || '--'}
                </Text>
              </Group>

              {/* Status */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.status.label')}
                </Text>
                <div style={{textAlign: 'left'}}>
                  <Badge
                    color={getStatusColor(project?.status || 'active')}
                    size="sm"
                    variant="light">
                    {t(`project.status.${project?.status || 'active'}`)}
                  </Badge>
                </div>
              </Group>
            </Stack>

            {/* Right Column */}
            <Stack gap="sm" style={{flex: 1, minWidth: 280}}>
              {/* Start Date */}
              <Group wrap="nowrap" py="xs">
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.startDate.label')}
                </Text>
                <Text size="sm" fw={500} style={{textAlign: 'left'}}>
                  {formatDate(project?.startDate)}
                </Text>
              </Group>

              {/* End Date */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.endDate.label')}
                </Text>
                <Text size="sm" fw={500} style={{textAlign: 'left'}}>
                  {formatDate(project?.endDate)}
                </Text>
              </Group>

              {/* Actual Start Date */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.actualStartDate.label')}
                </Text>
                <Text
                  size="sm"
                  fw={500}
                  c={project?.actualStartDate ? undefined : 'dimmed'}
                  fs={project?.actualStartDate ? undefined : 'italic'}
                  style={{textAlign: 'left'}}>
                  {formatDate(project?.actualStartDate)}
                </Text>
              </Group>

              {/* Actual End Date */}
              <Group
                wrap="nowrap"
                py="xs"
                style={{
                  borderTop: '1px solid var(--mantine-color-gray-1)',
                }}>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={500}
                  style={{width: 180, flexShrink: 0}}>
                  {t('project.form.actualEndDate.label')}
                </Text>
                <Text
                  size="sm"
                  fw={500}
                  c={project?.actualEndDate ? undefined : 'dimmed'}
                  fs={project?.actualEndDate ? undefined : 'italic'}
                  style={{textAlign: 'left'}}>
                  {formatDate(project?.actualEndDate)}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Box>

        {/* Description */}
        <Box
          bg="white"
          p="xl"
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 12,
          }}>
          <Title
            order={3}
            size="h5"
            mb="lg"
            pb="sm"
            style={{borderBottom: '1px solid var(--mantine-color-gray-2)'}}>
            {t('project.form.description.label')}
          </Title>

          <Text
            size="sm"
            style={{whiteSpace: 'pre-wrap', lineHeight: 1.8}}
            c={project?.description ? 'dimmed' : 'gray'}
            fs={project?.description ? undefined : 'italic'}>
            {project?.description || t('project.noDescription')}
          </Text>
        </Box>
      </Stack>
    </LayoutDetail>
  );
}
