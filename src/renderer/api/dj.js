import request from '@/utils/request.js'

export function getRecommendDjprogram () {
  return request.get('/api/personalized/djprogram')
}
export function getDjBanner () {
  return request.get('/api/dj/banner')
}
export function getDjCatelist () {
  return request.get('/api/dj/catelist')
}
export function getDjByCate ({type, limit = 5, offset = 0}) {
  return request.get('/api/dj/recommend/type', {
    params: {
      type, limit, offset
    }
  })
}
export function getDjCatelistRecommend () {
  return request.get('/api/dj/category/recommend')
}
export function getDjRecommend () {
  return request.get('/api/dj/recommend')
}
// 今日优选
export function getDjPerfered () {
  return request.get('/api/dj/today/perfered')
}
// 推荐节目
export function getProgramRecommend () {
  return request.get('/api/program/recommend')
}
// 付费精选
export function getDjPaygift () {
  return request.get('/api/dj/paygift')
}
// 电台详情
export function getDjDetail (rid) {
  return request.get('/api/dj/detail', {
    params: {
      rid
    }
  })
}
// 获取电台的节目
export function getDjProgram ({rid, limit, offset, asc = false}) {
  return request.get('/api/dj/program', {
    params: {
      rid,
      limit,
      offset,
      asc
    }
  })
}
