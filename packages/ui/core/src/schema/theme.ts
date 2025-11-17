import * as yup from 'yup';
import {TFormGroup} from '../types/input';

// Simple theme form type matching your clean format
export type ThemeFormSchemaType = {
  theme: 'light' | 'dark';
  primaryColor: string;
  fontPrimary: string;
  fontNumeric: string;
  fontMono: string;
  defaultRadius: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  statusNew: string;
  statusInProgress: string;
  statusCompleted: string;
  priorityHigh: string;
  borderTimeline: string;
  borderTimelineMonthEnd: string;
  showProgress: boolean;
  compactMode: boolean;
  showDependencies: boolean;
  dateFormat: string;
  timezone: string;
};

// Simple validation schema
export const themeSchema = (t: (key: string) => string) =>
  yup.object().shape({
    theme: yup.string().oneOf(['light', 'dark']).default('light'),
    primaryColor: yup
      .string()
      .matches(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
      .default('#FF9800')
      .required(),
    fontPrimary: yup.string().default('var(--gantt-font-primary), sans-serif'),
    fontNumeric: yup.string().default('var(--gantt-font-numeric), monospace'),
    fontMono: yup.string().default('var(--gantt-font-mono), monospace'),
    defaultRadius: yup
      .string()
      .oneOf(['xs', 'sm', 'md', 'lg', 'xl'])
      .default('md'),
    statusNew: yup.string().default('#6b7280'),
    statusInProgress: yup.string().default('#3b82f6'),
    statusCompleted: yup.string().default('#10b981'),
    priorityHigh: yup.string().default('#f59e0b'),
    borderTimeline: yup.string().default('#E5E7EB'),
    borderTimelineMonthEnd: yup.string().default('#9CA3AF'),
    showProgress: yup.boolean().default(true),
    compactMode: yup.boolean().default(false),
    showDependencies: yup.boolean().default(true),
    dateFormat: yup.string().default('MM/dd/yyyy'),
    timezone: yup.string().default('UTC'),
  });

// Simplified form groups for unified color input approach
export const themeFormGroups: TFormGroup[] = [
  {
    name: 'general',
    label: 'General Settings',
    col: [
      {
        col: 1,
        field: [
          {
            name: 'theme',
            label: 'theme.form.general.theme.label',
            type: 'select',
            column: 1,
            group: 'general',
            inputWidth: 'wms-w-full',
            withAsterisk: true,
          },
          {
            name: 'fontFamily',
            label: 'theme.form.general.fontFamily.label',
            type: 'text',
            column: 1,
            group: 'general',
            inputWidth: 'wms-w-full',
            withAsterisk: false,
          },
          {
            name: 'defaultRadius',
            label: 'theme.form.general.defaultRadius.label',
            type: 'select',
            column: 1,
            group: 'general',
            inputWidth: 'wms-w-full',
            withAsterisk: false,
          },
        ],
      },
    ],
  },
  {
    name: 'colors',
    label: 'Color Settings',
    col: [
      {
        col: 1,
        field: [
          {
            name: 'colors.primary',
            label: 'theme.form.colors.primary.label',
            type: 'text',
            column: 1,
            group: 'colors',
            inputWidth: 'wms-w-full',
            withAsterisk: true,
          },
          {
            name: 'colors.secondary',
            label: 'theme.form.colors.secondary.label',
            type: 'text',
            column: 1,
            group: 'colors',
            inputWidth: 'wms-w-full',
            withAsterisk: true,
          },
          {
            name: 'colors.gray',
            label: 'theme.form.colors.gray.label',
            type: 'text',
            column: 1,
            group: 'colors',
            inputWidth: 'wms-w-full',
            withAsterisk: false,
          },
        ],
      },
    ],
  },
  {
    name: 'timeline',
    label: 'Timeline Borders',
    col: [
      {
        col: 1,
        field: [
          {
            name: 'tailwind.customColors.borderTimeline',
            label: 'theme.form.timeline.borderTimeline.label',
            type: 'text',
            column: 1,
            group: 'timeline',
            inputWidth: 'wms-w-full',
            withAsterisk: false,
          },
          {
            name: 'tailwind.customColors.borderTimelineMonthEnd',
            label: 'theme.form.timeline.borderTimelineMonthEnd.label',
            type: 'text',
            column: 1,
            group: 'timeline',
            inputWidth: 'wms-w-full',
            withAsterisk: false,
          },
        ],
      },
    ],
  },
];

// Required fields for theme configuration
export const requiredThemeSchemaFields = ['theme', 'primaryColor'];
