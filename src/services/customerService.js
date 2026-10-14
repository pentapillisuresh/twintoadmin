import api from './api';export const getCustomers=p=>api.get('/admin/customers',{params:p});export const updateCustomerStatus=(id,isActive)=>api.patch(`/admin/customers/${id}/status`,{isActive});
