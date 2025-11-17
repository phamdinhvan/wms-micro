'use client';

import {
  ProjectFormSchemaType,
  projectFormGroupSchema,
  projectSchema,
  requiredProjectSchemaFields,
} from '../../schema/project';

import {yupResolver} from '@hookform/resolvers/yup';
import {Button, Group, Modal, Stack, Title} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {openConfirmModal} from '@mantine/modals';
import {notifications} from '@mantine/notifications';
import dayjs from 'dayjs';
import {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useAppMutation} from '../../hooks/useAppMutation';
import {useTranslation} from '../../i18n';
import {ValidateUtils} from '../../utils';
import {renderInput} from '../input/renderInput';

type ProjectFormModalProps = {
  appId: string;
  opened: boolean;
  onClose: () => void;
  onCreated?: (project: any) => void;
  defaultValues?: Partial<ProjectFormSchemaType>;
  disabledFields?: (keyof ProjectFormSchemaType)[];
};

export function ProjectFormModal({
  appId,
  opened,
  onClose,
  onCreated,
  defaultValues,
  disabledFields = [],
}: ProjectFormModalProps) {
  const {t} = useTranslation('gantt');

  // create-only here; if you need edit, pass isEdit=true into projectSchema
  const form = useForm<ProjectFormSchemaType>({
    resolver: yupResolver(projectSchema(t, /* isEdit */ false) as any),
    defaultValues: {
      appId: appId || '',
      externalId: '',
      name: '',
      description: '',
      code: '',
      startDate: '',
      endDate: '',
      status: 'active',
      priority: 'low',
      manager: '',
      owner: '',
      department: '',
      budget: 0,
      templateId: '',
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // Reset form values when defaultValues change and handle autofocus
  useEffect(() => {
    if (defaultValues && opened) {
      const newValues: Partial<ProjectFormSchemaType> = {
        appId: appId || '',
        externalId: '',
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active' as const,
        priority: 'low' as const,
        manager: '',
        templateId: '',
        ...defaultValues,
      };
      form.reset(newValues);
    } else {
      form.reset({
        appId: appId || '',
        externalId: '',
        name: '',
        code: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active' as const,
        priority: 'low' as const,
        manager: '',
        templateId: '',
      });
    }

    // Focus the first input after modal opens and form resets
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
  }, [defaultValues, opened, appId, form]);

  const {mutateAsync: createProject, isPending} =
    useAppMutation('ganttCreateProject');

  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
  const isRequiredOk = ValidateUtils.checkRequiredFieldsFilled(
    form.watch(),
    requiredProjectSchemaFields,
  );

  const handleSubmit = async (data: ProjectFormSchemaType) => {
    try {
      const payload = {
        appId: data.appId,
        externalId: data.externalId || undefined,
        name: data.name,
        description: data.description || undefined,
        code: data.code || undefined,
        startDate: data.startDate
          ? dayjs(data.startDate).format('YYYY-MM-DD')
          : undefined,
        endDate: data.endDate
          ? dayjs(data.endDate).format('YYYY-MM-DD')
          : undefined,
        status: data.status,
        priority: data.priority || undefined,
        manager: data.manager || undefined,
        owner: data.owner || undefined,
        department: data.department || undefined,
        budget:
          typeof data.budget === 'number' && !Number.isNaN(data.budget)
            ? data.budget
            : 0,
        templateId: data.templateId || null,
      };

      const result = await createProject({
        url: {baseUrl: '/gantt/projects'},
        method: 'post',
        payload,
      });

      notifications.show({
        message: t('project.notification.create'),
        color: 'green',
      });

      onCreated?.(payload);
      onClose();
      form.reset({...form.getValues(), name: '', code: ''});
    } catch (error) {
      console.error('Error creating project:', error);
      notifications.show({
        message: 'Failed to create project: ' + (error as Error).message,
        color: 'red',
      });
    }
  };

  const onSubmit = (data: ProjectFormSchemaType) => {
    openConfirmModal({
      title: t('modal.confirmation'),
      children: <p>{t('project.confirmation.create')}</p>,
      labels: {
        confirm: t('button.create'),
        cancel: t('button.cancel'),
      },
      cancelProps: {},
      confirmProps: {},
      onConfirm: () => handleSubmit(data),
      classNames: {content: 'sm:min-w-[460px]'},
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('project.actions.create')}
      centered
      size={'xl'}
      classNames={{
        title: 'wms-text-lg wms-font-bold wms-text-primary-500',
      }}>
      <FormProvider {...form}>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}>
          <Stack gap="sm">
            {projectFormGroupSchema.map(group => (
              <Stack key={group.name} gap="sm">
                {group.label && (
                  <Group justify="space-between" align="center">
                    <Title className="wms-text-primary-500" order={5}>
                      {t(group.label)}
                    </Title>
                  </Group>
                )}
                {group.col.flatMap((column, columnIndex) => (
                  <div
                    key={`${group.name}-col-${columnIndex}`}
                    className="wms-grid wms-grid-cols-1 wms-lg:wms-grid-cols-2 wms-gap-2">
                    {column.field.map(field =>
                      field.name === 'appId' ? null : (
                        <div key={field.name} className="wms-col-span-1">
                          {renderInput(field, form)}
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </Stack>
            ))}
            <Group justify="flex-end" gap="xs" mt="sm">
              <Button
                type="button"
                variant="outline"
                color="gray"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                disabled={isPending}>
                {t('button.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isPending}
                disabled={!isRequiredOk || !isDirty}>
                {t('button.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </FormProvider>
    </Modal>
  );
}

/** Hook: caller “calls a func”, doesn’t embed modal JSX in page */
export function useProjectCreateModal(opts: {
  appId: string;
  onCreated?: (project: any) => void;
  defaultValues?: Partial<ProjectFormSchemaType>;
  disabledFields?: (keyof ProjectFormSchemaType)[];
}) {
  const [opened, {open, close}] = useDisclosure(false);

  const ModalEl = () => (
    <ProjectFormModal
      appId={opts.appId}
      opened={opened}
      onClose={close}
      onCreated={opts.onCreated}
      defaultValues={opts.defaultValues}
      disabledFields={opts.disabledFields}
    />
  );

  return {open, close, ModalEl};
}
