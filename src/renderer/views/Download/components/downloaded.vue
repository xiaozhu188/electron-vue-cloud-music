<template>
  <div class="downloaded">
    <a-card :bordered="false">
      <div slot="title">

        <a-button type="primary" icon="play-circle" @click="play(downloaded, 0)">播放全部</a-button>

        <span>
           存储目录：{{ defaultDownloadFolder }}
          <a href="#" @click="openDownloadFolder">打开目录</a>
        </span>
      </div>

      <track-list
        :columns="columns"
        :tracks="downloaded"
        :isShowActions="false"
        @dblclick="play">
        <template slot="time" slot-scope="{ row }">
          <span>{{ moment(row.createdAt).format('YYYY-MM-DD HH:mm') }}</span>
        </template>
        <template slot="size" slot-scope="{ row }">
          <span>{{ row.size | normalSize }}</span>
        </template>
        <template slot="actions" slot-scope="{ row }">
          <a-icon type="folder" title="打开所在文件夹" @click="openFileInFolder(row)" />
        </template>
      </track-list>
    </a-card>
  </div>
</template>

<script>
import fs from 'fs'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { shell, remote, ipcRenderer } from 'electron'
import { uniq } from '@/utils/calculate'
import TrackList from '@/components/Common/track-list/index.js'
import Loading from '@/components/Common/loading'
import moment from 'moment'
import { getUrl, generateName } from '@/utils/song'
const columns = [
  {
    title: '音乐标题',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name)
  },
  {
    title: '歌手',
    dataIndex: 'artist',
    key: 'artist',
    sorter: (a, b) => a.artist[0].name.localeCompare(b.artist[0].name)
  },
  {
    title: '专辑',
    dataIndex: 'album',
    key: 'album',
    sorter: (a, b) => a.album.name.localeCompare(b.album.name)
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    slot: 'size',
    sorter: (a, b) => a.size - b.size
  },
  {
    title: '下载时间',
    dataIndex: 'time',
    key: 'time',
    slot: 'time'
  },
  {
    title: '时长',
    dataIndex: 'duration',
    key: 'duration',
    sorter: (a, b) => a.duration - b.duration
  },
  {
    title: '操作',
    dataIndex: 'actions',
    key: 'actions',
    slot: 'actions',
    width: '50px'
  }
]
export default {
  data () {
    return {
      selectedFolder: [],
      columns,
      moment
    }
  },
  components: {
    TrackList,
    Loading
  },
  computed: {
    ...mapState('Localsong', ['localSongs']),
    ...mapState('Download', ['downloaded']),
    ...mapGetters('Setting', ['downloadSongsFolders']),
    defaultDownloadFolder () {
      return this.downloadSongsFolders[0]
    }
  },
  methods: {
    ...mapActions('Localsong', ['refresh', 'match']),
    ...mapMutations('Localsong', ['setExportFolders']),
    openDownloadFolder () {
      shell.showItemInFolder(this.defaultDownloadFolder)
    },
    play (tracks, index) {
      this.$store.dispatch('play/selectPlay', { tracks, index })
    },
    openFileInFolder (song) {
      let path = `${this.defaultDownloadFolder}\\${generateName(song)}`
      if (!fs.existsSync(path)) { // 文件不存在
        this.$message.error(`文件${path}不存在`)
        return
      }
      shell.showItemInFolder(path) // 打开文件所在文件夹
    }
  },
  mounted () {
    this.refresh(this.downloadSongsFolders)
  }
}
</script>

<style lang="less" scoped>
.downloaded {
  font-size: 12px;
  /deep/ .ant-card {
    background: transparent;
    .ant-card-head {
      font-size: 12px;
    }
  }
  /deep/ .ant-btn {
    height: 28px;
    line-height: 26px;
  }
  /deep/ .ant-card-body {
    padding: 0;
  }
}
</style>
