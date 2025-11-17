// features/gantt/schema/task.schema.ts
import * as yup from 'yup';
import {TFormGroup, TFormInput} from '../types/input';

const CODE_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
const NOTES_MAX_LENGTH = 2000;

export const requiredTaskSchemaFields = [
  'name',
  'attributes.status',
  'attributes.priority',
];

export const taskSchema = (t: any, isEdit: boolean = false) =>
  yup.object({
    id: isEdit ? yup.string() : yup.mixed().optional(),
    projectId: yup
      .string()
      .required(`${t('task.form.projectId.label')}${t('messages.required')}`),
    externalId: yup.string().nullable().optional(),
    name: yup
      .string()
      .max(NAME_MAX_LENGTH, t('messages.maxLength', {max: NAME_MAX_LENGTH}))
      .required(`${t('task.form.name.label')}${t('messages.required')}`),
    description: yup
      .string()
      .max(
        DESCRIPTION_MAX_LENGTH,
        t('messages.maxLength', {max: DESCRIPTION_MAX_LENGTH}),
      )
      .nullable()
      .optional(),
    notes: yup
      .string()
      .max(
        DESCRIPTION_MAX_LENGTH,
        t('messages.maxLength', {max: DESCRIPTION_MAX_LENGTH}),
      )
      .nullable()
      .optional(),
    startDate: yup
      .date()
      .nullable()
      .optional()
      .typeError(t('task.validation.invalidDate')),
    endDate: yup
      .date()
      .nullable()
      .optional()
      .typeError(t('task.validation.invalidDate'))
      .test(
        'min-start-date',
        t('task.validation.endDateBeforeStart'),
        function (value) {
          const startDate = this.parent.startDate;
          if (!value || !startDate) return true;

          // Convert to Date objects if they aren't already
          const endDateObj = value instanceof Date ? value : new Date(value);
          const startDateObj =
            startDate instanceof Date ? startDate : new Date(startDate);

          // Check if dates are valid
          if (isNaN(endDateObj.getTime()) || isNaN(startDateObj.getTime())) {
            return true; // Let typeError handle invalid dates
          }

          return endDateObj >= startDateObj;
        },
      ),
    // Move status, priority, assignee to attributes object
    attributes: yup
      .object({
        status: yup
          .string()
          .default('new')
          .required(`${t('task.form.status.label')}${t('messages.required')}`),
        priority: yup
          .string()
          .default('normal')
          .required(
            `${t('task.form.priority.label')}${t('messages.required')}`,
          ),
        assignee: yup.string().nullable().optional(),
      })
      .default({}),
    level: yup
      .number()
      .min(0, t('messages.min', {min: 0}))
      .max(10, t('messages.max', {max: 10}))
      .default(0)
      .optional(),
    category: yup
      .string()
      .max(NAME_MAX_LENGTH, t('messages.maxLength', {max: NAME_MAX_LENGTH}))
      .nullable()
      .optional(),
    manager: yup
      .string()
      .max(NAME_MAX_LENGTH, t('messages.maxLength', {max: NAME_MAX_LENGTH}))
      .nullable()
      .optional(),
    parentId: yup.string().nullable().optional(),
    progress: yup
      .number()
      .min(0, t('messages.min', {min: 0}))
      .max(100, t('messages.max', {max: 100}))
      .default(0)
      .optional(),
    tags: yup
      .array()
      .of(yup.string().max(50, t('messages.maxLength', {max: 50})))
      .max(10, t('messages.maxItems', {max: 10}))
      .default([])
      .optional(),
    // Custom fields array
    customFields: yup
      .array()
      .of(
        yup.object({
          typeId: yup
            .string()
            .required(t('task.customFields.validation.typeRequired')),
          name: yup
            .string()
            .max(100, t('messages.maxLength', {max: 100}))
            .required(t('task.customFields.validation.nameRequired')),
          key: yup
            .string()
            .max(50, t('messages.maxLength', {max: 50}))
            .required(t('task.customFields.validation.keyRequired')),
          description: yup
            .string()
            .max(500, t('messages.maxLength', {max: 500}))
            .optional(),
          value: yup.mixed().optional(),
          orderIndex: yup.number().min(0).default(0),
          isRequired: yup.boolean().default(false),
        }),
      )
      .max(20, t('messages.maxItems', {max: 20}))
      .default([])
      .optional(),
    // External fields (dynamic fields from config)
    externalFields: yup.object().default({}).optional(),
    // Task relations/dependencies (form format)
    relations: yup
      .array()
      .of(
        yup.object({
          targetTaskId: yup
            .string()
            .required(t('task.relations.validation.targetTaskRequired')),
          relationType: yup
            .string()
            .oneOf(['SS', 'FS', 'SF', 'FF'], t('task.relations.validation.invalidRelationType'))
            .required(t('task.relations.validation.relationTypeRequired')),
          delayDays: yup
            .number()
            .min(0, t('messages.min', {min: 0}))
            .optional(),
        }),
      )
      .default([])
      .optional(),
  });

