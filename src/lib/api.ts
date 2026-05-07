// API client utility

const getApiBaseURL = () => {
  const configuredApiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  if (typeof window !== 'undefined') {
    const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (!isLocalhost) {
      return '/api';
    }
  }

  return configuredApiURL;
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;
  
  let url = `${getApiBaseURL()}${endpoint}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    // Required to send cookies (like session cookies from better-auth)
    credentials: 'include',
  };

  const response = await fetch(url, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || 'An error occurred');
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    
  put: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    
  patch: <T>(endpoint: string, body: any, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
