import request from '@/utils/request'

export const getDeptTree = () => request.get('/depts/tree')
export const getDeptDetail = (id) => request.get(`/depts/${id}`)
export const addDept = (data) => request.post('/depts', data)
export const updateDept = (id, data) => request.put(`/depts/${id}`, data)
export const deleteDept = (id) => request.delete(`/depts/${id}`)
