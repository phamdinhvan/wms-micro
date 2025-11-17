'use client';

import {yupResolver} from '@hookform/resolvers/yup';
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {IconCheck} from '@tabler/icons-react';
import {
  LayoutForm,
  ProjectFormData,
  TFormInput,
  TProject,
  projectFormGroupSchema,
  projectFormSchema,
  renderInput,
  useGetUsers,
  useNavigation,
  useTranslation,
} from '@wms/core';
import dayjs from 'dayjs';
import {useCallback, useEffect, useMemo} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {
  useCreateProject,
  useDeleteProject,
  useGetProject,
  useUpdateProject,
} from '../hooks/useProjectList';

export interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string; // Required for edit mode
  contextKey?: string; // Context key passed from props, not shown in UI
  // Navigation context to track where user came from
  navigationContext?: {
    source: 'list' | 'detail' | 'unknown';
    returnPath?: string; // Specific path to return to
  };
  // Path configuration - có thể override từ props
  paths?: {
    list?: string; // Default: '/projects'
    detail?: string; // Default: '/projects/{projectId}/detail'
    edit?: string; // Default: '/projects/{projectId}/update'
  };
  onBack?: () => void;
  onProjectCreated?: (project: TProject) => void;
  onProjectUpdated?: (project: TProject) => void;
  onProjectDeleted?: (projectId: string) => void;
}

// Type now imported from @wms/core project schema

// Validation error types (local definition until exported from core)
interface ValidationError {
  field: string;
  code: string;
  message: string;
}

// Utility function to handle validation errors
function handleValidationErrors(
  error: unknown,
  form: ReturnType<typeof useForm<ProjectFormData>>,
  t: (key: string, params?: Record<string, unknown>) => string,
) {
  // Type guard to check if error has validation error structure
  const isValidationError = (
    err: unknown,
  ): err is {
    name?: string;
    code?: string;
    validationErrors?: ValidationError[];
  } => {
    return typeof err === 'object' && err !== null;
  };

  if (!isValidationError(error)) {
    return false;
  }

  // Check if this is a validation error
  if (
    error.name === 'ValidationErrorException' ||
    error.code === 'VALIDATION_ERROR'
  ) {
    const validationErrors = error.validationErrors || [];

    // Show general notification with translated error code
    const errorMessage =
      t(`messages.${error.code}`) || t('messages.commonError');
    notifications.show({
      message: errorMessage,
      color: 'red',
    });

    // Set field-specific errors that persist until user interacts with the field
    validationErrors.forEach((validationError: ValidationError) => {
      const translatedMessage =
        t(`messages.${validationError.code}`) || validationError.message;

      // Type-safe field name check
      const fieldName = validationError.field as keyof ProjectFormData;

      // Set error as 'server' type - these persist until field value changes
      form.setError(fieldName, {
        type: 'server',
        message: translatedMessage,
      });
    });

    // DON'T call form.trigger() - this would clear server errors immediately
    // Server errors will persist until the user changes the field value

    return true; // Handled
  }
  return false; // Not handled
}

// Wrapper component to handle renderInput with hooks safely
function FieldRenderer({
  field,
  form,
}: {
  field: TFormInput;
  form: ReturnType<typeof useForm<ProjectFormData>>;
}) {
  return renderInput(field, form);
}

// Simple UserSelect component
function UserSelect({
  usersOptions,
  value,
  onChange,
  placeholder,
  error,
}: {
  usersOptions: Array<{id: string; name: string}>;
  value?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: string;
}) {
  const [t] = useTranslation('gantt');

  // Simple user options: just name as label, id as value
  const selectData = usersOptions.map(user => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <div className="wms-flex wms-items-center wms-gap-2 wms-mb-2 wms-w-full wms-flex-col md:wms-flex-row">
      <label className="wms-w-[220px] wms-font-medium wms-text-sm wms-text-gray-800 wms-shrink-0 wms-pb-[6px] md:wms-whitespace-pre-line wms-whitespace-normal wms-leading-4">
        {t('project.form.assignee.label')}
      </label>
      <Select
        data={selectData}
        value={value || null}
        onChange={onChange}
        placeholder={
          placeholder || t('project.form.assignee.placeholder') || 'Select user'
        }
        searchable
        clearable
        nothingFoundMessage={t('common.noResults') || 'No results found'}
        error={error}
        classNames={{
          input: 'wms-w-full',
          error: 'wms-text-red-500',
        }}
      />
    </div>
  );
}

