# External Fields - Integration Steps

## ✅ Đã hoàn thành

Hệ thống external fields đã được implement đầy đủ:

1. ✅ **Type definitions** - `packages/ui/core/src/types/externalFields.ts`
2. ✅ **Updated Task types** - `Task`, `TaskDetail`, `TaskResponse` có field `externalFields?: ExternalFieldsData`
3. ✅ **Context Provider** - `ExternalFieldsConfigProvider` để truyền config
4. ✅ **Renderer Component** - `ExternalFieldsRenderer` để render dynamic fields
5. ✅ **Examples & Documentation** - `externalFields.example.ts` và `EXTERNAL_FIELDS_GUIDE.md`

## 🚀 Bước tiếp theo để sử dụng

### 1. Tạo Config của bạn

Tạo file `packages/bundle/src/config/taskFieldsConfig.ts`:

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

### 2. Update mountGantt trong Bundle

File: `packages/bundle/src/index.tsx`

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
    taskFieldsConfig?: ExternalFieldsConfig; // 👈 ADD THIS
  },
) {
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
      <ExternalFieldsConfigProvider taskFieldsConfig={opts?.taskFieldsConfig}> {/* 👈 ADD THIS */}
        <Gantt
          locale={opts?.lang as 'en' | 'vi' | 'ja'}
          contextKey={opts?.contextKey}
          assignees={opts?.assignees}
          eventCallbacks={opts?.eventCallbacks}
          bus={opts?.bus}
        />
      </ExternalFieldsConfigProvider> {/* 👈 ADD THIS */}
    ),
  });
  return app.mount(container);
}
```

### 3. Update Gantt.tsx để pass config xuống

File: `packages/ui/gantt/src/Gantt.tsx`

```typescript
import {ExternalFieldsConfigProvider, useExternalFieldsConfig} from '@wms/core';

export interface GanttProps {
  locale?: 'en' | 'vi' | 'ja';
  contextKey?: string;
  assignees?: TaskAssignee[];
  eventCallbacks?: GanttEventCallbacks;
  bus?: EventEmitter;
  taskFieldsConfig?: ExternalFieldsConfig; // 👈 ADD THIS
}

export const Gantt: React.FC<GanttProps> = ({
  locale = 'en',
  contextKey,
  assignees,
  eventCallbacks,
  bus,
  taskFieldsConfig, // 👈 ADD THIS
}) => {
  // ... existing code ...

  return (
    <ExternalFieldsConfigProvider taskFieldsConfig={taskFieldsConfig}> {/* 👈 ADD THIS */}
      <div style={{height: '100vh', width: '100%', overflow: 'hidden'}}>
        {/* ... existing code ... */}
      </div>
    </ExternalFieldsConfigProvider> {/* 👈 ADD THIS */}
  );
};
```

### 4. Update TaskFormModal

File: `packages/ui/core/src/components/task/TaskFormModal.tsx`

#### 4a. Add imports

```typescript
import {ExternalFieldsRenderer, useTaskFieldsConfig} from '@wms/core';
```

#### 4b. Add hook

```typescript
export function TaskFormModal({...}) {
  const taskFieldsConfig = useTaskFieldsConfig(); // 👈 ADD THIS
  
  // ... existing code ...
}
```

#### 4c. Update form defaultValues

```typescript
const form = useForm<TaskFormSchemaType>({
  resolver: yupResolver(taskFormSchema),
  defaultValues: {
    name: '',
    description: '',
    // ... other fields ...
    externalFields: {}, // 👈 ADD THIS
  },
});
```

#### 4d. Update form reset (khi load task để edit)

```typescript
useEffect(() => {
  if (task && opened) {
    form.reset({
      name: task.name || '',
      description: task.description || '',
      // ... other fields ...
      externalFields: task.externalFields || {}, // 👈 ADD THIS
    });
  }
}, [task, opened]);
```

#### 4e. Add renderer trong form UI

```typescript
{/* Thêm sau Custom Fields Section */}
{taskFieldsConfig && Object.keys(taskFieldsConfig).length > 0 && (
  <div>
    <Group gap="xs" mb={4}>
      <IconTool size={16} color="var(--mantine-color-gray-5)" />
      <Text size="sm" c="gray.8" fw={500}>
        External Fields
      </Text>
    </Group>
    <ExternalFieldsRenderer
      config={taskFieldsConfig}
      form={form}
    />
  </div>
)}
```

#### 4f. Update submit payload

```typescript
const handleSubmit = async (formData: TaskFormSchemaType) => {
  const taskData = {
    name: formData.name,
    description: formData.description,
    // ... other fields ...
    externalFields: formData.externalFields, // 👈 ADD THIS
  };
  
  if (isEdit) {
    await updateTaskMutation.mutateAsync(taskData);
  } else {
    await createTaskMutation.mutateAsync(taskData);
  }
};
```

### 5. Test trong Dev App

File: `packages/ui/gantt/dev/App.tsx`

```typescript
import {ExternalFieldsConfig} from '@wms/core';
import {Gantt} from '../src/Gantt';

