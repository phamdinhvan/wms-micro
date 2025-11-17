import {ExternalFieldConfig, ExternalFieldsConfig, LocalizableText, MultilingualText} from '../types';
import {TFormInput} from '../types/input';

/**
 * Get localized text based on current language
 */
export const getLocalizedText = (
  text: LocalizableText | undefined,
  language: 'en' | 'ja' | 'vi' = 'en',
): string | undefined => {
  if (!text) return undefined;
  
  // If it's a string, return as-is
  if (typeof text === 'string') return text;
  
  // If it's a multilingual object, return the appropriate language
  return (text as MultilingualText)[language] || text.en;
};

/**
 * Map ExternalFieldConfig type to TFormInput type
 */
const mapFieldType = (
  type: ExternalFieldConfig['type'],
): TFormInput['type'] => {
  const typeMapping: Record<string, TFormInput['type']> = {
    text: 'text',
    textarea: 'textarea',
    number: 'number',
    date: 'date',
    datetime: 'datetime',
    boolean: 'checkbox',
    select: 'select',
    multiselect: 'multiselect',
    radio: 'radio',
  };

  return typeMapping[type] || 'text';
};

/**
 * Convert ExternalFieldConfig to TFormInput format
 * Note: Label/placeholder will be raw (string or multilingual object)
 * The translation will be handled by renderInput using getLocalizedText
 */
export const convertExternalFieldToFormInput = (
  fieldConfig: ExternalFieldConfig,
  language: 'en' | 'ja' | 'vi' = 'en',
): TFormInput => {
  return {
    // Use raw label (can be string or multilingual object)
    // renderInput will handle translation via getLocalizedText
    label: getLocalizedText(fieldConfig.name, language) || fieldConfig.name as string,
    name: `externalFields.${fieldConfig.key}`,
    type: mapFieldType(fieldConfig.type),
    placeholder: getLocalizedText(fieldConfig.placeholder, language),
    withAsterisk: fieldConfig.validation?.required,
    disabled: fieldConfig.disabled,
    group: fieldConfig.group || 'external',
    column: fieldConfig.column || 1,
    
    // Layout config
    labelWidth: fieldConfig.labelWidth || 'wms-w-[140px]',
    inputWidth: fieldConfig.inputWidth || 'wms-w-full',
    
    options: fieldConfig.options?.map(opt => ({
      label: getLocalizedText(opt.label, language) || opt.label as string,
      value: String(opt.value),
    })),
    min: fieldConfig.validation?.min,
    max: fieldConfig.validation?.max,
    maxLength: fieldConfig.validation?.maxLength,
    // Additional metadata for validation
    viewClient: !fieldConfig.hidden,
  };
};

/**
 * Convert entire ExternalFieldsConfig to array of TFormInput
 */
export const convertExternalFieldsConfigToFormInputs = (
  config: ExternalFieldsConfig,
  language: 'en' | 'ja' | 'vi' = 'en',
): TFormInput[] => {
  return Object.values(config)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(field => convertExternalFieldToFormInput(field, language));
};

/**
 * Get validation rules for external field
 */
export const getExternalFieldValidationRules = (
  fieldConfig: ExternalFieldConfig,
) => {
  const {validation} = fieldConfig;
  const rules: Record<string, unknown> = {};

  if (validation?.required) {
    rules.required = 'This field is required';
  }
  if (validation?.minLength) {
    rules.minLength = {
      value: validation.minLength,
      message: `Minimum length is ${validation.minLength}`,
    };
  }
  if (validation?.maxLength) {
    rules.maxLength = {
      value: validation.maxLength,
      message: `Maximum length is ${validation.maxLength}`,
    };
  }
  if (validation?.min !== undefined) {
    rules.min = {
      value: validation.min,
      message: `Minimum value is ${validation.min}`,
    };
  }
  if (validation?.max !== undefined) {
    rules.max = {
      value: validation.max,
      message: `Maximum value is ${validation.max}`,
    };
  }
  if (validation?.pattern) {
    rules.pattern = {
      value: validation.pattern,
      message: 'Invalid format',
    };
  }

  return rules;
};
