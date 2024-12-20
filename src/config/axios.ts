import axios from 'axios';
import { toast } from 'sonner'

export const errorFn = (error: any) => {
    if (error?.response?.status == 440 || error?.status == 440) {
        localStorage.removeItem("userToken");

        toast.loading("Sessão expirada", {
            description: "Redirecionando para login...",
            position: "top-right",
            action: {
                label: 'Login',
                onClick: () => { window.location.href = '/login' },
            },
        });

        setTimeout(() => {
            window.location.href = '/login'
        }, 3000)
    }
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL
});


instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

instance.interceptors.response.use(
    (response) => {
        // Retorna o conteúdo completo caso a resposta seja um blob ou arraybuffer
        if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
            return response;
        }
        return response.data; // Retorna somente os dados para respostas JSON normais
    },
    (error) => {
        errorFn(error);
        return Promise.reject(error);
    }
);

export default instance;