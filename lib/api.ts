
//lib/api.ts

import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  // Pedimos la sesión actual a NextAuth en lugar de usar localStorage
  const session = await getSession();

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o es inválido, NextAuth se encarga de desloguearte
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);





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





// --- RUTAS DEL WORKSPACE ---

export const getWorkspaceData = async () => {
  const response = await api.get('/study/workspace/');
  return response.data;
};

// NUEVA: Para traer los prompts al Modal
export const getStudyPrompts = async () => {
  const response = await api.get('/study/prompts/');
  return response.data;
};

// ACTUALIZADA: Ahora recibe el promptId opcional
export const createNotebook = async (title: string, color: string, promptId?: string) => {
  const response = await api.post('/study/notebooks/', {
    title,
    color,
    prompt_id: promptId // Se lo mandamos al backend
  });
  return response.data;
};

// ACTUALIZADA: Ahora recibe el promptId opcional
export const createStudyProject = async (title: string, promptId?: string) => {
  const response = await api.post('/study/projects/', {
    title,
    prompt_id: promptId // Se lo mandamos al backend
  });
  return response.data;
};







export const getChatSessions = async (notebookId?: string, projectId?: string) => {
  const params = new URLSearchParams();
  if (notebookId) params.append('notebook_id', notebookId);
  if (projectId) params.append('project_id', projectId);

  const response = await api.get(`/study/sessions/?${params.toString()}`);
  return response.data;
};

export const createChatSession = async (notebookId?: string, projectId?: string) => {
  const response = await api.post('/study/sessions/', {
    notebook_id: notebookId,
    project_id: projectId
  });
  return response.data;
};

export const getSessionHistory = async (sessionId: string) => {
  const response = await api.get(`/study/sessions/${sessionId}/`);

  return response.data;
};

export const sendSessionMessage = async (sessionId: string, message: string, model: string) => {
  const response = await api.post(`/study/sessions/${sessionId}/`, { message, model });

  return response.data;
};




// --- RUTAS DE LA LÍNEA DE TIEMPO (TIMELINE) ---

export const getTimelineEvents = async () => {
  const response = await api.get('/timeline/');
  return response.data;
};

export const getTimelineEventBySlug = async (slug: string) => {
  const response = await api.get(`/timeline/${slug}/`);
  return response.data;
};


export const createTimelineEvent = async (formData: FormData) => {
  const response = await api.post('/timeline/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateTimelineEvent = async (slug: string, formData: FormData) => {
  const response = await api.put(`/timeline/${slug}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteTimelineEvent = async (slug: string) => {
  const response = await api.delete(`/timeline/${slug}/`);
  return response.data;
};

export const deleteTimelineMedia = async (mediaId: number) => {
  const response = await api.delete(`/timeline/media/${mediaId}/`);
  return response.data;
};


// --- RUTAS DEL PLANNER INTERNO ---

export const getWorkProjects = async () => {
  const response = await api.get('/planner/projects/');
  return response.data;
};

export const getWorkProjectById = async (id: number) => {
  const response = await api.get(`/planner/projects/${id}/`);
  return response.data;
};

export const createWorkProject = async (data: { title: string, description?: string, status?: string, target_date?: string, repository_url?: string }) => {
  const response = await api.post('/planner/projects/', data);
  return response.data;
};

export const updateWorkProject = async (id: number, data: any) => {
  const response = await api.patch(`/planner/projects/${id}/`, data);
  return response.data;
};

export const deleteWorkProject = async (id: number) => {
  const response = await api.delete(`/planner/projects/${id}/`);
  return response.data;
};


export const createWorkModule = async (data: { project: number, title: string, description?: string, status?: string, priority?: string }) => {
  const response = await api.post('/planner/modules/', data);
  return response.data;
};


export const createWorkLog = async (data: { module: number, content: string, log_type?: string, version_tag?: string }) => {
  const response = await api.post('/planner/logs/', data);
  return response.data;
};




// --- RUTAS BAZAR ---

export const getProductoByBarcode = async (barcode: string) => {
  const response = await api.get(`/bazar/productos/barras/${barcode}/`);
  return response.data;
};

export const createProducto = async (data: any) => {
  const response = await api.post('/bazar/productos/', data);
  return response.data;
};

export const updateProducto = async (barcode: string, data: any) => {
  const response = await api.put(`/bazar/productos/barras/${barcode}/`, data);
  return response.data;
};