// MultiUserSelect component for collaborators field
function MultiUserSelect({
  usersOptions,
  value,
  onChange,
  placeholder,
  error,
}: {
  usersOptions: Array<{id: string; name: string}>;
  value?: Array<{id: string; name?: string; email?: string}>;
  onChange: (value: Array<{id: string; name?: string; email?: string}>) => void;
  placeholder?: string;
  error?: string;
}) {
  const [t] = useTranslation('gantt');

  // Map users to select data format
  const selectData = usersOptions.map(user => ({
    value: user.id,
    label: user.name,
  }));

  // Convert value to string array for MultiSelect
  // Ensure value is an array before mapping
  const selectedIds = Array.isArray(value) ? value.map(v => v.id) : [];

  // Handle change: convert string array back to user objects
  const handleChange = (ids: string[]) => {
    const selectedUsers = ids.map(id => {
      const user = usersOptions.find(u => u.id === id);
      return {
        id,
        name: user?.name,
        email: undefined as string | undefined,
      };
    });
    onChange(selectedUsers);
  };

  return (
    <div className="wms-flex wms-items-center wms-gap-2 wms-mb-2 wms-w-full wms-flex-col md:wms-flex-row">
      <label className="wms-w-[220px] wms-font-medium wms-text-sm wms-text-gray-800 wms-shrink-0 wms-pb-[6px] md:wms-whitespace-pre-line wms-whitespace-normal wms-leading-4">
        {t('project.form.collaborators.label')}
      </label>
      <MultiSelect
        data={selectData}
        value={selectedIds}
        onChange={handleChange}
        placeholder={
          placeholder ||
          t('project.form.collaborators.placeholder') ||
          'Select users'
        }
        searchable
        clearable
        nothingFoundMessage={t('common.noResults') || 'No results found'}
        error={error}
        classNames={{
          input: 'wms-w-full',
          error: 'wms-text-red-500',
        }}
      />
    </div>
  );
}

