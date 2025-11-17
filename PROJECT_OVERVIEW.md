# WMS MONOREPO - TỔNG QUAN DỰ ÁN

## 📋 Giới thiệu

WMS (Work Management System) Monorepo là một hệ thống quản lý công việc toàn diện được xây dựng với kiến trúc monorepo hiện đại. Dự án cung cấp các UI components và tools để quản lý tasks, projects với nhiều chế độ hiển thị khác nhau (Kanban Board, Gantt Chart, Table/List view).

## 🏗️ Kiến trúc tổng thể

### Công nghệ nền tảng

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Node.js** | >= 20 | Runtime environment |
| **Yarn** | 4.10.3 | Package manager (với Corepack) |
| **Turborepo** | 2.5.8 | Build system orchestration |
| **TypeScript** | 5.9.2 | Type-safe development |
| **React** | 18.2.0 | UI framework |
| **Vite** | 7.1.7 | Build tool (library mode) |
| **Mantine** | 8.1.3 | Component library |
| **Tailwind CSS** | Latest | Utility-first CSS |

### Cấu trúc Workspace

```
wms-micro/
├── packages/
│   ├── ui/                    # UI Packages
│   │   ├── board/            # Kanban Board component
│   │   ├── core/             # Core components & utilities
│   │   ├── gantt/            # Gantt Chart component
│   │   ├── list/             # List view component
│   │   ├── projects/         # Project management module
│   │   └── table/            # Table component
│   ├── bundle/               # Consolidated bundle package
│   ├── build-config/         # Shared Vite configuration
│   ├── eslint-config/        # Shared ESLint rules
│   ├── query-client/         # React Query wrapper
│   ├── styles/               # Shared Tailwind styles
│   └── typescript-config/    # Shared TypeScript config
├── docs/                     # Documentation
├── scripts/                  # Build & utility scripts
└── [config files]            # Root configuration
```

## 📦 Các Packages Chính

### 1. @wms/core - Package Trung Tâm

**Mô tả**: Package cốt lõi cung cấp components, hooks, utilities và types dùng chung cho toàn bộ hệ thống.

**Vị trí**: `packages/ui/core`

**Thành phần chính**:

