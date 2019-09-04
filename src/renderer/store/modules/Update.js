const state = {
  remoteVersion: ''
}

const mutations = {
  SET_REMOTE_VERSION (state, version) {
    state.remoteVersion = version
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
