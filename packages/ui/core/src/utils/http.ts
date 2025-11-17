import {notifications} from '@mantine/notifications';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_URL} from '../constants/common';

// interface IAuthTokens {
//   token: string;
// }

type ApiEndpoint = typeof API_URL;

const NO_MSG_URLS = [''];

class Http {
  instance: AxiosInstance;

  constructor(baseURL: ApiEndpoint, isPublic = false, t: any) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      //   withCredentials: true,
    });

    this.setupRequestInterceptor(isPublic, baseURL);
    this.setupResponseInterceptor(t);
  }

  //   private getAuthTokens(): IAuthTokens | null {
  //     try {
  //       const authStore = localStorage.getItem("auth-store");
  //       if (!authStore) return null;

  //       const parsedStore = JSON.parse(authStore);
  //       return parsedStore?.state || null;
  //     } catch (error) {
  //       console.error("Failed to parse auth tokens:", error);
  //       return null;
  //     }
  //   }

  private setupRequestInterceptor(
    isPublic: boolean,
    baseURL: ApiEndpoint,
  ): void {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        config.headers.set('X-Timezone', timezone);

        if (isPublic) return config;

        // const tokens = this.getAuthTokens();
        // if (!tokens) return config;

        // const tokenMap: Record<ApiEndpoint, keyof IAuthTokens> = {
        //   [API_URL]: "token",
        // };

        // const tokenKey = tokenMap[baseURL];
        // const token = tokens[tokenKey];

        // if (token) {
        //   config.headers.set("Authorization", `Bearer ${token}`);
        // }

        return config;
      },
      error => Promise.reject(error),
    );
  }

  private setupResponseInterceptor(t: any): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        // if (this.isAuthError(error)) {
        //   this.handleAuthError();
        //   return Promise.reject(error);
        // }

        if (this.shouldSkipErrorNotification(error)) {
          console.log(error);
          return Promise.reject(error);
        }

        this.showErrorNotification(error, t);
        return Promise.reject(error);
      },
    );
  }

  private isAuthError(error: AxiosError): boolean {
    return error?.response?.status === 401 || error?.code === 'ERR_NETWORK';
  }

  //   private handleAuthError(): void {
  //     localStorage.removeItem("auth-store");
  //     if (typeof window !== "undefined") {
  //       window.location.href = getSSOLoginUrl();
  //     }
  //   }

  private shouldSkipErrorNotification(error: AxiosError): boolean {
    const url = error.config?.url;
    return url ? NO_MSG_URLS.includes(url) : false;
  }

  private showErrorNotification(error: AxiosError, t: any): void {
    const response = error?.response?.data as any;
    const errorResponse = response?.error;
    // If ErrorCode is ERR_CANCELED do not show notification
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
        // Assume translation exists if it doesn't return the key itself
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

export default Http;
