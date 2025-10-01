import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Interceptor de Requisição (mantém-se igual)
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


// --- INTERCEPTOR DE RESPOSTA MELHORADO ---
// Variável para evitar múltiplas tentativas de refresh ao mesmo tempo
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh do token
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Se já estivermos a tentar obter um novo token, adiciona a requisição à fila
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Se não houver refreshToken, desloga
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const rs = await api.post('/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = rs.data;
        localStorage.setItem('accessToken', access);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + access;
        
        // Processa a fila de requisições que falharam
        processQueue(null, access);

        // Tenta novamente a requisição original com o novo token
        originalRequest.headers['Authorization'] = 'Bearer ' + access;
        return api(originalRequest);

      } catch (err) {
        // Se o refresh falhar, desloga o utilizador
        processQueue(err, null);
        
        // --- MELHORIA AQUI ---
        // Guarda uma mensagem para a página de login mostrar
        localStorage.setItem('sessionExpiredMessage', 'A sua sessão expirou. Por favor, faça login novamente.');
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // Redireciona para a página de login (ou a raiz, como está)
        window.location.href = "/";
        return Promise.reject(err);
      } 
    }

    return Promise.reject(error);
  }
);

export default api;