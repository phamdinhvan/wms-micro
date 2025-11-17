import {Loader} from '@mantine/core';
import {
  AppCredentialsProvider,
  EnhancedExternalFieldsConfig,
  WmsProvider,
} from '@wms/core';
import {Gantt} from '../src/Gantt';

// Test external fields config with EnhancedExternalFieldsConfig format
const testTaskFieldsConfig: EnhancedExternalFieldsConfig = {
  fields: {
    department: {
      key: 'department',
      name: {
        en: 'Department',
        ja: '部署',
        vi: 'Phòng ban',
      },
      type: 'select',

      placeholder: {
        en: 'Choose department',
        ja: '部署を選択してください',
        vi: 'Chọn phòng ban',
      },
      options: [
        {
          label: {en: 'Engineering', ja: 'エンジニアリング', vi: 'Kỹ thuật'},
          value: 'eng',
        },
        {label: {en: 'Sales', ja: '営業', vi: 'Kinh doanh'}, value: 'sales'},
        {
          label: {en: 'Marketing', ja: 'マーケティング', vi: 'Marketing'},
          value: 'marketing',
        },
        {label: {en: 'HR', ja: '人事', vi: 'Nhân sự'}, value: 'hr'},
      ],
      validation: {required: true},
      defaultValue: 'eng',
      order: 1,
      group: 'custom',
      column: 1,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    teamSize: {
      key: 'teamSize',
      name: {
        en: 'Team Size',
        ja: 'チーム規模',
        vi: 'Quy mô nhóm',
      },
      type: 'number',

      placeholder: {
        en: 'Enter team size',
        ja: 'チーム規模を入力',
        vi: 'Nhập quy mô nhóm',
      },
      validation: {
        required: true,
        min: 1,
        max: 50,
      },
      order: 2,
      group: 'custom',
      column: 2, // Same row as department
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    estimatedStartDate: {
      key: 'estimatedStartDate',
      name: {
        en: 'Estimated Start',
        ja: '開始予定日',
        vi: 'Ngày bắt đầu dự kiến',
      },
      type: 'date',

      placeholder: {
        en: 'Select start date',
        ja: '開始日を選択',
        vi: 'Chọn ngày bắt đầu',
      },
      validation: {required: true},
      order: 3,
      group: 'timeline',
      column: 1,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    estimatedEndDate: {
      key: 'estimatedEndDate',
      name: {
        en: 'Estimated End',
        ja: '終了予定日',
        vi: 'Ngày kết thúc dự kiến',
      },
      type: 'date',
      description: {
        en: 'When do you plan to finish?',
        ja: 'いつ終了予定ですか？',
        vi: 'Bạn dự kiến kết thúc khi nào?',
      },
      placeholder: {
        en: 'Select end date',
        ja: '終了日を選択',
        vi: 'Chọn ngày kết thúc',
      },
      validation: {
        required: true,
        custom: (value, allValues) => {
          const startDate = allValues.estimatedStartDate;
          if (startDate && value) {
            const start = new Date(startDate as string);
            const end = new Date(value as string);
            if (end <= start) {
              return 'End date must be after start date';
            }
          }
          return true;
        },
      },
      order: 4,
      group: 'timeline',
      column: 2, // Same row as estimatedStartDate
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    isBillable: {
      key: 'isBillable',
      name: {
        en: 'Is Billable',
        ja: '請求可能',
        vi: 'Có tính phí',
      },
      type: 'checkbox',
      defaultValue: false,
      order: 5,
      group: 'financial',
      column: 2,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-full',
    },

    tags: {
      key: 'tags',
      name: {
        en: 'Tags',
        ja: 'タグ',
        vi: 'Thẻ',
      },
      type: 'multiselect',
      description: {
        en: 'Select multiple tags',
        ja: '複数のタグを選択',
        vi: 'Chọn nhiều thẻ',
      },
      placeholder: {
        en: 'Choose tags',
        ja: 'タグを選択',
        vi: 'Chọn thẻ',
      },
      options: [
        {
          label: {en: 'Frontend', ja: 'フロントエンド', vi: 'Giao diện'},
          value: 'frontend',
        },
        {
          label: {en: 'Backend', ja: 'バックエンド', vi: 'Backend'},
          value: 'backend',
        },
        {
          label: {en: 'Design', ja: 'デザイン', vi: 'Thiết kế'},
          value: 'design',
        },
        {
          label: {en: 'Testing', ja: 'テスト', vi: 'Kiểm thử'},
          value: 'testing',
        },
        {label: {en: 'DevOps', ja: 'DevOps', vi: 'DevOps'}, value: 'devops'},
      ],
      order: 6,
      group: 'metadata',
      column: 2,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-full',
    },

    // Example: Dynamic API field with auto-fill dependency
    user: {
      key: 'user',
      name: {
        en: 'User',
        ja: 'ユーザー',
        vi: 'Người dùng',
      },
      type: 'select',
      placeholder: {
        en: 'Select user',
        ja: 'ユーザーを選択',
        vi: 'Chọn người dùng',
      },
      // Dynamic data fetching configuration
      dataConfig: {
        renderData: async () => {
          // Fetch users from API
          const response = await fetch(
            'https://6912f84b52a60f10c8237705.mockapi.io/api/data/users',
          );
          const users = await response.json();

          // Return both options and full data
          return {
            options: users.map((user: any) => ({
              label: user.name,
              value: user.id,
            })),
            // Store full user data for extract dependencies
            data: Object.fromEntries(users.map((user: any) => [user.id, user])),
          };
        },
        dataKey: 'users', // Store in sourceDataMap['users']
        cacheDuration: 300000, // Cache for 5 minutes
      },
      validation: {required: true},
      order: 7,
      group: 'user-info',
      column: 1,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    userId: {
      key: 'userId',
      name: {
        en: 'User ID',
        ja: 'ユーザーID',
        vi: 'ID người dùng',
      },
      type: 'text',
      placeholder: {
        en: 'Auto-filled from user',
        ja: 'ユーザーから自動入力',
        vi: 'Tự động điền từ user',
      },
      disabled: true, // Read-only field
      // Dependency: auto-fill user ID from user selection
      dependencies: [
        {
          type: 'extract',
          sourceField: 'user',
          targetField: 'userId',
          config: {
            sourcePath: 'id', // Extract 'id' property from user data
            sourceDataKey: 'users', // Must match dataKey in user field's dataConfig
          },
          required: false,
          clearOnChange: true,
        },
      ],
      order: 8,
      group: 'user-info',
      column: 2, // Same row as user field
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-[180px]',
    },

    product: {
      key: 'product',
      name: {
        en: 'Product',
        ja: '製品',
        vi: 'Sản phẩm',
      },
      type: 'select',
      placeholder: {
        en: 'Select product',
        ja: '製品を選択',
        vi: 'Chọn sản phẩm',
      },
      // Dependency: fetch products based on selected user
      dependencies: [
        {
          type: 'fetch',
          sourceField: 'user',
          targetField: 'product',
          config: {
            dataConfig: {
              renderData: async (userId: string) => {
                // Fetch products for specific user
                const response = await fetch(
                  `https://6912f84b52a60f10c8237705.mockapi.io/api/data/users/${userId}/products`,
                );
                const products = await response.json();

                // Return options and full data
                return {
                  options: products.map((product: any) => ({
                    label: product.name,
                    value: product.id,
                  })),
                  data: Object.fromEntries(
                    products.map((product: any) => [product.id, product]),
                  ),
                };
              },
            },
          },
          required: true, // Only fetch when user is selected
          clearOnChange: true,
        },
      ],
      validation: {required: false},
      order: 9,
      group: 'user-info',
      column: 1,
      labelWidth: 'wms-w-[140px]',
      inputWidth: 'wms-w-full',
    },
  },
  sourceDataMap: {},
};

const App = () => {
  // Mock credentials - same as Projects App
  const mockAppId = '0199c1cb-20f3-76eb-adcb-3614128c72f5';
  const mockCode = '55059ac48c98dc5372e2e8bccec6a8f2';

  if (!mockAppId || !mockCode) {
    return <Loader />;
  }

  return (
    <div className="wms-h-screen">
      <WmsProvider>
        <AppCredentialsProvider appId={mockAppId} code={mockCode}>
          <Gantt
            contextKey="9fd38075-1c29-4bdc-bd3d-afd8f03fd8ad"
            taskFieldsConfig={testTaskFieldsConfig}
          />
        </AppCredentialsProvider>
      </WmsProvider>
    </div>
  );
};

export default App;
