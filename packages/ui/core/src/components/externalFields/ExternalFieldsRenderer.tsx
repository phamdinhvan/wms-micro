'use client';

import {Stack} from '@mantine/core';
import {useEffect} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {useTranslation} from '../../i18n';
import {
  DynamicOptionsMap,
  ExternalFieldConfig,
  ExternalFieldsConfig,
  ExternalFieldsData,
  FieldChangeHandler,
  FieldValue,
} from '../../types';
import {convertExternalFieldToFormInput} from '../../utils/externalFieldsUtils';
import {renderInput} from '../input/renderInput';

type ExternalFieldsRendererProps = {
  config: ExternalFieldsConfig;
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
  groupBy?: string; // Filter by group
  dynamicOptions?: DynamicOptionsMap; // Options từ API (runtime)
  onFieldChange?: FieldChangeHandler; // Callback khi field thay đổi
  sourceDataMap?: Record<string, Record<string, any>>; // Map để extract nested data
};

/**
 * Component render động các external fields dựa trên config
 */
export function ExternalFieldsRenderer({
  config,
  form,
  groupBy,
  dynamicOptions,
  onFieldChange,
  sourceDataMap,
}: ExternalFieldsRendererProps): JSX.Element {
  const {t} = useTranslation('gantt');

  // Get current language from i18n
  const currentLanguage = (t('language') as 'en' | 'ja' | 'vi') || 'en';

  // Sắp xếp fields theo order
  const sortedFields = Object.values(config).sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  // Filter by group nếu có
  const fieldsToRender = groupBy
    ? sortedFields.filter(field => field.group === groupBy)
    : sortedFields;

  // Handle dependencies and notify parent on changes
  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (!name || !name.startsWith('externalFields.')) return;

      const changedFieldKey = name.replace('externalFields.', '');
      const changedFieldConfig = config[changedFieldKey];
      const changedValue = value.externalFields?.[changedFieldKey];

      // Notify parent component về field change (để fetch API nếu cần)
      if (onFieldChange) {
        onFieldChange(
          changedFieldKey,
          changedValue as FieldValue,
          value.externalFields || {},
        );
      }

      if (!changedFieldConfig?.dependencies) return;

      // Process each dependency
      changedFieldConfig.dependencies.forEach(dep => {
        if (dep.sourceField === changedFieldKey) {
          const sourceValue = value.externalFields?.[changedFieldKey];
          const targetValue = value.externalFields?.[dep.targetField];
          const newValue = dep.onChange(
            sourceValue as FieldValue,
            targetValue as FieldValue,
            value.externalFields || {},
          );

          form.setValue(`externalFields.${dep.targetField}`, newValue);
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [config, form, onFieldChange]);

  const renderField = (fieldConfig: ExternalFieldConfig) => {
    if (fieldConfig.hidden) return null;

    // Convert external field config to TFormInput format with current language
    let formInput = convertExternalFieldToFormInput(
      fieldConfig,
      currentLanguage,
    );

    // Override with dynamic options nếu có (từ API)
    if (dynamicOptions && dynamicOptions[fieldConfig.key]) {
      // Convert SelectOption[] sang TFormInput options format
      const convertedOptions = dynamicOptions[fieldConfig.key].map(opt => ({
        label:
          typeof opt.label === 'string'
            ? opt.label
            : opt.label[currentLanguage] || opt.label.en,
        value: String(opt.value),
      }));

      formInput = {
        ...formInput,
        options: convertedOptions,
      };
    }

    // Render using unified renderInput (renderInput handles its own validation via yup schema)
    return renderInput(formInput, form as UseFormReturn<any>);
  };

  // Group fields by column for layout (similar to TaskFormModal)
  const renderFields = () => {
    // Group by column
    const column1Fields: ExternalFieldConfig[] = [];
    const column2Fields: ExternalFieldConfig[] = [];

    fieldsToRender.forEach(field => {
      if (field.column === 2) {
        column2Fields.push(field);
      } else {
        column1Fields.push(field);
      }
    });

    // Find pairs (fields that should be on same row)
    const rows: Array<{
      col1?: ExternalFieldConfig;
      col2?: ExternalFieldConfig;
    }> = [];
    const maxLength = Math.max(column1Fields.length, column2Fields.length);

    for (let i = 0; i < maxLength; i++) {
      rows.push({
        col1: column1Fields[i],
        col2: column2Fields[i],
      });
    }

    return (
      <Stack gap="sm">
        {rows.map((row, rowIndex) => {
          // If both columns exist, render side by side
          if (row.col1 && row.col2) {
            return (
              <div key={`row-${rowIndex}`} className="wms-flex wms-gap-4">
                <div className="wms-flex-1">{renderField(row.col1)}</div>
                <div className="wms-flex-1">{renderField(row.col2)}</div>
              </div>
            );
          }

          // If only column 1, render full width
          if (row.col1) {
            return <div key={`row-${rowIndex}`}>{renderField(row.col1)}</div>;
          }

          // If only column 2, render full width
          if (row.col2) {
            return <div key={`row-${rowIndex}`}>{renderField(row.col2)}</div>;
          }

          return null;
        })}
      </Stack>
    );
  };

  return <>{renderFields()}</>;
}
