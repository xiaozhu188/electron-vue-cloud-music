import { dialog, shell, app } from 'electron'
import semver from 'semver'
import axios from 'axios'
import pkg from '../../../package.json'
const version = pkg.version
const localVersion = app.getVersion()
const release = 'https://api.github.com/repos/xiaozhu188/electron-vue-cloud-music/releases/latest'
const downloadUrl = 'https://github.com/xiaozhu188/electron-vue-cloud-music/releases/latest'
const getDownloadUrl = function () {
  const BASE_URL = 'https://github.com/xiaozhu188/electron-vue-cloud-music/releases/download'
  if (process.platform === 'win32') {
    return `${BASE_URL}/v${version}/electron-vue-cloud-music-setup-${version}.exe`
  } else if (process.platform === 'darwin') {
    return `${BASE_URL}/v${version}/electron-vue-cloud-music-${version}.dmg`
  } else if (process.platform === 'linux') {
    return `${BASE_URL}/v${version}/electron-vue-cloud-music-${version}-x86_64.AppImage`
  }
}

let shouldUpdate = false
let forceUpdate = false

// axios.get(release).then(res => {
//   const remoteVersion = res.data.name
//   shouldUpdate = semver.gt(remoteVersion, localVersion)
//   // forceUpdate = semver.diff(remoteVersion, 'localVersion') === 'major'
//   forceUpdate = semver.diff('2.0.0', '1.0.7') === 'major'
//   console.log('version:', version, 'localVersion:', localVersion, 'remoteVersion:', remoteVersion, shouldUpdate)
//   global.remoteVersion = remoteVersion
//   global.shouldUpdate = shouldUpdate
// }).catch(err => {
//   console.log('获取版本信息失败:', err)
// })

// export default {shouldUpdate, forceUpdate}
export function checkUpdate () {
  return new Promise((resolve, reject) => {
    axios.get(release).then(res => {
      const remoteVersion = res.data.name
      shouldUpdate = semver.gt(remoteVersion, localVersion)
      forceUpdate = semver.diff(remoteVersion, localVersion) === 'major'
      // console.log(remoteVersion, localVersion)
      // console.log(semver.diff(remoteVersion, localVersion))
      // console.log('version:', version, 'localVersion:', localVersion, 'remoteVersion:', remoteVersion, forceUpdate)
      global.remoteVersion = remoteVersion
      global.shouldUpdate = shouldUpdate
      resolve({ shouldUpdate, forceUpdate })
    }).catch(err => {
      console.log('获取版本信息失败:', err)
      reject(err)
    })
  })
}
