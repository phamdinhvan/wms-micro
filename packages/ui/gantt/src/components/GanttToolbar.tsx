import {ActionIcon, Button, Select} from '@mantine/core';
import {IconChevronDown, IconFileExport} from '@tabler/icons-react';
import {TProject} from '@wms/core';

interface GanttToolbarProps {
  projects: TProject[];
  projectId: string | null;
  isProjectsLoading: boolean;
  isExporting: boolean;
  onProjectSelect: (projectId: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onCreateProject: () => void;
  t: (key: string) => string;
}

export function GanttToolbar({
  projects,
  projectId,
  isProjectsLoading,
  isExporting,
  onProjectSelect,
  onRefresh,
  onExport,
  onCreateProject,
  t,
}: GanttToolbarProps) {
  return (
    <div className="wms-border-b wms-border-gray-200 wms-bg-white">
      <div className="wms-px-3 wms-py-2 wms-flex wms-items-center wms-gap-2 wms-border-b wms-border-gray-200">
        <Select
          w={320}
          searchable
          placeholder={t('project.selectPlaceholder')}
          data={projects?.map(p => ({value: p.id, label: p.name}))}
          value={projectId}
          onChange={val => {
            if (val) onProjectSelect(val);
          }}
          disabled={isProjectsLoading}
          nothingFoundMessage={
            isProjectsLoading ? t('common.loading') : t('project.noProjects')
          }
          rightSection={
            <ActionIcon size="xs" variant="transparent" color="black">
              <IconChevronDown />
            </ActionIcon>
          }
          className="wms-bg-white wms-rounded wms-shadow-sm"
        />
        <Button
          size="sm"
          variant="outline"
          disabled={isProjectsLoading}
          onClick={onRefresh}>
          {t('common.refresh')}
        </Button>
        <Button
          size="sm"
          variant="primary"
          color="primary"
          onClick={onExport}
          disabled={!projectId || isProjectsLoading || isExporting}
          leftSection={<IconFileExport size={16} />}
          loading={isExporting}>
          {t('gantt.export')}
        </Button>
      </div>
    </div>
  );
}
