# External Fields System - Hướng dẫn sử dụng

## 📋 Tổng quan

Hệ thống External Fields cho phép bạn thêm các field động vào Task/Project mà không cần thay đổi database schema. Bạn chỉ cần define config và truyền vào, hệ thống sẽ tự động render UI, validation, và xử lý dependencies.

## 🚀 Quick Start

### Bước 1: Tạo Config File

Tạo file `taskFieldsConfig.ts`:

```typescript
import {ExternalFieldsConfig} from '@wms/core';

export const taskFieldsConfig: ExternalFieldsConfig = {
  testfield1: {
    key: 'testfield1',
    name: 'Test Field 1',
    type: 'text',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    order: 1,
  },
  
  testfield2: {
    key: 'testfield2',
    name: 'Test Field 2',
    type: 'number',
    validation: {
      min: 0,
      max: 100,
    },
    order: 2,
  },
};
```

### Bước 2: Truyền Config từ Bundle

Trong `packages/bundle/src/index.tsx`, update function `mountGantt`:

```typescript
import {ExternalFieldsConfigProvider} from '@wms/core';
import {taskFieldsConfig} from './config/taskFieldsConfig';

function mountGantt(
  container: HTMLElement,
  opts?: {
    lang?: string;
    theme?: any;
    appId?: string;
    code?: string;
    contextKey?: string;
    assignees?: any[];
    eventCallbacks?: any;
    bus?: any;
    taskFieldsConfig?: ExternalFieldsConfig; // 👈 Thêm prop này
  },
) {
  // Initialize appConfig
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...(opts || {}),
    render: () => (
      // 👇 Wrap với Provider
      <ExternalFieldsConfigProvider taskFieldsConfig={opts?.taskFieldsConfig}>
        <Gantt
          locale={opts?.lang as 'en' | 'vi' | 'ja'}
          contextKey={opts?.contextKey}
          assignees={opts?.assignees}
          eventCallbacks={opts?.eventCallbacks}
          bus={opts?.bus}
        />
      </ExternalFieldsConfigProvider>
    ),
  });
  return app.mount(container);
}

// Sử dụng
mountGantt(document.getElementById('gantt-container'), {
  appId: 'your-app-id',
  code: 'your-code',
  contextKey: 'your-context',
  taskFieldsConfig: taskFieldsConfig, // 👈 Truyền config
});
```

### Bước 3: Sử dụng trong TaskFormModal

Trong `packages/ui/core/src/components/task/TaskFormModal.tsx`:

```typescript
import {ExternalFieldsRenderer, useTaskFieldsConfig} from '@wms/core';

export function TaskFormModal() {
  const taskFieldsConfig = useTaskFieldsConfig(); // 👈 Lấy config từ context
  
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      externalFields: {}, // 👈 Thêm external fields object
    },
  });

  return (
    <Modal>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Standard fields */}
        <TextInput {...form.register('name')} label="Task Name" />
        <Textarea {...form.register('description')} label="Description" />
        
        {/* 👇 External fields - tự động render */}
        {taskFieldsConfig && (
          <div>
            <Text size="lg" fw={600} mt="md" mb="sm">
              Custom Fields
            </Text>
            <ExternalFieldsRenderer
              config={taskFieldsConfig}
              form={form}
            />
          </div>
        )}
        
        <Button type="submit">Save Task</Button>
      </form>
    </Modal>
  );
}
```

### Bước 4: Xử lý Submit & Load

```typescript
// Khi submit (create/update task)
const onSubmit = (formData) => {
  const payload = {
    name: formData.name,
    description: formData.description,
    startDate: formData.startDate,
    endDate: formData.endDate,
    externalFields: formData.externalFields, // 👈 Gửi external fields
  };
  
  await createTaskAPI(payload);
};

// Khi load task để edit
useEffect(() => {
  if (task) {
    form.reset({
      name: task.name,
      description: task.description,
      externalFields: task.externalFields || {}, // 👈 Load external fields
    });
  }
}, [task]);
```

## 📝 Field Types

### Text Input

```typescript
{
  key: 'textField',
  name: 'Text Field',
  type: 'text',
  placeholder: 'Enter text...',
  validation: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  order: 1,
}
```

### Textarea

```typescript
{
  key: 'notesField',
  name: 'Notes',
  type: 'textarea',
  placeholder: 'Enter notes...',
  order: 2,
}
```

### Number Input

```typescript
{
  key: 'budgetField',
  name: 'Budget',
  type: 'number',
  validation: {
    required: true,
    min: 1000,
    max: 1000000,
  },
  order: 3,
}
```

### Date Input

```typescript
{
  key: 'dueDateField',
  name: 'Due Date',
  type: 'date',
  validation: {
    required: true,
  },
  order: 4,
}
```

### DateTime Input

```typescript
{
  key: 'meetingTimeField',
  name: 'Meeting Time',
  type: 'datetime',
  validation: {
    required: true,
  },
  order: 5,
}
```

