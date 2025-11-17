'use client';

import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Menu,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import {DateInput} from '@mantine/dates';
import {IconPlus, IconTrash} from '@tabler/icons-react';
import {useState} from 'react';
import {Control, Controller, UseFormReturn} from 'react-hook-form';
import {useGetCustomFieldTypes} from '../../../hooks/useMasterData';
import {useTranslation} from '../../../i18n';
import {TaskFormSchemaType} from '../../../schema';
import {getFieldTypeIcon} from '../utils/fieldTypeUtils';
import {CustomFieldDetailModal} from './CustomFieldDetailModal';

interface CustomFieldType {
  id: string;
  name: string;
  displayName: string;
}

interface CustomFieldsSectionProps {
  form: UseFormReturn<TaskFormSchemaType>;
  opened: boolean;
}

// Function to render input field based on type
const renderCustomFieldInput = (
  field: {type: string; options?: string[]; description?: string; name: string},
  index: number,
  control: Control<TaskFormSchemaType>,
  t: (key: string) => string,
) => {
  const fieldName = `customFields.${index}.value` as const;

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <TextInput
              value={inputField.value || ''}
              onChange={inputField.onChange}
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.enterValue')}
              error={error?.message}
              size="sm"
            />
          )}
        />
      );

    case 'textarea':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <Textarea
              value={inputField.value || ''}
              onChange={inputField.onChange}
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.enterValue')}
              error={error?.message}
              size="sm"
              minRows={2}
            />
          )}
        />
      );

    case 'number':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <NumberInput
              value={inputField.value ? Number(inputField.value) : undefined}
              onChange={value => inputField.onChange(value?.toString() || '')}
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.enterValue')}
              error={error?.message}
              size="sm"
            />
          )}
        />
      );

    case 'date':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <DateInput
              value={
                inputField.value ? new Date(inputField.value as string) : null
              }
              onChange={inputField.onChange}
              valueFormat="YYYY/MM/DD"
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.selectDate')}
              error={error?.message}
              size="sm"
            />
          )}
        />
      );

    case 'select':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <Select
              value={(inputField.value as string) || null}
              onChange={value => inputField.onChange(value || '')}
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.selectOption')}
              error={error?.message}
              size="sm"
              data={field.options || []}
            />
          )}
        />
      );

    case 'checkbox':
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField}) => (
            <Checkbox
              checked={inputField.value === 'true' || inputField.value === true}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                inputField.onChange(event.currentTarget.checked.toString())
              }
              label={field.description || t('task.customFields.checkboxLabel')}
              size="sm"
            />
          )}
        />
      );

    default:
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({field: inputField, fieldState: {error}}) => (
            <TextInput
              value={inputField.value || ''}
              onChange={inputField.onChange}
              onBlur={inputField.onBlur}
              placeholder={t('task.customFields.enterValue')}
              error={error?.message}
              size="sm"
            />
          )}
        />
      );
  }
};

export function CustomFieldsSection({form, opened}: CustomFieldsSectionProps) {
  const {t} = useTranslation('gantt');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFieldType, setSelectedFieldType] =
    useState<CustomFieldType | null>(null);

  const {data: customFieldTypesData} = useGetCustomFieldTypes({
    enabled: opened,
  });
  const customFieldTypes = customFieldTypesData?.data?.items || [];

  const addCustomField = (
    fieldType: CustomFieldType,
    fieldName: string,
    description: string,
    isRequired: boolean,
  ) => {
    const currentCustomFields = form.getValues('customFields') || [];
    const newCustomField = {
      typeId: fieldType.id,
      name: fieldName,
      key: fieldName.toLowerCase().replace(/\s+/g, '_'),
      description,
      value: '',
      orderIndex: currentCustomFields.length,
      isRequired,
    };

    form.setValue('customFields', [...currentCustomFields, newCustomField]);
  };

  const handleFieldTypeSelect = (fieldType: CustomFieldType) => {
    setSelectedFieldType(fieldType);
    setShowDetailModal(true);
  };

  const removeCustomField = (index: number) => {
    const currentCustomFields = form.getValues('customFields') || [];
    const updatedFields = currentCustomFields.filter((_, i) => i !== index);
    form.setValue('customFields', updatedFields);
  };

  const customFields = form.watch('customFields') || [];

  return (
    <>
      <div>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500}>
            {t('task.customFields.title')}
          </Text>
          <Menu shadow="md" width={250}>
            <Menu.Target>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={16} />}>
                {t('task.customFields.createNewField')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t('task.customFields.selectType')}</Menu.Label>
              {customFieldTypes.map((fieldType: CustomFieldType) => {
                const {icon: Icon, color} = getFieldTypeIcon(fieldType);
                return (
                  <Menu.Item
                    key={fieldType.id}
                    leftSection={
                      <Icon
                        size={16}
                        color={`var(--mantine-color-${color.replace('.', '-')})`}
                      />
                    }
                    onClick={() => handleFieldTypeSelect(fieldType)}>
                    {fieldType.displayName}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        </Group>

        {customFields.length > 0 && (
          <Stack gap="md">
            {customFields.map((field, index) => {
              // Find the field type to get the type info
              const fieldType = customFieldTypes.find(
                type => type.id === field.typeId,
              );
              const fieldWithType = {
                ...field,
                type: fieldType?.name || 'text',
                name: field.name || 'Unnamed Field',
              };

              return (
                <div key={index}>
                  {/* Field Label with type and delete button */}
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text size="sm" fw={500} c="blue">
                        # {field.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ({fieldType?.displayName || 'Text'})
                      </Text>
                      {field.isRequired && (
                        <Text size="xs" c="red">
                          *
                        </Text>
                      )}
                    </Group>
                    <Tooltip label={t('task.customFields.remove')}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => removeCustomField(index)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>

                  {/* Input Field */}
                  {renderCustomFieldInput(
                    fieldWithType,
                    index,
                    form.control,
                    t,
                  )}
                </div>
              );
            })}
          </Stack>
        )}
      </div>

      <CustomFieldDetailModal
        opened={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAddField={addCustomField}
        selectedFieldType={selectedFieldType}
        customFieldTypes={customFieldTypes}
      />
    </>
  );
}
