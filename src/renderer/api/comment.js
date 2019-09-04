import request from '@/utils/request.js'

export function getPlaylistComment (id, limit = 20, offset = 0) {
  return request.get('/api/comment/playlist', {
    params: {
      id, limit, offset
    }
  })
}

export function getAlbumComment (id, limit = 20, offset = 0) {
  return request.get('/api/comment/album', {
    params: {
      id, limit, offset
    }
  })
}

export function getMVComment (id, limit = 20, offset = 0) {
  return request.get('/api/comment/mv', {
    params: {
      id, limit, offset
    }
  })
}

export function getVideoComment (id, limit = 20, offset = 0) {
  return request.get('/api/comment/video', {
    params: {
      id, limit, offset
    }
  })
}

export function getSongComment (id, limit = 20, offset = 0, before = '') {
  return request.get('/api/comment/music', {
    params: {
      id, limit, offset, before
    }
  })
}

export function getDjComment (id, limit = 20, offset = 0, before = '') {
  return request.get('/api/comment/dj', {
    params: {
      id, limit, offset, before
    }
  })
}
