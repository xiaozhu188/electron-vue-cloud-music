import { playMode, PLAY_HISTORY_MAX_LEN } from './../../config/config'
import { shuffle } from '@/utils/calculate.js'
import ls from 'store'

const PLAY_HISTORY_KEY = '__playHistory__'
const CURRENT_SONG_INDEX_KEY = 'current_song_index'
const CURRENT_PLAY_LIST_KEY = 'current_play_list'
const SOURCE_KEY = 'source'
const VOLUME_KEY = 'volume'

function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if ( index === 0 ) {
    return
  }
  if ( index > 0 ) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if ( maxLen && arr.length > maxLen ) {
    arr.pop()
  }
}

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

const state = () => ({
  // current_play_list: ls.get(CURRENT_PLAY_LIST_KEY, []), // 当前播放列表
  // current_song_index: ls.get(CURRENT_SONG_INDEX_KEY, -1), // 当前播放歌曲索引
  // history_play_list: ls.get(PLAY_HISTORY_KEY, []), // 历史播放列表
  current_play_list: [], // 当前播放列表
  original_play_list: [], // 原始列表
  current_song_index: -1, // 当前播放歌曲索引
  history_play_list: [], // 历史播放列表
  playing: false, // 音频是否播放
  videoPlaying: false, // 视频是否播放
  source: ls.get(SOURCE_KEY, ''), // 音视频播放源
  mode: playMode.sequence, // 音频播放模式
  fullscreen: false, // 音频大屏
  lyric: null, // 歌词
  current_lyric: null, // 当前播放歌词
  current_lyric_line: 0, // 当前播放歌词索引
  isMuted: false,
  volume: 0.9,
  showDesktoplyric: false
})
const getters = {
  current_song: state => state.current_play_list[ state.current_song_index ] || {},
  mode: state => state.mode,
  source: state => state.source,
  playing: state => state.playing,
  original_play_list: state => state.original_play_list,
  history_play_list: state => state.history_play_list,
  current_play_list: state => state.current_play_list,
  current_song_index: state => state.current_song_index,
  fullscreen: state => state.fullscreen,
  current_lyric: state => state.current_lyric,
  lyric: state => state.lyric,
  current_lyric_line: state => state.current_lyric_line,
  videoPlaying: state => state.videoPlaying,
  isMuted: state => state.isMuted,
  volume: state => state.volume,
  showDesktoplyric: state => state.showDesktoplyric
}
const mutations = {
  SET_SHOW_DESKTOP_LYRIC (state, flag) {
    state.showDesktoplyric = flag
  },
  SET_CURRENT_PLAY_LIST (state, list) {
    state.current_play_list = list
  },
  SET_ORIGINAL_PLAY_LIST (state, list) {
    state.original_play_list = list
  },
  SET_CURRENT_SONG (state, song) {
    let index = state.current_play_list.findIndex(item => item.id == song.id)
    state.current_play_list.splice(index, 1, song)
  },
  SET_PLAY_HISTORY (state, list) {
    state.history_play_list = list
    ls.set(PLAY_HISTORY_KEY, list)
  },
  SET_CURRENT_INDEX (state, index) {
    state.current_song_index = index
    ls.set(CURRENT_SONG_INDEX_KEY, index)
  },
  SET_PLAY_STATUS (state, val) {
    state.playing = val
  },
  SET_VIDEO_PLAY_STATUS (state, val) {
    state.videoPlaying = val
  },
  SET_SOURCE (state, url) {
    state.source = url
    ls.set(SOURCE_KEY, url)
  },
  SET_MODE (state, mode) {
    state.mode = mode
    // ls.set('__PLAY_MODE__', mode)
  },
  SET_FULLSCREEN (state, val) {
    state.fullscreen = val
  },
  SET_LYRIC (state, lyric) {
    state.lyric = lyric
  },
  SET_CURRENT_LYRIC (state, lyric) {
    state.current_lyric = lyric
  },
  SET_CURRENT_LYRIC_LINE (state, line) {
    state.current_lyric_line = line
  },
  SET_VOLUME (state, volume) {
    state.volume = volume
  },
  SET_MUTED (state, flag) {
    state.isMuted = flag
  }
}

const actions = {
  setLyric ({ commit }, lyric) {
    commit('SET_LYRIC', lyric)
  },
  // 追加播放,用于搜索建议单曲播放,相似歌曲播放,动态歌曲播放等
  async appendPlay ({ commit, state }, song) {
    let index = state.current_play_list.findIndex(item => {
      return item.id === song.id
    })
    if ( index >= 0 ) {
      commit('SET_CURRENT_INDEX', index)
      return
    }
    let list = state.current_play_list.slice()
    list.push(song)
    commit('SET_CURRENT_PLAY_LIST', list)
    commit('SET_CURRENT_INDEX', list.length - 1)
  },
  // 右键菜单的下一首播放
  async nextPlay ({ commit, state }, song) {
    let index = state.current_play_list.findIndex(item => {
      return item.id === song.id
    })
    let current_song_index = state.current_song_index
    if ( index === current_song_index ) return

    let current_play_list = state.current_play_list.slice()
    if ( index < 0 ) { // 下一首播放的歌曲,不在当前歌单
      current_play_list.splice(current_song_index + 1, 0, song)
    } else {
      let removeItem = current_play_list.splice(index, 1)
      if ( index < current_song_index ) {
        current_play_list.splice(current_song_index, 0, ...removeItem)
      } else {
        current_play_list.splice(current_song_index + 1, 0, ...removeItem)
      }
    }
    // 找到播放列表变化后当前播放歌曲的新索引
    let newIndex = current_play_list.findIndex(item => {
      return state.current_play_list[ state.current_song_index ].id === item.id
    })
    commit('SET_CURRENT_INDEX', newIndex)
    commit('SET_CURRENT_PLAY_LIST', current_play_list)
  },
  // 双击的播放
  async selectPlay ({ commit, state }, { tracks, index }) {
    if ( tracks.length < 1 ) return
    commit('SET_ORIGINAL_PLAY_LIST', tracks)
    if ( state.mode === playMode.random ) {
      let randomList = shuffle(tracks)
      commit('SET_CURRENT_PLAY_LIST', randomList)
      index = findIndex(randomList, tracks[ index ])
    } else {
      commit('SET_CURRENT_PLAY_LIST', tracks)
    }
    commit('SET_CURRENT_INDEX', index)
    // commit('SET_PLAY_STATUS', true)
  },
  addHistorySong ({ commit }, song) {
    let songs = ls.get(PLAY_HISTORY_KEY, [])
    delete song.isClicked
    insertArray(songs, song, (item) => {
      return song.id == item.id
    }, PLAY_HISTORY_MAX_LEN)
    commit('SET_PLAY_HISTORY', songs)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
