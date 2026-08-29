import request from '@/utils/request'

export const pageOperLogs = (params) => request.get('/operLogs/page', { params })
export const pageLoginLogs = (params) => request.get('/loginLogs/page', { params })
