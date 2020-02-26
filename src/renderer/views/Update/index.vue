<template>
  <div class="update-win">
    <template v-if="!showDownload">
      <div class="title"> 发现新版本 <small v-if="remoteVersionFromApp">v{{ remoteVersionFromApp }}</small>
      </div>
      <div class="content">
        <div class="fixed" v-if="updateContent" v-html="updateContent"></div>
        <ul class="fixed" v-else>
          <li>1.提升了客户端的启动速度</li>
          <li>2.解决了已知的BUG</li>
        </ul>
        <div class="verson">
          <span>当前版本: v{{ localVersion }}</span>
          <span class="more" @click="goRoute">
            更多
            <a-icon type="right"></a-icon>
          </span>
        </div>
        <div class="content-footer">
          <div class="download-btn cancel" @click="close">暂不更新</div>
          <div class="download-btn" @click="download">立即下载</div>
        </div>
      </div>
    </template>
    <div class="download-wrapper" v-else>
      <div class="download-title" v-if="is_paused">暂停中</div>
      <div class="download-title" v-else>正在下载...</div>
      <div class="progress-bar">
        <a-progress size="small" :percent="state.percent" />
      </div>
      <div class="state" v-if="state.size">
        <div class="size">
          <span>{{ state.size.transferred | normalSize }}</span>
          <span>/</span>
          <span>{{ state.size.total | normalSize }}</span>
        </div>
        <div class="speed" v-if="state.speed">{{ state.speed | normalSize('K') }}/s</div>
      </div>
      <div class="actions">
        <span @click="resume" v-if="is_paused"><a-icon type="caret-right"></a-icon> 继续</span>
        <span @click="pause" v-else><a-icon type="pause"></a-icon> 暂停</span>
        <span @click="abort"><a-icon type="close"></a-icon> 取消</span>
      </div>
    </div>
    <a-icon type="close" class="close" @click="close"></a-icon>
    <a-icon type="minus" class="hide" @click="hide" />
  </div>
</template>

<script>
import { remote } from 'electron'
import { mapState } from 'vuex'
import { checkUpdate } from '@/api/app'

const fs = require('fs')
const path = require('path')
const request = require('request')
const progress = require('request-progress')
const showdown = require('showdown')

const getDownloadInfo = function (version) {
  const BASE_URL = 'https://github.com/xiaozhu188/electron-vue-cloud-music/releases/download'
  if ( process.platform === 'win32' ) {
    return {
      filename: `electron-vue-cloud-music-setup-${version}.exe`,
      url: `${BASE_URL}/v${version}/electron-vue-cloud-music-setup-${version}.exe`
    }
  } else if ( process.platform === 'linux' ) {
    return {
      filename: `${BASE_URL}/v${version}/electron-vue-cloud-music-${version}-x86_64.AppImage`,
      url: `${BASE_URL}/v${version}/electron-vue-cloud-music-${version}-x86_64.AppImage`
    }
  } else {
    return {
      filename: `electron-vue-cloud-music-${version}.dmg`,
      url: `${BASE_URL}/v${version}/electron-vue-cloud-music-${version}.dmg`
    }
  }
}
export default {
  data () {
    return {
      localVersion: remote.app.getVersion(),
      showDownload: false,
      state: {},
      $request: null,
      is_paused: false,
      is_abort: false,
      remoteVersionFromApp: this.$electron.remote.getGlobal('remoteVersion')
    }
  },
  computed: {
    ...mapState('Update', [ 'updateContent' ])
  },
  methods: {
    hide () {
      this.$electron.ipcRenderer.send('toggle-updatewin')
    },
    close () {
      this.$electron.ipcRenderer.send('close-updatewin')
    },
    goRoute () {
      remote.shell.openExternal(
        'https://github.com/xiaozhu188/electron-vue-cloud-music/releases'
      )
    },
    download () {
      remote.dialog.showOpenDialog(
        {
          title: '选择保存路径',
          defaultPath: remote.app.getPath('home'),
          properties: [ 'openDirectory' ]
        },
        dir => {
          if ( dir ) {
            if ( !dir && !dir.length ) {
              this.showDownload = false
              return
            }
            this.showDownload = true
            let saveDir = dir[ 0 ]
            let { filename, url } = getDownloadInfo(this.remoteVersionFromApp)
            console.log(filename, url)
            // const downloadUrl = url
            const downloadUrl = url
            const $request = request(downloadUrl)
            // console.log($request)
            const _progress = progress($request, {
              throttle: 1000
            })
              .on('progress', state => {
                this.handleProgress(state)
              })
              .on('error', err => {
                this.handleErr(err)
              })
              .on('end', () => {
                if ( this.is_abort ) return // 取消下载会触发end
                this.state.percent = 100
                this.$electron.ipcRenderer.send('quit-and-open', path.join(saveDir, filename))
              })
              .pipe(fs.createWriteStream(path.join(saveDir, filename)))

            this.$request = $request
          }
        }
      )
    },
    handleErr (err) {
      this.showDownload = false
      let networkNotification = new Notification('网易云音乐', {
        title: '网易云音乐',
        body: '下载失败:' + err,
        icon: 'images/icon.ico'
      })
    },
    handleProgress (state) {
      console.log(state)
      state.percent = Number(Math.round(state.percent * 100))
      this.state = state
    },
    pause () {
      this.is_paused = true
      this.$request.pause()
    },
    resume () {
      this.is_paused = false
      this.$request.resume()
    },
    abort () {
      this.state = {}
      this.showDownload = false
      this.is_abort = true
      this.$request.abort()
    }
  }
}
</script>

