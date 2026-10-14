import api from './api';export const adminLogin=(email,password)=>api.post('/admin/auth/login',{email,password});export const getMe=()=>api.get('/auth/me');
