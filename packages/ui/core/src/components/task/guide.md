/**
 * Enhanced External Fields Types with API Integration
 * Supports dynamic data fetching, field dependencies, and complex workflows
 */

import {FieldValue, SelectOption, ExternalFieldsData} from './base-types';

// ============================================================================
// API Integration Types
// ============================================================================



// ============================================================================
// Field Dependency Types
// ============================================================================

/**
 * Field dependency configuration
 * When source field changes, trigger action on target field
 */
export interface FieldDependency {
  /** Source field key to watch */
  sourceField: string;
  
  /** Target field key to update */
  targetField: string;
  
  /** Dependency type */
  type: 'extract' | 'filter' | 'fetch' | 'transform' | 'custom';
  

  
  /** Whether to clear target field when source changes */
  clearOnChange?: boolean;
  
  /** Whether dependency is required (source must have value) */
  required?: boolean;
}



// ============================================================================
// Field Group Types (Field Clusters)
// ============================================================================

/**
 * Field Group/Cluster configuration
 * Groups related fields with shared logic
 */
export interface ExternalFieldGroup {
  /** Unique group identifier */
  id: string;
  
  /** Group display name */
  name: string;
  
  /** Fields in this group */
  fields: string[];
  
  /** Dependencies within this group */
  dependencies?: FieldDependency[];
  
  /** Shared API configurations for the group */
  apis?: Record<string, FieldAPIConfig>;
  
  /** Group-level data source map */
  sourceDataMap?: Record<string, Record<string, any>>;
  
  /** Lifecycle hooks */
  hooks?: {
    /** Called when group is initialized */
    onInit?: (helpers: DependencyHelpers) => Promise<void> | void;
    
    /** Called when any field in group changes */
    onChange?: (
      changedField: string,
      value: FieldValue,
      allValues: ExternalFieldsData,
      helpers: DependencyHelpers
    ) => Promise<void> | void;
    
    /** Called when group is destroyed */
    onDestroy?: () => void;
  };
  
  /** Whether this group can be duplicated (for multiple instances) */
  repeatable?: boolean;
  
  /** Maximum number of instances if repeatable */
  maxInstances?: number;
}

// ============================================================================
// Enhanced Field Config
// ============================================================================

/**
 * Enhanced External Field Configuration with API support
 */
export interface EnhancedExternalFieldConfig {
  key: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'datetime' | 'textarea' | 'checkbox' | 'radio';
  
  // Basic config
  order?: number;
  group?: string;
  column?: 1 | 2;
  hidden?: boolean;
  disabled?: boolean;
  

  
  // Dependencies on other fields
  dependencies?: FieldDependency[];
  
  // Validation
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: FieldValue, allValues: ExternalFieldsData) => string | undefined;
  };
  
  // UI customization
  placeholder?: string;
  helpText?: string;
  labelWidth?: string;
  inputWidth?: string;
  
  // Field-specific callbacks
  onValueChange?: (
    value: FieldValue,
    allValues: ExternalFieldsData,
    helpers: DependencyHelpers
  ) => Promise<void> | void;
  
  // Default value or value resolver
  defaultValue?: FieldValue | ((allValues: ExternalFieldsData) => FieldValue);
}

// ============================================================================
// Complete Configuration
// ============================================================================



// ============================================================================
// Runtime State Types
// ============================================================================

/**
 * Runtime state for managing dynamic options and loading
 */
export interface FieldRuntimeState {
  options?: SelectOption[];
  loading?: boolean;
  error?: string;
  lastFetched?: number;
}

export type FieldsRuntimeState = Record<string, FieldRuntimeState>;



/**
   * Update runtime state for a field
   */
  const updateRuntimeState = useCallback(
    (fieldKey: string, state: Partial<FieldsRuntimeState[string]>) => {
      setRuntimeState(prev => ({
        ...prev,
        [fieldKey]: {...prev[fieldKey], ...state},
      }));
    },
    []
  );


  /**
 * Hook for managing External Field Dependencies
 * Handles extract, filter, fetch, transform, and custom dependency types
 */



