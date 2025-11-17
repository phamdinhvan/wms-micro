'use client';

import {ActionIcon, Button, Group, Stack, Text} from '@mantine/core';
import {IconPlus, IconTrash} from '@tabler/icons-react';
import {useCallback, useEffect, useState} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {DynamicOptionsMap, ExternalFieldConfig, ExternalFieldsData} from '../../types';
import {ExternalFieldsRenderer} from './ExternalFieldsRenderer';

type RepeatableFieldGroupProps = {
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
  groupConfig: Record<string, ExternalFieldConfig>; // Config cho các fields trong 1 group
  dynamicOptionsGetter: (groupIndex: number) => DynamicOptionsMap; // Function để get options cho mỗi group
  onFieldChange: (groupIndex: number, fieldKey: string, newValue: any) => void;
  fieldName: string; // Name trong form (vd: 'taskMasterGroups')
  minGroups?: number;
  maxGroups?: number;
};

/**
 * Component để render repeatable field groups sử dụng ExternalFieldsRenderer
 * Đơn giản hơn TaskMasterGroupsField, tích hợp trực tiếp với external fields
 */
export function RepeatableFieldGroup({
  form,
  groupConfig,
  dynamicOptionsGetter,
  onFieldChange,
  fieldName,
  minGroups = 1,
  maxGroups = 10,
}: RepeatableFieldGroupProps): JSX.Element {
  const [groupCount, setGroupCount] = useState(minGroups);

  // Initialize form values
  useEffect(() => {
    const currentValue = form.getValues(`externalFields.${fieldName}` as any);
    if (!currentValue) {
      const initialGroups = Array.from({length: minGroups}, () => ({}));
      form.setValue(`externalFields.${fieldName}` as any, initialGroups);
    }
  }, [form, fieldName, minGroups]);

  const handleAddGroup = useCallback(() => {
    if (groupCount < maxGroups) {
      setGroupCount(prev => prev + 1);
      const currentGroups = form.getValues(`externalFields.${fieldName}` as any) || [];
      form.setValue(`externalFields.${fieldName}` as any, [...currentGroups, {}]);
    }
  }, [groupCount, maxGroups, form, fieldName]);

  const handleRemoveGroup = useCallback(
    (index: number) => {
      if (groupCount > minGroups) {
        setGroupCount(prev => prev - 1);
        const currentGroups = (form.getValues(`externalFields.${fieldName}` as any) ||
          []) as any[];
        const newGroups = currentGroups.filter((_, i) => i !== index);
        form.setValue(`externalFields.${fieldName}` as any, newGroups);
      }
    },
    [groupCount, minGroups, form, fieldName],
  );

  // Create wrapper form for each group
  const createGroupForm = (groupIndex: number): UseFormReturn<any> => {
    return {
      ...form,
      getValues: (name?: string) => {
        if (!name) {
          const groupData =
            (form.getValues(`externalFields.${fieldName}` as any) as any[])?.[groupIndex] || {};
          return {externalFields: groupData};
        }
        if (name.startsWith('externalFields.')) {
          const fieldKey = name.replace('externalFields.', '');
          const groupData =
            (form.getValues(`externalFields.${fieldName}` as any) as any[])?.[groupIndex] || {};
          return groupData[fieldKey];
        }
        return form.getValues(name as any);
      },
      setValue: (name: string, value: any) => {
        if (name.startsWith('externalFields.')) {
          const fieldKey = name.replace('externalFields.', '');
          const currentGroups = (form.getValues(`externalFields.${fieldName}` as any) ||
            []) as any[];
          const updatedGroups = [...currentGroups];
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            [fieldKey]: value,
          };
          form.setValue(`externalFields.${fieldName}` as any, updatedGroups);
          
          // Trigger onFieldChange
          onFieldChange(groupIndex, fieldKey, value);
        } else {
          form.setValue(name as any, value);
        }
      },
      watch: form.watch,
      formState: form.formState,
      control: form.control,
      register: form.register,
    } as any;
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={500} size="sm" c="gray.8">
          Task Master Groups
        </Text>
        {groupCount < maxGroups && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddGroup}>
            Add Group
          </Button>
        )}
      </Group>

      <Stack gap="md">
        {Array.from({length: groupCount}, (_, index) => (
          <div
            key={`group-${index}`}
            style={{
              padding: '1rem',
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: '8px',
              backgroundColor: 'var(--mantine-color-gray-0)',
            }}>
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500} c="gray.7">
                Group #{index + 1}
              </Text>
              {groupCount > minGroups && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => handleRemoveGroup(index)}>
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>

            {/* Render ExternalFieldsRenderer cho mỗi group */}
            <ExternalFieldsRenderer
              config={groupConfig}
              form={createGroupForm(index)}
              dynamicOptions={dynamicOptionsGetter(index)}
            />
          </div>
        ))}
      </Stack>
    </Stack>
  );
}
