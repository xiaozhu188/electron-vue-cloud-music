import request from '@/utils/request.js'

// 全球榜
export function getToplist () {
  return request.get('/api/toplist')
}

export function getTopDetail (idx) {
  return request.get('/api/top/list', {
    params: {
      idx
    }
  })
}

export function getToplistDetail () {
  return request.get('/api/toplist/detail')
}
