import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import {ReactNode} from 'react';
import {cn} from '../../utils';

export type ConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  labels?: {
    confirm: string;
    cancel: string;
  };
  onConfirm: () => void;
  onCancel?: () => void;
  confirmProps?: React.ComponentPropsWithoutRef<'button'>;
  cancelProps?: React.ComponentPropsWithoutRef<'button'>;
  centered?: boolean;
  withCloseButton?: boolean;
  classNames?: {
    title?: string;
    header?: string;
    content?: string;
  };
};

export function ConfirmModal({
  opened,
  onClose,
  title = 'Confirm',
  children = 'Are you sure?',
  labels = {confirm: 'Confirm', cancel: 'Cancel'},
  onConfirm,
  onCancel,
  confirmProps,
  cancelProps,
  centered = false,
  withCloseButton = true,
  classNames = {},
}: ConfirmModalProps) {
  const theme = useMantineTheme();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // Get primary color from theme
  const primaryColor =
    theme.colors[theme.primaryColor]?.[5] || theme.colors.blue[5];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered={centered}
      withCloseButton={withCloseButton}
      classNames={{
        title: cn('wms-font-medium wms-text-white', classNames.title),
        header: cn('wms-py-1', classNames.header),
        content: classNames.content,
      }}
      styles={{
        header: {
          backgroundColor: primaryColor,
          borderRadius: 0,
        },
        body: {
          paddingTop: '1.5rem',
        },
      }}>
      <Stack gap="md">
        <div>
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </div>
        <Group justify="flex-end" gap="xs">
          <Button
            variant="outline"
            color="gray"
            onClick={handleCancel}
            {...cancelProps}>
            {labels.cancel}
          </Button>
          <Button onClick={handleConfirm} {...confirmProps}>
            {labels.confirm}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
