import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});


api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);


export const loginUser = async (credentials: any) => {
  const response = await api.post('/token/', credentials);
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};


export const getProfile = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile/', data);
  return response.data;
};


export const getProjects = async (isAdmin: boolean = false) => {
  const url = isAdmin ? '/projects/?all=true' : '/projects/';
  const response = await api.get(url);
  return response.data;
};

export const getProjectBySlug = async (slug: string) => {
  const response = await api.get(`/projects/${slug}/`);
  return response.data;
};

export const createProject = async (data: any) => {
  const response = await api.post('/projects/', data);
  return response.data;
};

export const updateProject = async (slug: string, data: any) => {
  const response = await api.put(`/projects/${slug}/`, data);
  return response.data;
};

export const deleteProject = async (slug: string) => {
  const response = await api.delete(`/projects/${slug}/`);
  return response.data;
};


export const getLabSnippets = async (isAdmin: boolean = false) => {
  const url = isAdmin ? '/lab/?all=true' : '/lab/';
  const response = await api.get(url);
  return response.data;
};

export const createLabSnippet = async (data: any) => {
  const response = await api.post('/lab/', data);
  return response.data;
};

export const updateLabSnippet = async (id: number, data: any) => {
  const response = await api.put(`/lab/${id}/`, data);
  return response.data;
};

export const deleteLabSnippet = async (id: number) => {
  const response = await api.delete(`/lab/${id}/`);
  return response.data;
};



export const trackEvent = async (action: string, target: string) => {
  try {
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) return; 

    await api.post('/track/', { action, target });
  } catch (error) {
    console.error("Error de telemetría:", error); 
  }
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};

export const clearTelemetry = async () => {
  const response = await api.delete('/dashboard/stats/clear/');
  return response.data;
};




export const sendContactMessage = async (data: { name: string, email: string, subject: string, message: string, recaptchaToken: string }) => {
  const response = await api.post('/contact/', data);
  return response.data;
};

export const getAdminMessages = async () => {
  const response = await api.get('/admin/messages/');
  return response.data;
};

export const markMessageAsRead = async (id: number) => {
  const response = await api.patch(`/admin/messages/${id}/read/`);
  return response.data;
};




/// --- RUTAS DEL WORKSPACE ---

export const getWorkspaceData = async () => {
  const response = await api.get('/study/workspace/');
  return response.data;
};

export const createNotebook = async (title: string, color: string) => {
  const response = await api.post('/study/notebooks/', { title, color });
  return response.data;
};

// ACÁ EL CAMBIO DE NOMBRE
export const createStudyProject = async (title: string) => {
  const response = await api.post('/study/projects/', { title });
  return response.data;
};

// --- RUTAS DEL CHAT (Actualizadas) ---

export const getChatSessions = async (notebookId?: string, projectId?: string) => {
  // Pasamos parámetros opcionales por si queremos filtrar
  const params = new URLSearchParams();
  if (notebookId) params.append('notebook_id', notebookId);
  if (projectId) params.append('project_id', projectId);
  
  const response = await api.get(`/study/sessions/?${params.toString()}`);
  return response.data; // [{id, title}, ...]
};

export const createChatSession = async (notebookId?: string, projectId?: string) => {
  const response = await api.post('/study/sessions/', {
    notebook_id: notebookId,
    project_id: projectId
  });
  return response.data; // {id, title}
};

export const getSessionHistory = async (sessionId: string) => {
  const response = await api.get(`/study/sessions/${sessionId}/`);
  // Ahora retorna: { messages: [...], meta: { message_count, limit } }
  return response.data; 
};

export const sendSessionMessage = async (sessionId: string, message: string, model: string) => {
  const response = await api.post(`/study/sessions/${sessionId}/`, { message, model });
  // Ahora retorna: { role, content, meta: { message_count, limit } }
  return response.data; 
};