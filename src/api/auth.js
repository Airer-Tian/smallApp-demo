import request from '@/utils/request'

export const getCaptcha = () => request.get('/auth/captcha')
export const login = (data) => request.post('/auth/login', data)
export const getUserInfo = () => request.get('/auth/userinfo')
export const logout = () => request.post('/auth/logout')