<style lang="less" scoped>
  .update-win {
    background: #f8f8f8 url("./../../assets/images/loginBg.jpg") top
      center/contain no-repeat;
    width: 330px;
    height: 410px;
    border-radius: 15px;
    padding-top: 180px;
    border: 1px solid #ddd;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    position: absolute;
    left: 5px;
    top: 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .close {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 11;
      font-size: 18px;
      color: rgba(0, 0, 0, .5);

      &:hover {
        color: rgba(0, 0, 0, 1);
        cursor: pointer;
      }
    }

    .hide {
      position: absolute;
      top: 15px;
      right: 45px;
      z-index: 11;
      font-size: 18px;
      color: rgba(0, 0, 0, .5);

      &:hover {
        color: rgba(0, 0, 0, 1);
        cursor: pointer;
      }
    }

    .fixed {
      color: rgba(0, 0, 0, 0.7);

      li {
        line-height: 28px;
      }
    }

    .title,
    .fixed {
      -webkit-app-region: drag;
    }

    .title {
      margin-bottom: 10px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      color: rgba(0, 0, 0, 1);
    }

    .content {
      width: 70%;
      margin: 0 auto;
      overflow: auto;
      .verson {
        display: flex;
        justify-content: space-between;
        color: rgba(0, 0, 0, 0.4);
        font-size: 12px;

        .more {
          -webkit-app-region: no-drag;
          color: rgba(0, 0, 0, 0.5);

          &:hover {
            color: rgba(0, 0, 0, 1);
            cursor: pointer;
          }
        }
      }

      .content-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .download-btn {
          width: 47%;
          margin-top: 20px;
          line-height: 34px;
          border-radius: 18px;
          background: linear-gradient(to right, #c72828, #ff2c2c);
          color: #fff;
          font-size: 14px;
          text-align: center;
          font-weight: 600;

          &:hover {
            opacity: 0.9;
            cursor: pointer;
          }

          &.cancel {
            color: #333;
            background: none;
            border: 1px solid #ddd;
          }
        }
      }
    }

    .download-wrapper {
      -webkit-app-region: drag;
      margin: 20px;
      width: 80%;
      margin: auto;

      .progress-bar {
        margin: 2px 0;
        -webkit-app-region: no-drag;

        /deep/ .ant-progress-bg {
          background-image: linear-gradient(to right, #52acff 0, #006fd6 100%);
        }

        /deep/ .ant-progress-inner {
          background: #e8e8e8;
        }
      }

      .download-title {
        font-size: 14px;
        line-height: 1;
      }

      .state {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: rgba(0, 0, 0.5);
      }

      .actions {
        text-align: center;
        margin-top: 20px;
        -webkit-app-region: no-drag;

        span {
          &:hover {
            color: rgba(0, 0, 0.9);
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
