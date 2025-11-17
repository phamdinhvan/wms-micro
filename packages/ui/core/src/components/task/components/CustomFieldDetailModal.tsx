'use client';

import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from '../../../i18n';
import {getFieldTypeIcon} from '../utils/fieldTypeUtils';

interface CustomFieldType {
  id: string;
  name: string;
  displayName: string;
}

interface CustomFieldDetailModalProps {
  opened: boolean;
  onClose: () => void;
  onAddField: (
    fieldType: CustomFieldType,
    fieldName: string,
    description: string,
    isRequired: boolean,
  ) => void;
  selectedFieldType: CustomFieldType | null;
  customFieldTypes: CustomFieldType[];
}

export function CustomFieldDetailModal({
  opened,
  onClose,
  onAddField,
  selectedFieldType,
  customFieldTypes,
}: CustomFieldDetailModalProps) {
  const {t} = useTranslation('gantt');
  const [fieldName, setFieldName] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [currentFieldType, setCurrentFieldType] =
    useState<CustomFieldType | null>(null);
  const fieldNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFieldType) {
      setCurrentFieldType(selectedFieldType);
    }
  }, [selectedFieldType]);

  // Auto focus when modal opens
  useEffect(() => {
    if (opened && fieldNameInputRef.current) {
      // Use a longer timeout to ensure the modal is fully rendered
      setTimeout(() => {
        fieldNameInputRef.current?.focus();
      }, 200);
    }
  }, [opened]);

  const handleAdd = () => {
    if (!fieldName.trim() || !currentFieldType) return;

    onAddField(
      currentFieldType,
      fieldName.trim(),
      description.trim(),
      isRequired,
    );

    setFieldName('');
    setDescription('');
    setIsRequired(false);
    setCurrentFieldType(null);
    onClose();
  };

  const handleClose = () => {
    setFieldName('');
    setDescription('');
    setIsRequired(false);
    setCurrentFieldType(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Title c="dark" size="xl" fw={600}>
          {t('task.customFields.modal.title')}
        </Title>
      }
      styles={{
        header: {
          backgroundColor: 'white',
        },
      }}
      size="sm"
      centered>
      <Stack gap="md">
        <TextInput
          ref={fieldNameInputRef}
          label={t('task.customFields.modal.fieldName.label')}
          placeholder={t('task.customFields.enterLabel')}
          value={fieldName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFieldName(e.target.value)
          }
          required
        />

        <Textarea
          label={t('task.customFields.modal.description.label')}
          placeholder={t('task.customFields.modal.description.placeholder')}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
          rows={3}
        />

        <Text size="xs" c="dimmed">
          {t('task.customFields.modal.description.help')}
        </Text>

        <Select
          label={t('task.customFields.modal.type.label')}
          placeholder={t('task.customFields.modal.type.placeholder')}
          value={currentFieldType?.id || ''}
          onChange={value => {
            const fieldType = customFieldTypes.find(ft => ft.id === value);
            setCurrentFieldType(fieldType || null);
          }}
          data={customFieldTypes.map(ft => ({
            value: ft.id,
            label: ft.displayName,
          }))}
          leftSection={
            currentFieldType
              ? (() => {
                  const {icon: Icon, color} =
                    getFieldTypeIcon(currentFieldType);
                  return (
                    <Icon
                      size={16}
                      color={`var(--mantine-color-${color.replace('.', '-')})`}
                    />
                  );
                })()
              : null
          }
          renderOption={({option}) => {
            const fieldType = customFieldTypes.find(
              ft => ft.id === option.value,
            );
            if (!fieldType) return null;

            const {icon: Icon, color} = getFieldTypeIcon(fieldType);
            return (
              <Group flex="1" gap="xs">
                <Icon
                  size={16}
                  color={`var(--mantine-color-${color.replace('.', '-')})`}
                />
                <span>{option.label}</span>
              </Group>
            );
          }}
          required
        />

        <Group justify="flex-end" gap="xs">
          <Button variant="outline" onClick={handleClose}>
            {t('task.customFields.modal.actions.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!fieldName.trim() || !currentFieldType}>
            {t('task.customFields.modal.actions.create')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