export function ProjectForm({
  mode,
  projectId,
  contextKey,
  navigationContext,
  paths,
  onBack,
  onProjectCreated,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectFormProps) {
  const [t] = useTranslation('gantt');
  const [deleteModalOpened, {open: openDeleteModal, close: closeDeleteModal}] =
    useDisclosure(false);

  // Sử dụng navigation hook
  const {navigate} = useNavigation();

  // Read navigation context from URL parameters
  const urlNavigationContext = useMemo(() => {
    // Access URL search params directly
    const urlParams = new URLSearchParams(window.location.search);
    const from = urlParams.get('from') as 'list' | 'detail' | null;
    const returnPath = urlParams.get('returnPath');

    if (from && returnPath) {
      return {
        source: from,
        returnPath: decodeURIComponent(returnPath),
      };
    }

    return navigationContext;
  }, [navigationContext]);

  // Default paths với khả năng override từ props - memoized để tránh re-render
  const resolvedPaths = useMemo(() => {
    const defaultPaths = {
      list: '/projects',
      detail: '/projects/{projectId}/detail',
      edit: '/projects/{projectId}/update',
    };

    return {
      ...defaultPaths,
      ...paths,
    };
  }, [paths]);

  // Enhanced navigation handler with context-aware routing
  const handleNavigation = useCallback(() => {
    if (onBack) {
      // Backward compatibility - sử dụng onBack prop nếu có
      onBack();
      return;
    }

    // Determine return path based on navigation context (URL params take precedence)
    const activeContext = urlNavigationContext || navigationContext;
    let returnPath: string;

    if (activeContext?.returnPath) {
      // Use explicit return path if provided
      returnPath = activeContext.returnPath;
    } else if (activeContext?.source === 'detail' && projectId) {
      // If came from detail view, return to detail
      returnPath = resolvedPaths.detail.replace('{projectId}', projectId);
    } else {
      // Default: return to list (covers 'list' source and 'unknown')
      returnPath = resolvedPaths.list;
    }

    // Navigate to determined path
    navigate(returnPath, {reload: true});
  }, [
    onBack,
    urlNavigationContext,
    navigationContext,
    resolvedPaths,
    projectId,
    mode,
    navigate,
  ]);

  // Hooks - only fetch project data in edit mode
  const {data: data, isLoading: isLoadingProject} = useGetProject(
    projectId || '',
    {
      enabled: mode === 'edit' && !!projectId,
    },
  );

  const {onCreateProject} = useCreateProject();
  const {onUpdateProject} = useUpdateProject();
  const {onDeleteProject, isDeleting} = useDeleteProject();

  // Get users data for assignee field
  const {data: usersData} = useGetUsers({
    contextKey: contextKey,
    enabled: true,
  });

  // Prepare users options for assignee field
  const usersOptions = usersData?.data || [];

  // Schema now imported from @wms/core project schema
  const schema = projectFormSchema(t);

  const form = useForm<ProjectFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange', // Validate on change to clear errors when user types
    reValidateMode: 'onChange', // Re-validate on change
    defaultValues: {
      externalId: '',
      name: '',
      assignee: undefined,
      description: '',
      key: '',
      type: 'main', // Default to main project
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      actualStartDate: undefined,
      actualEndDate: undefined,
      status: 'active',
      collaborators: [],
    },
  });

  // Load project data for edit mode - with debugging
  useEffect(() => {
    if (mode === 'edit' && data?.data && !isLoadingProject) {
      // Check if project data is nested in a 'data' property
      const projectData = data.data;

      // Use assignee ID for select field
      const assigneeValue = projectData.assignee?.id || undefined;

      form.reset({
        externalId: projectData.externalId || '',
        name: projectData.name || '',
        assignee: assigneeValue as any, // Use ID for select
        description: projectData.description || '',
        key: projectData.key || '',
        type: ((projectData as any).type as ProjectFormData['type']) || 'main', // Load type from project data
        startDate: projectData.startDate
          ? new Date(projectData.startDate)
          : new Date(),
        endDate: projectData.endDate
          ? new Date(projectData.endDate)
          : new Date(),
        actualStartDate: projectData.actualStartDate
          ? new Date(projectData.actualStartDate)
          : undefined,
        actualEndDate: projectData.actualEndDate
          ? new Date(projectData.actualEndDate)
          : undefined,
        status: (projectData.status as ProjectFormData['status']) || 'active',
        collaborators: projectData.collaborators || [],
      });
    }
  }, [mode, data, isLoadingProject, form, projectId]);

  const onSubmit = async (values: ProjectFormData) => {
    try {
      // Parse assignee if it's a JSON string (from select)
      let assigneeValue = values.assignee;

      if (typeof values.assignee === 'string') {
        assigneeValue = usersData?.data?.find(
          (user: any) => user.id === values.assignee,
        );
      }
      const payload = {
        externalId: values.externalId || undefined,
        name: values.name,
        assignee: assigneeValue,
        description: values.description,
        key: values.key,
        // Only send type when creating, not when editing
        ...(mode === 'create' && {type: values.type}),
        contextKey: contextKey || undefined, // Use contextKey from props
        startDate: values.startDate
          ? dayjs(values.startDate).format('YYYY-MM-DD')
          : undefined,
        endDate: values.endDate
          ? dayjs(values.endDate).format('YYYY-MM-DD')
          : undefined,
        actualStartDate: values.actualStartDate
          ? dayjs(values.actualStartDate).format('YYYY-MM-DD')
          : undefined,
        actualEndDate: values.actualEndDate
          ? dayjs(values.actualEndDate).format('YYYY-MM-DD')
          : undefined,
        status: values.status,
        collaborators: values.collaborators || [],
      };

      if (mode === 'create') {
        const result = await onCreateProject(payload);

        notifications.show({
          message:
            t('project.notification.createSuccess') ||
            `Project has been created successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        if (onProjectCreated) {
          onProjectCreated(result);
        } else {
          // For create mode, navigate to the project list page
          navigate(resolvedPaths.list, {reload: true});
        }
      } else {
        const result = await onUpdateProject(projectId!, payload, 'put');

        notifications.show({
          message:
            t('project.notification.updateSuccess') ||
            `Project has been updated successfully`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        if (onProjectUpdated) {
          onProjectUpdated(result);
        } else {
          // For edit mode, use context-aware navigation
          handleNavigation();
        }
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);

      // Try to handle validation errors first
      const wasHandled = handleValidationErrors(error, form, t);

      if (!wasHandled) {
        // Fallback to generic error handling
        const isCreate = mode === 'create';
        notifications.show({
          message: isCreate
            ? t('project.notification.createError') ||
              'Failed to create project. Please try again.'
            : t('project.notification.updateError') ||
              'Failed to update project. Please try again.',
          color: 'red',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (mode !== 'edit' || !projectId) return;

    try {
      await onDeleteProject(projectId);

      notifications.show({
        message:
          t('project.notification.deleteSuccess') ||
          'Project deleted successfully',
        color: 'green',
      });

      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      } else {
        // After delete, always return to list (since detail no longer exists)
        navigate(resolvedPaths.list, {reload: true});
      }
    } catch (error) {
      console.error('❌ Delete error:', error);

      // Try to handle validation errors first
      const wasHandled = handleValidationErrors(error, form, t);

      if (!wasHandled) {
        // Fallback to generic error handling
        notifications.show({
          message:
            t('project.notification.deleteError') ||
            'Failed to delete project. Please try again.',
          color: 'red',
        });
      }
    } finally {
      closeDeleteModal();
    }
  };

  // Show loading state for edit mode
  if (mode === 'edit' && isLoadingProject) {
    return (
      <LayoutForm
        title={t('common.loading') || 'Loading...'}
        actions={<></>}
        onBackClick={handleNavigation}>
        <Text>{t('common.loading') || 'Loading...'}</Text>
      </LayoutForm>
    );
  }

  // Show not found for edit mode
  if (mode === 'edit' && !isLoadingProject && !data?.data) {
    return (
      <LayoutForm
        title={t('project.notFound') || 'Project not found'}
        actions={<></>}
        onBackClick={handleNavigation}>
        <Stack gap="md">
          <Text c="red">{t('project.notFound') || 'Project not found'}</Text>
        </Stack>
      </LayoutForm>
    );
  }

  const isEdit = mode === 'edit';
  const title = isEdit
    ? t('project.edit') || 'Edit Project'
    : t('project.create') || 'Create Project';
  const submitText = isEdit
    ? t('project.update') || 'Update Project'
    : t('button.create') || 'Create';
  // Prepare actions for LayoutForm
  const actions = (
    <Group>
      <Button
        type="submit"
        variant="primary"
        disabled={form.formState.isSubmitting}
        loading={form.formState.isSubmitting}
        form="project-form">
        {submitText}
      </Button>
    </Group>
  );

  return (
    <LayoutForm
      title={title}
      actions={actions}
      onBackClick={onBack}
      backText={t('button.back') || 'Back'}>
      <FormProvider {...form}>
        <form id="project-form" onSubmit={form.handleSubmit(onSubmit)}>
          <Stack gap="sm">
            {projectFormGroupSchema
              .filter(group =>
                ['basic', 'schedule', 'people', 'extra'].includes(group.name),
              )
              .map(group => (
                <Stack key={group.name} gap="sm">
                  {group.col.flatMap((column, columnIndex) => {
                    const filteredFields = column.field.filter(field =>
                      [
                        'externalId',
                        'type',
                        'name',
                        'key',
                        'description',
                        'assignee',
                        'collaborators',
                        'startDate',
                        'endDate',
                        'actualStartDate',
                        'actualEndDate',
                        'status',
                      ].includes(field.name),
                    );

                    // Special handling for schedule group to put dates on same line
                    if (group.name === 'schedule') {
                      const startDateField = filteredFields.find(
                        f => f.name === 'startDate',
                      );
                      const endDateField = filteredFields.find(
                        f => f.name === 'endDate',
                      );
                      const actualStartDateField = filteredFields.find(
                        f => f.name === 'actualStartDate',
                      );
                      const actualEndDateField = filteredFields.find(
                        f => f.name === 'actualEndDate',
                      );

                      return (
                        <Stack
                          key={`${group.name}-col-${columnIndex}`}
                          gap="sm">
                          {/* Planned dates row */}
                          {startDateField && endDateField && (
                            <div className="wms-flex wms-gap-4">
                              <div className="wms-flex-1">
                                <FieldRenderer
                                  field={startDateField}
                                  form={form}
                                />
                              </div>
                              <div className="wms-flex-1">
                                <FieldRenderer
                                  field={endDateField}
                                  form={form}
                                />
                              </div>
                            </div>
                          )}

                          {/* Actual dates row */}
                          {actualStartDateField && actualEndDateField && (
                            <div className="wms-flex wms-gap-4">
                              <div className="wms-flex-1">
                                <FieldRenderer
                                  field={actualStartDateField}
                                  form={form}
                                />
                              </div>
                              <div className="wms-flex-1">
                                <FieldRenderer
                                  field={actualEndDateField}
                                  form={form}
                                />
                              </div>
                            </div>
                          )}
                        </Stack>
                      );
                    }

                    return (
                      <Stack key={`${group.name}-col-${columnIndex}`} gap="sm">
                        {filteredFields.map(field => {
                          // Special case for assignee field
                          if (
                            field.name === 'assignee' &&
                            usersOptions &&
                            usersOptions.length > 0
                          ) {
                            const assigneeValue = form.watch('assignee');
                            const currentValue =
                              typeof assigneeValue === 'string'
                                ? assigneeValue
                                : assigneeValue?.id;

                            return (
                              <UserSelect
                                key={field.name}
                                usersOptions={usersOptions}
                                value={currentValue}
                                onChange={value =>
                                  form.setValue('assignee', value)
                                }
                                error={form.formState.errors.assignee?.message}
                              />
                            );
                          }

                          // Special case for collaborators field
                          if (
                            field.name === 'collaborators' &&
                            usersOptions &&
                            usersOptions.length > 0
                          ) {
                            const collaboratorsValue =
                              form.watch('collaborators');

                            return (
                              <MultiUserSelect
                                key={field.name}
                                usersOptions={usersOptions}
                                value={collaboratorsValue}
                                onChange={value =>
                                  form.setValue('collaborators', value)
                                }
                                error={
                                  form.formState.errors.collaborators?.message
                                }
                              />
                            );
                          }

                          // Default: use FieldRenderer for all other fields
                          // Disable type field in edit mode (cannot change project type after creation)
                          const fieldToRender =
                            field.name === 'type' && mode === 'edit'
                              ? {...field, disabled: true}
                              : field;

                          return (
                            <FieldRenderer
                              key={field.name}
                              field={fieldToRender}
                              form={form}
                            />
                          );
                        })}
                      </Stack>
                    );
                  })}
                </Stack>
              ))}
          </Stack>
        </form>
      </FormProvider>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={t('common.confirm') || 'Confirm'}
        centered
        withCloseButton={true}>
        <Stack gap="md">
          <Text>
            {t('project.confirmation.delete') ||
              'Are you sure you want to delete this project?'}
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="outline" color="gray" onClick={closeDeleteModal}>
              {t('button.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              loading={isDeleting}>
              {t('button.ok') || 'OK'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </LayoutForm>
  );
}
