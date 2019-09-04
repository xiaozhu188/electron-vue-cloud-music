import axios from 'axios'

export function checkUpdate () {
  return axios.get('https://api.github.com/repos/xiaozhu188/electron-vue-cloud-music/releases/latest')
}