#### Components (12 nhóm)
- **common/** - Các components chung: AssigneeSelect, StatusSelect, ProjectSelect, Layouts, Pagination
- **task/** - TaskFormModal và task-related components
- **project/** - Project management components
- **input/** - Custom input components
- **date/** - Date/DateTime pickers
- **modal/** - Modal components (Confirm, etc.)
- **table/** - Table components
- **tooltip/** - Tooltip utilities
- **theme/** - Theme configuration components
- **externalFields/** - Dynamic external fields system

#### Hooks (17+ custom hooks)
- **Data fetching**: `useAppQuery`, `useAppMutation`
- **API integration**: `useProjectApi`, `useTaskApi`, `useThemeApi`, `useUserApi`
- **Navigation**: `useListNavigation`, `useNavigation`, `useControlParams`
- **Utilities**: `useDebounce`, `useFieldDependencies`, `useMasterData`, `useAbortController`

#### Exports chính
- `WmsProvider` - Root provider tích hợp Mantine + i18n + React Query
- Tất cả components từ 12 nhóm
- Tất cả custom hooks
- Config, constants, types, utils, schemas

**Dependencies chính**:
```json
{
  "@mantine/core": "^8.1.3",
  "@mantine/dates": "^8.1.3",
  "@mantine/hooks": "^8.1.3",
  "@mantine/modals": "^8.1.3",
  "@mantine/notifications": "^8.1.3",
  "@tabler/icons-react": "^3.35.0",
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2",
  "axios": "^1.12.2",
  "i18next": "^25.5.2",
  "react-i18next": "^16.0.0",
  "yup": "^1.7.1",
  "dayjs": "^1.11.18"
}
```

---

### 2. @wms/board - Kanban Board View

**Mô tả**: Component hiển thị tasks dưới dạng Kanban board với drag & drop functionality.

**Vị trí**: `packages/ui/board`

**Tính năng nổi bật**:
- ✅ Drag & drop tasks giữa các cột (status)
- ✅ Reorder tasks trong cùng một cột
- ✅ Virtualization với react-virtuoso (hiệu năng cao với danh sách lớn)
- ✅ Horizontal scroll với preview indicator
- ✅ Filter tasks theo assignee, priority, status
- ✅ Tự động tính toán sortOrder khi di chuyển tasks
- ✅ Context tracking projectId
- ✅ Quick create task dropdown

**Components chính**:
- `Board.tsx` - Main component với DragDropContext
- `BoardColumn.tsx` - Cột status với virtualized task list
- `BoardItem.tsx` - Task card hiển thị thông tin task
- `BoardFilter.tsx` - Bộ lọc tasks
- `ScrollPreview.tsx` - Horizontal scroll preview
- `CreateTaskDropdown.tsx` - Dropdown tạo task nhanh

**Dependencies đặc biệt**:
```json
{
  "@hello-pangea/dnd": "^18.0.1",     // Drag & drop
  "react-virtuoso": "^4.14.1",        // List virtualization
  "@wms/core": "workspace:*"
}
```

---

### 3. @wms/gantt - Gantt Chart View

**Mô tả**: Gantt chart visualization với timeline, dependencies, và mountain chart mode.

**Vị trí**: `packages/ui/gantt`

**Tính năng nổi bật**:
- ✅ Timeline visualization cho tasks/projects
- ✅ Mountain chart - alternative visualization mode
- ✅ External fields configuration
- ✅ Per-project theme customization
- ✅ Event bus system (decoupled communication)
- ✅ Custom event callbacks
- ✅ Multi-language support (en, vi, ja)
- ✅ Context-based user/project filtering
- ✅ Assignee management
- ✅ Task dependencies visualization

**Cấu trúc**:
```
packages/ui/gantt/
├── components/          # GanttChart và sub-components
├── hooks/              # useGanttParams, useGanttMoutainChart
├── providers/          # Context providers
├── bus/                # Event emitter system
├── styles/             # Gantt-specific CSS
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

**Props quan trọng**:
```typescript
interface GanttProps {
  locale?: 'en' | 'vi' | 'ja';
  customTexts?: Record<string, string>;
  assignees?: TaskAssignee[];
  contextKey?: string;
  appId?: string;
  code?: string;
  taskFieldsConfig?: EnhancedExternalFieldsConfig;
  eventCallbacks?: GanttEventCallbacks;
  bus?: GanttEmitter<GanttBusEvents>;
}
```

**Styles export**: `./styles.css` (cần import riêng)

---

### 4. @wms/table - Data Table Component

**Mô tả**: Flexible table component với sorting, filtering, pagination, và column management.

**Vị trí**: `packages/ui/table`

**Tính năng nổi bật**:
- ✅ Column sorting (ascending/descending)
- ✅ Column filtering với custom filter renderers
- ✅ Pagination (client-side & server-side)
- ✅ Column resizing
- ✅ Column visibility toggle
- ✅ Sticky columns support
- ✅ Row/cell action buttons
- ✅ Search functionality
- ✅ Custom toolbar

**Components**:
- `Table.tsx` - Main table component
- `TableHeader.tsx` - Header với sorting/filtering controls
- `TableBody.tsx` - Body với rows rendering
- `TableToolbar.tsx` - Toolbar với search, title, actions
- `PaginationControl.tsx` - Pagination controls

**Sử dụng**:
```typescript
import { Table } from '@wms/table';

<Table
  data={tasks}
  columns={columnDef}
  enableSorting
  enableFiltering
  enablePagination
  pageSize={20}
/>
```

**Dependencies**:
```json
{
  "@tanstack/react-table": "^8.21.3",
  "@tabler/icons-react": "^3.35.0",
  "@wms/core": "workspace:*"
}
```

---

### 5. @wms/list - List View

**Mô tả**: List view sử dụng Table component để hiển thị tasks trong dạng bảng.

**Vị trí**: `packages/ui/list`

**Tính năng**:
- ✅ Sử dụng `@wms/table` làm base component
- ✅ Pre-configured column definitions cho tasks
- ✅ Filters cho status, priority, assignee
- ✅ Pagination support
- ✅ Mock data để demo (1000+ tasks)

**Dependencies**:
```json
{
  "@wms/table": "workspace:^",
  "@wms/core": "workspace:*"
}
```

---

### 6. @wms/projects - Project Management Module

**Mô tả**: Module quản lý projects với đầy đủ CRUD operations và routing.

**Vị trí**: `packages/ui/projects`

**Tính năng nổi bật**:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Client-side routing
- ✅ List view với filters & pagination
- ✅ Create/Edit forms với validation
- ✅ Detail view
- ✅ Dashboard view (analytics)
- ✅ Row actions (edit, delete, etc.)
- ✅ Customizable routing paths

**Components chính**:
- `Projects.tsx` - Main wrapper component
- `ProjectRouter.tsx` - Client-side router
- `ListProjects.tsx` - Project list view
- `ProjectForm.tsx` - Create/edit form
- `ProjectDetail.tsx` - Project detail view
- `ProjectDashboard.tsx` - Dashboard/analytics
- `RenderRowActions.tsx` - Action buttons

**API Hooks**:
```typescript
{
  useGetProjectList,     // Fetch project list
  useGetProject,         // Fetch single project
  useCreateProject,      // Create new project
  useUpdateProject,      // Update project
  useDeleteProject       // Delete project
}
```

**Supported Routes**:
- `/projects` - List view
- `/projects/create` - Create form
- `/projects/:id/edit` - Edit form
- `/projects/:id` - Detail view

---

## 🔧 Shared Packages

### @wms/styles

**Mục đích**: Shared Tailwind CSS styles với prefix để tránh conflicts.

**Vị trí**: `packages/styles`

**Cấu hình**:
- Tailwind prefix: `wms-`
- Content paths: `../ui/**/src/**/*.{js,ts,jsx,tsx}`
- Output: `dist/index.css` (minified)

**Scripts**:
```bash
yarn dev    # Watch mode
yarn build  # Production build
```

---

### @wms/qc (Query Client)

**Mục đích**: Wrapper cho @tanstack/react-query với custom configuration.

**Vị trí**: `packages/query-client`

**Exports**:
- `WmsQueryProvider` - Provider component
- `setGlobalHttp()` - HTTP client configuration
- Query keys constants

**Features**:
- ✅ Custom HTTP client (axios)
- ✅ Global error handling
- ✅ Retry logic configuration
- ✅ Cache configuration

---

### @wms/build-config

**Mục đích**: Shared Vite build configuration cho library mode.

**Vị trí**: `packages/build-config`

**File chính**: `vite.lib.config.mjs`

**Features**:
- ✅ ESM + CJS dual format output
- ✅ TypeScript declarations generation
- ✅ External peer dependencies (không bundle)
- ✅ CSS modules support
- ✅ Optimized production builds

**External packages** (không bundle vào output):
```javascript
[
  'react', 'react-dom',
  '@mantine/*',
  '@tanstack/react-query',
  'i18next', 'react-i18next'
]
```

---

### @wms/typescript-config

**Mục đích**: Shared TypeScript configuration cho consistency.

**Vị trí**: `packages/typescript-config`

**Configs**:
- `base.json` - Base config
- `react-library.json` - React library config
- `nextjs.json` - Next.js specific config

**Features**:
- ✅ Strict mode enabled
- ✅ Modern target (ES2020+)
- ✅ Path aliases support

---

### @wms/eslint-config

**Mục đích**: Shared ESLint rules để đảm bảo code consistency.

**Vị trí**: `packages/eslint-config`

**Exports**:
- `./base` - Base configuration
- `./next-js` - Next.js specific rules
- `./react-internal` - React internal rules

**Plugins**:
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-turbo
- eslint-config-prettier
- typescript-eslint

---

### @wms/ui (Bundle Package)

**Mục đích**: Consolidated bundle export tất cả UI packages với mount functions.

**Vị trí**: `packages/bundle`

**Mount Functions**:
```typescript
// Gantt
mountGantt(container: HTMLElement, options: GanttMountOptions): void

