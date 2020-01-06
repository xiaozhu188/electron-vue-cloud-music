import ls from 'store'
const state = {
  primaryColor: '',
  isChangingColor: false,
  redirect: '/home',
  partRefreshFlag: false,
  showView: false,
  showDesktoplyric: false,
  isOnliline: navigator.onLine,
  noLimitRoutes: ['music_local', 'music_download', 'setting']
}

const getters = {
  primaryColor: state => state.primaryColor,
  showView: state => state.showView,
  showDesktoplyric: state => state.showDesktoplyric,
  isOnliline: state => state.isOnliline
}

const mutations = {
  SET_SHOW_DESKTOP_LYRIC (state, flag) {
    state.showDesktoplyric = flag
  },
  CHANGE_COLOR (state, color) {
    state.primaryColor = color
    ls.set('DEFAULT_COLOR', color)
  },
  SET_IS_CHANGING_COLOR (state, status) {
    state.isChangingColor = status
  },
  SET_REDIRECT (state, url) {
    state.redirect = url
  },
  SHOW_VIEW (state, flag) {
    state.showView = flag
  },
  SET_ONLINE (state, flag) {
    state.isOnliline = flag
  }
}

const actions = {
  toggleColor ({ commit }, color) {
    commit('CHANGE_COLOR', color)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
