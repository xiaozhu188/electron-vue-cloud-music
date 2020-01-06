<template>
  <setting-item label="歌曲下载目录">
    <div title="更改目录">
      <a-icon type="folder" style="margin-right: 5px" />
      <span>{{ defaultDownloadFolder }}</span>
      <a-button size="small" @click="select">更改目录</a-button>
      <a-button size="small" @click="reset">恢复默认</a-button>
    </div>
  </setting-item>
</template>
<script>
import SettingItem from './SettingItem.vue'
import { mapGetters, mapMutations } from 'vuex'
import { remote } from 'electron'

const { dialog } = remote

export default {
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
    select () {
      dialog.showOpenDialog(
        {
          properties: [ 'openDirectory' ]
        },
        filePaths => {
          if ( filePaths && filePaths.length ) {
            this.mutateState({
              downloadSongsFolders: filePaths
            })
          }
        }
      )
    },
    reset () {
      let folder = [ `${remote.app.getPath('music')}` ]
      this.mutateState({
        downloadSongsFolders: folder
      })
    }
  }
}
</script>
