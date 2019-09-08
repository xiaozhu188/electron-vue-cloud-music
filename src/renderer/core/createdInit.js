import store from '@/store'
import config from '@/config/defaultSettings'
import ls from 'store'
import { remote } from 'electron'
const mm = require('music-metadata')
const uuid = require('uuid/v1')
const fs = require('fs')
const path = require('path')

export default function Initializer () {
  store.commit('App/CHANGE_COLOR', ls.get('DEFAULT_COLOR', config.primaryColor))
  window.ondragenter = (event) => {
    event.preventDefault()
  }
  window.ondragover = (event) => {
    event.preventDefault()
  }
  window.ondrop = disableDrag

  this.$on('hook:destroyed', () => {
    window.ondragenter = null
    window.ondragover = null
    window.ondrop = null
  })

  function bufferToBase64 (buffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    for (var len = bytes.byteLength, i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return 'data:image/jpg;base64,' + window.btoa(binary)
  }

  function getStat (path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err) {
          resolve(false)
        } else {
          resolve(stats)
        }
      })
    })
  }

  function mkdir (dir) {
    return new Promise((resolve, reject) => {
      fs.mkdir(dir, err => {
        if (err) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  let userData = remote.app.getPath('userData')
  async function disableDrag (event) {
    event.preventDefault()
    try {
      let efile = event.dataTransfer
      let songs = []
      for (let file of efile.files) {
        let file_name = file.name
        let path = file.path
        let picture
        if (file_name.endsWith('.mp3')) {
          const metadata = await mm.parseFile(path)
          if (metadata.common.picture && metadata.common.picture[0]) {
            // let picture = arrayBufferToBase64(metadata.common.picture[0].data)
            let savePath = `${userData}/img`
            let isExists = await getStat(savePath)
            if (isExists && isExists.isDirectory()) {
              picture = `${savePath}/${file_name}.jpg`
              fs.writeFile(picture, metadata.common.picture[0].data, (err) => {
                if (!err) {
                  console.log(`图片${file_name}.jpg 保存成功!`)
                } else {
                  console.log(`图片${file_name}.jpg 保存失败!`)
                }
              })
            } else {
              await mkdir(savePath)
            }
          }
          const songItem = {
            id: uuid(),
            name: file_name.substring(0, file_name.lastIndexOf('.')),
            avatar: 'static/images/default_album.jpg',
            album: {
              name: metadata.common.album || '未知专辑'
            },
            artist: metadata.common.artists
              ? metadata.common.artists.map(item => {
                return {
                  id: uuid(),
                  name: item
                }
              })
              : [{
                id: uuid(),
                name: '未知歌手'
              }],
            duration: parseInt(metadata.format.duration) || 0,
            url: path,
            folder: path,
            size: file.size,
            picture
          }
          songs.push(songItem)
        }
      }
      store.dispatch('play/selectPlay', {tracks: songs, index: 0})
    } catch (error) {
      console.log('error')
    }
  }
}