### Boolean (Checkbox)

```typescript
{
  key: 'isBillableField',
  name: 'Is Billable',
  type: 'boolean',
  defaultValue: false,
  order: 6,
}
```

### Select (Dropdown)

```typescript
{
  key: 'departmentField',
  name: 'Department',
  type: 'select',
  options: [
    {label: 'Engineering', value: 'eng'},
    {label: 'Sales', value: 'sales'},
    {label: 'Marketing', value: 'marketing'},
  ],
  validation: {
    required: true,
  },
  defaultValue: 'eng',
  order: 7,
}
```

### MultiSelect

```typescript
{
  key: 'tagsField',
  name: 'Tags',
  type: 'multiselect',
  options: [
    {label: 'Frontend', value: 'frontend'},
    {label: 'Backend', value: 'backend'},
    {label: 'Design', value: 'design'},
  ],
  order: 8,
}
```

### Radio Buttons

```typescript
{
  key: 'priorityField',
  name: 'Priority',
  type: 'radio',
  options: [
    {label: 'Low', value: 'low'},
    {label: 'Medium', value: 'medium'},
    {label: 'High', value: 'high'},
  ],
  validation: {
    required: true,
  },
  defaultValue: 'medium',
  order: 9,
}
```

### Checkbox Group

```typescript
{
  key: 'featuresField',
  name: 'Features',
  type: 'checkbox',
  options: [
    {label: 'Feature A', value: 'a'},
    {label: 'Feature B', value: 'b'},
    {label: 'Feature C', value: 'c'},
  ],
  order: 10,
}
```

## ✅ Validation

### Basic Validation

```typescript
{
  key: 'emailField',
  name: 'Email',
  type: 'text',
  validation: {
    required: true,
    minLength: 5,
    maxLength: 100,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
}
```

### Custom Validation

```typescript
{
  key: 'endDateField',
  name: 'End Date',
  type: 'date',
  validation: {
    required: true,
    custom: (value, allValues) => {
      const startDate = allValues.startDate;
      if (startDate && value) {
        if (new Date(value) <= new Date(startDate)) {
          return 'End date must be after start date';
        }
      }
      return true;
    },
  },
}
```

## 🔗 Dependencies (Field tự động thay đổi)

### Auto-calculate Duration

```typescript
const config = {
  startDate: {
    key: 'startDate',
    name: 'Start Date',
    type: 'date',
    validation: {required: true},
    order: 1,
  },
  
  endDate: {
    key: 'endDate',
    name: 'End Date',
    type: 'date',
    validation: {required: true},
    order: 2,
  },
  
  duration: {
    key: 'duration',
    name: 'Duration (days)',
    type: 'number',
    disabled: true, // Read-only
    dependencies: [
      {
        sourceField: 'startDate',
        targetField: 'duration',
        onChange: (_source, _target, allValues) => {
          const start = allValues.startDate;
          const end = allValues.endDate;
          if (start && end) {
            const diffDays = Math.ceil(
              (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
            );
            return diffDays;
          }
          return null;
        },
      },
      {
        sourceField: 'endDate',
        targetField: 'duration',
        onChange: (_source, _target, allValues) => {
          // Same logic
          const start = allValues.startDate;
          const end = allValues.endDate;
          if (start && end) {
            const diffDays = Math.ceil(
              (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
            );
            return diffDays;
          }
          return null;
        },
      },
    ],
    order: 3,
  },
};
```

### Reset Field khi field khác thay đổi

```typescript
{
  key: 'city',
  name: 'City',
  type: 'select',
  options: [...],
  dependencies: [
    {
      sourceField: 'country',
      targetField: 'city',
      onChange: () => {
        // Reset city khi country thay đổi
        return null;
      },
    },
  ],
}
```

## 🎨 Layout & Organization

### Group Fields

```typescript
const config = {
  field1: {
    key: 'field1',
    name: 'Field 1',
    type: 'text',
    group: 'basic', // 👈 Nhóm basic
    order: 1,
  },
  
  field2: {
    key: 'field2',
    name: 'Field 2',
    type: 'text',
    group: 'advanced', // 👈 Nhóm advanced
    order: 2,
  },
};

// Render chỉ group 'basic'
<ExternalFieldsRenderer config={config} form={form} groupBy="basic" />
```

### Field Width

```typescript
{
  key: 'fullWidthField',
  name: 'Full Width',
  type: 'text',
  width: 'full', // 👈 Full width (default)
  order: 1,
}

// TODO: half và third width chưa được implement
```

### Display Order

```typescript
{
  key: 'field1',
  name: 'Field 1',
  type: 'text',
  order: 1, // 👈 Hiển thị đầu tiên
}

{
  key: 'field2',
  name: 'Field 2',
  type: 'text',
  order: 2, // 👈 Hiển thị sau
}
```

