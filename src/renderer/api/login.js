import request from '../utils/request.js'

export function login_cellphone (params) {
  return request.get('/api/login/cellphone', {
    params
  })
}
export function login_email (params) {
  return request.get('/api/login/cellphone', {
    params
  })
}
export function login_refresh () {
  return request.get('/api/login/refresh')
}
export function login_status () {
  return request.get('/api/login/status')
}
export function logout () {
  return request.get('/api/logout')
}
