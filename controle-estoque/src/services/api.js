import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.22.6:4000/api/', // ajuste conforme o seu backend
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para lidar com respostas (ex.: token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname; // Obtem a rota atual

    // Se a resposta for 401 (não autorizado)
    if (error.response && error.response.status === 401) {
      // Se já estiver na página de login (rota "/"), apenas rejeita o erro
      if (currentPath === "/") {
        return Promise.reject(error);
      }
      // Para outras rotas, exibe um alerta e redireciona o usuário para a página de login ("/")
      
      localStorage.removeItem("accessToken");
      window.location.href = "/"; // Redireciona para a página de login
    }
    return Promise.reject(error);
  }
);

export default api;
