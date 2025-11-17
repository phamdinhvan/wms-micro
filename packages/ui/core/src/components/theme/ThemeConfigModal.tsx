'use client';

import {yupResolver} from '@hookform/resolvers/yup';
import {
  Button,
  ColorInput,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import {openConfirmModal} from '@mantine/modals';
import {useEffect, useState} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {DATE_FORMAT} from '../../constants';
import {useGetTheme, useUpdateTheme} from '../../hooks/useThemeApi';
import {useTranslation} from '../../i18n';
import {
  requiredThemeSchemaFields,
  ThemeFormSchemaType,
  themeSchema,
} from '../../schema';
import {defaultGanttTheme, GanttThemeConfig} from '../../types/theme';
import {ValidateUtils} from '../../utils';
import {
  generateColorShades,
  generateDefaultColorPalette,
} from '../../utils/color';

// Utility functions for converting between theme config and form values
function getDefaultFormValues(): ThemeFormSchemaType {
  return {
    theme: 'light',
    primaryColor: '#FF9800',
    fontPrimary: 'Inter, sans-serif',
    fontNumeric: 'Inter, sans-serif',
    fontMono: 'JetBrains Mono, monospace',
    defaultRadius: 'md',
    statusNew: '#6b7280',
    statusInProgress: '#3b82f6',
    statusCompleted: '#10b981',
    priorityHigh: '#f59e0b',
    borderTimeline: '#E5E7EB',
    borderTimelineMonthEnd: '#9CA3AF',
    showProgress: true,
    compactMode: false,
    showDependencies: true,
    dateFormat: 'MM/dd/yyyy',
    timezone: 'UTC',
  };
}

// Helper function to get valid value or fallback
function getValidValue<T>(value: T | null | undefined | '', fallback: T): T {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
}

function convertThemeToFormValues(
  theme: GanttThemeConfig,
): ThemeFormSchemaType {
  const customColors = theme.tailwind?.customColors as any;

  return {
    theme: theme.theme || defaultGanttTheme.theme || 'light',
    primaryColor: theme.primaryColor || defaultGanttTheme.primaryColor || '',
    fontPrimary:
      theme.mantine?.fontFamilies?.primary ||
      defaultGanttTheme.tailwind?.fontFamilies?.primary ||
      '',
    fontNumeric:
      theme.mantine?.fontFamilies?.numeric ||
      defaultGanttTheme.tailwind?.fontFamilies?.numeric ||
      '',
    fontMono:
      theme.mantine?.fontFamilies?.mono ||
      defaultGanttTheme.tailwind?.fontFamilies?.mono ||
      '',
    defaultRadius:
      theme.mantine?.defaultRadius ||
      defaultGanttTheme.mantine?.defaultRadius ||
      'md',
    statusNew: theme.colors?.statusNew || '#6b7280',
    statusInProgress: theme.colors?.statusInProgress || '#3b82f6',
    statusCompleted: theme.colors?.statusCompleted || '#10b981',
    priorityHigh: theme.colors?.priorityHigh || '#f59e0b',
    borderTimeline:
      customColors?.borderTimeline ||
      defaultGanttTheme.tailwind?.customColors?.borderTimeline ||
      '#E5E7EB',
    borderTimelineMonthEnd:
      customColors?.borderTimelineMonthEnd ||
      defaultGanttTheme.tailwind?.customColors?.borderTimelineMonthEnd ||
      '#9CA3AF',
    showProgress:
      theme.displayFeatures?.showProgress ??
      defaultGanttTheme.displayFeatures?.showProgress ??
      true,
    compactMode:
      theme.displayFeatures?.compactMode ??
      defaultGanttTheme.displayFeatures?.compactMode ??
      false,
    showDependencies:
      theme.displayFeatures?.showDependencies ??
      defaultGanttTheme.displayFeatures?.showDependencies ??
      false,
    dateFormat:
      theme.displayFeatures?.dateFormat ||
      defaultGanttTheme.displayFeatures?.dateFormat ||
      DATE_FORMAT,
    timezone:
      theme.displayFeatures?.timezone ||
      defaultGanttTheme.displayFeatures?.timezone ||
      'UTC',
  };
}

function convertFormValuesToTheme(
  formValues: ThemeFormSchemaType,
): GanttThemeConfig {
  const primaryColor = formValues.primaryColor;
  const primaryShades = primaryColor
    ? generateColorShades(primaryColor)
    : undefined;
  const defaultPalettes = generateDefaultColorPalette();

  return {
    theme: formValues.theme,
    primaryColor: primaryColor,
    mantine: {
      primaryColor: 'primary',
      defaultRadius: formValues.defaultRadius,
      colors: {
        ...defaultPalettes,
        ...(primaryShades && {primary: primaryShades}),
      },
      fontFamilies: {
        primary: formValues.fontPrimary,
        numeric: formValues.fontNumeric,
        mono: formValues.fontMono,
      },
    },
    tailwind: {
      primaryColor: primaryColor,
      fontFamilies: {
        primary: formValues.fontPrimary,
        numeric: formValues.fontNumeric,
        mono: formValues.fontMono,
      },
      customColors: {
        borderTimeline: formValues.borderTimeline,
        borderTimelineMonthEnd: formValues.borderTimelineMonthEnd,
      },
    },
    colors: {
      statusNew: formValues.statusNew,
      statusInProgress: formValues.statusInProgress,
      statusCompleted: formValues.statusCompleted,
      priorityHigh: formValues.priorityHigh,
    },
    customVariables: {
      focus: formValues.primaryColor,
      selected: formValues.primaryColor ?? `${formValues.primaryColor}20`,
    },
    displayFeatures: {
      showProgress: formValues.showProgress,
      compactMode: formValues.compactMode,
      showDependencies: formValues.showDependencies,
      dateFormat: formValues.dateFormat,
      timezone: formValues.timezone,
    },
  };
}

type ThemeConfigModalProps = {
  projectId: string;
  opened: boolean;
  onClose: () => void;
  onUpdated?: (theme: GanttThemeConfig) => void;
  onPreview?: (theme: GanttThemeConfig | null) => void; // For live preview
};

export function ThemeConfigModal({
  projectId,
  opened,
  onClose,
  onUpdated,
  onPreview,
}: ThemeConfigModalProps) {
  const {t} = useTranslation('gantt');
  const [originalTheme, setOriginalTheme] = useState<GanttThemeConfig | null>(
    null,
  );

  // API hooks
  const {data: themeResponse, isLoading: isLoadingTheme} = useGetTheme({
    projectId,
    options: {enabled: opened && !!projectId},
  });
  const {onUpdateTheme, isUpdating} = useUpdateTheme(projectId);

  const form = useForm<ThemeFormSchemaType>({
    resolver: yupResolver(themeSchema(t) as any),
    mode: 'onChange',
  });

  // Load theme data when modal opens
  useEffect(() => {
    if (opened && themeResponse?.data) {
      const themeData = themeResponse.data;
      setOriginalTheme(themeData); // Store original theme for revert
      const formValues = convertThemeToFormValues(themeData);
      form.reset(formValues);

      // Initialize preview with current theme
      if (onPreview) {
        onPreview(themeData);
      }
    } else {
      onPreview?.(null);
    }
  }, [opened, themeResponse, form, onPreview]);

  // Watch form changes for live preview
  const watchedValues = form.watch();

  useEffect(() => {
    if (opened && onPreview && form.formState.dirtyFields) {
      // Update preview when form changes
      const previewTheme = convertFormValuesToTheme(watchedValues);
      onPreview(previewTheme);
    }
  }, [watchedValues, opened, onPreview, form.formState.dirtyFields]);

  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
  const isRequiredOk = ValidateUtils.checkRequiredFieldsFilled(
    form.watch(),
    requiredThemeSchemaFields,
  );

  const handleSubmit = async (data: ThemeFormSchemaType) => {
    try {
      const themeConfig = convertFormValuesToTheme(data);
      await onUpdateTheme(themeConfig, response => {
        onUpdated?.(response.data);
        setOriginalTheme(response.data); // Update original theme after successful save
        onClose();
        form.reset(data);
      });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const handleClose = () => {
    if (onPreview && originalTheme) {
      // Revert to original theme when closing without saving
      onPreview(originalTheme);
    } else if (onPreview) {
      // Clear preview if no original theme
      onPreview(null);
    }
    onClose();
  };

  const onSubmit = (data: ThemeFormSchemaType) => {
    openConfirmModal({
      title: t('modal.confirmation'),
      children: (
        <p>
          {t(
            'theme.confirmation.update',
            'Are you sure you want to update the theme configuration?',
          )}
        </p>
      ),
      labels: {
        confirm: t('button.save'),
        cancel: t('button.cancel'),
      },
      onConfirm: () => {
        handleSubmit(data).catch(console.error);
      },
      classNames: {content: 'sm:min-w-[460px]'},
    });
  };

  const handleReset = () => {
    openConfirmModal({
      title: t('modal.confirmation'),
      children: (
        <p>
          {t(
            'theme.confirmation.reset',
            'Are you sure you want to reset all theme settings to default values?',
          )}
        </p>
      ),
      labels: {
        confirm: t('button.reset'),
        cancel: t('button.cancel'),
      },
      onConfirm: () => {
        form.reset(getDefaultFormValues());
      },
      classNames: {content: 'sm:min-w-[460px]'},
    });
  };

  const handleRestoreDefault = async () => {
    openConfirmModal({
      title: t('modal.confirmation'),
      children: (
        <p>
          {t(
            'theme.confirmation.restoreDefault',
            'Are you sure you want to restore the theme to default values? This will save the default theme configuration.',
          )}
        </p>
      ),
      labels: {
        confirm: t('button.restoreDefault', 'Restore Default'),
        cancel: t('button.cancel'),
      },
      onConfirm: async () => {
        try {
          const defaultValues = getDefaultFormValues();
          const defaultTheme = convertFormValuesToTheme(defaultValues);
          await onUpdateTheme(defaultTheme, response => {
            onUpdated?.(response.data);
            setOriginalTheme(response.data);
            form.reset(defaultValues);
            onClose();
          });
        } catch (error) {
          console.error('Error restoring default theme:', error);
        }
      },
      classNames: {content: 'sm:min-w-[460px]'},
    });
  };

  // Font options
  const primaryFontOptions = [
    {value: 'Inter, sans-serif', label: 'Inter'},
    {value: 'Noto Sans JP, sans-serif', label: 'Noto Sans JP'},
    {value: 'Roboto, sans-serif', label: 'Roboto'},
    {value: 'Open Sans, sans-serif', label: 'Open Sans'},
    {value: 'Lato, sans-serif', label: 'Lato'},
    {value: 'Poppins, sans-serif', label: 'Poppins'},
    {value: 'Montserrat, sans-serif', label: 'Montserrat'},
    {value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro'},
    {value: 'Ubuntu, sans-serif', label: 'Ubuntu'},
    {value: 'sans-serif', label: 'System Sans-serif'},
  ];

  const numericFontOptions = [
    {value: 'Inter, sans-serif', label: 'Inter'},
    {value: 'Roboto Mono, monospace', label: 'Roboto Mono'},
    {value: 'Source Code Pro, monospace', label: 'Source Code Pro'},
    {value: 'JetBrains Mono, monospace', label: 'JetBrains Mono'},
    {value: 'Fira Code, monospace', label: 'Fira Code'},
    {value: 'Monaco, monospace', label: 'Monaco'},
    {value: 'Consolas, monospace', label: 'Consolas'},
    {value: 'monospace', label: 'System Monospace'},
  ];

  const monospaceFontOptions = [
    {value: 'JetBrains Mono, monospace', label: 'JetBrains Mono'},
    {value: 'Fira Code, monospace', label: 'Fira Code'},
    {value: 'Source Code Pro, monospace', label: 'Source Code Pro'},
    {value: 'Monaco, monospace', label: 'Monaco'},
    {value: 'Consolas, monospace', label: 'Consolas'},
    {value: 'Courier New, monospace', label: 'Courier New'},
    {value: 'monospace', label: 'System Monospace'},
  ];

  // Custom render function for font options with preview
  const renderFontOption = ({
    option,
  }: {
    option: {value: string; label: string};
  }) => (
    <Text style={{fontFamily: option.value}} size="sm">
      {option.label} - The quick brown fox jumps
    </Text>
  );

  return (
    <Modal
      opened={opened} // Always show modal when opened prop is true
      onClose={handleClose}
      title={t('theme.modal.title', 'Theme Configuration')}
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
      classNames={{
        body: 'wms-p-0',
        header: 'wms-px-6 wms-py-4 wms-border-b wms-border-gray-200',
        content: 'wms-max-h-[90vh]',
      }}>
      <LoadingOverlay visible={isLoadingTheme || isUpdating} />
      <FormProvider {...form}>
        <form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}>
          <Tabs defaultValue="general" orientation="vertical">
            <Tabs.List>
              <Tabs.Tab value="general">
                {t('theme.form.tabs.general', 'General')}
              </Tabs.Tab>
              <Tabs.Tab value="fonts">
                {t('theme.form.tabs.fonts', 'Fonts')}
              </Tabs.Tab>
              <Tabs.Tab value="colors">
                {t('theme.form.tabs.colors', 'Colors')}
              </Tabs.Tab>
              <Tabs.Tab value="timeline">
                {t('theme.form.tabs.timeline', 'Timeline')}
              </Tabs.Tab>
              <Tabs.Tab value="displayFeatures">
                {t('theme.form.tabs.displayFeatures', 'Display Features')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general" className="wms-p-6">
              <Stack gap="md">
                <Controller
                  name="theme"
                  control={form.control}
                  render={({field}) => (
                    <Select
                      {...field}
                      label={t('theme.form.general.theme.label', 'Theme Mode')}
                      placeholder={t(
                        'theme.form.general.theme.placeholder',
                        'Select theme mode',
                      )}
                      data={[
                        {
                          value: 'light',
                          label: t('theme.form.general.theme.light', 'Light'),
                        },
                        {
                          value: 'dark',
                          label: t('theme.form.general.theme.dark', 'Dark'),
                        },
                      ]}
                      withAsterisk
                    />
                  )}
                />
                <Controller
                  name="defaultRadius"
                  control={form.control}
                  render={({field}) => (
                    <Select
                      {...field}
                      label={t(
                        'theme.form.general.defaultRadius.label',
                        'Default Radius',
                      )}
                      placeholder={t(
                        'theme.form.general.defaultRadius.placeholder',
                        'Select default radius',
                      )}
                      data={[
                        {value: 'xs', label: 'XS'},
                        {value: 'sm', label: 'SM'},
                        {value: 'md', label: 'MD'},
                        {value: 'lg', label: 'LG'},
                        {value: 'xl', label: 'XL'},
                      ]}
                    />
                  )}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="fonts" className="wms-p-6">
              <Stack gap="md">
                <Controller
                  name="fontPrimary"
                  control={form.control}
                  render={({field}) => (
                    <Select
                      {...field}
                      label={t(
                        'theme.form.fonts.primary.label',
                        'Primary Font',
                      )}
                      placeholder={t(
                        'theme.form.fonts.primary.placeholder',
                        'Select primary font',
                      )}
                      data={primaryFontOptions}
                      searchable
                      renderOption={renderFontOption}
                    />
                  )}
                />
                <Controller
                  name="fontNumeric"
                  control={form.control}
                  render={({field}) => (
                    <Select
                      {...field}
                      label={t(
                        'theme.form.fonts.numeric.label',
                        'Numeric Font',
                      )}
                      placeholder={t(
                        'theme.form.fonts.numeric.placeholder',
                        'Select numeric font',
                      )}
                      data={numericFontOptions}
                      searchable
                      renderOption={renderFontOption}
                    />
                  )}
                />
                <Controller
                  name="fontMono"
                  control={form.control}
                  render={({field}) => (
                    <Select
                      {...field}
                      label={t('theme.form.fonts.mono.label', 'Monospace Font')}
                      placeholder={t(
                        'theme.form.fonts.mono.placeholder',
                        'Select monospace font',
                      )}
                      data={monospaceFontOptions}
                      searchable
                      renderOption={renderFontOption}
                    />
                  )}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="colors" className="wms-p-6">
              <Stack gap="md">
                <Controller
                  name="primaryColor"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.colors.primary.label',
                        'Primary Color',
                      )}
                      placeholder={t(
                        'theme.form.colors.primary.placeholder',
                        'Select primary color',
                      )}
                      withAsterisk
                    />
                  )}
                />
                <Controller
                  name="statusNew"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.colors.statusNew.label',
                        'New Status Color',
                      )}
                      placeholder={t(
                        'theme.form.colors.statusNew.placeholder',
                        'Select new status color',
                      )}
                    />
                  )}
                />
                <Controller
                  name="statusInProgress"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.colors.statusInProgress.label',
                        'In Progress Status Color',
                      )}
                      placeholder={t(
                        'theme.form.colors.statusInProgress.placeholder',
                        'Select in progress status color',
                      )}
                    />
                  )}
                />
                <Controller
                  name="statusCompleted"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.colors.statusCompleted.label',
                        'Completed Status Color',
                      )}
                      placeholder={t(
                        'theme.form.colors.statusCompleted.placeholder',
                        'Select completed status color',
                      )}
                    />
                  )}
                />
                <Controller
                  name="priorityHigh"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.colors.priorityHigh.label',
                        'High Priority Color',
                      )}
                      placeholder={t(
                        'theme.form.colors.priorityHigh.placeholder',
                        'Select high priority color',
                      )}
                    />
                  )}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="timeline" className="wms-p-6">
              <Stack gap="md">
                <Controller
                  name="borderTimeline"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.timeline.borderTimeline.label',
                        'Timeline Border Color',
                      )}
                      placeholder={t(
                        'theme.form.timeline.borderTimeline.placeholder',
                        'Select timeline border color',
                      )}
                    />
                  )}
                />
                <Controller
                  name="borderTimelineMonthEnd"
                  control={form.control}
                  render={({field}) => (
                    <ColorInput
                      {...field}
                      label={t(
                        'theme.form.timeline.borderTimelineMonthEnd.label',
                        'Month End Border Color',
                      )}
                      placeholder={t(
                        'theme.form.timeline.borderTimelineMonthEnd.placeholder',
                        'Select month end border color',
                      )}
                    />
                  )}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="displayFeatures" className="wms-p-6">
              <Stack gap="md">
                <Controller
                  name="showProgress"
                  control={form.control}
                  render={({field: {value, onChange, ...field}}) => (
                    <Switch
                      {...field}
                      checked={value}
                      onChange={onChange}
                      label={t(
                        'theme.form.displayFeatures.showProgress.label',
                        'Show Progress',
                      )}
                    />
                  )}
                />
                <Controller
                  name="compactMode"
                  control={form.control}
                  render={({field: {value, onChange, ...field}}) => (
                    <Switch
                      {...field}
                      checked={value}
                      onChange={onChange}
                      label={t(
                        'theme.form.displayFeatures.compactMode.label',
                        'Compact Mode',
                      )}
                    />
                  )}
                />
                <Controller
                  name="showDependencies"
                  control={form.control}
                  render={({field: {value, onChange, ...field}}) => (
                    <Switch
                      {...field}
                      checked={value}
                      onChange={onChange}
                      label={t(
                        'theme.form.displayFeatures.showDependencies.label',
                        'Show Dependencies',
                      )}
                    />
                  )}
                />
                <TextInput
                  label={t(
                    'theme.form.displayFeatures.dateFormat.label',
                    'Date Format',
                  )}
                  placeholder="MM/dd/yyyy"
                  {...form.register('dateFormat')}
                />
                <TextInput
                  label={t(
                    'theme.form.displayFeatures.timezone.label',
                    'Timezone',
                  )}
                  placeholder="UTC"
                  {...form.register('timezone')}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group
            justify="space-between"
            className="wms-p-6 wms-border-t wms-border-gray-200">
            <Group>
              <Button variant="outline" onClick={handleReset}>
                {t('button.reset', 'Reset')}
              </Button>
              <Button variant="outline" onClick={handleRestoreDefault}>
                {t('button.restoreDefault', 'Restore Default')}
              </Button>
            </Group>
            <Group>
              <Button variant="outline" onClick={handleClose}>
                {t('button.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || !isRequiredOk}
                loading={isUpdating}>
                {t('button.save', 'Save')}
              </Button>
            </Group>
          </Group>
        </form>
      </FormProvider>
    </Modal>
  );
}
