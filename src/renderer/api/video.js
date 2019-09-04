import request from '@/utils/request.js'

export function getVideo (groupId) {
  let id = groupId || 5100
  return request.get(`/api/video/group?id=${id}&_=${new Date().getTime()}`)
}

// /api/video/group/list
export function getVideoCates () {
  return request.get('/api/video/group/list')
}

export function getVideoUrl (id) {
  return request.get(`/api/video/url?id=${id}`)
}

export function getVideoDetail (id) {
  return request.get(`/api/video/detail?id=${id}`)
}

// 相关视频
export function getRelatedVideo (id) {
  return request.get(`/api/related/allvideo?id=${id}`)
}

// 收藏视频 t : 1 为收藏,其他为取消收藏
export function subVideo (id, t) {
  return request.get('/api/video/sub', {
    params: {
      id, t
    }
  })
}
