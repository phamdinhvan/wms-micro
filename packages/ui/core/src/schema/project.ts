import dayjs from 'dayjs';
import * as yup from 'yup';
import {TFormGroup, TFormInput} from '../types';
import {ValidateUtils} from '../utils';

const CODE_MAX_LENGTH = 100;
const NAME_MAX_LENGTH = 100;

export const requiredProjectSchemaFields = [
  'appId',
  'name',
  'status',
  'priority',
];

export const projectSchema = (t: any, isEdit: boolean = false) =>
  yup.object({
    id: isEdit ? yup.string() : yup.mixed().optional(),
    appId: yup
      .string()
      .required(`${t('project.form.appId.label')}${t('messages.required')}`),
    externalId: yup.string().nullable().optional(),
    name: yup
      .string()
      .max(NAME_MAX_LENGTH, t('messages.maxLength', {max: NAME_MAX_LENGTH}))
      .required(`${t('project.form.name.label')}${t('messages.required')}`),
    description: yup.string().nullable().optional(),
    code: yup
      .string()
      .max(CODE_MAX_LENGTH, t('messages.maxLength', {max: CODE_MAX_LENGTH}))
      .test(
        'code-validator',
        `${t('project.form.code.label')}${t('messages.invalid')} ${t('messages.codeValidatorError')}`,
        value => {
          if (!value) return true;
          return ValidateUtils.validateCode(value);
        },
      )
      .nullable()
      .optional(),
    startDate: yup
      .string()
      .nullable()
      .test('is-date', t('messages.invalidDate'), v =>
        !v ? true : dayjs(v, 'YYYY-MM-DD', true).isValid(),
      )
      .optional(),
    endDate: yup
      .string()
      .nullable()
      .test('is-date', t('messages.invalidDate'), v =>
        !v ? true : dayjs(v, 'YYYY-MM-DD', true).isValid(),
      )
      .optional(),
    status: yup
      .string()
      .oneOf(['active', 'archived', 'on-hold'])
      .default('active')
      .required(`${t('project.form.status.label')}${t('messages.required')}`),
    priority: yup
      .string()
      .oneOf(['low', 'medium', 'high'])
      .default('low')
      .required(`${t('project.form.priority.label')}${t('messages.required')}`),
    manager: yup.string().nullable().optional(),
    owner: yup.string().nullable().optional(),
    department: yup.string().nullable().optional(),
    budget: yup
      .number()
      .typeError(t('messages.number'))
      .min(0, t('messages.min', {min: 0}))
      .default(0)
      .optional(),
    templateId: yup.string().nullable().optional(),
  });

export type ProjectFormSchemaType = yup.InferType<
  ReturnType<typeof projectSchema>
>;

// Unified form type for both create and edit - matching new payload format
export type ProjectFormData = {
  externalId?: string;
  name: string;
  assignee?:
    | {
        id: string;
        name: string;
        email: string;
      }
    | string; // Can be object or JSON string from select
  description: string;
  key: string;
  type: 'main' | 'sub'; // Project type: main or sub project
  startDate: Date; // Form uses Date objects, converted to ISO string in payload
  endDate: Date; // Form uses Date objects, converted to ISO string in payload
  actualStartDate?: Date;
  actualEndDate?: Date;
  status: 'active' | 'inactive' | 'completed' | 'on-hold';
  collaborators?: {
    id: string;
    name?: string;
    email?: string;
  }[];
};

// Unified schema for both create and edit - matching new payload format
export const projectFormSchema = (t: any) =>
  yup.object({
    externalId: yup.string().optional(),
    name: yup
      .string()
      .required(t('project.validation.nameRequired') || 'Name is required')
      .defined(),
    assignee: yup.mixed().optional(), // Can be object or JSON string from select
    description: yup
      .string()
      .required(
        t('project.validation.descriptionRequired') ||
          'Description is required',
      )
      .defined(),
    key: yup
      .string()
      .required(t('project.validation.keyRequired') || 'Key is required')
      .defined(),
    type: yup
      .mixed<ProjectFormData['type']>()
      .oneOf(['main', 'sub'] as const)
      .required(
        t('project.validation.typeRequired') || 'Project type is required',
      )
      .defined(),
    startDate: yup
      .date()
      .typeError(t('project.validation.invalidDate') || 'Invalid date')
      .required(
        t('project.validation.startDateRequired') || 'Start date is required',
      )
      .defined(),
    endDate: yup
      .date()
      .typeError(t('project.validation.invalidDate') || 'Invalid date')
      .required(
        t('project.validation.endDateRequired') || 'End date is required',
      )
      .defined()
      .test(
        'is-after-start',
        t('project.validation.endDateAfterStart') ||
          'End date must be after start date',
        function (value) {
          const {startDate} = this.parent;
          if (!startDate || !value) return true;
          return dayjs(value).isAfter(dayjs(startDate));
        },
      ),
    actualStartDate: yup
      .date()
      .typeError(t('project.validation.invalidDate') || 'Invalid date')
      .optional(),
    actualEndDate: yup
      .date()
      .typeError(t('project.validation.invalidDate') || 'Invalid date')
      .optional()
      .test(
        'is-after-actual-start',
        t('project.validation.actualEndDateAfterActualStart') ||
          'Actual end date must be after actual start date',
        function (value) {
          const {actualStartDate} = this.parent;
          if (!actualStartDate || !value) return true;
          return dayjs(value).isAfter(dayjs(actualStartDate));
        },
      ),
    status: yup
      .mixed<ProjectFormData['status']>()
      .oneOf(['active', 'inactive', 'completed', 'on-hold'] as const)
      .required(t('project.validation.statusRequired') || 'Status is required')
      .defined(),
    collaborators: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          name: yup.string().optional(),
          email: yup.string().optional(),
        }),
      )
      .optional(),
  });