interface UseFieldDependenciesProps {
  dependencies: FieldDependency[];
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
}



  /**
   * Process a single dependency
   */
  const processDependency = useCallback(
    async (
      dependency: FieldDependency,
      sourceValue: FieldValue,
      allValues: ExternalFieldsData
    ) => {
      const {sourceField, targetField, type, config, clearOnChange} = dependency;

      // Avoid circular dependencies
      const depKey = `${sourceField}->${targetField}`;
      if (processingRef.current.has(depKey)) {
        return;
      }

      processingRef.current.add(depKey);

      try {
        const helpers = createHelpers();

        // Clear target if configured
        if (clearOnChange && sourceValue !== helpers.getValue(targetField)) {
          helpers.setValue(targetField, '');
        }

        // Check if source value is required but empty
        if (dependency.required && !sourceValue) {
          helpers.setValue(targetField, '');
          helpers.setOptions(targetField, []);
          return;
        }

        // Process based on dependency type
        switch (type) {
          case 'extract': {
            if (!config?.sourcePath || !sourceDataMap) break;

            const sourceId = String(sourceValue);
            const dataKey = config.sourceDataKey || sourceField;
            const sourceData = sourceDataMap[dataKey]?.[sourceId];

            if (sourceData) {
              const extractedValue = getNestedValue(sourceData, config.sourcePath);
              if (extractedValue !== undefined) {
                helpers.setValue(targetField, extractedValue);
              }
            }
            break;
          }

          case 'filter': {
            if (!config?.filterField) break;

            // Get all options for target field from runtime state or config
            const targetFieldConfig = form.getValues(`externalFields.${targetField}` as any);
            // You'll need to access field config to get all options
            // This assumes options are stored in runtime state
            
            // Filter options based on source value
            // Implementation depends on how you store all available options
            break;
          }



          case 'transform': {
            if (!config?.transform) break;

            const transformedValue = config.transform(sourceValue, allValues);
            helpers.setValue(targetField, transformedValue);
            break;
          }

          case 'custom': {
            if (!config?.handler) break;

            await config.handler(sourceValue, allValues, helpers);
            break;
          }
        }
      } catch (error) {
        console.error(`Error processing dependency ${depKey}:`, error);
      } finally {
        processingRef.current.delete(depKey);
      }
    },
    [createHelpers, sourceDataMap, fetchFieldOptions, form]
  );

  /**
   * Watch for field changes and trigger dependencies
   */
  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (!name || !name.startsWith('externalFields.')) return;

      const changedFieldKey = name.replace('externalFields.', '');
      const changedValue = value.externalFields?.[changedFieldKey];

      // Find dependencies where this field is the source
      const relevantDeps = dependencies.filter(
        dep => dep.sourceField === changedFieldKey
      );

      // Process each dependency
      relevantDeps.forEach(dep => {
        processDependency(dep, changedValue, value.externalFields || {});
      });
    });

    return () => subscription.unsubscribe();
  }, [dependencies, form, processDependency]);

  /**
   * Initialize dependencies on mount
   */
  useEffect(() => {
    const allValues = form.getValues('externalFields') || {};

    // Process all dependencies with current values
    dependencies.forEach(dep => {
      const sourceValue = allValues[dep.sourceField];
      if (sourceValue) {
        processDependency(dep, sourceValue, allValues);
      }
    });
  }, []); // Only run on mount

  return {
    processDependency,
  };
}


/**
 * Enhanced External Fields Renderer with API Integration
 * Supports dynamic options, field dependencies, and complex workflows
 */

'use client';

import {Stack} from '@mantine/core';
import {useEffect, useMemo} from 'react';
import {UseFormReturn} from 'react-hook-form';

import {useFieldDependencies} from './useFieldDependencies';
import {convertExternalFieldToFormInput} from './externalFieldsUtils';
import {renderInput} from './renderInput';

