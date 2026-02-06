import { Run } from '@/types/run';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithError<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown error');
    throw new ApiError(response.status, message);
  }

  return response.json();
}

// Runs API
export const runsApi = {
  list: (): Promise<Run[]> => 
    fetchWithError('/runs'),

  getById: (id: string): Promise<Run> => 
    fetchWithError(`/runs/${id}`),

  create: (request: { request: string }): Promise<Run> =>
    fetchWithError('/runs', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  approve: (id: string): Promise<void> =>
    fetchWithError(`/runs/${id}/approve`, { method: 'POST' }),

  reject: (id: string): Promise<void> =>
    fetchWithError(`/runs/${id}/reject`, { method: 'POST' }),

  deploy: (id: string): Promise<{ url: string; environment: string }> =>
    fetchWithError(`/runs/${id}/deploy`, { method: 'POST' }),
};

// SSE for real-time updates
export function subscribeToRunEvents(
  runId: string,
  onEvent: (event: Partial<Run>) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE_URL}/runs/${runId}/events`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch (e) {
      console.error('Failed to parse SSE event:', e);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    onError?.(new Error('Connection lost'));
    eventSource.close();
  };

  return () => eventSource.close();
}

export { ApiError };
