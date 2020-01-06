import { remote } from 'electron'
let state = {
  downloadSongsFolders: [
    `${remote.app.getPath('music')}`
  ]
}
let getters = {
  downloadSongsFolders: state => state.downloadSongsFolders
}

let mutations = {
  add (state, folders) {
    state.downloadSongsFolders = state.downloadSongsFolders.concat(folders)
  },
  SET_FOLDERS (state, folders) {
    console.log(folders)
    state.downloadSongsFolders = state.downloadSongsFolders.concat(folders)
  },
  mutateState (state, payload) {
    for (let k in payload) {
      state[k] = payload[k]
    }
  }
}

export default { namespaced: true, state, getters, mutations }
