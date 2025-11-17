/**
 * Enhanced External Fields Types with API Integration
 * Supports dynamic data fetching, field dependencies, and complex workflows
 */

import {ExternalFieldsData, FieldValue, SelectOption} from './externalFields';

// Re-export for convenience
export type {SelectOption, FieldValue, ExternalFieldsData};

// ============================================================================
// Field Data Configuration (for dynamic data fetching)
// ============================================================================

/**
 * Result from renderData function
 */
export interface FieldDataResult {
  /** Options for select/multiselect */
  options: SelectOption[];
  /** Full data objects keyed by ID (for extract dependencies) */
  data?: Record<string, any>;
}

/**
 * Configuration for fetching field data dynamically
 */
export interface FieldDataConfig<TParams = any> {
  /**
   * Function to render/fetch data
   * Can return just options array or {options, data}
   */
  renderData: (
    params?: TParams,
  ) => Promise<SelectOption[] | FieldDataResult> | SelectOption[] | FieldDataResult;

  /** Key to store full data in sourceDataMap */
  dataKey?: string;

  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;

  /** Debounce delay for search (in milliseconds) */
  debounce?: number;
}

// ============================================================================
// Field Dependency Types
// ============================================================================

/**
 * Configuration for dependency behavior
 */
export interface DependencyConfig {
  /** For 'extract' type: path to extract from source data */
  sourcePath?: string;

  /** For 'extract' type: key in sourceDataMap */
  sourceDataKey?: string;

  /** For 'filter' type: field to filter by */
  filterField?: string;

  /** For 'fetch' type: data config with params */
  dataConfig?: FieldDataConfig<any>;

  /** For 'transform' type: transformation function */
  transform?: (sourceValue: FieldValue, allValues: ExternalFieldsData) => FieldValue;

  /** For 'custom' type: custom handler */
  handler?: (
    sourceValue: FieldValue,
    allValues: ExternalFieldsData,
    helpers: DependencyHelpers,
  ) => Promise<void> | void;
}

/**
 * Field dependency configuration
 */
export interface FieldDependency {
  /** Source field key to watch */
  sourceField: string;

  /** Target field key to update */
  targetField: string;

  /** Dependency type */
  type: 'extract' | 'filter' | 'fetch' | 'transform' | 'custom';

  /** Dependency configuration */
  config?: DependencyConfig;

  /** Whether to clear target field when source changes */
  clearOnChange?: boolean;

  /** Whether dependency is required (source must have value) */
  required?: boolean;
}

/**
 * Helper functions for dependency handlers
 */
export interface DependencyHelpers {
  /** Get field value */
  getValue: (fieldKey: string) => FieldValue;

  /** Set field value */
  setValue: (fieldKey: string, value: FieldValue) => void;

  /** Get field options */
  getOptions: (fieldKey: string) => SelectOption[] | undefined;

  /** Set field options */
  setOptions: (fieldKey: string, options: SelectOption[]) => void;

  /** Set loading state */
  setLoading: (fieldKey: string, loading: boolean) => void;

  /** Set error state */
  setError: (fieldKey: string, error: string | undefined) => void;

  /** Get data from sourceDataMap */
  getSourceData: (dataKey: string, id: string) => any;
}

// ============================================================================
// Enhanced Field Config
// ============================================================================

/**
 * Enhanced External Field Configuration with API support
 */
export interface EnhancedExternalFieldConfig {
  key: string;
  name: string | {en: string; ja: string; vi: string};
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'datetime'
    | 'textarea'
    | 'checkbox'
    | 'radio'
    | 'boolean';

  // Basic config
  order?: number;
  group?: string;
  column?: number;
  hidden?: boolean;
  disabled?: boolean;

  // Static options (for select/multiselect without API)
  options?: SelectOption[];

  // Dynamic data fetching configuration
  dataConfig?: FieldDataConfig<any>;

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
  placeholder?: string | {en: string; ja: string; vi: string};
  helpText?: string | {en: string; ja: string; vi: string};
  labelWidth?: string;
  inputWidth?: string;

  // Default value
  defaultValue?: FieldValue | ((allValues: ExternalFieldsData) => FieldValue);
}

// ============================================================================
// Complete Configuration
// ============================================================================

/**
 * Complete Enhanced External Fields Configuration
 */
export interface EnhancedExternalFieldsConfig {
  /** Field configurations */
  fields: Record<string, EnhancedExternalFieldConfig>;

  /** Source data map (full objects keyed by ID) */
  sourceDataMap?: Record<string, Record<string, any>>;
}

// ============================================================================
// Runtime State Types
// ============================================================================

/**
 * Runtime state for a single field
 */
export interface FieldRuntimeState {
  /** Current options (from API or static) */
  options?: SelectOption[];

  /** Loading state */
  loading?: boolean;

  /** Error message */
  error?: string;

  /** Timestamp of last fetch */
  lastFetched?: number;
}

/**
 * Runtime state for all fields
 */
export type FieldsRuntimeState = Record<string, FieldRuntimeState>;

// ============================================================================
// Context Types
// ============================================================================

/**
 * External Fields API Context Value
 */
export interface ExternalFieldsAPIContextValue {
  /** Configuration */
  config: EnhancedExternalFieldsConfig;

  /** Runtime state */
  runtimeState: FieldsRuntimeState;

  /** Source data map */
  sourceDataMap: Record<string, Record<string, any>>;

  /** Fetch field data */
  fetchFieldData: <TParams = any>(
    fieldKey: string,
    dataConfig: FieldDataConfig<TParams>,
    params?: TParams,
  ) => Promise<SelectOption[]>;

  /** Update runtime state */
  updateRuntimeState: (fieldKey: string, state: Partial<FieldRuntimeState>) => void;

  /** Update source data map */
  updateSourceDataMap: (dataKey: string, data: Record<string, any>) => void;
}
