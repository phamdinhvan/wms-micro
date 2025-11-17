/**
 * External Fields System Types
 * Hệ thống cho phép define dynamic fields cho Task/Project
 */

// Các loại field được hỗ trợ
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox';

// Nested object value - để lưu complex data từ API (vd: task master với equipment nested)
export type NestedFieldValue = {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | NestedFieldValue;
};

// Giá trị của field có thể là các type sau
export type FieldValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | NestedFieldValue // Support nested objects
  | NestedFieldValue[] // Support array of nested objects (multiple selections)
  | null
  | undefined;

// Object chứa tất cả external fields data (key-value)
export type ExternalFieldsData = Record<string, FieldValue>;

// Validation rules cho field
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: FieldValue, allValues: ExternalFieldsData) => string | true;
};

// Multilingual text support
export type MultilingualText = {
  en: string;
  ja: string;
  vi: string;
};

// Text có thể là string hoặc multilingual object
export type LocalizableText = string | MultilingualText;

// Option cho select/multiselect/radio/checkbox
export type SelectOption = {
  label: LocalizableText;
  value: string | number;
  disabled?: boolean;
};

// Dependency giữa các fields
export type FieldDependency = {
  sourceField: string; // Field trigger
  targetField: string; // Field bị ảnh hưởng
  onChange: (
    sourceValue: FieldValue,
    targetCurrentValue: FieldValue,
    allValues: ExternalFieldsData,
  ) => FieldValue;
};

// Config cho 1 field
export type ExternalFieldConfig = {
  key: string; // Key để lưu trong externalFields object
  name: LocalizableText; // Label hiển thị (support multilingual)
  type: FieldType;
  description?: LocalizableText;
  placeholder?: LocalizableText;
  defaultValue?: FieldValue;
  validation?: ValidationRule;
  options?: SelectOption[]; // For select, multiselect, radio, checkbox
  disabled?: boolean;
  hidden?: boolean;

  // Layout control (similar to taskSchemaInputs)
  group?: string; // Nhóm field lại (vd: "basic", "advanced")
  column?: number; // Column number (1 or 2) - để 2 field cùng hàng
  order?: number; // Thứ tự hiển thị trong group
  labelWidth?: string; // Tailwind class (vd: 'wms-w-[140px]')
  inputWidth?: string; // Tailwind class (vd: 'wms-w-full', 'wms-w-[180px]')

  // Legacy width support
  width?: 'full' | 'half' | 'third'; // Deprecated - use column instead

  dependencies?: FieldDependency[];
};

// Config cho tất cả fields (key là field key)
export type ExternalFieldsConfig = {
  [key: string]: ExternalFieldConfig;
};

// Dynamic options map - để truyền options từ API vào external fields
export type DynamicOptionsMap = Record<string, SelectOption[]>;

// Callback khi external field thay đổi - để parent component handle refetch API
export type FieldChangeHandler = (
  fieldKey: string,
  newValue: FieldValue,
  allValues: ExternalFieldsData,
) => void;