type EnhancedExternalFieldsRendererProps = {
  fields: Record<string, EnhancedExternalFieldConfig>;
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
  groupId?: string; // Render only fields from specific group
  language?: 'en' | 'ja' | 'vi';
};



  /**
   * Render a single field
   */
  const renderField = (fieldConfig: EnhancedExternalFieldConfig) => {
    // Convert to TFormInput format
    let formInput = convertExternalFieldToFormInput(fieldConfig, language);

    // Use runtime options if available (from API or dependencies)
    const runtimeOptions = runtimeState[fieldConfig.key]?.options;
    if (runtimeOptions) {
      formInput = {
        ...formInput,
        options: runtimeOptions.map(opt => ({
          label: typeof opt.label === 'string' ? opt.label : opt.label[language] || opt.label.en,
          value: String(opt.value),
        })),
      };
    }

    // Add loading state
    const isLoading = runtimeState[fieldConfig.key]?.loading || false;
    
    // Add error state
    const error = runtimeState[fieldConfig.key]?.error;

    return (
      <div key={fieldConfig.key}>
        {renderInput(formInput, form as UseFormReturn<any>)}
        {isLoading && (
          <div className="wms-text-xs wms-text-gray-500 wms-mt-1">
            Loading options...
          </div>
        )}
        {error && (
          <div className="wms-text-xs wms-text-red-500 wms-mt-1">
            {error}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render fields in columns (same layout as original)
   */
  const renderFields = () => {
    const column1Fields: EnhancedExternalFieldConfig[] = [];
    const column2Fields: EnhancedExternalFieldConfig[] = [];

    fieldsToRender.forEach(field => {
      if (field.column === 2) {
        column2Fields.push(field);
      } else {
        column1Fields.push(field);
      }
    });

    const rows: Array<{
      col1?: EnhancedExternalFieldConfig;
      col2?: EnhancedExternalFieldConfig;
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

/**
 * Hook for managing Field Groups (Field Clusters)
 * Handles group-level lifecycle, dependencies, and repeatable groups
 */

import {useState, useCallback, useEffect, useRef} from 'react';
import {UseFormReturn} from 'react-hook-form';


interface UseFieldGroupsProps {
  groups: ExternalFieldGroup[];
  form: UseFormReturn<{externalFields?: ExternalFieldsData}>;
}

interface GroupInstance {
  groupId: string;
  instanceId: string;
  fields: string[];
}



  /**
   * Initialize all groups
   */
  const initializeGroups = useCallback(async () => {
    if (initializedRef.current) return;
    
    for (const group of groups) {
      if (group.hooks?.onInit) {
        const helpers = createGroupHelpers(group);
        await group.hooks.onInit(helpers);
      }

      // Create initial instance for non-repeatable groups
      if (!group.repeatable) {
        setGroupInstances(prev => [
          ...prev,
          {
            groupId: group.id,
            instanceId: `${group.id}-0`,
            fields: group.fields,
          },
        ]);
      }
    }
    
    initializedRef.current = true;
  }, [groups, createGroupHelpers]);

  /**
   * Add a new instance of a repeatable group
   */
  const addGroupInstance = useCallback(
    (groupId: string) => {
      const group = groups.find(g => g.id === groupId);
      if (!group || !group.repeatable) {
        console.warn(`Group ${groupId} is not repeatable`);
        return;
      }

      const existingInstances = groupInstances.filter(
        i => i.groupId === groupId
      );

      if (group.maxInstances && existingInstances.length >= group.maxInstances) {
        console.warn(
          `Maximum instances (${group.maxInstances}) reached for group ${groupId}`
        );
        return;
      }

      const newInstanceId = `${groupId}-${Date.now()}`;
      const newFields = group.fields.map(
        field => `${field}_${newInstanceId}`
      );

      setGroupInstances(prev => [
        ...prev,
        {
          groupId,
          instanceId: newInstanceId,
          fields: newFields,
        },
      ]);
    },
    [groups, groupInstances]
  );

  /**
   * Remove an instance of a repeatable group
   */
  const removeGroupInstance = useCallback(
    (instanceId: string) => {
      const instance = groupInstances.find(i => i.instanceId === instanceId);
      if (!instance) return;

      // Clear field values
      instance.fields.forEach(fieldKey => {
        form.setValue(`externalFields.${fieldKey}` as any, undefined);
      });

      setGroupInstances(prev => prev.filter(i => i.instanceId !== instanceId));
    },
    [groupInstances, form]
  );

  /**
   * Watch for field changes and trigger group-level onChange
   */
  useEffect(() => {
    const subscription = form.watch((value, {name}) => {
      if (!name || !name.startsWith('externalFields.')) return;

      const changedFieldKey = name.replace('externalFields.', '');
      const changedValue = value.externalFields?.[changedFieldKey];

      // Find groups that contain this field
      groups.forEach(group => {
        if (group.fields.includes(changedFieldKey) && group.hooks?.onChange) {
          const helpers = createGroupHelpers(group);
          group.hooks.onChange(
            changedFieldKey,
            changedValue,
            value.externalFields || {},
            helpers
          );
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [groups, form, createGroupHelpers]);

  /**
   * Initialize groups on mount
   */
  useEffect(() => {
    initializeGroups();
  }, [initializeGroups]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      groups.forEach(group => {
        if (group.hooks?.onDestroy) {
          group.hooks.onDestroy();
        }
      });
    };
  }, [groups]);

  return {
    groupInstances,
    addGroupInstance,
    removeGroupInstance,
  };
}

/**
 * EXAMPLE: External Fields Configuration from Parent System
 * 
 * This demonstrates how to configure complex field workflows with:
 * - Task Master selection
 * - Auto-fill Equipment from Task Master
 * - Dynamic CO2 and Calendar options based on Equipment
 */

import {
  EnhancedExternalFieldsConfig,
  ExternalFieldsAPIClient,
  SelectOption,
} from './external-fields-api-types';

// ============================================================================
// 1. Define API Client (from parent system)
// ============================================================================

const myAPIClient: ExternalFieldsAPIClient = {
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Your actual API implementation
    const url = new URL(endpoint, 'https://api.yourcompany.com');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    const response = await fetch(url.toString());
    return response.json();
  },
  
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`https://api.yourcompany.com${endpoint}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ============================================================================
// 2. Define Task Master Field Group Configuration
// ============================================================================

export const taskMasterFieldGroupConfig: EnhancedExternalFieldsConfig = {
  apiClient: myAPIClient,
  
  // Individual field configurations
  fields: {
    // Field 1: Task Master (Select với data từ API)
    taskMaster: {
      key: 'taskMaster',
      name: {
        en: 'Task Master',
        ja: 'タスクマスター',
        vi: 'Nhiệm vụ chính',
      },
      type: 'select',
      order: 1,
      column: 1,
      
      // Fetch task masters from API
      api: {
        endpoint: '/api/task-masters',
        transform: (response) => {
          return response.data.map((tm: any) => ({
            label: tm.name,
            value: tm.id,
          }));
        },
        cacheDuration: 600000, // Cache for 10 minutes
      },
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select a task master',
        ja: 'タスクマスターを選択',
        vi: 'Chọn nhiệm vụ chính',
      },
    },

    // Field 2: Equipment (Auto-filled từ Task Master)
    equipment: {
      key: 'equipment',
      name: {
        en: 'Equipment',
        ja: '設備',
        vi: 'Thiết bị',
      },
      type: 'text',
      order: 2,
      column: 1,
      disabled: true, // Read-only, auto-filled
      
      // Dependency: Extract equipment name from selected task master
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'equipment',
          type: 'extract',
          config: {
            sourcePath: 'equipment.name',
            sourceDataKey: 'taskMasters',
          },
        },
      ],
    },

    // Field 3: Equipment ID (Hidden, used for subsequent lookups)
    equipmentId: {
      key: 'equipmentId',
      name: 'Equipment ID',
      type: 'text',
      order: 3,
      hidden: true, // Hidden from UI
      
      // Dependency: Extract equipment ID from selected task master
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'equipmentId',
          type: 'extract',
          config: {
            sourcePath: 'equipment.id',
            sourceDataKey: 'taskMasters',
          },
        },
      ],
    },

    // Field 4: CO2 (Dynamic options dựa theo Equipment ID)
    co2: {
      key: 'co2',
      name: {
        en: 'CO2 Level',
        ja: 'CO2レベル',
        vi: 'Mức CO2',
      },
      type: 'select',
      order: 4,
      column: 2,
      
      // Dependency: Fetch CO2 options when equipmentId changes
      dependencies: [
        {
          sourceField: 'equipmentId',
          targetField: 'co2',
          type: 'fetch',
          required: true, // equipmentId must be set first
          clearOnChange: true, // Clear previous selection
          config: {
            apiConfig: {
              endpoint: '/api/equipment/{equipmentId}/co2-levels',
              params: {}, // equipmentId will be injected
              transform: (response) => {
                return response.data.map((co2: any) => ({
                  label: `${co2.level} ppm - ${co2.description}`,
                  value: co2.id,
                }));
              },
            },
          },
        },
      ],
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select CO2 level',
        ja: 'CO2レベルを選択',
        vi: 'Chọn mức CO2',
      },
    },

    // Field 5: Calendar (Dynamic options dựa theo Equipment ID)
    calendar: {
      key: 'calendar',
      name: {
        en: 'Work Calendar',
        ja: 'カレンダー',
        vi: 'Lịch làm việc',
      },
      type: 'select',
      order: 5,
      column: 2,
      
      // Dependency: Fetch calendar options when equipmentId changes
      dependencies: [
        {
          sourceField: 'equipmentId',
          targetField: 'calendar',
          type: 'fetch',
          required: true,
          clearOnChange: true,
          config: {
            apiConfig: {
              endpoint: '/api/equipment/{equipmentId}/calendars',
              params: {},
              transform: (response) => {
                return response.data.map((cal: any) => ({
                  label: {
                    en: cal.name_en,
                    ja: cal.name_ja,
                    vi: cal.name_vi,
                  },
                  value: cal.id,
                }));
              },
            },
          },
        },
      ],
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select calendar',
        ja: 'カレンダーを選択',
        vi: 'Chọn lịch',
      },
    },
  },

  // Source data map (full objects keyed by ID)
  // This would be fetched/provided by parent system
  sourceDataMap: {
    taskMasters: {
      // Example: Task Master ID -> Full Object
      'tm-001': {
        id: 'tm-001',
        name: 'Assembly Line A',
        equipment: {
          id: 'eq-123',
          name: 'Robot Arm Alpha',
          type: 'robotic',
        },
      },
      'tm-002': {
        id: 'tm-002',
        name: 'Quality Check Station',
        equipment: {
          id: 'eq-456',
          name: 'Inspection Camera Beta',
          type: 'camera',
        },
      },
      // ... more task masters
    },
  },

  // Define field group
  groups: [
    {
      id: 'taskMasterGroup',
      name: 'Task Master Configuration',
      fields: ['taskMaster', 'equipment', 'equipmentId', 'co2', 'calendar'],
      
      // Group-level hooks
      hooks: {
        // Initialize: Pre-fetch task masters
        onInit: async (helpers) => {
          console.log('Initializing Task Master group...');
          
          // Could pre-fetch common data here
          // helpers.apiClient.get(...);
        },
        
        // Track changes for analytics
        onChange: (changedField, value, allValues, helpers) => {
          console.log(`Field ${changedField} changed to:`, value);
          
          // Could trigger analytics or side effects
          if (changedField === 'taskMaster') {
            // Track task master selection
            // analytics.track('task_master_selected', { taskMasterId: value });
          }
        },
      },
      
      // This group can be repeated (multiple task master configs per task)
      repeatable: true,
      maxInstances: 5,
    },
  ],

  // Global callbacks
  callbacks: {
    onFieldChange: (fieldKey, value, allValues) => {
      console.log('Global field change:', fieldKey, value);
    },
    
    onValidationError: (fieldKey, error) => {
      console.error('Validation error:', fieldKey, error);
    },
  },
};

// ============================================================================
// 3. ADVANCED EXAMPLE: Custom Dependency Handler
// ============================================================================

export const advancedTaskMasterConfig: EnhancedExternalFieldsConfig = {
  ...taskMasterFieldGroupConfig,
  
  fields: {
    ...taskMasterFieldGroupConfig.fields,
    
    // Add a custom calculated field
    estimatedDuration: {
      key: 'estimatedDuration',
      name: 'Estimated Duration',
      type: 'number',
      order: 6,
      column: 1,
      disabled: true,
      
      // Custom dependency: Calculate duration based on multiple factors
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'estimatedDuration',
          type: 'custom',
          config: {
            handler: async (sourceValue, allValues, helpers) => {
              if (!sourceValue) {
                helpers.setValue('estimatedDuration', 0);
                return;
              }
              
              // Fetch duration estimate from API
              try {
                helpers.setLoading('estimatedDuration', true);
                
                const result = await helpers.apiClient.post(
                  '/api/calculate-duration',
                  {
                    taskMasterId: sourceValue,
                    equipmentId: allValues.equipmentId,
                    co2Level: allValues.co2,
                  }
                );
                
                helpers.setValue('estimatedDuration', result.estimatedHours);
              } catch (error) {
                console.error('Failed to calculate duration:', error);
                helpers.setValue('estimatedDuration', 0);
              } finally {
                helpers.setLoading('estimatedDuration', false);
              }
            },
          },
        },
      ],
    },
  },
};

// ============================================================================
// 4. MULTIPLE FIELD GROUPS EXAMPLE
// ============================================================================

export const multipleGroupsConfig: EnhancedExternalFieldsConfig = {
  apiClient: myAPIClient,
  
  fields: {
    // Task Master Group fields
    ...taskMasterFieldGroupConfig.fields,
    
    // Material Group fields
    material: {
      key: 'material',
      name: 'Material Type',
      type: 'select',
      order: 10,
      group: 'materials',
      api: {
        endpoint: '/api/materials',
        transform: (r) => r.data.map((m: any) => ({label: m.name, value: m.id})),
      },
    },
    
    quantity: {
      key: 'quantity',
      name: 'Quantity',
      type: 'number',
      order: 11,
      group: 'materials',
      validation: {
        required: true,
        min: 1,
      },
    },
    
    // Quality Group fields
    qualityStandard: {
      key: 'qualityStandard',
      name: 'Quality Standard',
      type: 'select',
      order: 20,
      group: 'quality',
      options: [
        {label: 'ISO 9001', value: 'iso9001'},
        {label: 'ISO 14001', value: 'iso14001'},
        {label: 'Custom', value: 'custom'},
      ],
    },
  },
  
  groups: [
    {
      id: 'taskMasterGroup',
      name: 'Task Configuration',
      fields: ['taskMaster', 'equipment', 'equipmentId', 'co2', 'calendar'],
    },
    {
      id: 'materialsGroup',
      name: 'Materials',
      fields: ['material', 'quantity'],
      repeatable: true,
      maxInstances: 10,
    },
    {
      id: 'qualityGroup',
      name: 'Quality Control',
      fields: ['qualityStandard'],
    },
  ],
};




/**
 * EXAMPLE: External Fields Configuration from Parent System
 * 
 * This demonstrates how to configure complex field workflows with:
 * - Task Master selection
 * - Auto-fill Equipment from Task Master
 * - Dynamic CO2 and Calendar options based on Equipment
 */

import {
  EnhancedExternalFieldsConfig,
  ExternalFieldsAPIClient,
  SelectOption,
} from './external-fields-api-types';

// ============================================================================
// 1. Define API Client (from parent system)
// ============================================================================

const myAPIClient: ExternalFieldsAPIClient = {
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Your actual API implementation
    const url = new URL(endpoint, 'https://api.yourcompany.com');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    const response = await fetch(url.toString());
    return response.json();
  },
  
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`https://api.yourcompany.com${endpoint}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ============================================================================
// 2. Define Task Master Field Group Configuration
// ============================================================================

export const taskMasterFieldGroupConfig: EnhancedExternalFieldsConfig = {
  apiClient: myAPIClient,
  
  // Individual field configurations
  fields: {
    // Field 1: Task Master (Select với data từ API)
    taskMaster: {
      key: 'taskMaster',
      name: {
        en: 'Task Master',
        ja: 'タスクマスター',
        vi: 'Nhiệm vụ chính',
      },
      type: 'select',
      order: 1,
      column: 1,
      
      // Fetch task masters from API
      api: {
        endpoint: '/api/task-masters',
        transform: (response) => {
          return response.data.map((tm: any) => ({
            label: tm.name,
            value: tm.id,
          }));
        },
        cacheDuration: 600000, // Cache for 10 minutes
      },
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select a task master',
        ja: 'タスクマスターを選択',
        vi: 'Chọn nhiệm vụ chính',
      },
    },

    // Field 2: Equipment (Auto-filled từ Task Master)
    equipment: {
      key: 'equipment',
      name: {
        en: 'Equipment',
        ja: '設備',
        vi: 'Thiết bị',
      },
      type: 'text',
      order: 2,
      column: 1,
      disabled: true, // Read-only, auto-filled
      
      // Dependency: Extract equipment name from selected task master
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'equipment',
          type: 'extract',
          config: {
            sourcePath: 'equipment.name',
            sourceDataKey: 'taskMasters',
          },
        },
      ],
    },

    // Field 3: Equipment ID (Hidden, used for subsequent lookups)
    equipmentId: {
      key: 'equipmentId',
      name: 'Equipment ID',
      type: 'text',
      order: 3,
      hidden: true, // Hidden from UI
      
      // Dependency: Extract equipment ID from selected task master
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'equipmentId',
          type: 'extract',
          config: {
            sourcePath: 'equipment.id',
            sourceDataKey: 'taskMasters',
          },
        },
      ],
    },

    // Field 4: CO2 (Dynamic options dựa theo Equipment ID)
    co2: {
      key: 'co2',
      name: {
        en: 'CO2 Level',
        ja: 'CO2レベル',
        vi: 'Mức CO2',
      },
      type: 'select',
      order: 4,
      column: 2,
      
      // Dependency: Fetch CO2 options when equipmentId changes
      dependencies: [
        {
          sourceField: 'equipmentId',
          targetField: 'co2',
          type: 'fetch',
          required: true, // equipmentId must be set first
          clearOnChange: true, // Clear previous selection
          config: {
            apiConfig: {
              endpoint: '/api/equipment/{equipmentId}/co2-levels',
              params: {}, // equipmentId will be injected
              transform: (response) => {
                return response.data.map((co2: any) => ({
                  label: `${co2.level} ppm - ${co2.description}`,
                  value: co2.id,
                }));
              },
            },
          },
        },
      ],
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select CO2 level',
        ja: 'CO2レベルを選択',
        vi: 'Chọn mức CO2',
      },
    },

    // Field 5: Calendar (Dynamic options dựa theo Equipment ID)
    calendar: {
      key: 'calendar',
      name: {
        en: 'Work Calendar',
        ja: 'カレンダー',
        vi: 'Lịch làm việc',
      },
      type: 'select',
      order: 5,
      column: 2,
      
      // Dependency: Fetch calendar options when equipmentId changes
      dependencies: [
        {
          sourceField: 'equipmentId',
          targetField: 'calendar',
          type: 'fetch',
          required: true,
          clearOnChange: true,
          config: {
            apiConfig: {
              endpoint: '/api/equipment/{equipmentId}/calendars',
              params: {},
              transform: (response) => {
                return response.data.map((cal: any) => ({
                  label: {
                    en: cal.name_en,
                    ja: cal.name_ja,
                    vi: cal.name_vi,
                  },
                  value: cal.id,
                }));
              },
            },
          },
        },
      ],
      
      validation: {
        required: true,
      },
      
      placeholder: {
        en: 'Select calendar',
        ja: 'カレンダーを選択',
        vi: 'Chọn lịch',
      },
    },
  },

  // Source data map (full objects keyed by ID)
  // This would be fetched/provided by parent system
  sourceDataMap: {
    taskMasters: {
      // Example: Task Master ID -> Full Object
      'tm-001': {
        id: 'tm-001',
        name: 'Assembly Line A',
        equipment: {
          id: 'eq-123',
          name: 'Robot Arm Alpha',
          type: 'robotic',
        },
      },
      'tm-002': {
        id: 'tm-002',
        name: 'Quality Check Station',
        equipment: {
          id: 'eq-456',
          name: 'Inspection Camera Beta',
          type: 'camera',
        },
      },
      // ... more task masters
    },
  },

  // Define field group
  groups: [
    {
      id: 'taskMasterGroup',
      name: 'Task Master Configuration',
      fields: ['taskMaster', 'equipment', 'equipmentId', 'co2', 'calendar'],
      
      // Group-level hooks
      hooks: {
        // Initialize: Pre-fetch task masters
        onInit: async (helpers) => {
          console.log('Initializing Task Master group...');
          
          // Could pre-fetch common data here
          // helpers.apiClient.get(...);
        },
        
        // Track changes for analytics
        onChange: (changedField, value, allValues, helpers) => {
          console.log(`Field ${changedField} changed to:`, value);
          
          // Could trigger analytics or side effects
          if (changedField === 'taskMaster') {
            // Track task master selection
            // analytics.track('task_master_selected', { taskMasterId: value });
          }
        },
      },
      
      // This group can be repeated (multiple task master configs per task)
      repeatable: true,
      maxInstances: 5,
    },
  ],

  // Global callbacks
  callbacks: {
    onFieldChange: (fieldKey, value, allValues) => {
      console.log('Global field change:', fieldKey, value);
    },
    
    onValidationError: (fieldKey, error) => {
      console.error('Validation error:', fieldKey, error);
    },
  },
};

// ============================================================================
// 3. ADVANCED EXAMPLE: Custom Dependency Handler
// ============================================================================

export const advancedTaskMasterConfig: EnhancedExternalFieldsConfig = {
  ...taskMasterFieldGroupConfig,
  
  fields: {
    ...taskMasterFieldGroupConfig.fields,
    
    // Add a custom calculated field
    estimatedDuration: {
      key: 'estimatedDuration',
      name: 'Estimated Duration',
      type: 'number',
      order: 6,
      column: 1,
      disabled: true,
      
      // Custom dependency: Calculate duration based on multiple factors
      dependencies: [
        {
          sourceField: 'taskMaster',
          targetField: 'estimatedDuration',
          type: 'custom',
          config: {
            handler: async (sourceValue, allValues, helpers) => {
              if (!sourceValue) {
                helpers.setValue('estimatedDuration', 0);
                return;
              }
              
              // Fetch duration estimate from API
              try {
                helpers.setLoading('estimatedDuration', true);
                
                const result = await helpers.apiClient.post(
                  '/api/calculate-duration',
                  {
                    taskMasterId: sourceValue,
                    equipmentId: allValues.equipmentId,
                    co2Level: allValues.co2,
                  }
                );
                
                helpers.setValue('estimatedDuration', result.estimatedHours);
              } catch (error) {
                console.error('Failed to calculate duration:', error);
                helpers.setValue('estimatedDuration', 0);
              } finally {
                helpers.setLoading('estimatedDuration', false);
              }
            },
          },
        },
      ],
    },
  },
};

// ============================================================================
// 4. MULTIPLE FIELD GROUPS EXAMPLE
// ============================================================================

export const multipleGroupsConfig: EnhancedExternalFieldsConfig = {
  apiClient: myAPIClient,
  
  fields: {
    // Task Master Group fields
    ...taskMasterFieldGroupConfig.fields,
    
    // Material Group fields
    material: {
      key: 'material',
      name: 'Material Type',
      type: 'select',
      order: 10,
      group: 'materials',
      api: {
        endpoint: '/api/materials',
        transform: (r) => r.data.map((m: any) => ({label: m.name, value: m.id})),
      },
    },
    
    quantity: {
      key: 'quantity',
      name: 'Quantity',
      type: 'number',
      order: 11,
      group: 'materials',
      validation: {
        required: true,
        min: 1,
      },
    },
    
    // Quality Group fields
    qualityStandard: {
      key: 'qualityStandard',
      name: 'Quality Standard',
      type: 'select',
      order: 20,
      group: 'quality',
      options: [
        {label: 'ISO 9001', value: 'iso9001'},
        {label: 'ISO 14001', value: 'iso14001'},
        {label: 'Custom', value: 'custom'},
      ],
    },
  },
  
  groups: [
    {
      id: 'taskMasterGroup',
      name: 'Task Configuration',
      fields: ['taskMaster', 'equipment', 'equipmentId', 'co2', 'calendar'],
    },
    {
      id: 'materialsGroup',
      name: 'Materials',
      fields: ['material', 'quantity'],
      repeatable: true,
      maxInstances: 10,
    },
    {
      id: 'qualityGroup',
      name: 'Quality Control',
      fields: ['qualityStandard'],
    },
  ],
};



/**
 * Utility functions for External Field Dependencies
 */

/**
 * Get nested value từ object by path
 * Example: getNestedValue({a: {b: {c: 123}}}, 'a.b.c') => 123
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

/**
 * Set nested value in object by path (immutable)
 * Example: setNestedValue({a: {b: 1}}, 'a.b.c', 123) => {a: {b: {c: 123}}}
 */
export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  const result = {...obj};
  let current = result;
  
  for (const key of keys) {
    current[key] = {...(current[key] || {})};
    current = current[key];
  }
  
  current[lastKey] = value;
  return result;
}

/**
 * Replace template variables in string
 * Example: replaceTemplateVars('/api/equipment/{equipmentId}', {equipmentId: '123'})
 *          => '/api/equipment/123'
 */
export function replaceTemplateVars(
  template: string,
  vars: Record<string, any>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : match;
  });
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if value is empty (for validation)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Format API endpoint with params
 */
export function formatEndpoint(
  endpoint: string,
  params: Record<string, any>
): string {
  let formattedEndpoint = replaceTemplateVars(endpoint, params);
  
  // Add query string for remaining params
  const remainingParams = Object.entries(params).filter(
    ([key]) => !endpoint.includes(`{${key}}`)
  );
  
  if (remainingParams.length > 0) {
    const queryString = remainingParams
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    formattedEndpoint += `?${queryString}`;
  }
  
  return formattedEndpoint;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T = any>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


/**
 * UPDATED: Gantt Entry Point with External Fields API Support
 * Shows how parent system passes external fields configuration
 */

import {appConfig} from '@wms/core';
import {Gantt} from '@wms/gantt';
import {EnhancedExternalFieldsConfig} from './external-fields-api-types';
import {createApp, MountOptions} from './runtime/mount';

type MountGanttOptions = {
  lang?: string;
  theme?: any;
  appId?: string;
  code?: string;
  contextKey?: string;
  assignees?: any[];
  eventCallbacks?: any;
  bus?: any;
  
  // ✅ NEW: Enhanced external fields configuration with API support
  externalFieldsConfig?: EnhancedExternalFieldsConfig;
};

/**
 * Mount Gantt with External Fields API Support
 */
function mountGanttWithAPI(
  container: HTMLElement,
  opts?: MountGanttOptions
) {
  // Initialize appConfig
  if (opts?.appId || opts?.code) {
    appConfig.initialize({
      appId: opts?.appId,
      code: opts?.code,
      lang: opts?.lang,
    });
  }

  const app = createApp({
    ...(opts || {}),
    render: () => (
      <Gantt
        locale={opts?.lang as 'en' | 'vi' | 'ja'}
        contextKey={opts?.contextKey}
        assignees={opts?.assignees}
        eventCallbacks={opts?.eventCallbacks}
        bus={opts?.bus}
        externalFieldsConfig={opts?.externalFieldsConfig} // ✅ Pass to Gantt
      />
    ),
  });
  
  return app.mount(container);
}

// Update WmsUI export
export const WmsUI = {
  mountGantt: mountGanttWithAPI,
  // ... other mount functions
};

export {mountGanttWithAPI as mountGantt};
export default WmsUI;



/**
 * FINAL: Updated Gantt Component with External Fields API Support
 * This shows how to integrate the external fields system into your Gantt
 */

'use client';

import {useState} from 'react';
import {EnhancedExternalFieldsConfig} from './external-fields-api-types';
import {TaskFormModal} from './TaskFormModal-example';

interface GanttProps {
  locale?: 'en' | 'vi' | 'ja';
  contextKey?: string;
  assignees?: any[];
  eventCallbacks?: any;
  bus?: any;
  
  // ✅ NEW: External fields configuration with API support
  externalFieldsConfig?: EnhancedExternalFieldsConfig;
}

export function Gantt({
  locale = 'en',
  contextKey,
  assignees,
  eventCallbacks,
  bus,
  externalFieldsConfig, // ✅ Receive from parent
}: GanttProps) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData: any) => {
    console.log('Submitting task with external fields:', taskData);
    
    // Save task with externalFields included
    // await saveTask({
    //   ...taskData,
    //   externalFields: taskData.externalFields,
    // });
  };

  return (
    <div className="gantt-container">
      {/* Gantt Chart */}
      <div className="gantt-chart">
        {/* Your existing Gantt rendering */}
        <button onClick={() => handleTaskClick({id: '1', name: 'Task 1'})}>
          Open Task
        </button>
      </div>

      {/* Task Form Modal with External Fields */}
      {taskModalOpen && (
        <TaskFormModal
          opened={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          externalFieldsConfig={externalFieldsConfig} // ✅ Pass to modal
          initialData={selectedTask}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
}


// 1️⃣ Your API Layer (bên parent system)
class MyProductionAPI {
  async getTaskMasters() {
    return fetch('https://your-api.com/task-masters', {
      headers: {'Authorization': `Bearer ${this.token}`}
    }).then(r => r.json());
  }
  
  async getCO2Levels(equipmentId: string) {
    return fetch(`https://your-api.com/equipment/${equipmentId}/co2`, {
      headers: {'Authorization': `Bearer ${this.token}`}
    }).then(r => r.json());
  }
  
  async getCalendars(equipmentId: string) {
    return fetch(`https://your-api.com/equipment/${equipmentId}/calendars`, {
      headers: {'Authorization': `Bearer ${this.token}`}
    }).then(r => r.json());
  }
}

const myAPI = new MyProductionAPI();

// 2️⃣ Configure External Fields
const config: EnhancedExternalFieldsConfig = {
  fields: {
    // Task Master - fetch from YOUR API
    taskMaster: {
      key: 'taskMaster',
      name: 'Task Master',
      type: 'select',
      dataConfig: {
        renderData: async () => {
          const data = await myAPI.getTaskMasters();  // ✅ YOU call API
          return data.map(tm => ({
            label: `${tm.code} - ${tm.name}`,
            value: tm.id,
          }));
        },
      },
      validation: {required: true},
    },
    
    // Equipment - auto-filled from task master
    equipment: {
      key: 'equipment',
      name: 'Equipment',
      type: 'text',
      disabled: true,
      dependencies: [{
        sourceField: 'taskMaster',
        targetField: 'equipment',
        type: 'extract',
        config: {
          sourcePath: 'equipment.name',
          sourceDataKey: 'taskMasters',
        },
      }],
    },
    
    // Equipment ID - hidden field
    equipmentId: {
      key: 'equipmentId',
      name: 'Equipment ID',
      type: 'text',
      hidden: true,
      dependencies: [{
        sourceField: 'taskMaster',
        targetField: 'equipmentId',
        type: 'extract',
        config: {
          sourcePath: 'equipment.id',
          sourceDataKey: 'taskMasters',
        },
      }],
    },
    
    // CO2 - fetch from YOUR API based on equipmentId
    co2: {
      key: 'co2',
      name: 'CO2 Level',
      type: 'select',
      dependencies: [{
        sourceField: 'equipmentId',
        targetField: 'co2',
        type: 'fetch',
        required: true,
        clearOnChange: true,
        config: {
          dataConfig: {
            // ✅ Receives equipmentId as parameter
            renderData: async (equipmentId: string) => {
              const data = await myAPI.getCO2Levels(equipmentId);  // ✅ YOU call API
              return data.map(c => ({
                label: `${c.level} ppm`,
                value: c.id,
              }));
            },
          },
        },
      }],
      validation: {required: true},
    },
    
    // Calendar - fetch from YOUR API based on equipmentId
    calendar: {
      key: 'calendar',
      name: 'Work Calendar',
      type: 'select',
      dependencies: [{
        sourceField: 'equipmentId',
        targetField: 'calendar',
        type: 'fetch',
        required: true,
        clearOnChange: true,
        config: {
          dataConfig: {
            // ✅ Receives equipmentId as parameter
            renderData: async (equipmentId: string) => {
              const data = await myAPI.getCalendars(equipmentId);  // ✅ YOU call API
              return data.map(cal => ({
                label: cal.name,
                value: cal.id,
              }));
            },
          },
        },
      }],
      validation: {required: true},
    },
  },
  
  // Data map cho extract dependencies
  sourceDataMap: {
    taskMasters: {
      'tm-001': {
        id: 'tm-001',
        equipment: {id: 'eq-123', name: 'Robot Arm Alpha'},
      },
    },
  },
  
  // ✅ Repeatable groups - tạo nhiều cụm
  groups: [{
    id: 'taskMasterGroup',
    name: 'Task Master Configuration',
    fields: ['taskMaster', 'equipment', 'equipmentId', 'co2', 'calendar'],
    repeatable: true,
    maxInstances: 5,
  }],
};

// 3️⃣ Mount Gantt
WmsUI.mountGantt(container, {
  appId: 'your-app',
  externalFieldsConfig: config,  // ✅ Pass config với callbacks
});


// 1️⃣ Chọn Task Master từ API
taskMaster: {
  dataConfig: {
    renderData: async (): Promise<FieldDataResult> => {
      const taskMasters = await myAPI.getTaskMasters();
      // Returns: {id, name, equipment: {id, name}}
      
      return {
        options: taskMasters.map(tm => ({
          label: `${tm.code} - ${tm.name}`,
          value: tm.id
        })),
        data: Object.fromEntries(
          taskMasters.map(tm => [tm.id, tm])  // ✅ Store FULL objects
        )
      };
    },
    dataKey: 'taskMasters'  // ✅ Populate sourceDataMap['taskMasters']
  }
},

// 2️⃣ Auto-fill Equipment name
equipment: {
  type: 'text',
  disabled: true,
  dependencies: [{
    sourceField: 'taskMaster',
    type: 'extract',
    config: {
      sourcePath: 'equipment.name',  // ✅ Extract từ full object
      sourceDataKey: 'taskMasters'
    }
  }]
},

// 3️⃣ Extract Equipment ID (hidden)
equipmentId: {
  hidden: true,
  dependencies: [{
    sourceField: 'taskMaster',
    type: 'extract',
    config: {
      sourcePath: 'equipment.id',  // ✅ Extract ID
      sourceDataKey: 'taskMasters'
    }
  }]
},

// 4️⃣ Fetch CO2 by Equipment ID
co2: {
  type: 'select',
  dependencies: [{
    sourceField: 'equipmentId',
    type: 'fetch',
    config: {
      dataConfig: {
        renderData: async (equipmentId: string) => {
          const data = await myAPI.getCO2Levels(equipmentId);  // ✅ YOUR API
          return data.map(c => ({
            label: `${c.level} ppm`,
            value: c.id
          }));
        }
      }
    }
  }]
},

// 5️⃣ Fetch Calendar by Equipment ID
calendar: {
  type: 'select',
  dependencies: [{
    sourceField: 'equipmentId',
    type: 'fetch',
    config: {
      dataConfig: {
        renderData: async (equipmentId: string) => {
          const data = await myAPI.getCalendars(equipmentId);  // ✅ YOUR API
          return data.map(cal => ({
            label: cal.name,
            value: cal.id
          }));
        }
      }
    }
  }]
}
