import {notifications} from '@mantine/notifications';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_URL} from '../constants/common';

// Validation error types
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error?: {
    code: string;
    message: string;
    validationErrors?: ValidationError[];
  };
}

export class ValidationErrorException extends Error {
  public code: string;
  public validationErrors: ValidationError[];

  constructor(
    code: string,
    message: string,
    validationErrors: ValidationError[] = [],
  ) {
    super(message);
    this.name = 'ValidationErrorException';
    this.code = code;
    this.validationErrors = validationErrors;
  }
}

type ApiEndpoint = typeof API_URL;

const NO_MSG_URLS = [''];

class HttpWithCredentials {
  instance: AxiosInstance;
  private appId?: string;
  private code?: string;

  constructor(
    baseURL: ApiEndpoint,
    isPublic = false,
    t: any,
    appId?: string,
    code?: string,
  ) {
    this.appId = appId;
    this.code = code;

    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupRequestInterceptor(isPublic, baseURL);
    this.setupResponseInterceptor(t);
  }

  private setupRequestInterceptor(
    isPublic: boolean,
    baseURL: ApiEndpoint,
  ): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        config.headers.set('X-Timezone', timezone);

        // Add app headers if provided
        // Add app headers if provided
        if (this.appId) {
          config.headers.set('X-App-ID', this.appId);
        }
        if (this.code) {
          config.headers.set('X-App-Code', this.code);
        }

        if (isPublic) return config;

        return config;
      },
      error => Promise.reject(error),
    );
  }

  private setupResponseInterceptor(t: any): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // Check if this is a validation error
        console.log(error);
        const response = error?.response?.data as ApiErrorResponse;
        if (
          response?.error?.code === 'VALIDATION_ERROR' &&
          response?.error?.validationErrors
        ) {
          // Throw custom validation error exception
          const validationError = new ValidationErrorException(
            response?.error?.code,
            response?.error?.message,
            response?.error?.validationErrors,
          );
          return Promise.reject(validationError);
        }

        if (this.shouldSkipErrorNotification(error)) {
          console.log(error);
          return Promise.reject(error);
        }

        this.showErrorNotification(error, t);
        return Promise.reject(error);
      },
    );
  }

  private shouldSkipErrorNotification(error: AxiosError): boolean {
    const url = error.config?.url;
    return url ? NO_MSG_URLS.includes(url) : false;
  }

  private showErrorNotification(error: AxiosError, t: any): void {
    const response = error?.response?.data as any;
    const errorResponse = response?.error;

    if (error?.code === 'ERR_CANCELED') {
      return;
    }

    if (errorResponse?.message === 'EMAIL_NOT_EXISTS') {
      notifications.show({
        message: t('messages.emailNotExist'),
        color: 'red',
        classNames: {description: 'whitespace-pre-line'},
      });
      return;
    }

    if (errorResponse?.message === 'UNAUTHORIZED') {
      notifications.show({
        message: t('messages.notAuth'),
        color: 'red',
        classNames: {description: 'whitespace-pre-line'},
      });
    } else {
      const errorKey = errorResponse?.Error;
      const translationKey = `messages.${errorKey}`;
      let message: string;

      try {
        const translatedMessage = t(translationKey);
        message =
          translatedMessage === translationKey
            ? t('messages.commonError')
            : translatedMessage;
      } catch {
        message = t('messages.commonError');
      }

      notifications.show({
        message,
        color: 'red',
        classNames: {description: 'whitespace-pre-line'},
      });
    }
  }
}

export default HttpWithCredentials;