// Board
mountBoard(container: HTMLElement, options: BoardMountOptions): void

// List
mountList(container: HTMLElement, options: ListMountOptions): void

// Projects - Router mode
mountProjects(container: HTMLElement, options: ProjectsMountOptions): void
mountProjectsWithRouter(container: HTMLElement, options: ProjectsMountOptions): void

// Projects - Individual views
mountListProjects(container: HTMLElement, options: ProjectsMountOptions): void
mountCreateProject(container: HTMLElement, options: ProjectsMountOptions): void
mountEditProject(container: HTMLElement, projectId: string, options: ProjectsMountOptions): void
mountDetailProject(container: HTMLElement, projectId: string, options: ProjectsMountOptions): void
```

**Output Formats**:
- **ESM**: `dist/wms-ui.es.js` - For modern bundlers
- **CJS**: `dist/wms-ui.cjs` - For Node.js/CommonJS
- **IIFE**: `dist/wms-ui.iife.js` - For direct browser/CDN usage
- **Styles**: `dist/styles.css` - Consolidated styles

**Usage Examples**:

```javascript
// ESM Import
import { mountGantt } from '@wms/ui';
import '@wms/ui/styles.css';

mountGantt(document.getElementById('gantt'), {
  appId: 'my-app',
  code: 'project-code',
  contextKey: 'user-context',
  taskFieldsConfig: { /* config */ }
});
```

```html
<!-- CDN Usage -->
<link rel="stylesheet" href="https://cdn.example.com/wms-ui/styles.css">
<script src="https://cdn.example.com/wms-ui/wms-ui.iife.js"></script>
<script>
  WmsUI.mountGantt(document.getElementById('gantt'), {
    appId: 'my-app',
    code: 'project-code',
    contextKey: 'user-context'
  });
