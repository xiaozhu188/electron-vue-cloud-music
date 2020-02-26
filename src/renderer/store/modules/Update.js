const state = {
  remoteVersion: 2,
  updateContent: ''
}

const mutations = {
  SET_REMOTE_VERSION (state, version) {
    state.remoteVersion = version
  },
  SET_UPDATE_CONTENT (state, content) {
    state.updateContent = content
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
