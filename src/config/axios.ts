import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL
});


instance.interceptors.response.use(function (response) {
    return response.data;
}, function (error) {
    return Promise.reject(error);
});

export default instance;