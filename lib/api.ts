import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

// ==========================================
// 🛡️ 1. INTERCEPTOR DE PETICIÓN (Envía la llave)
// ==========================================
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ==========================================
// 🛡️ 2. INTERCEPTOR DE RESPUESTA (Maneja los bloqueos)
// ==========================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si Django nos tira un 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Destruimos la llave vieja
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirigimos al login (Evitamos loop infinito si ya estamos en login)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 🔑 AUTENTICACIÓN
// ==========================================
export const loginUser = async (credentials: any) => {
  const response = await api.post('/token/', credentials);
  if (response.data.access) {
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
  }
  return response.data;
};

// ==========================================
// 👤 PERFIL
// ==========================================
export const getProfile = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile/', data);
  return response.data;
};

// ==========================================
// 🚀 PROYECTOS
// ==========================================
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

// ==========================================
// 🧪 LABORATORIO (SNIPPETS)
// ==========================================
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



// ==========================================
// 📊 TELEMETRÍA Y DASHBOARD
// ==========================================

// Función silenciosa para la web pública (no falla ni frena la página si hay error)
export const trackEvent = async (action: string, target: string) => {
  try {
    // Si estás logueado como admin en la misma PC, evitamos registrar tus propias visitas para no ensuciar los datos
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) return; 

    await api.post('/track/', { action, target });
  } catch (error) {
    console.error("Error de telemetría:", error); // Falla en silencio
  }
};

// Función privada para tu Panel de Control
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};


// ==========================================
// ✉️ CONTACTO
// ==========================================

export const sendContactMessage = async (data: { name: string, email: string, subject: string, message: string }) => {
 
  const response = await api.post('/contact/', data);
  return response.data;
};

// Agregalo al final de lib/api.ts
export const getAdminMessages = async () => {
  const response = await api.get('/admin/messages/');
  return response.data;
};
export const markMessageAsRead = async (id: number) => {
  const response = await api.patch(`/admin/messages/${id}/read/`);
  return response.data;
};