export type TaskFormSchemaType = yup.InferType<ReturnType<typeof taskSchema>>;

/** Form groups definition */
const taskGroups: TFormGroup[] = [
  {name: 'basic', label: 'task.group.basic', col: []},
  {name: 'schedule', label: 'task.group.schedule', col: []},
  {name: 'people', label: 'task.group.people', col: []},
  {name: 'extra', label: 'task.group.extra', col: []},
];

const taskSchemaInputs: TFormInput[] = [
  // BASIC
  {
    label: 'task.form.name.label',
    name: 'name',
    type: 'text',
    withAsterisk: true,
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
    maxLength: NAME_MAX_LENGTH,
    autoFocus: true,
  },
  {
    label: 'task.form.description.label',
    name: 'description',
    type: 'textarea',
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
    maxLength: DESCRIPTION_MAX_LENGTH,
  },
  {
    label: 'task.form.category.label',
    name: 'category',
    type: 'text',
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
  },
  {
    label: 'task.form.notes.label',
    name: 'notes',
    type: 'textarea',
    column: 1,
    group: 'basic',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
    maxLength: NOTES_MAX_LENGTH,
  },

  // SCHEDULE
  {
    label: 'task.form.startDate.label',
    name: 'startDate',
    type: 'date',
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[140px]',
    placeholder: 'task.form.startDate.placeholder',
  },
  {
    label: 'task.form.endDate.label',
    name: 'endDate',
    type: 'date',
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[140px]',
    placeholder: 'task.form.endDate.placeholder',
  },
  {
    label: 'task.form.progress.label',
    name: 'progress',
    type: 'number',
    column: 1,
    group: 'schedule',
    inputWidth: 'wms-w-[100px]',
    labelWidth: 'wms-w-[140px]',
    min: 0,
    max: 100,
  },

  // PEOPLE
  {
    label: 'task.form.assignee.label',
    name: 'assignee',
    type: 'text',
    column: 1,
    group: 'people',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
  },
  {
    label: 'task.form.manager.label',
    name: 'manager',
    type: 'text',
    column: 1,
    group: 'people',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
  },

  // EXTRA
  {
    label: 'task.form.status.label',
    name: 'status',
    type: 'select',
    withAsterisk: true,
    column: 1,
    group: 'extra',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[140px]',
  },
  {
    label: 'task.form.priority.label',
    name: 'priority',
    type: 'select',
    withAsterisk: true,
    column: 1,
    group: 'extra',
    inputWidth: 'wms-w-[180px]',
    labelWidth: 'wms-w-[140px]',
  },
  {
    label: 'task.form.externalId.label',
    name: 'externalId',
    type: 'text',
    column: 1,
    group: 'extra',
    inputWidth: 'wms-w-full',
    labelWidth: 'wms-w-[140px]',
  },
];

taskSchemaInputs.forEach(field => {
  const group = taskGroups.find(g => g.name === field.group);
  const col = group?.col;
  if (!col) return;
  const exists = col.find(i => i.col === field.column);
  if (exists) exists.field.push(field);
  else col.push({col: field.column || 0, field: [field]});
});

const taskGroupSchema = taskGroups
  .filter(g => g.col?.length > 0)
  .map(g => ({...g, col: [...g.col].sort((a, b) => a.col - b.col)}));

export {taskGroups, taskGroupSchema, taskSchemaInputs};