</script>
```

---

## 🔨 Development Workflow

### Cài đặt & Khởi động

```bash
# 1. Enable Corepack (nếu chưa có)
corepack enable

# 2. Install dependencies
yarn install

# Dependencies peers sẽ tự động install qua postinstall hook
```

### Development Scripts

```bash
# Development - All packages
yarn dev

# Development - Filtered (với dependencies)
yarn dev:board      # Board + Core + Styles
yarn dev:gantt      # Gantt + Core + Styles
yarn dev:list       # List + Table + Core + Styles
yarn dev:projects   # Projects + Core + Styles
yarn dev:table      # Table + Core + Styles

# Development - Custom filter
turbo run dev --filter="./packages/ui/board"
turbo run dev --filter="./packages/ui/gantt" --filter="./packages/ui/core"

# Build
yarn build          # Build all packages
yarn build:uip      # Build UI packages only
yarn build:apps     # Build apps only (if any)

# Code Quality
yarn lint           # Run ESLint
yarn format         # Run Prettier
yarn check-types    # TypeScript type checking

# Generators
yarn create:uim              # Create new UI module
yarn generate:component      # Generate component in package

# Publishing
yarn publish        # Build UI packages + bundle
```

### Turbo Configuration

**Dependency Graph** (build order):
```
@wms/bundle
  ├─> @wms/board ────┐
  ├─> @wms/gantt ────┤
  ├─> @wms/list ─────┤
  │   └─> @wms/table ┤
  └─> @wms/projects ─┤
                     │
                     ├─> @wms/core
                     │   ├─> @wms/qc
                     │   └─> @wms/styles
                     │
                     └─> @wms/styles
```

**Task Caching** (`turbo.json`):
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"],
      "cache": true
    }
  }
}
```

---

## 🎯 Tính năng đặc biệt

### 1. External Fields System

**Mô tả**: Hệ thống dynamic fields cho phép thêm custom fields vào Task/Project mà không cần thay đổi database schema.

**Supported Field Types**:
- **Text**: text, textarea, number
- **Date**: date, datetime
- **Boolean**: checkbox, switch
- **Selection**: select, multiselect, radio, checkbox group
- **Advanced**: file upload (planned), rich text (planned)

