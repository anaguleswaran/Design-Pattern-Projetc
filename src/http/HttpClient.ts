export interface HttpRequestConfig {
  body?: unknown;
  headers?: HeadersInit;
  timeoutMs?: number;
}

export interface HttpInterceptorStrategy {
  beforeRequest?(
    input: RequestInfo | URL,
    init: RequestInit,
  ): Promise<[RequestInfo | URL, RequestInit]> | [RequestInfo | URL, RequestInit];
  afterResponse?(response: Response): Promise<Response> | Response;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly responseBody: string;

  constructor(
    message: string,
    status: number,
    responseBody: string,
  ) {
    super(message);
    this.status = status;
    this.responseBody = responseBody;
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly interceptors: HttpInterceptorStrategy[];

  constructor(
    baseUrl = "",
    interceptors: HttpInterceptorStrategy[] = [],
  ) {
    this.baseUrl = baseUrl;
    this.interceptors = interceptors;
  }

  get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("GET", url, config);
  }

  post<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("POST", url, { ...config, body });
  }

  put<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("PUT", url, { ...config, body });
  }

  delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, config);
  }

  async request<T>(
    method: string,
    url: string,
    config: HttpRequestConfig = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), config.timeoutMs ?? 5000);

    let requestInput: RequestInfo | URL = `${this.baseUrl}${url}`;
    let requestInit: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };

    if (config.body !== undefined) {
      requestInit.body =
        typeof config.body === "string"
          ? config.body
          : JSON.stringify(config.body);
    }

    try {
      for (const interceptor of this.interceptors) {
        if (interceptor.beforeRequest) {
          [requestInput, requestInit] = await interceptor.beforeRequest(
            requestInput,
            requestInit,
          );
        }
      }

      let response = await fetch(requestInput, requestInit);

      for (const interceptor of this.interceptors) {
        if (interceptor.afterResponse) {
          response = await interceptor.afterResponse(response);
        }
      }

      if (!response.ok) {
        const body = await response.text();
        throw new HttpError(
          `HTTP ${response.status} sur ${method} ${url}`,
          response.status,
          body,
        );
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error(`Requête expirée après ${config.timeoutMs ?? 5000} ms.`);
      }

      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
}
