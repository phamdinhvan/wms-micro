/**
 * Enhanced External Fields Renderer with API Integration
 * Supports dynamic options, field dependencies, and complex workflows
 */

'use client';

import {Stack, Text} from '@mantine/core';
import {useEffect, useMemo} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {useFieldDependencies} from '../../hooks/useFieldDependencies';
import {useTranslation} from '../../i18n';
import {useExternalFieldsAPI} from '../../providers/ExternalFieldsAPIProvider';
import {
  EnhancedExternalFieldConfig,
  ExternalFieldsData,
} from '../../types/externalFieldsAPI';
import {convertExternalFieldToFormInput} from '../../utils/externalFieldsUtils';
import {renderInput} from '../input/renderInput';

type Props = {
  fields: Record<string, EnhancedExternalFieldConfig>;
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
  groupBy?: string; // Render only fields from specific group
  language?: 'en' | 'ja' | 'vi';
};

export function EnhancedExternalFieldsRenderer({
  fields,
  form,
  groupBy,
  language,
}: Props) {
  const {t} = useTranslation('gantt');
  const {runtimeState, fetchFieldData} = useExternalFieldsAPI();

  // Get current language from i18n if not provided
  const currentLanguage =
    language || (t('language') as 'en' | 'ja' | 'vi') || 'en';

  // Collect all dependencies
  const allDependencies = useMemo(() => {
    const deps = Object.values(fields).flatMap(
      field => field.dependencies || [],
    );

    return deps;
  }, [fields]);

  // Use dependency hook
  useFieldDependencies({dependencies: allDependencies, form});

  // Fields to render (sorted and filtered)
  const fieldsToRender = useMemo(() => {
    let sorted = Object.values(fields)
      .filter(field => !field.hidden)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (groupBy) {
      sorted = sorted.filter(field => field.group === groupBy);
    }

    return sorted;
  }, [fields, groupBy]);

  // Fetch initial data for fields with dataConfig
  useEffect(() => {
    fieldsToRender.forEach(field => {
      // Check if field has dataConfig and hasn't been fetched yet
      const currentState = runtimeState[field.key];
      const hasOptions =
        currentState?.options && currentState.options.length > 0;
      const isLoading = currentState?.loading;

      if (field.dataConfig && !hasOptions && !isLoading) {
        fetchFieldData(field.key, field.dataConfig, undefined);
      } else if (field.dataConfig) {
      }
    });
    // CRITICAL: Remove runtimeState from dependencies to prevent infinite loop
    // We read it inside the effect but don't depend on it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsToRender, fetchFieldData]);

  const renderField = (fieldConfig: EnhancedExternalFieldConfig) => {
    const runtimeOptions = runtimeState[fieldConfig.key]?.options;
    const isLoading = runtimeState[fieldConfig.key]?.loading || false;
    const error = runtimeState[fieldConfig.key]?.error;

    // Use runtime options if available, otherwise use static options
    const options = runtimeOptions || fieldConfig.options;

    // Convert to form input format
    const formInput = convertExternalFieldToFormInput(
      {
        key: fieldConfig.key,
        name: fieldConfig.name,
        type: fieldConfig.type,
        order: fieldConfig.order,
        group: fieldConfig.group,
        column: fieldConfig.column,
        placeholder: fieldConfig.placeholder,
        description: fieldConfig.helpText,
        validation: fieldConfig.validation,
        options,
        disabled: fieldConfig.disabled || isLoading,
        hidden: fieldConfig.hidden,
        labelWidth: fieldConfig.labelWidth,
        inputWidth: fieldConfig.inputWidth,
      },
      currentLanguage,
    );

    return (
      <div key={fieldConfig.key}>
        {renderInput(formInput, form)}
        {error && (
          <Text size="xs" c="red" mt={4}>
            {error}
          </Text>
        )}
      </div>
    );
  };

  /**
   * Render fields with pairing rule:
   * - Column 2 fields with consecutive orders (+1) pair on same line (2 fields max)
   * - Column 1 fields always stand alone
   * - Different columns never pair
   */
  const renderFields = () => {
    const rows: Array<{
      col1?: EnhancedExternalFieldConfig;
      col2?: EnhancedExternalFieldConfig;
    }> = [];
    const processedIndices = new Set<number>();

    fieldsToRender.forEach((field, index) => {
      // Skip if already processed
      if (processedIndices.has(index)) {
        return;
      }

      const currentOrder = field.order || 0;
      const currentColumn = field.column || 1;

      if (currentColumn === 1) {
        // Column 1 always stands alone
        rows.push({col1: field});
        processedIndices.add(index);
      } else {
        // Column 2 - check if next field is also col2 with order + 1
        const nextIndex = fieldsToRender.findIndex(
          (f, i) =>
            i > index &&
            (f.order || 0) === currentOrder + 1 &&
            (f.column || 1) === 2,
        );

        if (nextIndex !== -1) {
          // Pair with next col2 field
          rows.push({
            col1: field,
            col2: fieldsToRender[nextIndex],
          });
          processedIndices.add(index);
          processedIndices.add(nextIndex);
        } else {
          // Stand alone
          rows.push({col2: field});
          processedIndices.add(index);
        }
      }
    });

    return (
      <Stack gap="sm">
        {rows.map((row, rowIndex) => {
          if (row.col1 && row.col2) {
            return (
              <div key={`row-${rowIndex}`} className="wms-flex wms-gap-4">
                <div className="wms-flex-1">{renderField(row.col1)}</div>
                <div className="wms-flex-1">{renderField(row.col2)}</div>
              </div>
            );
          }

          if (row.col1) {
            return <div key={`row-${rowIndex}`}>{renderField(row.col1)}</div>;
          }

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