**Features**:
- ✅ **Validation**: required, min/max length, pattern, custom validators
- ✅ **Dependencies**: Auto-calculate fields based on other fields
- ✅ **Conditional Visibility**: Show/hide fields based on conditions
- ✅ **Custom Renderers**: Custom UI cho từng field type
- ✅ **Grouping & Ordering**: Organize fields into sections
- ✅ **Repeatable Groups**: Dynamic field groups (add/remove rows)
- ✅ **i18n Support**: Multi-language labels & options

**Configuration Example**:
```typescript
const taskFieldsConfig: EnhancedExternalFieldsConfig = {
  fieldOrder: ['priority', 'estimatedHours', 'tags'],
  fields: {
    priority: {
      type: 'select',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ],
      validation: { required: true }
    },
    estimatedHours: {
      type: 'number',
      label: 'Estimated Hours',
      validation: { min: 0, max: 999 }
    },
    tags: {
      type: 'multiselect',
      label: 'Tags',
      options: loadTagsFromAPI
    }
  }
};
```

**Tài liệu chi tiết**:
- `/EXTERNAL_FIELDS_GUIDE.md` - Hướng dẫn đầy đủ
- `/externalFields.example.ts` - Ví dụ cấu hình
- `/INTEGRATION_STEPS.md` - Hướng dẫn tích hợp

---

### 2. Theme Customization

**Features**:
- ✅ Per-project theme configuration
- ✅ CSS variables-based theming
- ✅ Primary/secondary color customization
- ✅ Light/Dark mode support (planned)
- ✅ Preview mode trước khi apply
- ✅ Theme persistence

**Usage**:
```typescript
import { ThemeConfigModal } from '@wms/core';

<ThemeConfigModal
  opened={opened}
  onClose={onClose}
  projectId={projectId}
/>
```

**Tài liệu**: `/docs/theme-integration.md`

---

### 3. Multi-language Support

**Supported Languages**:
- 🇬🇧 English (en)
- 🇻🇳 Vietnamese (vi)
- 🇯🇵 Japanese (ja)

**Features**:
- ✅ i18next integration
- ✅ Namespace organization
- ✅ Lazy loading translations
- ✅ Runtime language switching
- ✅ Custom text overrides

**Usage**:
```typescript
import { WmsProvider } from '@wms/core';

<WmsProvider locale="vi" customTexts={{ 'task.create': 'Tạo công việc mới' }}>
  {children}
</WmsProvider>
```

---

### 4. Event System

**Mô tả**: Event bus cho decoupled communication giữa components.

**Features**:
- ✅ Type-safe event definitions
- ✅ Async event handlers
- ✅ Event callbacks support
- ✅ Mitt-based event emitter

**Usage**:
```typescript
import { createGanttBus } from '@wms/gantt';

const bus = createGanttBus();

// Subscribe
bus.on('task:created', (task) => {
  console.log('New task:', task);
});

// Emit
bus.emit('task:created', newTask);

// Pass to Gantt
<Gantt bus={bus} />
```

---

## 📋 Build & Release Process

### Build Process

```bash
# 1. Build all UI packages
yarn build:uip

# 2. Build bundle package
yarn workspace @wms/ui build

# 3. Verify outputs
ls -la packages/bundle/dist/
# Should contain:
# - wms-ui.es.js (ESM)
# - wms-ui.cjs (CJS)
# - wms-ui.iife.js (IIFE)
# - styles.css (Consolidated CSS)
# - *.d.ts (Type definitions)
```

### Release Script

```bash
# Run automated release process
./publish.sh

# Script sẽ:
# 1. Build all UI packages
# 2. Build bundle
# 3. Copy outputs to release directory
# 4. Generate changelog (if configured)
# 5. Ready for NPM publish hoặc CDN upload
```

### Distribution Options

**Option 1: NPM Package**
```bash
cd packages/bundle
npm publish --access public
```

**Option 2: CDN Deployment**
```bash
# Upload files từ packages/bundle/dist/ lên CDN
aws s3 cp packages/bundle/dist/ s3://my-cdn/wms-ui/ --recursive
```

**Option 3: Monorepo Integration**
```bash
# Trong monorepo khác
yarn add @wms/ui
# hoặc
yarn workspace my-app add @wms/ui
```

