import Message from 'ant-design-vue/es/message'
import { login_refresh, logout } from './../../api/login'
import {
  getUserPlaylist,
  getUserLikeSongs,
  likePlaylist,
  likeMusic,
  deletePlaylist,
  createPlaylist,
  subDj,
  subAlbum,
  subArtist,
  user_follow
} from './../../api/user.js'

let state = {
  showLogin: false,
  userInfo: {},
  userDetail: '',
  userPlaylists: [], // 用户收藏的歌单
  likedsongIds: [] // 喜欢的歌曲id列表
}
let getters = {
  hasUserInfo: state => Object.keys(state.userInfo).length > 0,
  userId: state => ((Object.keys(state.userInfo).length > 0) && state.userInfo.profile.userId) || '',
  userPlaylists: state => state.userPlaylists,
  subscribedList: state => {
    return state.userPlaylists.filter(item => {
      return item.subscribed
      // return item.creator.userId !== state.userInfo.userId
    })
  },
  createdList: state => {
    return state.userPlaylists.filter(item => {
      return !item.subscribed
      // return item.creator.userId === state.userInfo.userId
    })
  },
  likedPlaylistIds: state => state.userPlaylists.map(item => item.id),
  likedsongIds: state => state.likedsongIds
}

let mutations = {
  SET_SHOW_LOGIN (state, val) {
    state.showLogin = val
  },
  SET_USER_INFO (state, payload) {
    state.userInfo = payload
  },
  SET_USER_PLAYLISTS (state, list) {
    state.userPlaylists = list
  },
  SET_LIKEDSONG_IDS (state, ids) {
    state.likedsongIds = ids
  },
  SET_USER_DETAIL (state, val) {
    state.userDetail = val
  }
}

let actions = {
  setShowLogin ({ commit }, val) {
    commit('SET_SHOW_LOGIN', val)
  },
  async refreshUser () {
    await login_refresh()
  },
  async logout ({ commit }) {
    let { code } = await logout()
    if (code === 200) {
      localStorage.removeItem('userId')
      commit('SET_USER_PLAYLISTS', [])
      commit('SET_LIKEDSONG_IDS', [])
      commit('SET_USER_INFO', {})
    }
  },
  async getUserPlaylists ({ commit, getters }) {
    let { playlist } = await getUserPlaylist(getters.userId)
    commit('SET_USER_PLAYLISTS', playlist)
    // return playlist
  },
  async getUserLikedSongs ({ commit, getters }) {
    if (getters.userId) {
      let { ids } = await getUserLikeSongs(getters.userId)
      commit('SET_LIKEDSONG_IDS', ids)
    }
  },
  // 收藏/取消收藏歌单
  async subscribePlatlist ({ commit, state }, { t, playlist }) {
    let pid = playlist.id
    let res = await likePlaylist(t, pid)
    if (res.code === 200) {
      let userPlaylists = state.userPlaylists.slice()
      if (t === 1) {
        Message.success('收藏成功!')
        playlist.subscribed = true
        userPlaylists.unshift(playlist)
      } else if (t === 2) {
        Message.success('取消收藏成功!')
        let index = userPlaylists.findIndex(item => item.id === pid)
        userPlaylists.splice(index, 1)
      }
      commit('SET_USER_PLAYLISTS', userPlaylists)
    }
  },
  // 取消收藏歌单
  async removePlaylist ({ commit, state }, { action, pid }) {
    let res = await likePlaylist(action, pid)
    if (res.code === 200) {
      let userPlaylists = state.userPlaylists.slice()
      let index = userPlaylists.findIndex(item => item.id === pid)
      userPlaylists.splice(index, 1)
      commit('SET_USER_PLAYLISTS', userPlaylists)
      Message.success('删除成功!')
    }
  },
  // 删除创建的歌单
  async deletePlaylist ({ commit, state }, id) {
    let res = await deletePlaylist(id)
    if (res.code === 200) {
      let userPlaylists = state.userPlaylists.slice()
      let index = userPlaylists.findIndex(item => item.id === id)
      userPlaylists.splice(index, 1)
      commit('SET_USER_PLAYLISTS', userPlaylists)
      Message.success('删除成功!')
    }
  },
  // 新建歌单
  async createPlaylist ({ commit, state }, formData) {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await createPlaylist(formData)
        if (res.code === 200) {
          let userPlaylists = state.userPlaylists.slice()
          userPlaylists.push(res.playlist)
          commit('SET_USER_PLAYLISTS', userPlaylists)
          resolve(res.playlist)
        } else {
          reject(new Error('创建歌单失败'))
        }
      } catch (err) {
        reject(err)
      }
    })
  },
  handleLikeSong ({ commit, state }, { songId, isLike }) {
    return new Promise(async (resolve, reject) => {
      try {
        let { code } = await likeMusic(songId, isLike)
        if (code === 200) {
          let likedsongIds = [...state.likedsongIds]
          if (isLike) {
            likedsongIds.unshift(songId)
            commit('SET_LIKEDSONG_IDS', likedsongIds)
            Message.success('喜欢歌曲成功!')
          } else {
            let index = likedsongIds.findIndex(id => id === songId)
            likedsongIds.splice(index, 1)
            commit('SET_LIKEDSONG_IDS', likedsongIds)
            Message.success('取消喜欢成功!')
          }
          resolve()
        } else {
          reject(new Error('操作失败'))
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  async subscribeDj ({ commit, state }, { t, dj }) {
    let res = await subDj({ t, rid: dj.id })
    if (res.code === 200) {
      t === 1 ? Message.success(res.message || '订阅电台成功!') : Message.success('取消订阅电台成功!')
    }
  },
  async subscribeAlbum ({ commit, state }, { t, album }) {
    let id = album.id
    let res = await subAlbum({ t, id })
    if (res.code === 200) {
      t === 1 ? Message.success(`收藏专辑${album.name}成功`) : Message.success(`取消收藏专辑${album.name}成功`)
      return res.code
    }
    throw new Error(res)
  },
  async subscribeArtist ({ commit, state }, { t, artist }) {
    let id = artist.id
    let res = await subArtist({ t, id })
    if (res.code === 200) {
      t === 1 ? Message.success(`收藏歌手${artist.name}成功`) : Message.success(`取消收藏歌手${artist.name}成功`)
      return res.code
    }
    throw new Error(res)
  },
  async subscribeUser ({ commit, state }, { t, userId, nickname }) {
    let id = userId
    let res = await user_follow({ t, id })
    if (res.code === 200) {
      t === 1 ? Message.success(res.followContent || `关注用户${nickname}成功`) : Message.success(`取消关注用户${nickname}成功`)
      return res
    }
    throw new Error(res)
  }
}

export default { namespaced: true, state, getters, mutations, actions }
