import request from '@/utils/request'

export const getMenuTree = () => request.get('/menus/tree')
export const addMenu = (data) => request.post('/menus', data)
export const updateMenu = (id, data) => request.put(`/menus/${id}`, data)
export const deleteMenu = (id) => request.delete(`/menus/${id}`)
