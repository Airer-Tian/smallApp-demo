import request from '@/utils/request'

export const pageDicts = (params) => request.get('/dicts', { params })
export const addDict = (data) => request.post('/dicts', data)
export const updateDict = (id, data) => request.put(`/dicts/${id}`, data)
export const deleteDict = (id) => request.delete(`/dicts/${id}`)
export const listEnabledItems = (code) => request.get(`/dicts/code/${code}/items`)
export const pageDictItems = (params) => request.get('/dict-items', { params })
export const addDictItem = (data) => request.post('/dict-items', data)
export const updateDictItem = (id, data) => request.put(`/dict-items/${id}`, data)
export const deleteDictItems = (ids) => request.delete('/dict-items', { data: ids })
