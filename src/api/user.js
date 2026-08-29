import request from '@/utils/request'

export const pageUsers = (params) => request.get('/users', { params })
export const getUserDetail = (id) => request.get(`/users/${id}`)
export const addUser = (data) => request.post('/users', data)
export const updateUser = (id, data) => request.put(`/users/${id}`, data)
export const deleteUsers = (ids) => request.delete('/users', { data: ids })
export const changeMyPassword = (data) => request.put('/users/password', data)
export const resetPassword = (id) => request.put(`/users/${id}/resetPassword`)