### Hidden Field

```typescript
{
  key: 'internalField',
  name: 'Internal Field',
  type: 'text',
  hidden: true, // 👈 Không hiển thị UI
}
```

### Disabled Field

```typescript
{
  key: 'calculatedField',
  name: 'Calculated Field',
  type: 'number',
  disabled: true, // 👈 Read-only
}
```

## 💾 Data Format

### Khi lưu vào API:

```json
{
  "id": "task-123",
  "name": "Task name",
  "description": "Description",
  "externalFields": {
    "testfield1": "value 1",
    "testfield2": 42,
    "startDate": "2025-01-01T00:00:00Z",
    "tags": ["frontend", "backend"]
  }
}
```

### Khi load từ API:

Form sẽ tự động populate:

```typescript
form.reset({
  name: task.name,
  description: task.description,
  externalFields: task.externalFields || {},
});
```

## 🎯 Complete Example

```typescript
import {ExternalFieldsConfig} from '@wms/core';

export const taskFieldsConfig: ExternalFieldsConfig = {
  // Department select
  department: {
    key: 'department',
    name: 'Department',
    type: 'select',
    options: [
      {label: 'Engineering', value: 'eng'},
      {label: 'Sales', value: 'sales'},
      {label: 'Marketing', value: 'marketing'},
    ],
    validation: {required: true},
    defaultValue: 'eng',
    order: 1,
    group: 'organization',
  },
  
  // Team size
  teamSize: {
    key: 'teamSize',
    name: 'Team Size',
    type: 'number',
    validation: {
      required: true,
      min: 1,
      max: 50,
    },
    order: 2,
    group: 'organization',
  },
  
  // Estimated start
  estimatedStartDate: {
    key: 'estimatedStartDate',
    name: 'Estimated Start',
    type: 'date',
    validation: {required: true},
    order: 3,
    group: 'timeline',
  },
  
  // Estimated end
  estimatedEndDate: {
    key: 'estimatedEndDate',
    name: 'Estimated End',
    type: 'date',
    validation: {
      required: true,
      custom: (value, allValues) => {
        const start = allValues.estimatedStartDate;
        if (start && value && new Date(value) <= new Date(start)) {
          return 'End date must be after start date';
        }
        return true;
      },
    },
    order: 4,
    group: 'timeline',
  },
  
  // Duration (auto-calculated)
  estimatedDuration: {
    key: 'estimatedDuration',
    name: 'Duration (days)',
    type: 'number',
    disabled: true,
    dependencies: [
      {
        sourceField: 'estimatedStartDate',
        targetField: 'estimatedDuration',
        onChange: (_src, _tgt, allValues) => {
          const {estimatedStartDate, estimatedEndDate} = allValues;
          if (estimatedStartDate && estimatedEndDate) {
            return Math.ceil(
              (new Date(estimatedEndDate) - new Date(estimatedStartDate)) /
                (1000 * 60 * 60 * 24),
            );
          }
          return null;
        },
      },
      {
        sourceField: 'estimatedEndDate',
        targetField: 'estimatedDuration',
        onChange: (_src, _tgt, allValues) => {
          const {estimatedStartDate, estimatedEndDate} = allValues;
          if (estimatedStartDate && estimatedEndDate) {
            return Math.ceil(
              (new Date(estimatedEndDate) - new Date(estimatedStartDate)) /
                (1000 * 60 * 60 * 24),
            );
          }
          return null;
        },
      },
    ],
    order: 5,
    group: 'timeline',
  },
  
  // Tags
  tags: {
    key: 'tags',
    name: 'Tags',
    type: 'multiselect',
    options: [
      {label: 'Frontend', value: 'frontend'},
      {label: 'Backend', value: 'backend'},
      {label: 'Design', value: 'design'},
      {label: 'Testing', value: 'testing'},
    ],
    order: 6,
    group: 'metadata',
  },
  
  // Is billable
  isBillable: {
    key: 'isBillable',
    name: 'Is Billable',
    type: 'boolean',
    defaultValue: false,
    order: 7,
    group: 'financial',
  },
  
  // Notes
  notes: {
    key: 'notes',
    name: 'Additional Notes',
    type: 'textarea',
    placeholder: 'Enter any additional notes...',
    order: 8,
    group: 'metadata',
  },
};
```

## 📞 Next Steps

1. Copy `externalFields.example.ts` và customize theo nhu cầu
2. Truyền config qua bundle hoặc component
3. Thêm `ExternalFieldsRenderer` vào form
4. Test với real data

## ⚠️ Lưu ý

- **TypeScript warnings** về date onChange là type inference issue, không ảnh hưởng runtime
- **Backend API** cần hỗ trợ field `externalFields: Record<string, any>` trong Task model
- **Validation** chỉ ở client, nên validate lại ở server
- **Performance**: Với nhiều fields và dependencies phức tạp, cân nhắc optimize
