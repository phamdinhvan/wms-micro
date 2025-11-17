/**
 * EXAMPLE: External Fields Config
 * Copy file này và customize theo nhu cầu của bạn
 */

import {ExternalFieldsConfig} from '@wms/core';

export const exampleTaskFieldsConfig: ExternalFieldsConfig = {
  // Text field đơn giản
  testfield1: {
    key: 'testfield1',
    name: 'Test Field 1',
    type: 'text',
    description: 'This is a test text field',
    placeholder: 'Enter value here...',
    validation: {
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    order: 1,
    group: 'custom',
  },

  // Number field
  testfield2: {
    key: 'testfield2',
    name: 'Test Field 2 (Number)',
    type: 'number',
    description: 'A numeric field',
    validation: {
      required: false,
      min: 0,
      max: 100,
    },
    defaultValue: 0,
    order: 2,
    group: 'custom',
  },

  // Select field
  department: {
    key: 'department',
    name: 'Department',
    type: 'select',
    description: 'Select department',
    options: [
      {label: 'Engineering', value: 'eng'},
      {label: 'Sales', value: 'sales'},
      {label: 'Marketing', value: 'marketing'},
      {label: 'HR', value: 'hr'},
    ],
    validation: {
      required: true,
    },
    defaultValue: 'eng',
    order: 3,
    group: 'organization',
  },

  // Multi-select field
  tags: {
    key: 'tags',
    name: 'Tags',
    type: 'multiselect',
    description: 'Select multiple tags',
    options: [
      {label: 'Frontend', value: 'frontend'},
      {label: 'Backend', value: 'backend'},
      {label: 'Design', value: 'design'},
      {label: 'Testing', value: 'testing'},
      {label: 'DevOps', value: 'devops'},
    ],
    order: 4,
    group: 'metadata',
  },

  // Date field
  estimatedStartDate: {
    key: 'estimatedStartDate',
    name: 'Estimated Start Date',
    type: 'date',
    description: 'When do you plan to start?',
    validation: {
      required: true,
    },
    order: 5,
    group: 'timeline',
  },

  // Date field với validation phụ thuộc
  estimatedEndDate: {
    key: 'estimatedEndDate',
    name: 'Estimated End Date',
    type: 'date',
    description: 'When do you plan to finish?',
    validation: {
      required: true,
      // Validate end date phải sau start date
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
    order: 6,
    group: 'timeline',
  },

  // Number field với dependency (auto-calculate)
  estimatedDuration: {
    key: 'estimatedDuration',
    name: 'Duration (days)',
    type: 'number',
    description: 'Automatically calculated from dates',
    disabled: true, // Read-only field
    dependencies: [
      {
        sourceField: 'estimatedStartDate',
        targetField: 'estimatedDuration',
        onChange: (_sourceValue, _targetValue, allValues) => {
          const start = allValues.estimatedStartDate;
          const end = allValues.estimatedEndDate;
          if (start && end) {
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
          }
          return null;
        },
      },
      {
        sourceField: 'estimatedEndDate',
        targetField: 'estimatedDuration',
        onChange: (_sourceValue, _targetValue, allValues) => {
          const start = allValues.estimatedStartDate;
          const end = allValues.estimatedEndDate;
          if (start && end) {
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
          }
          return null;
        },
      },
    ],
    order: 7,
    group: 'timeline',
  },

  // Boolean field
  isBillable: {
    key: 'isBillable',
    name: 'Is Billable',
    type: 'boolean',
    description: 'Mark if this task is billable',
    defaultValue: false,
    order: 8,
    group: 'financial',
  },

  // Textarea
  notes: {
    key: 'notes',
    name: 'Additional Notes',
    type: 'textarea',
    description: 'Any additional notes',
    placeholder: 'Enter notes here...',
    order: 9,
    group: 'metadata',
  },

  // Radio field
  priority: {
    key: 'priority',
    name: 'Custom Priority',
    type: 'radio',
    options: [
      {label: 'Low', value: 'low'},
      {label: 'Medium', value: 'medium'},
      {label: 'High', value: 'high'},
      {label: 'Critical', value: 'critical'},
    ],
    validation: {
      required: true,
    },
    defaultValue: 'medium',
    order: 10,
    group: 'custom',
  },
};

// ===============================================
// CÁC VÍ DỤ ĐƠN GIẢN HƠN
// ===============================================

// Example 1: Chỉ có 2 fields text đơn giản
export const simpleConfig: ExternalFieldsConfig = {
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

// Example 2: Select với options
export const selectConfig: ExternalFieldsConfig = {
  department: {
    key: 'department',
    name: 'Department',
    type: 'select',
    options: [
      {label: 'Engineering', value: 'eng'},
      {label: 'Sales', value: 'sales'},
    ],
    validation: {required: true},
    order: 1,
  },
};

// Example 3: Date range validation
export const dateRangeConfig: ExternalFieldsConfig = {
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
    validation: {
      required: true,
      custom: (value, allValues) => {
        const start = allValues.startDate;
        if (start && value && new Date(value as string) <= new Date(start as string)) {
          return 'End date must be after start date';
        }
        return true;
      },
    },
    order: 2,
  },
};