**Tài liệu**: `/docs/releasing.md`

---

## 🎓 Conventions & Best Practices

### Code Style

1. **Named Exports Only**
   ```typescript
   // ✅ Good
   export function MyComponent() {}

   // ❌ Avoid
   export default MyComponent;
   ```

2. **Peer Dependencies**
   - Keep `react`, `react-dom`, `@mantine/*` as peer dependencies
   - Không bundle vào package output
   - Đảm bảo version compatibility

3. **No Global CSS Imports**
   ```typescript
   // ❌ Avoid trong packages/ui/*
   import './global.css';

   // ✅ Use từ @wms/styles
   import '@wms/styles';
   ```

4. **Tailwind Utilities with Prefix**
   ```tsx
   // ✅ Good
   <div className="wms-flex wms-gap-4" />

   // ❌ Wrong
   <div className="flex gap-4" />
   ```

5. **TypeScript Strict Mode**
   - Luôn enable strict mode
   - Không sử dụng `any` type
   - Proper type definitions cho all exports

### Component Development

1. **File Organization**
   ```
   ComponentName/
   ├── index.ts              # Re-export
   ├── ComponentName.tsx     # Main component
   ├── ComponentName.types.ts # Type definitions
   ├── ComponentName.test.tsx # Tests (if any)
   └── components/           # Sub-components
       └── SubComponent.tsx
   ```

2. **Props Interface**
   ```typescript
   export interface ComponentNameProps {
     /** Description of prop */
     propName: string;
     /** Optional prop with default */
     optionalProp?: boolean;
   }

   export function ComponentName({ propName, optionalProp = false }: ComponentNameProps) {
     // Implementation
   }
   ```

3. **Hooks Usage**
   ```typescript
   // ✅ Good - từ @wms/core
   import { useAppQuery, useTaskApi } from '@wms/core';

   // ✅ Good - local hook
   import { useLocalState } from './hooks/useLocalState';
   ```

### Git Workflow

1. **Commit Messages** (Conventional Commits)
   ```bash
   feat(board): add drag and drop support
   fix(gantt): resolve timeline rendering issue
   docs(readme): update installation instructions
   chore(deps): upgrade react to 18.2.0
   ```

2. **Branch Naming**
   ```bash
   feat/add-dark-mode
   fix/board-drag-drop-bug
   docs/update-api-reference
   ```

### Package Development

1. **Creating New UI Package**
   ```bash
   # Use generator script
   yarn create:uim

   # Follow prompts:
   # - Package name: my-feature
   # - Scope: @wms
   # - Component name: MyFeature

   # Result: packages/ui/my-feature/
   ```

2. **Adding Dependencies**
   ```bash
   # Add to specific package
   yarn workspace @wms/board add lodash
   yarn workspace @wms/board add -D @types/lodash

   # Add workspace dependency
   yarn workspace @wms/gantt add @wms/core
   ```

3. **Running Tests**
   ```bash
   # All packages
   yarn test

   # Specific package
   yarn workspace @wms/board test

   # With coverage
   yarn test --coverage
   ```

---

## 📚 Tài liệu tham khảo

### Documentation Files

| File | Mô tả |
|------|-------|
| `README.md` | Quickstart guide, basic usage |
| `CONTRIBUTING.md` | Contributing guidelines |
| `CODE_OF_CONDUCT.md` | Code of conduct |
| `docs/overview.md` | Project overview (technical) |
| `docs/ui-package-blueprint.md` | Template để tạo UI package mới |
| `docs/releasing.md` | Release process chi tiết |
| `docs/theme-integration.md` | Theme customization guide |
| `EXTERNAL_FIELDS_GUIDE.md` | External fields system documentation |
| `INTEGRATION_STEPS.md` | Integration guide cho consumers |
| `externalFields.example.ts` | External fields config examples |

### Package-specific Docs

- `packages/ui/core/TASK_FORM_MIGRATION_GUIDE.md` - Task form migration guide
- `packages/ui/core/src/components/task/guide.md` - Task component usage guide
- `packages/eslint-config/README.md` - ESLint config documentation