/** Optional: form groups definition (like company) */
const projectGroups: TFormGroup[] = [
  {name: 'basic', label: 'project.group.basic', col: []},
  {name: 'schedule', label: 'project.group.schedule', col: []},
  {name: 'people', label: 'project.group.people', col: []},
  {name: 'extra', label: 'project.group.extra', col: []},
];

// ProjectForm specific inputs for create/edit form
const projectFormInputs: TFormInput[] = [
  // {
  //   label: 'project.form.externalId.label',
  //   name: 'externalId',
  //   type: 'text',
  //   column: 1,
  //   group: 'basic',
  //   inputWidth: 'wms-w-full',
  //   labelWidth: 'wms-w-[220px]',
  //   placeholder: 'gantt-21554caf-...',
  // },
  {
    label: 'project.form.type.label',
    name: 'type',
    type: 'select',
    withAsterisk: true,
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.type.placeholder',
    isTranslate: true,
    options: [
      {value: 'main', label: 'project.form.type.main'},
      {value: 'sub', label: 'project.form.type.sub'},
    ],
  },
  {
    label: 'project.form.name.label',
    name: 'name',
    type: 'text',
    withAsterisk: true,
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    maxLength: NAME_MAX_LENGTH,
    labelWidth: 'wms-w-[220px]',
    autoFocus: true,
    placeholder: 'project.form.name.placeholder',
  },
  {
    label: 'project.form.key.label',
    name: 'key',
    type: 'text',
    withAsterisk: true,
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    maxLength: CODE_MAX_LENGTH,
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.key.placeholder',
  },
  {
    label: 'project.form.description.label',
    name: 'description',
    type: 'textarea',
    withAsterisk: true,
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[220px]',
    rows: 3,
    placeholder: 'project.form.description.placeholder',
  },
  {
    label: 'project.form.assignee.label',
    name: 'assignee',
    type: 'select',
    column: 1,
    group: 'people',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.assignee.placeholder',
    apiUrl: '/external/users',
    valueKey: 'id',
    labelKey: 'name',
    searchable: true,
    clearable: true,
  },
  {
    label: 'project.form.startDate.label',
    name: 'startDate',
    type: 'date',
    withAsterisk: true,
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.startDate.placeholder',
  },
  {
    label: 'project.form.endDate.label',
    name: 'endDate',
    type: 'date',
    withAsterisk: true,
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.endDate.placeholder',
  },
  {
    label: 'project.form.actualStartDate.label',
    name: 'actualStartDate',
    type: 'date',
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.actualStartDate.placeholder',
  },
  {
    label: 'project.form.actualEndDate.label',
    name: 'actualEndDate',
    type: 'date',
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.actualEndDate.placeholder',
  },
  {
    label: 'project.form.status.label',
    name: 'status',
    type: 'select',
    options: [
      {value: 'active', label: 'project.status.active'},
      {value: 'inactive', label: 'project.status.inactive'},
      {value: 'completed', label: 'project.status.completed'},
      {value: 'on-hold', label: 'project.status.on-hold'},
    ],
    isTranslate: true, // Enable translation for options
    withAsterisk: true,
    column: 1,
    group: 'extra',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[220px]',
  },
  {
    label: 'project.form.collaborators.label',
    name: 'collaborators',
    type: 'select',
    column: 1,
    group: 'people',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[220px]',
    placeholder: 'project.form.collaborators.placeholder',
    apiUrl: '/external/users',
    valueKey: 'id',
    labelKey: 'name',
    searchable: true,
    clearable: true,
    multiple: true,
  },
];

// Process projectFormInputs for groups
projectFormInputs.forEach((field: TFormInput) => {
  const group = projectGroups.find(g => g.name === field.group);
  const col = group?.col;
  if (!col) return;
  const exists = col.find(i => i.col === field.column);
  if (exists) exists.field.push(field);
  else col.push({col: field.column || 0, field: [field]});
});

const projectFormGroupSchema = projectGroups
  .filter(g => g.col?.length > 0)
  .map(g => ({...g, col: [...g.col].sort((a, b) => a.col - b.col)}));

export {projectFormGroupSchema, projectFormInputs, projectGroups};
