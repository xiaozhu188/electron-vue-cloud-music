import axios from 'axios'
import store from './../store'
import { Base64 } from 'js-base64'
import Message from 'ant-design-vue/es/message'
// http://musicapi.leanapp.cn
const baseURL = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:3000'
  : 'http://127.0.0.1:3000' // http://129.204.108.71:3000  http://106.13.145.118:3000

const instance = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true
})

instance.interceptors.request.use(config => {
  config.headers['sra'] = 'sra'
  if (process.env.NODE_ENV !== 'development' && config.method == 'get' && config.params) {
    config.params = {params: Base64.encode(JSON.stringify(config.params))}
  }
  return config
}, error => {
  Message.error(error)
  Promise.reject(error)
})

instance.interceptors.response.use(
  response => {
    if (typeof response.data === 'string') {
      response.data = JSON.parse(Base64.decode(response.data))
    }
    // console.log('response', response)
    if (response.data.code && response.data.code === 200) {
      return response.data
    } else {
      return Promise.reject(response.data)
    }
  },
  error => {
    console.log(error.response)
    if (error.response) {
      let res = error.response
      switch (res.status) {
        case 301:
          store.commit('User/SET_SHOW_LOGIN', true)
          store.commit('User/SET_USER_INFO', {})
          store.commit('App/SET_REDIRECT', '/home')
          localStorage.removeItem('userId')
          Message.warn(res.data.msg || '请先登录')
          break
        case 400:
          Message.warn(res.data.message || res.data.msg || '资源不在收藏列表中')
          break
        case 401:
          Message.error(res.data.msg || '请先登录')
          break
        case 403:
          Message.error(res.data.msg || '权限不足')
          break
        case 404:
          Message.error(res.data.msg || '请求资源不存在')
          break
        case 408:
          Message.error(res.data.message || '已经收藏过该视频')
          break
        case 500:
          Message.error(res.data.msg || '服务器开小差啦')
          break
        case 504:
          Message.error(res.data.msg || '网络请求失败')
          break
        default:
          Message.error(res.data.msg || res.statusText)
      }
    } else {
      console.log('error', error.message)
      Message.error('服务器崩溃啦')
    }
    return Promise.reject(error.response)
  })

export default instance