### Online Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Mantine UI](https://mantine.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

---

## 📊 Thống kê dự án

### Package Count
- **Total Packages**: 13
  - UI Packages: 6 (@wms/board, @wms/core, @wms/gantt, @wms/list, @wms/projects, @wms/table)
  - Shared Packages: 7 (@wms/bundle, @wms/build-config, @wms/eslint-config, @wms/qc, @wms/styles, @wms/typescript-config)

### Technology Stack
- **TypeScript Coverage**: 100%
- **Build Tool**: Vite 7.1.7
- **UI Framework**: Mantine 8
- **State Management**: React Query 5.x + Context
- **Form Handling**: React Hook Form + Yup
- **Styling**: Tailwind CSS (prefixed)
- **Icons**: Tabler Icons
- **Date**: Day.js
- **i18n**: i18next + react-i18next

### Code Quality Tools
- **Linter**: ESLint 9+ (flat config)
- **Formatter**: Prettier 3.6+
- **Type Checker**: TypeScript 5.9
- **Test Framework**: Vitest (configured)
- **Build Orchestration**: Turborepo 2.5

---

## 🚀 Quick Start Guide

### 1. Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd wms-micro

# Enable Corepack
corepack enable

# Install dependencies
yarn install
```

### 2. Development

```bash
# Start all packages in dev mode
yarn dev

# Hoặc start specific package
yarn dev:board
yarn dev:gantt
yarn dev:projects
```

### 3. Build

```bash
# Build all packages
yarn build

# Build UI packages only
yarn build:uip
```

### 4. Using as Library

```typescript
// Install package
yarn add @wms/ui

// Import styles
import '@wms/ui/styles.css';

// Import and use
import { mountGantt, mountBoard } from '@wms/ui';

// Mount Gantt
mountGantt(document.getElementById('gantt-container'), {
  appId: 'my-app',
  code: 'project-1',
  contextKey: 'user-123',
  locale: 'vi'
});

// Mount Board
mountBoard(document.getElementById('board-container'), {
  appId: 'my-app',
  code: 'project-1',
  contextKey: 'user-123'
});
```

---

## 🎯 Roadmap & Future Plans

### Planned Features
- [ ] Dark mode support
- [ ] Mobile responsive views
- [ ] Offline support với service workers
- [ ] Real-time collaboration
- [ ] Advanced filtering & search
- [ ] Custom views/dashboards
- [ ] Export to PDF/Excel
- [ ] Timeline/Calendar view
- [ ] Notification system
- [ ] Activity logs/audit trail

### Performance Improvements
- [ ] Code splitting optimization
- [ ] Lazy loading strategies
- [ ] Bundle size reduction
- [ ] Virtual scrolling cho tất cả lists
- [ ] Service worker caching

### Developer Experience
- [ ] Storybook integration
- [ ] Component documentation site
- [ ] Playwright E2E tests
- [ ] Visual regression testing
- [ ] Performance benchmarks

---

## 🤝 Contributing

Chúng tôi hoan nghênh contributions từ cộng đồng! Vui lòng đọc `CONTRIBUTING.md` để biết chi tiết về:

- Code of Conduct
- Development workflow
- Coding standards
- Pull request process
- Testing requirements

---

## 📄 License

[License Type] - Xem file LICENSE để biết chi tiết.

---

## 🙏 Acknowledgments

Dự án sử dụng các open source libraries tuyệt vời:

- [React](https://react.dev/) - UI Framework
- [Mantine](https://mantine.dev/) - Component Library
- [TanStack Query](https://tanstack.com/query/) - Data Fetching
- [Turborepo](https://turbo.build/) - Build System
- [Vite](https://vitejs.dev/) - Build Tool
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

Và nhiều thư viện khác. Cảm ơn tất cả maintainers và contributors!

---

## 📞 Support & Contact

Để được hỗ trợ hoặc báo cáo issues:

- GitHub Issues: [Link to issues]
- Documentation: `/docs` directory
- Email: [contact email if applicable]

---

**Last Updated**: 2025-11-17
**Document Version**: 1.0.0
