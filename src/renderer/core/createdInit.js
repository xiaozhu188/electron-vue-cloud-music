import store from '@/store'
import config from '@/config/defaultSettings'
import ls from 'store'
import { remote, ipcRenderer } from 'electron'
const mm = require('music-metadata')
const uuid = require('uuid/v1')
const fs = require('fs')
const path = require('path')

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

function writeFile (picture, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(picture, data, function (err) {
      if (err) reject(err)
      resolve(picture)
    })
  })
}

function normalLocalSong ({ songname, picture, metadata, filePath, size }) {
  return {
    id: uuid(),
    name: songname,
    avatar: picture || 'images/default_album.jpg',
    album: {
      name: metadata.common.album || '未知专辑'
    },
    artist: metadata.common.artists
      ? metadata.common.artists.map(item => { return { name: item } })
      : [],
    duration: parseInt(metadata.format.duration) || 0,
    url: filePath,
    folder: filePath,
    size: size
  }
}

const userData = remote.app.getPath('userData')
const savePath = `${userData}/OpenFilesPicture`

export default function Initializer () {
  store.commit('App/CHANGE_COLOR', ls.get('DEFAULT_COLOR', config.primaryColor))
  // 处理以拖动文件到快捷图标的方式启动客户端
  const startArgv = remote.getGlobal('argv')
  if (startArgv.length > 1) {
    handleWillOpenFiles(startArgv)
  }

  window.ondragenter = (event) => {
    event.preventDefault()
  }
  window.ondragover = (event) => {
    event.preventDefault()
  }
  window.ondrop = openFilesOndrop
  // 处理拖动文件到主界面
  async function openFilesOndrop (event) {
    event.preventDefault()
    try {
      let efile = event.dataTransfer
      let songs = []
      for (let file of efile.files) {
        let filename = file.name
        if (!filename.endsWith('.mp3')) return
        let filePath = file.path
        let picture
        const songname = filename.substring(0, filename.lastIndexOf('.'))
        const metadata = await mm.parseFile(filePath)
        picture = await handlePicture(metadata, songname)
        songs.push(normalLocalSong({ songname, picture, metadata, filePath, size: file.size }))
      }
      if (songs.length) {
        store.dispatch('play/selectPlay', { tracks: songs, index: 0 })
      }
    } catch (error) {
      console.log(error)
    }
  }
  // 客户端已经打开,处理以拖动文件到快捷图标的方式启动客户端
  ipcRenderer.on('open-files', async (event, args) => {
    console.log('open-files', args)
    let { argv } = args
    handleWillOpenFiles(argv)
  })
}

async function handleWillOpenFiles (argv) {
  let songs = []
  for (let i = 0; i < argv.length; i++) {
    let picture
    const filePath = argv[i]
    const lastIndex = filePath.lastIndexOf('\\')
    const filename = filePath.substring(lastIndex + 1)
    if (!filename.endsWith('.mp3')) continue
    const songname = filename.substring(0, filename.lastIndexOf('.'))
    const stat = fs.statSync(filePath)
    const metadata = await mm.parseFile(filePath)
    picture = await handlePicture(metadata, songname)
    songs.push(normalLocalSong({ songname, picture, metadata, filePath, size: stat.size }))
  }
  if (songs.length) {
    store.dispatch('play/selectPlay', { tracks: songs, index: 0 })
  }
}

// 处理解析结果是否有二进制图片
async function handlePicture (metadata, songname) {
  if (metadata.common.picture && metadata.common.picture[0]) {
    try {
      let isExists = await getStat(savePath)
      if (!isExists || !isExists.isDirectory()) {
        await mkdir(savePath)
      }
      let picture = `${savePath}/${songname}.jpg`
      await writeFile(picture, metadata.common.picture[0].data)
      return picture
    } catch (error) {
      return error
    }
  }
}
