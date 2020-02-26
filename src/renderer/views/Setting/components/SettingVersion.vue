<template>
  <setting-item label="关于云音乐">
    <div @click="checkVersion">
      <span>当前版本：{{ localVersion }}</span>
      <span v-if="remoteVersion">远程版本：{{ remoteVersion }}</span>
      <a-button :loading="loading" size="small">检查更新</a-button>
    </div>
  </setting-item>
</template>
<script>
import SettingItem from './SettingItem.vue'
import { mapGetters, mapMutations } from 'vuex'
import { remote } from 'electron'
import { checkUpdate } from '@/api/app'
import semver from 'semver'

const showdown = require('showdown')
const { dialog } = remote
export default {
  data () {
    return {
      localVersion: remote.app.getVersion(),
      remoteVersion: '',
      loading: false,
      updateContent: '',
      converter: new showdown.Converter()
    }
  },
  components: {
    SettingItem
  },
  computed: {
    ...mapGetters('Setting', [ 'downloadSongsFolders' ]),
    defaultDownloadFolder () {
      return this.downloadSongsFolders[ 0 ]
    }
  },
  methods: {
    ...mapMutations('Setting', [ 'mutateState' ]),
    checkVersion () {
      this.loading = true
      checkUpdate().then(res => {
        let data = res.data
        this.remoteVersion = data.name
        this.$store.commit('Update/SET_UPDATE_CONTENT', this.converter.makeHtml(data.body))
        this.$electron.ipcRenderer.send('update-version', this.remoteVersion)
        let shouldUpdate = semver.gt(this.remoteVersion, this.localVersion)
        if ( shouldUpdate ) {
          this.$electron.ipcRenderer.send('toggle-updatewin')
        } else {
          this.$message.warn('暂无更新')
        }
      }).catch(() => {
        this.$message.error('获取版本号失败')
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
