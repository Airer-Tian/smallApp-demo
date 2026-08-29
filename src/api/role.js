import request from '@/utils/request'

export const pageRoles = (params) => request.get('/roles', { params })
export const listSimpleRoles = () => request.get('/roles/simple')
export const addRole = (data) => request.post('/roles', data)
export const updateRole = (id, data) => request.put(`/roles/${id}`, data)
export const deleteRoles = (ids) => request.delete('/roles', { data: ids })
export const getRoleMenus = (id) => request.get(`/roles/${id}/menus`)
export const assignRoleMenus = (id, menuIds) => request.put(`/roles/${id}/menus`, menuIds)
