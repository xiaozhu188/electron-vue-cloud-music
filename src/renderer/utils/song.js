import { getLyric, getSongUrl, getIntelligence } from '@/api/song'

// param图片宽高
export function normalSong (song, param = '200y200') {
  let avatar = (song.album && (song.album.picUrl || song.album.artist.img1v1Url)) || (song.al && song.al.picUrl) || 'static/images/default_album.jpg'
  return {
    id: song.id,
    name: song.name,
    duration: song.duration / 1000 || song.dt / 1000,
    album: song.album || song.al,
    alia: song.alias || song.alia,
    artist: song.artists || song.ar,
    avatar: `${avatar}?param=${param}`,
    lyric: '',
    url: '',
    mvid: song.mvid || song.mv || '',
    hot: 90,
    isFm: false
  }
}

export async function getUrl (id) {
  try {
    let songUrl = ''
    let res = await getSongUrl(id)
    if (!res.data || !res.data.length) {
      songUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`
    } else if (res.data[0].url) {
      songUrl = res.data[0].url
    }
    return songUrl
  } catch (error) {
    console.log(error)
    return ''
  }
}

export function generateName (song) {
  let artistStr = song.artist.map(item => item.name).join(',').trim()
  return `${artistStr} - ${song.name}.mp3`
}

/*
class Song {
  constructor(song) {
    this.id = song.id;
    this.name = song.name;
    this.duration = song.duration / 1000 || song.dt / 1000;
    this.album = song.album || song.al;
    this.alia = song.alia;
    this.artist = song.artist || song.ar;
    this.lyric = '';
    this.url = '';
    this.methods = this.getSongUrl;
  }

  /!*getLyric() {
    return new Promise((resolve, reject) => {
      getLyric(this.id).then(res => {
        if (res.code === 200) {
          let lyric = ''
          if (res.nolyric) {
            lyric = '[00:00.000] 暂无歌词'
          } else {
            lyric = res.lrc.lyric
          }
          resolve(lyric)
        } else {
          reject('获取歌词失败!')
        }
      })
    })
  }

  getSongUrl() {
    return new Promise((resolve, reject) => {
      getSongUrl(this.id).then(res => {
        if (res.code === 200) {
          let url = ''
          if (!res.data || !res.data.length) {
            url = `https://music.163.com/song/media/outer/url?id=${track.id}.mp3`
          } else {
            url = res.data[0].url
          }
          if (url) {
            resolve(url)
          } else {
            reject('获取音频失败!')
          }
        } else {
          reject('获取音频失败!')
        }
      })
    })

  }*!/
}

export function normalSong(song) {
  return new Song(song)
} */
