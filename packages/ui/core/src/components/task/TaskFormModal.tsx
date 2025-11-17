'use client';

import {yupResolver} from '@hookform/resolvers/yup';
import {
  Button,
  Drawer,
  Grid,
  Group,
  Slider,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {openConfirmModal} from '@mantine/modals';
import {notifications} from '@mantine/notifications';
import {IconTool} from '@tabler/icons-react';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {useAppMutation} from '../../hooks/useAppMutation';
import {useGetTaskById} from '../../hooks/useTaskApi';
import {useTranslation} from '../../i18n';
import {useTaskFieldsConfig} from '../../providers/ExternalFieldsConfigProvider';
import {TaskFormSchemaType, taskGroupSchema, taskSchema} from '../../schema';
import {TaskAssignee, TaskPriority, TaskStatus, TFormInput, RelationTask} from '../../types';
import {EnhancedExternalFieldsRenderer} from '../externalFields/EnhancedExternalFieldsRenderer';
import {renderInput} from '../input/renderInput';
import {
  CustomFieldsSection,
  TaskDependenciesTab,
  TaskPrioritySelector,
  TaskStatusSelector,
} from './components';

// Wrapper component to handle renderInput with hooks safely
function FieldRenderer({
  field,
  form,
  assigneeOptions,
}: {
  field: TFormInput;
  form: ReturnType<typeof useForm<TaskFormSchemaType>>;
  assigneeOptions?: TaskAssignee[];
}) {
  // For assignee field, populate options dynamically
  if (field.name === 'assignee' && assigneeOptions) {
    return renderInput(
      {
        ...field,
        name: 'attributes.assignee',
        type: 'select',
        options: assigneeOptions.map(a => ({value: a.id, label: a.name})),
        searchable: true,
        clearable: true,
      },
      form,
    );
  }

  // For manager field, populate options dynamically
  if (field.name === 'manager' && assigneeOptions) {
    return renderInput(
      {
        ...field,
        type: 'select',
        options: assigneeOptions.map(a => ({value: a.id, label: a.name})),
        searchable: true,
        clearable: true,
      },
      form,
    );
  }

  return renderInput(field, form);
}

type TaskFormModalProps = {
  projectId: string;
  opened: boolean;
  onClose: () => void;
  onCreated?: (task: TaskFormSchemaType) => void;
  onUpdated?: (task: TaskFormSchemaType) => void;
  defaultValues?: Partial<TaskFormSchemaType>;
  disabledFields?: (keyof TaskFormSchemaType)[];
  isEdit?: boolean;
  taskId?: string; // Add taskId for fetching task details
  parentId?: string | null; // Add parentId for creating child tasks
  assigneeOptions?: TaskAssignee[];
  statusOptions?: TaskStatus[];
  priorityOptions?: TaskPriority[];
  projectStartDate?: string;
};

export function TaskFormModal({
  projectId,
  opened,
  onClose,
  onCreated,
  onUpdated,
  defaultValues,
  isEdit = false,
  taskId,
  parentId,
  assigneeOptions = [],
  statusOptions = [],
  priorityOptions = [],
  projectStartDate,
}: TaskFormModalProps) {
  const {t} = useTranslation('gantt');
  const taskFieldsConfig = useTaskFieldsConfig();

  // Fetch task details when in edit mode
  const {taskDetail} = useGetTaskById(projectId, taskId || '');

  const form = useForm<TaskFormSchemaType>({
    resolver: yupResolver(taskSchema(t, isEdit) as any),
    defaultValues: {
      projectId: projectId || '',
      externalId: '',
      name: '',
      description: '',
      notes: '',
      startDate: null,
      endDate: null,
      attributes: {
        status: 'new',
        priority: 'normal',
        assignee: '',
      },
      level: 0,
      category: '',
      manager: '',
      parentId: '',
      progress: 0,
      tags: [],
      customFields: [],
      externalFields: {},
      relations: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // Reset form values when modal opens or task data loads
  useEffect(() => {
    if (opened) {
      let newValues: Partial<TaskFormSchemaType> = {
        projectId: projectId || '',
        externalId: '',
        name: '',
        description: '',
        notes: '',
        startDate: null,
        endDate: null,
        attributes: {
          status: 'new' as const,
          priority: 'normal' as const,
          assignee: '',
        },
        level: 0,
        category: '',
        manager: '',
        parentId: '',
        progress: 0,
        tags: [],
        customFields: [],
        externalFields: {},
        relations: [],
        ...(defaultValues || {}),
      };

      // If in edit mode and task detail is loaded, populate form with task data
      if (isEdit && taskDetail?.data) {
        const task = taskDetail.data;
        newValues = {
          ...newValues,
          id: task.id,
          externalId: task.externalId || '',
          name: task.name || '',
          description: task.description || '',
          notes: task.notes || '',
          startDate: task.startDate ? new Date(task.startDate) : null,
          endDate: task.endDate ? new Date(task.endDate) : null,
          progress: task.progress || 0,
          customFields: task.customFields || [],
          externalFields: task.externalFields || {},
          relations: (task.relations || []).map((relation: RelationTask) => ({
            targetTaskId: relation.targetTask.id,
            relationType: relation.relationType || 'FS',
            delayDays: relation.delayDays || 0,
          })),
          attributes: {
            status: task.attributes?.status || 'new',
            priority: task.attributes?.priority || 'normal',
            assignee: task.attributes?.assignee?.id || '',
          },
        };
      }

      form.reset(newValues);
    }
  }, [opened, form, defaultValues, projectId, isEdit, taskDetail]);

  // Focus the first input only when modal first opens
  useEffect(() => {
    if (opened) {
      setTimeout(() => {
        const firstInput = document.querySelector(
          '[data-autofocus="true"]',
        ) as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [opened]);

  const {mutateAsync: createTask} = useAppMutation('ganttCreateTask');
  const {mutateAsync: updateTask} = useAppMutation('ganttUpdateTask');

  useEffect(() => {
    if (defaultValues && opened) {
      // Merge defaultValues with current form values instead of completely replacing
      const currentValues = form.getValues();
      const mergedValues = {
        ...currentValues,
        ...defaultValues,
      };
      form.reset(mergedValues);
    }
  }, [defaultValues, opened, form]);

  const handleSubmit = async (data: TaskFormSchemaType) => {
    try {
      const payload = {
        externalId: data.externalId || undefined,
        name: data.name,
        description: data.description || undefined,
        notes: data.notes || undefined,
        startDate: data.startDate
          ? dayjs(data.startDate).format('YYYY-MM-DD')
          : undefined,
        endDate: data.endDate
          ? dayjs(data.endDate).format('YYYY-MM-DD')
          : undefined,
        attributes: {
          status: data.attributes?.status || 'new',
          priority: data.attributes?.priority || 'normal',
          assignee: data.attributes?.assignee
            ? assigneeOptions.find(
                opt => opt.id === data.attributes?.assignee,
              ) || {
                id: data.attributes.assignee,
                name: undefined as string | undefined,
                email: undefined as string | undefined,
              }
            : undefined,
        },
        parentId: parentId || data.parentId || undefined,
        progress:
          typeof data.progress === 'number' && !Number.isNaN(data.progress)
            ? data.progress
            : 0,
        tags: data.tags || [],
        customFields: (data.customFields || [])
          .filter(
            field =>
              field.value && (field.value as string).toString().trim() !== '',
          ) // Only include fields with values
          .map((field, index) => ({
            typeId: field.typeId,
            name: field.name,
            key: field.key,
            description: field.description || '',
            value: field.value,
            orderIndex: index,
            isRequired: field.isRequired || false,
          })),
        externalFields: data.externalFields || {},
        relations: data.relations || [],
      };

      if (isEdit && taskId) {
        await updateTask({
          url: {
            baseUrl: '/gantt/:projectId/tasks/:taskId',
            urlParams: {projectId, taskId},
          },
          method: 'put',
          payload,
        });

        notifications.show({
          message: t('task.notification.update'),
          color: 'green',
        });

        onUpdated?.(data);
      } else {
        const res = (await createTask({
          url: {baseUrl: '/gantt/:projectId/tasks', urlParams: {projectId}},
          method: 'post',
          payload,
        })) as any;

        notifications.show({
          message: t('task.notification.create'),
          color: 'green',
        });
        onCreated?.({...data, id: res.data?.id});
      }

      onClose();
      form.reset({...form.getValues(), name: '', description: ''});
    } catch (error) {
      console.error('Error submitting task:', error);
      notifications.show({
        message: 'Error submitting task',
        color: 'red',
      });
    }
  };

  const onSubmit = (data: TaskFormSchemaType) => {
    openConfirmModal({
      title: t('modal.confirmation'),

      children: (
        <p>
          {isEdit
            ? t('task.confirmation.update')
            : t('task.confirmation.create')}
        </p>
      ),
      labels: {
        confirm: isEdit ? t('button.save') : t('button.create'),
        cancel: t('button.cancel'),
      },
      cancelProps: {variant: 'outline'},
      confirmProps: {variant: 'filled'},
      onConfirm: () => {
        handleSubmit(data).catch(console.error);
      },
      classNames: {content: 'sm:min-w-[460px]'},
      styles: {
        header: {
          backgroundColor: 'white',
          color: 'black',
          padding: '16px',
        },
        title: {
          color: 'black',
          fontWeight: 600,
          fontSize: 16,
        },
      },
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Title c="dark" size={'xl'} fw={600}>
          {!isEdit ? t('task.form.title.create') : t('task.form.title.edit')}
        </Title>
      }
      position="right"
      size="xl"
      styles={{
        content: {
          backgroundColor: 'var(--mantine-color-white)',
          color: 'var(--mantine-color-dark-7)',
          display: 'flex',
          flexDirection: 'column',
        },
        header: {
          backgroundColor: 'var(--mantine-color-white)',
          borderBottom: 'none',
          flexShrink: 0,
        },
        body: {
          padding: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
          }}>
          {/* Scrollable content area */}
          <div
            style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              padding: '1.5rem',
            }}>
            <Tabs defaultValue="details" orientation="horizontal">
              <Tabs.List>
                <Tabs.Tab value="details">
                  {t('task.tabs.details') || 'Details'}
                </Tabs.Tab>
                <Tabs.Tab value="dependencies">
                  {t('task.tabs.dependencies') || 'Dependencies'}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="details" pt="md">
                <Stack gap="sm">
                  {/* Render form fields from schema */}
                  {taskGroupSchema
                    .filter(group =>
                      ['basic', 'schedule', 'people', 'extra'].includes(group.name),
                    )
                    .map(group => (
                      <Stack key={group.name} gap="sm">
                        {group.col.flatMap((column, columnIndex) => {
                          const filteredFields = column.field.filter(field =>
                            [
                              'name',
                              'description',
                              'category',
                              'startDate',
                              'endDate',
                              'progress',
                              'assignee',
                              'manager',
                              'notes',
                              'externalId',
                            ].includes(field.name),
                          );

                          // Special handling for schedule group - dates on same line, progress with slider
                          if (group.name === 'schedule') {
                            const startDateField = filteredFields.find(
                              f => f.name === 'startDate',
                            );
                            const endDateField = filteredFields.find(
                              f => f.name === 'endDate',
                            );
                            const progressField = filteredFields.find(
                              f => f.name === 'progress',
                            );

                            return (
                              <Stack
                                key={`${group.name}-col-${columnIndex}`}
                                gap="sm">
                                {/* Status & Priority Row */}
                                <Grid>
                                  <Grid.Col span={6}>
                                    <TaskStatusSelector control={form.control} />
                                  </Grid.Col>
                                  <Grid.Col span={6}>
                                    <TaskPrioritySelector control={form.control} />
                                  </Grid.Col>
                                </Grid>

                                {/* Date fields row */}
                                {startDateField && endDateField && (
                                  <div className="wms-flex wms-gap-4">
                                    <div className="wms-flex-1">
                                      <FieldRenderer
                                        field={startDateField}
                                        form={form}
                                        assigneeOptions={assigneeOptions}
                                      />
                                    </div>
                                    <div className="wms-flex-1">
                                      <FieldRenderer
                                        field={endDateField}
                                        form={form}
                                        assigneeOptions={assigneeOptions}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Progress slider */}
                                {progressField && (
                                  <div className="wms-mb-4">
                                    <Group gap="xs" mb={8}>
                                      <Text size="sm" c="gray.8" fw={500}>
                                        {t('task.form.progress.label')}
                                      </Text>
                                      <Text size="sm" c="dark.7">
                                        {form.watch('progress')
                                          ? `${form.watch('progress')}%`
                                          : '0%'}
                                      </Text>
                                    </Group>
                                    <Controller
                                      name="progress"
                                      control={form.control}
                                      render={({field}) => (
                                        <Slider
                                          style={{marginBottom: '20px'}}
                                          {...field}
                                          min={0}
                                          max={100}
                                          step={5}
                                          marks={[
                                            {value: 0, label: '0%'},
                                            {value: 25, label: '25%'},
                                            {value: 50, label: '50%'},
                                            {value: 75, label: '75%'},
                                            {value: 100, label: '100%'},
                                          ]}
                                        />
                                      )}
                                    />
                                  </div>
                                )}
                              </Stack>
                            );
                          }

                          // Special handling for people group - assignee and manager on same row
                          if (group.name === 'people') {
                            const assigneeField = filteredFields.find(
                              f => f.name === 'assignee',
                            );
                            const managerField = filteredFields.find(
                              f => f.name === 'manager',
                            );

                            return (
                              <Stack
                                key={`${group.name}-col-${columnIndex}`}
                                gap="sm">
                                {assigneeField && managerField && (
                                  <div className="wms-flex wms-gap-4">
                                    <div className="wms-flex-1">
                                      <FieldRenderer
                                        field={assigneeField}
                                        form={form}
                                        assigneeOptions={assigneeOptions}
                                      />
                                    </div>
                                    <div className="wms-flex-1">
                                      <FieldRenderer
                                        field={managerField}
                                        form={form}
                                        assigneeOptions={assigneeOptions}
                                      />
                                    </div>
                                  </div>
                                )}
                              </Stack>
                            );
                          }

                          // Default rendering for other groups
                          return (
                            <Stack
                              key={`${group.name}-col-${columnIndex}`}
                              gap="sm">
                              {filteredFields.map(field => (
                                <FieldRenderer
                                  key={field.name}
                                  field={field}
                                  form={form}
                                  assigneeOptions={assigneeOptions}
                                />
                              ))}
                            </Stack>
                          );
                        })}
                      </Stack>
                    ))}

                  {/* Custom Fields Section */}
                  <CustomFieldsSection form={form} opened={opened} />

                  {/* External Fields Section */}
                  {taskFieldsConfig && Object.keys(taskFieldsConfig).length > 0 && (
                    <div>
                      <Group gap="xs" mb={4}>
                        <IconTool size={16} color="var(--mantine-color-gray-5)" />
                        <Text size="sm" c="gray.8" fw={500}>
                          {t('task.form.externalFields') || 'External Fields'}
                        </Text>
                      </Group>
                      <EnhancedExternalFieldsRenderer
                        fields={taskFieldsConfig || {}}
                        form={form}
                      />
                    </div>
                  )}
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="dependencies" pt="md">
                <TaskDependenciesTab
                  form={form}
                  projectId={projectId}
                  taskId={taskId}
                />
              </Tabs.Panel>
            </Tabs>
          </div>

          {/* Fixed footer with action buttons */}
          <div
            style={{
              flexShrink: 0,
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--mantine-color-gray-2)',
              backgroundColor: 'var(--mantine-color-white)',
            }}>
            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={form.formState.isSubmitting}>
                {isEdit
                  ? t('task.form.title.edit')
                  : t('task.form.title.create')}
              </Button>
            </Group>
          </div>
        </form>
      </FormProvider>
    </Drawer>
  );
}

export function useTaskFormModal() {
  const [opened, {open, close}] = useDisclosure(false);

  const TaskFormModalComponent = (
    props: Omit<TaskFormModalProps, 'opened' | 'onClose'>,
  ) => <TaskFormModal {...props} opened={opened} onClose={close} />;

  return {
    opened,
    open,
    close,
    TaskFormModal: TaskFormModalComponent,
  };
}

export function useTaskCreateModal(opts: {
  projectId: string;
  onCreated?: (task: TaskFormSchemaType) => void;
  defaultValues?: Partial<TaskFormSchemaType>;
  disabledFields?: (keyof TaskFormSchemaType)[];
  assigneeOptions?: TaskAssignee[];
}) {
  const [opened, {open, close}] = useDisclosure(false);

  const ModalEl = () => (
    <TaskFormModal
      projectId={opts.projectId}
      opened={opened}
      onClose={close}
      onCreated={opts.onCreated}
      defaultValues={opts.defaultValues}
      disabledFields={opts.disabledFields}
      assigneeOptions={opts.assigneeOptions}
    />
  );

  return {open, close, ModalEl};
}

export function useTaskEditModal(opts: {
  projectId: string;
  onUpdated?: (task: TaskFormSchemaType) => void;
  defaultValues?: Partial<TaskFormSchemaType>;
  disabledFields?: (keyof TaskFormSchemaType)[];
  assigneeOptions?: TaskAssignee[];
}) {
  const [opened, {open, close}] = useDisclosure(false);

  const ModalEl = () => (
    <TaskFormModal
      projectId={opts.projectId}
      opened={opened}
      onClose={close}
      onUpdated={opts.onUpdated}
      defaultValues={opts.defaultValues}
      disabledFields={opts.disabledFields}
      assigneeOptions={opts.assigneeOptions}
      isEdit={true}
    />
  );

  return {open, close, ModalEl};
}
