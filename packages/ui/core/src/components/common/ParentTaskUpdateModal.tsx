import {Button, Group, Modal, Stack, Text} from '@mantine/core';
import {IconCalendar, IconClock, IconUsers} from '@tabler/icons-react';
import React from 'react';
import {useTranslation} from '../../i18n';

interface ParentTaskUpdateModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (isOnlyParent: boolean) => void;
  taskName?: string;
  updateType: 'duration' | 'dates';
}

export const ParentTaskUpdateModal: React.FC<ParentTaskUpdateModalProps> = ({
  opened,
  onClose,
  onConfirm,
  taskName = 'this task',
  updateType,
}) => {
  const {t} = useTranslation('gantt');

  const handleChoice = (isOnlyParent: boolean) => {
    onConfirm(isOnlyParent);
    onClose();
  };

  const updateTypeText =
    updateType === 'duration'
      ? t('parentTaskModal.updateType.duration')
      : t('parentTaskModal.updateType.dates');
  const icon =
    updateType === 'duration' ? (
      <IconClock size={20} />
    ) : (
      <IconCalendar size={20} />
    );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          {icon}
          <Text fw={600}>{t('parentTaskModal.title')}</Text>
        </Group>
      }
      size="md"
      centered>
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          {t('parentTaskModal.description', {
            updateType: updateTypeText,
            taskName,
          })}
        </Text>

        <Text size="sm">{t('parentTaskModal.question')}</Text>

        <Stack gap="sm">
          <Button
            variant="filled"
            color="blue"
            leftSection={<IconUsers size={16} />}
            onClick={() => handleChoice(false)}
            fullWidth
            style={{justifyContent: 'flex-start'}}>
            <div>
              <Text size="sm" fw={500}>
                {t('parentTaskModal.options.updateAll.title')}
              </Text>
              <Text size="xs">
                {t('parentTaskModal.options.updateAll.description', {
                  updateType: updateTypeText,
                })}
              </Text>
            </div>
          </Button>

          <Button
            variant="outline"
            color="gray"
            leftSection={<IconClock size={16} />}
            onClick={() => handleChoice(true)}
            fullWidth
            style={{justifyContent: 'flex-start'}}>
            <div>
              <Text size="sm" fw={500}>
                {t('parentTaskModal.options.updateParentOnly.title')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('parentTaskModal.options.updateParentOnly.description')}
              </Text>
            </div>
          </Button>
        </Stack>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