const testTaskFieldsConfig: ExternalFieldsConfig = {
  testfield1: {
    key: 'testfield1',
    name: 'Test Field 1',
    type: 'text',
    validation: {required: true},
    order: 1,
  },
  testfield2: {
    key: 'testfield2',
    name: 'Test Field 2',
    type: 'number',
    validation: {min: 0, max: 100},
    order: 2,
  },
};

const App = () => {
  return (
    <div className="wms-h-screen">
      <WmsProvider>
        <AppCredentialsProvider appId={mockAppId} code={mockCode}>
          <Gantt
            contextKey="9fd38075-1c29-4bdc-bd3d-afd8f03fd8ad"
            taskFieldsConfig={testTaskFieldsConfig} {/* 👈 ADD THIS */}
          />
        </AppCredentialsProvider>
      </WmsProvider>
    </div>
  );
};
```

### 6. Khi mount từ HTML/JS

```javascript
// Trong HTML app
const taskFieldsConfig = {
  testfield1: {
    key: 'testfield1',
    name: 'Test Field 1',
    type: 'text',
    validation: {required: true},
    order: 1,
  },
  testfield2: {
    key: 'testfield2',
    name: 'Test Field 2',
    type: 'number',
    validation: {min: 0, max: 100},
    order: 2,
  },
};

mountGantt(document.getElementById('gantt-container'), {
  appId: 'your-app-id',
  code: 'your-code',
  contextKey: 'your-context',
  taskFieldsConfig: taskFieldsConfig, // 👈 Pass config here
});
```

## 📝 Files cần chỉnh sửa

1. ✏️ `packages/bundle/src/index.tsx` - Add taskFieldsConfig prop và ExternalFieldsConfigProvider
2. ✏️ `packages/ui/gantt/src/Gantt.tsx` - Add taskFieldsConfig prop và Provider
3. ✏️ `packages/ui/core/src/components/task/TaskFormModal.tsx` - Add ExternalFieldsRenderer
4. ✏️ `packages/ui/gantt/dev/App.tsx` - Test config
5. ✏️ Tạo `packages/bundle/src/config/taskFieldsConfig.ts` - Your actual config

## 🎯 Data Flow

```
HTML/JS App
  └─> mountGantt(container, {taskFieldsConfig})
       └─> ExternalFieldsConfigProvider
            └─> Gantt
                 └─> GanttChart
                      └─> TaskFormModal
                           └─> useTaskFieldsConfig() ← Get config
                           └─> ExternalFieldsRenderer ← Render fields
```

## 💾 API Contract

Khi submit task, payload sẽ có:

```json
{
  "id": "task-123",
  "name": "Task name",
  "description": "Description",
  "startDate": "2025-01-01",
  "endDate": "2025-01-15",
  "externalFields": {
    "testfield1": "some value",
    "testfield2": 42
  }
}
```

Backend API cần accept và return `externalFields` field trong Task model.

## ⚠️ Notes

- TypeScript warnings về date onChange là type inference issue, không ảnh hưởng runtime
- Example config ở `externalFields.example.ts` có nhiều ví dụ
- Đọc `EXTERNAL_FIELDS_GUIDE.md` để hiểu rõ hơn về features

## 📞 Next Actions

1. Implement các changes ở trên
2. Test bằng cách tạo/edit task trong Gantt dev app
3. Verify data được save/load đúng
4. Deploy và test với real API
