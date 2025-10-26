import { BACKEND_URL } from '../constants';

const getToken = () => localStorage.getItem('authToken');

const handleErrors = async (response: Response) => {
    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('API response was not JSON:', responseText);
        throw new Error(
          `Server returned an unexpected response. Expected JSON but got "${contentType || 'unknown'}". Status: ${response.status}. Check console for full response.`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
};


const api = {
  async post<T>(endpoint: string, body: object, isPublic: boolean = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (!isPublic) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return handleErrors(response);
  },

  async put<T>(endpoint: string, body?: object): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleErrors(response);
  },

  async patch<T>(endpoint: string, body?: object): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleErrors(response);
  },

  async get<T>(endpoint: string, isPublic = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    if (!isPublic) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return handleErrors(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'ngrok-skip-browser-warning': 'true',
        },
    });
    return handleErrors(response);
  },

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
    });
     if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || `Request failed with status ${response.status}`);
        } catch (e: any) {
             if (e.message.startsWith('Request failed')) throw e;
             throw new Error(`Request failed with status ${response.status}`);
        }
    }
    return await response.json();
  }
};

export default api;