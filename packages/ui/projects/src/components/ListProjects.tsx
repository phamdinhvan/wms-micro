'use client';

import {
  Badge,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {DateInput} from '@mantine/dates';
import {notifications} from '@mantine/notifications';
import {IconCalendar, IconPlus, IconSearch} from '@tabler/icons-react';
import {
  Column,
  DynamicTable,
  LayoutList,
  PaginationControl,
  TProject,
  TruncateTooltipWrapper,
  useControlParams,
  useNavigation,
  useTranslation,
} from '@wms/core';
import dayjs from 'dayjs';
import {useCallback, useMemo, useState} from 'react';
import {useDeleteProject, useGetProjectList} from '../hooks/useProjectList';
import {RenderRowAction} from './RenderRowActions';

const NAME_MAX_WIDTH = 240;

export interface ListProjectsProps {
  contextKey?: string;
  paths?: {
    create?: string;
    edit?: string;
    view?: string;
    list?: string;
    gantt?: string;
  };
  onCreateProject?: () => void;
  onEditProject?: (projectId: string) => void;
  onViewProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onGanttProject?: (projectId: string) => void;
  showGanttButton?: boolean;
}

export function ListProjects({
  onCreateProject,
  onEditProject,
  onViewProject,
  onDeleteProject,
  onGanttProject,
  showGanttButton = false,
  contextKey,
  paths,
}: ListProjectsProps) {
  const [t] = useTranslation('gantt');
  const {navigate} = useNavigation();

  const {
    queryParams: {
      pPage,
      pPageSize,
      pSearch,
      pStatus,
      pAssignee,
      pFromDate,
      pToDate,
    },
    replaceParams,
  } = useControlParams();

  const page = parseInt(pPage || '1', 10);
  const pageSize = parseInt(pPageSize || '10', 10);

  const defaultPaths = {
    create: '/projects/create',
    edit: '/projects/{projectId}/update',
    view: '/projects/{projectId}/detail',
    list: '/projects',
    gantt: '/simulation/gantt?projectId={projectId}',
  };

  const resolvedPaths = {
    ...defaultPaths,
    ...paths,
  };

  const handleCreateProject = useCallback(() => {
    if (onCreateProject) {
      onCreateProject();
    } else {
      navigate(resolvedPaths.create, {reload: true});
    }
  }, [navigate, onCreateProject, resolvedPaths.create]);

  const handleEditProject = useCallback(
    (projectId: string) => {
      if (onEditProject) {
        onEditProject(projectId);
      } else {
        const editPath = resolvedPaths.edit.replace('{projectId}', projectId);
        // Pass navigation context via URL parameters to indicate we're coming from the list
        const editPathWithContext = `${editPath}?from=list&returnPath=${encodeURIComponent(resolvedPaths.list)}`;
        navigate(editPathWithContext, {reload: true});
      }
    },
    [navigate, onEditProject, resolvedPaths.edit, resolvedPaths.list],
  );

  const handleViewProject = useCallback(
    (projectId: string) => {
      if (onViewProject) {
        onViewProject(projectId);
      } else {
        const viewPath = resolvedPaths.view.replace('{projectId}', projectId);
        navigate(viewPath, {reload: true});
      }
    },
    [navigate, onViewProject, resolvedPaths.view],
  );

  const handleGanttProject = useCallback(
    (projectId: string) => {
      if (onGanttProject) {
        onGanttProject(projectId);
      } else {
        const ganttPath = resolvedPaths.gantt.replace('{projectId}', projectId);
        navigate(ganttPath, {reload: true});
      }
    },
    [navigate, onGanttProject, resolvedPaths.gantt],
  );

  const {onDeleteProject: deleteProject} = useDeleteProject();

  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDeleteWithConfirmation = useCallback((projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteModalOpened(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete);

      notifications.show({
        title: t('common.success') || 'Success',
        message:
          t('project.notification.deleteSuccess') ||
          'Project deleted successfully',
        color: 'green',
      });

      onDeleteProject?.(projectToDelete);
    } catch {
      notifications.show({
        title: t('common.error') || 'Error',
        message:
          t('project.notification.deleteError') || 'Failed to delete project',
        color: 'red',
      });
    } finally {
      setDeleteModalOpened(false);
      setProjectToDelete(null);
    }
  }, [deleteProject, onDeleteProject, projectToDelete, t]);

  const columns: Column<TProject>[] = useMemo(() => {
    const baseColumns: Column<TProject>[] = [
      {
        label: t('project.table.name'),
        key: 'name',
        type: 'text',
        headerClassName:
          'sm:wms-sticky sm:wms-left-0 wms-z-[30] sm:wms-shadow-sticky-left',
        cellClassName:
          'sm:wms-sticky sm:wms-left-0 wms-z-[5] wms-bg-inherit sm:wms-shadow-sticky-left',
        headerStyle: {
          width: NAME_MAX_WIDTH,
          minWidth: NAME_MAX_WIDTH,
          maxWidth: NAME_MAX_WIDTH,
        },
        cellStyle: {
          width: NAME_MAX_WIDTH,
          minWidth: NAME_MAX_WIDTH,
          maxWidth: NAME_MAX_WIDTH,
        },
        render: (row: TProject) => (
          <TruncateTooltipWrapper
            lineClamp={1}
            maxWidth={400}
            tooltipLabel={row.name}
            className="wms-w-full">
            <Text
              c="primary"
              className="wms-underline wms-cursor-pointer wms-truncate"
              onClick={() => handleViewProject(row.id)}>
              {row.name}
            </Text>
          </TruncateTooltipWrapper>
        ),
      },
      {
        key: 'status',
        label: t('project.table.status'),
        type: 'short',
        headerStyle: {
          width: 120,
          minWidth: 120,
        },
        cellStyle: {
          width: 120,
          minWidth: 120,
        },
        render: (row: TProject) => (
          <Badge variant="outline" color="blue">
            {t(`project.status.${row.status}`)}
          </Badge>
        ),
      },
      {
        key: 'dateRange',
        label: t('project.table.startDate'),
        type: 'short',
        headerStyle: {
          width: 180,
          minWidth: 180,
        },
        cellStyle: {
          width: 180,
          minWidth: 180,
        },
        render: (row: TProject) => {
          const startDate = dayjs(row.startDate).format('YYYY/MM/DD');
          const endDate = dayjs(row.endDate).format('YYYY/MM/DD');
          return `${startDate} - ${endDate}`;
        },
      },
      {
        key: 'actualDateRange',
        label: t('project.table.actualDateRange'),
        type: 'short',
        headerStyle: {
          width: 180,
          minWidth: 180,
        },
        cellStyle: {
          width: 180,
          minWidth: 180,
        },
        render: (row: TProject) => {
          if (row.actualStartDate && row.actualEndDate) {
            const startDate = dayjs(row.actualStartDate).format('YYYY/MM/DD');
            const endDate = dayjs(row.actualEndDate).format('YYYY/MM/DD');
            return `${startDate} - ${endDate}`;
          }
          return '-';
        },
      },
      {
        key: 'assignee',
        label: t('project.table.assignee'),
        type: 'short',
        headerStyle: {
          width: 150,
          minWidth: 150,
        },
        cellStyle: {
          width: 150,
          minWidth: 150,
        },
        render: (row: TProject) => row.assignee?.name || '-',
      },
    ];

    baseColumns.push({
      label: t('button.action'),
      key: 'actions',
      type: 'action',
      headerClassName:
        'sm:wms-sticky sm:wms-right-0 wms-z-[30] sm:wms-shadow-sticky-right',
      cellClassName:
        'sm:wms-sticky sm:wms-right-0 wms-z-[5] wms-bg-inherit sm:wms-shadow-sticky-right',
      headerStyle: {
        width: 300,
        minWidth: 300,
      },
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
      render: (row: TProject) => (
        <RenderRowAction
          row={row}
          onEdit={() => handleEditProject(row.id)}
          onDelete={() => handleDeleteWithConfirmation(row.id)}
          onGantt={() => handleGanttProject(row.id)}
          showGanttButton={showGanttButton}
        />
      ),
    });

    return baseColumns;
  }, [
    t,
    handleEditProject,
    handleDeleteWithConfirmation,
    handleGanttProject,
    showGanttButton,
  ]);

  const statusOptions = [
    {value: 'active', label: t('project.status.active')},
    {value: 'inactive', label: t('project.status.inactive')},
    {value: 'completed', label: t('project.status.completed')},
    {value: 'on-hold', label: t('project.status.on-hold')},
    {value: 'archived', label: t('project.status.archived')},
  ];

  const handleSearchChange = (value: string) => {
    replaceParams({search: value || undefined, page: '1'});
  };

  const handleStatusChange = (value: string | null) => {
    replaceParams({status: value || undefined, page: '1'});
  };

  const handleAssigneeChange = (value: string) => {
    replaceParams({assignee: value || undefined, page: '1'});
  };

  const handleStartDateChange = (value: string | null) => {
    replaceParams({
      fromDate: value || undefined,
      page: '1',
    });
  };

  const handleEndDateChange = (value: string | null) => {
    replaceParams({
      toDate: value || undefined,
      page: '1',
    });
  };

  const {data, isLoading, isFetching} = useGetProjectList({
    page: pPage ?? '1',
    limit: pPageSize ?? '10',
    search: pSearch || undefined,
    status: pStatus || undefined,
    assignee: pAssignee || undefined,
    startFrom: pFromDate || undefined,
    endTo: pToDate || undefined,
    contextKey,
  });

  const totalItems = data?.total || 0;
  const projects = data?.items || [];

  return (
    <LayoutList
      title={t('project.title')}
      actions={
        !isLoading && (
          <Button
            leftSection={<IconPlus size={20} />}
            variant="primary"
            onClick={handleCreateProject}>
            {t('project.create')}
          </Button>
        )
      }
      filters={
        <Group gap="md" className="wms-w-full">
          <TextInput
            placeholder={
              t('gantt.filters.search.placeholder') || 'Search projects...'
            }
            value={pSearch || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(e.target.value)
            }
            leftSection={<IconSearch size={16} />}
            style={{minWidth: 200}}
          />

          <Select
            placeholder={t('gantt.filters.status.placeholder') || 'Status'}
            value={pStatus || ''}
            onChange={handleStatusChange}
            data={statusOptions}
            clearable
            style={{minWidth: 150}}
          />

          <TextInput
            placeholder={t('gantt.filters.assignee.placeholder') || 'Assignee'}
            value={pAssignee || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleAssigneeChange(e.target.value)
            }
            leftSection={<IconSearch size={16} />}
            style={{minWidth: 200}}
          />

          <DateInput
            placeholder={
              t('gantt.filters.dateRange.startFrom') || 'Start date from'
            }
            value={pFromDate || ''}
            onChange={handleStartDateChange}
            leftSection={<IconCalendar size={16} />}
            style={{minWidth: 150}}
            clearable
          />

          <DateInput
            placeholder={t('gantt.filters.dateRange.endTo') || 'End date to'}
            value={pToDate || ''}
            onChange={handleEndDateChange}
            leftSection={<IconCalendar size={16} />}
            style={{minWidth: 150}}
            clearable
          />
        </Group>
      }>
      {/* CRITICAL FIX: Proper overflow handling for scrolling */}
      <div className="wms-flex-1 wms-flex wms-flex-col wms-min-h-0 wms-overflow-hidden">
        {/* Table container - THIS is where scrolling happens */}
        <div className="wms-flex-1 wms-min-h-0 wms-relative">
          <DynamicTable
            data={projects}
            columns={columns}
            isLoading={isLoading}
            isRefetching={isFetching}
          />
        </div>

        {/* Pagination - fixed at bottom */}
        <div className="wms-flex-shrink-0 wms-pb-1 wms-pt-2">
          <PaginationControl
            total={totalItems}
            page={page}
            onPageChange={page => replaceParams({page: page.toString()})}
            pageSize={pageSize}
            onPageSizeChange={size => {
              replaceParams({
                page: '1',
                pageSize: size.toString(),
              });
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title={t('common.confirm') || 'Confirm'}
        centered
        withCloseButton={true}>
        <Stack gap="md">
          <Text>
            {t('project.confirmation.delete') ||
              'Are you sure you want to delete this project?'}
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button
              variant="outline"
              color="gray"
              onClick={() => setDeleteModalOpened(false)}>
              {t('button.cancel') || 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleConfirmDelete}>
              {t('button.ok') || 'OK'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </LayoutList>
  );
}
