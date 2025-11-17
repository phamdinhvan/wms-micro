/**
 * Hook for managing External Field Dependencies
 * Handles extract, filter, fetch, transform, and custom dependency types
 */

import {useCallback, useEffect, useRef} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {
  DependencyHelpers,
  ExternalFieldsData,
  FieldDependency,
  FieldValue,
  SelectOption,
} from '../types/externalFieldsAPI';
import {useExternalFieldsAPI} from '../providers/ExternalFieldsAPIProvider';

interface UseFieldDependenciesProps {
  dependencies: FieldDependency[];
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
}

/**
 * Utility: Get nested value from object by path
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

export function useFieldDependencies({dependencies, form}: UseFieldDependenciesProps) {
  const {sourceDataMap, fetchFieldData, updateRuntimeState} = useExternalFieldsAPI();

  // Track processing dependencies to avoid circular loops
  const processingRef = useRef<Set<string>>(new Set());

  /**
   * Create helper functions for dependency handlers
   */
  const createHelpers = useCallback((): DependencyHelpers => {
    return {
      getValue: (fieldKey: string) => {
        return form.getValues(`externalFields.${fieldKey}` as any);
      },

      setValue: (fieldKey: string, value: FieldValue) => {
        form.setValue(`externalFields.${fieldKey}` as any, value);
      },

      getOptions: (fieldKey: string) => {
        // Options are managed in runtime state
        return undefined;
      },

      setOptions: (fieldKey: string, options: SelectOption[]) => {
        updateRuntimeState(fieldKey, {options});
      },

      setLoading: (fieldKey: string, loading: boolean) => {
        updateRuntimeState(fieldKey, {loading});
      },

      setError: (fieldKey: string, error: string | undefined) => {
        updateRuntimeState(fieldKey, {error});
      },

      getSourceData: (dataKey: string, id: string) => {
        return sourceDataMap[dataKey]?.[id];
      },
    };
  }, [form, sourceDataMap, updateRuntimeState]);

  /**
   * Process a single dependency
   */
  const processDependency = useCallback(
    async (
      dependency: FieldDependency,
      sourceValue: FieldValue,
      allValues: ExternalFieldsData,
    ) => {
      const {sourceField, targetField, type, config, clearOnChange} = dependency;

      // Avoid circular dependencies
      const depKey = `${sourceField}->${targetField}`;
      if (processingRef.current.has(depKey)) {
        console.log(`[Dependency] ⚠️  Circular dependency detected: ${depKey}`);
        return;
      }

      processingRef.current.add(depKey);

      try {
        const helpers = createHelpers();

        console.log(`[Dependency] 🔄 Processing ${type} dependency: ${depKey}`, {
          sourceValue,
        });

        // Clear target if configured
        if (clearOnChange) {
          helpers.setValue(targetField, '');
          console.log(`[Dependency] 🧹 Cleared ${targetField}`);
        }

        // Check if source value is required but empty
        if (dependency.required && !sourceValue) {
          helpers.setValue(targetField, '');
          helpers.setOptions(targetField, []);
          console.log(`[Dependency] ⏭️  Skipped (required source empty): ${depKey}`);
          return;
        }

        // Process based on dependency type
        switch (type) {
          case 'extract': {
            if (!config?.sourcePath || !config?.sourceDataKey) {
              console.warn(`[Dependency] ⚠️  Missing sourcePath or sourceDataKey for ${depKey}`);
              break;
            }

            const sourceId = String(sourceValue);
            const sourceData = sourceDataMap[config.sourceDataKey]?.[sourceId];

            if (sourceData) {
              const extractedValue = getNestedValue(sourceData, config.sourcePath);
              if (extractedValue !== undefined) {
                helpers.setValue(targetField, extractedValue);
                console.log(`[Dependency] ✅ Extracted value for ${targetField}:`, extractedValue);
              }
            } else {
              console.warn(
                `[Dependency] ⚠️  No source data found for ${config.sourceDataKey}[${sourceId}]`,
              );
            }
            break;
          }

          case 'fetch': {
            if (!config?.dataConfig) {
              console.warn(`[Dependency] ⚠️  Missing dataConfig for ${depKey}`);
              break;
            }

            // Fetch options with source value as parameter
            const options = await fetchFieldData(
              targetField,
              config.dataConfig,
              sourceValue,
            );

            helpers.setOptions(targetField, options);
            console.log(`[Dependency] ✅ Fetched ${options.length} options for ${targetField}`);
            break;
          }

          case 'transform': {
            if (!config?.transform) {
              console.warn(`[Dependency] ⚠️  Missing transform function for ${depKey}`);
              break;
            }

            const transformedValue = config.transform(sourceValue, allValues);
            helpers.setValue(targetField, transformedValue);
            console.log(`[Dependency] ✅ Transformed value for ${targetField}:`, transformedValue);
            break;
          }

          case 'custom': {
            if (!config?.handler) {
              console.warn(`[Dependency] ⚠️  Missing handler function for ${depKey}`);
              break;
            }

            await config.handler(sourceValue, allValues, helpers);
            console.log(`[Dependency] ✅ Custom handler executed for ${depKey}`);
            break;
          }

          case 'filter': {
            console.warn(`[Dependency] ⚠️  'filter' type not yet implemented for ${depKey}`);
            break;
          }
        }
      } catch (error) {
        console.error(`[Dependency] ❌ Error processing ${depKey}:`, error);
      } finally {
        processingRef.current.delete(depKey);
      }
    },
    [createHelpers, sourceDataMap, fetchFieldData],
  );

  /**
   * Watch for field changes and trigger dependencies
   */
  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (!name || !name.startsWith('externalFields.')) return;

      const changedFieldKey = name.replace('externalFields.', '');
      const changedValue = value.externalFields?.[changedFieldKey];

      console.log(`[Dependency] 👁️  Field changed: ${changedFieldKey}`, {value: changedValue});

      // Find dependencies where this field is the source
      const relevantDeps = dependencies.filter((dep) => dep.sourceField === changedFieldKey);

      if (relevantDeps.length > 0) {
        console.log(
          `[Dependency] 🔗 Found ${relevantDeps.length} dependencies for ${changedFieldKey}`,
        );

        // Process each dependency
        relevantDeps.forEach((dep) => {
          processDependency(dep, changedValue, value.externalFields || {});
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [dependencies, form, processDependency]);

  /**
   * Initialize dependencies on mount
   */
  useEffect(() => {
    const allValues = form.getValues('externalFields') || {};

    console.log('[Dependency] 🚀 Initializing dependencies on mount');

    // Process all dependencies with current values
    dependencies.forEach((dep) => {
      const sourceValue = allValues[dep.sourceField];
      if (sourceValue) {
        console.log(`[Dependency] 🔄 Processing initial dependency: ${dep.sourceField} -> ${dep.targetField}`);
        processDependency(dep, sourceValue, allValues);
      }
    });
  }, []); // Only run on mount

  return {
    processDependency,
  };
}
