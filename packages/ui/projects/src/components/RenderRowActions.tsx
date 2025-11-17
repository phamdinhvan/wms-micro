'use client';
import {Button, Group, Tooltip} from '@mantine/core';
import {
  IconAlignBoxLeftMiddle,
  IconEdit,
  IconTrashX,
} from '@tabler/icons-react';
import {TProject, useTranslation} from '@wms/core';

type RenderRowActionProps = {
  row: TProject;
  onEdit?: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onGantt?: (projectId: string) => void;
  showGanttButton?: boolean;
};

export const RenderRowAction = ({
  row,
  onEdit,
  onDelete,
  onGantt,
  showGanttButton = false,
}: RenderRowActionProps) => {
  const [t] = useTranslation('gantt');

  const handleEdit = () => {
    onEdit?.(row.id);
  };

  const handleDelete = () => {
    onDelete?.(row.id);
  };

  const handleGantt = () => {
    onGantt?.(row.id);
  };

  return (
    <Group justify="center" gap="xs" wrap="nowrap">
      {showGanttButton && (
        <Tooltip label={t('button.gantt') || 'Gantt'}>
          <Button
            leftSection={<IconAlignBoxLeftMiddle size={16} />}
            variant="outline"
            color="green"
            size="sm"
            onClick={handleGantt}>
            {t('button.gantt') || 'Gantt'}
          </Button>
        </Tooltip>
      )}

      <Tooltip label={t('button.edit')}>
        <Button
          leftSection={<IconEdit size={16} />}
          variant="outline"
          color="blue"
          size="sm"
          onClick={handleEdit}>
          {t('button.edit')}
        </Button>
      </Tooltip>

      <Tooltip label={t('button.delete')}>
        <Button
          leftSection={<IconTrashX size={16} />}
          variant="outline"
          color="red"
          size="sm"
          onClick={handleDelete}>
          {t('button.delete')}
        </Button>
      </Tooltip>
    </Group>
  );
};
