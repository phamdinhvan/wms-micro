'use client';

import {
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {IconPlus, IconTrash} from '@tabler/icons-react';
import {useState} from 'react';
import {Controller, UseFormReturn, useFieldArray} from 'react-hook-form';
import {useGetPossibleTargetsTasks} from '../../../hooks/useTaskApi';
import {useTranslation} from '../../../i18n';
import {TaskFormSchemaType} from '../../../schema';
import {RelationFormData, TaskResponse} from '../../../types';

interface TaskDependenciesTabProps {
  form: UseFormReturn<TaskFormSchemaType>;
  projectId: string;
  taskId?: string;
}

export function TaskDependenciesTab({
  form,
  projectId,
  taskId,
}: TaskDependenciesTabProps) {
  const {t} = useTranslation('gantt');
  
  const relationTypeOptions = [
    {value: 'FS', label: t('task.dependencies.relationTypes.FS') || 'Finish-to-Start (FS)'},
    {value: 'SS', label: t('task.dependencies.relationTypes.SS') || 'Start-to-Start (SS)'},
    {value: 'FF', label: t('task.dependencies.relationTypes.FF') || 'Finish-to-Finish (FF)'},
    {value: 'SF', label: t('task.dependencies.relationTypes.SF') || 'Start-to-Finish (SF)'},
  ];
  const [searchValue, setSearchValue] = useState('');

  // Get possible target tasks for dependencies
  const {possibleTargets, isLoading} = useGetPossibleTargetsTasks(
    projectId,
    taskId || '',
  );

  // Field array for managing relations
  const {fields, append, remove} = useFieldArray({
    control: form.control,
    name: 'relations',
  });

  // Transform possible targets to select options
  const taskOptions =
    possibleTargets?.data?.map((task: TaskResponse) => ({
      value: task.id,
      label: `${task.name}`,
    })) || [];

  const addDependency = () => {
    append({
      targetTaskId: '',
      relationType: 'FS' as const,
      delayDays: 0,
    } as RelationFormData);
  };

  const removeDependency = (index: number) => {
    remove(index);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={4}>
          {t('task.dependencies.title') || 'Task Dependencies'}
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          size="sm"
          onClick={addDependency}>
          {t('task.dependencies.add') || 'Add Dependency'}
        </Button>
      </Group>

      {fields.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {t('task.dependencies.empty') || 'No dependencies configured'}
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                {t('task.dependencies.targetTask') || 'Target Task'}
              </Table.Th>
              <Table.Th>
                {t('task.dependencies.relationType') || 'Relation Type'}
              </Table.Th>
              <Table.Th>
                {t('task.dependencies.delayDays') || 'Delay (Days)'}
              </Table.Th>
              <Table.Th width={60}>{t('button.action') || 'Actions'}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {fields.map((field, index) => (
              <Table.Tr key={field.id}>
                <Table.Td>
                  <Controller
                    name={`relations.${index}.targetTaskId`}
                    control={form.control}
                    render={({field: controllerField, fieldState}) => (
                      <Select
                        {...controllerField}
                        data={taskOptions}
                        placeholder={
                          t('task.dependencies.selectTask') || 'Select a task'
                        }
                        searchable
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        clearable
                        error={fieldState.error?.message}
                        disabled={isLoading}
                        size="sm"
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Controller
                    name={`relations.${index}.relationType`}
                    control={form.control}
                    render={({field: controllerField, fieldState}) => (
                      <Select
                        {...controllerField}
                        data={relationTypeOptions}
                        placeholder={
                          t('task.dependencies.selectRelationType') ||
                          'Select relation type'
                        }
                        error={fieldState.error?.message}
                        size="sm"
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Controller
                    name={`relations.${index}.delayDays`}
                    control={form.control}
                    render={({field: controllerField, fieldState}) => (
                      <TextInput
                        {...controllerField}
                        type="number"
                        min={0}
                        placeholder="0"
                        error={fieldState.error?.message}
                        size="sm"
                        style={{width: 80}}
                      />
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color="red"
                    variant="light"
                    size="sm"
                    onClick={() => removeDependency(index)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Text size="sm" c="dimmed">
        {t('task.dependencies.description') ||
          'Dependencies define the relationships between tasks. For example, a Finish-to-Start (FS) dependency means the target task cannot start until this task finishes.'}
      </Text>
    </Stack>
  );
}
