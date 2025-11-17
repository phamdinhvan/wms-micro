# Task Form Migration Guide - Using renderInput

## Enhanced renderInput Features

The `renderInput` function now supports:
- **Icons**: Display icons next to field labels
- **Icon customization**: Control icon size and color
- **All existing features**: Validation, styling, various input types

### New Properties

```typescript
{
  name: 'fieldName',
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | ...,
  label: 'task.form.label',
  placeholder: 'task.form.placeholder',
  withAsterisk: true, // Show required indicator
  // NEW: Icon properties
  icon: IconComponent, // e.g., IconTextSize from @tabler/icons-react
  iconSize: 16, // Optional, default is 16
  iconColor: 'var(--mantine-color-gray-5)', // Optional
  // Other properties...
  inputWidth: 'wms-w-full',
  labelWidth: 'wms-w-[180px]',
  isShowLabel: true,
}
```

## Example: TaskFormModal Field Configuration

Here's how to define fields for TaskFormModal using the enhanced renderInput:

```typescript
import {
  IconTextSize,
  IconListDetails,
  IconCalendar,
} from '@tabler/icons-react';
import {TFormInput} from '@wms/core';

export const taskFormInputs: TFormInput[] = [
  // Task Name Field
  {
    name: 'name',
    type: 'text',
    label: 'task.form.taskName',
    placeholder: 'task.form.placeholders.taskName',
    withAsterisk: true,
    autoFocus: true,
    icon: IconTextSize,
    iconSize: 16,
    iconColor: 'var(--mantine-color-gray-5)',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-full', // Full width for drawer
    isShowLabel: true,
  },
  
  // Description Field
  {
    name: 'description',
    type: 'textarea',
    label: 'task.form.description',
    placeholder: 'task.form.placeholders.description',
    rows: 3,
    icon: IconListDetails,
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-full',
    isShowLabel: true,
  },
  
  // Start Date Field
  {
    name: 'startDate',
    type: 'date',
    label: 'task.form.startDate.label',
    placeholder: 'YYYY/MM/DD',
    icon: IconCalendar,
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-full',
    isShowLabel: true,
  },
  
  // End Date Field
  {
    name: 'endDate',
    type: 'date',
    label: 'task.form.endDate.label',
    placeholder: 'YYYY/MM/DD',
    icon: IconCalendar,
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-full',
    isShowLabel: true,
  },
  
  // Add more fields as needed...
];
```

## Usage in TaskFormModal

### Before (Manual Controllers):

```typescript
<div>
  <Group gap="xs" mb={4}>
    <IconTextSize size={16} color="var(--mantine-color-gray-5)" />
    <Text size="sm" c="gray.8" fw={500}>
      {t('task.form.taskName')}
      {/* Required indicator */}
    </Text>
  </Group>
  <Controller
    name="name"
    control={form.control}
    render={({field, fieldState}) => (
      <TextInput
        {...field}
        placeholder={t('task.form.placeholders.taskName')}
        variant="filled"
        size="md"
        error={fieldState.error?.message}
        data-autofocus="true"
      />
    )}
  />
</div>
```

### After (Using renderInput):

```typescript
import {renderInput} from '@wms/core';
import {taskFormInputs} from './taskFormConfig'; // Your config file

// In your component
<FormProvider {...form}>
  <Stack gap="lg">
    {taskFormInputs.map(fieldConfig => (
      <div key={fieldConfig.name}>
        {renderInput(fieldConfig, form)}
      </div>
    ))}
  </Stack>
</FormProvider>
```

## Special Cases

### Custom Components (Status, Priority Selectors)

For custom components like `TaskStatusSelector` and `TaskPrioritySelector`, keep them as is:

```typescript
<Stack gap="lg">
  {/* Standard fields using renderInput */}
  {taskFormInputs
    .filter(field => !['status', 'priority'].includes(field.name))
    .map(fieldConfig => (
      <div key={fieldConfig.name}>
        {renderInput(fieldConfig, form)}
      </div>
    ))}
  
  {/* Custom Status & Priority Group */}
  <div>
    <FieldLabel
      icon={IconFlag}
      label={`${t('task.form.status.label')} & ${t('task.form.priority.label')}`}
    />
    <Group gap="xs">
      <TaskStatusSelector control={form.control} />
      <TaskPrioritySelector control={form.control} />
    </Group>
  </div>
  
  {/* Progress Slider - Keep as custom */}
  <div>
    <Group gap="xs" mb={8}>
      <Text size="sm" c="gray.8" fw={500}>
        {t('task.form.progress.label')}
      </Text>
      <Text size="sm" c="dark.7">
        {form.watch('progress') ? `${form.watch('progress')}%` : '0%'}
      </Text>
    </Group>
    <Controller
      name="progress"
      control={form.control}
      render={({field}) => (
        <Slider
          {...field}
          min={0}
          max={100}
          step={5}
          marks={[
            {value: 0, label: '0%'},
            {value: 50, label: '50%'},
            {value: 100, label: '100%'},
          ]}
        />
      )}
    />
  </div>
  
  {/* Custom Fields & External Fields - Keep as is */}
  <CustomFieldsSection form={form} projectId={projectId} />
  <ExternalFieldsRenderer config={taskFieldsConfig} form={form} />
</Stack>
```

## Benefits

✅ **Cleaner code**: Reduce 20-30 lines per field to just 1 line
✅ **Consistent styling**: All fields use the same design system
✅ **Centralized config**: Easy to maintain and modify
✅ **Icon support**: Beautiful icons with minimal code
✅ **Type safety**: Full TypeScript support
✅ **Validation**: Automatic error handling
✅ **Responsive**: Works great in drawer layout

## Migration Steps

1. **Create config file**: Define `taskFormInputs` array with all standard fields
2. **Add icons**: Import icons from `@tabler/icons-react` and add to config
3. **Replace manual Controllers**: Use `renderInput` with the config
4. **Keep special components**: Progress slider, custom selectors, etc.
5. **Test thoroughly**: Ensure all fields work correctly
6. **Remove unused code**: Clean up old Controller components

## Notes

- Use `isShowLabel: true` and `labelWidth: 'wms-w-full'` for drawer layout
- Keep `variant="filled"` styling via renderInput (or pass as prop)
- Maintain `data-autofocus` for first field via `autoFocus: true`
- External/custom fields can remain separate from renderInput
