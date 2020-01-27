<template>
  <div>
    <transition name="track-list">
      <div class="track-list" v-if="songs.length">
        <div v-if="isShowHead">
          <slot name="header" v-if="$slots && $slots.header"></slot>
          <div class="track-list-header" v-else>
            <div class="col-item col-index" v-if="isShowPlaying"></div>
            <div class="col-item col-actions" v-if="isShowActions">操作</div>
            <div
              v-for="col in currentColumns"
              :key="col.key"
              class="col-item"
              :class="[{'col-duration' : col.key === 'duration'},{'col-has-sorter' : col.sorter}]"
              :style="col.width ? `width: ${col.width};flex: 0 0 ${col.width}` : ''"
              @click="sortSongs(col)"
            >
              <span class="col-title">{{ col.title }}</span>
              <span class="sort-icons" v-show="col.sorter">
                <a-icon type="caret-up" v-if="col.rule===0" :key="col.key" />
                <a-icon type="caret-down" v-else-if="col.rule===1" :key="col.key" />
                <span class="col-sorter" v-else :key="col.key">
                  <a-icon type="caret-up" class="col-sorter-up" />
                  <a-icon type="caret-down" class="col-sorter-down" />
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="track-list-body">
          <ul class="song-list">
            <li
              v-for="(row, rowIndex) in songs"
              :key="rowIndex"
              :class="{'gray' : row.matched === false}"
              @dblclick="onRowdblclick(songs, rowIndex)"
            >
              <a-dropdown :trigger="['contextmenu']" overlayClassName="sider-right-menu">
                <div class="song-item">
                  <div class="col-item col-index" v-if="isShowPlaying">
                    <playing :playing="playing" v-if="current_song.id === row.id && source" />
                    <span v-else>{{ rowIndex > 8 ? rowIndex + 1 : '0' + (rowIndex + 1) }}</span>
                  </div>
                  <div class="col-item col-actions" v-if="isShowActions">
                    <song-heart
                      :disable = "row.songHeartDisable"
                      :isLiked="likedsongIds.includes(row.id)"
                      @heartClick="(isLike) => {_handleLikeSong(row, { songId: row.id, isLike })}"
                    />

                    <template v-if="downloaded.findIndex(item => item.id === row.id) >= 0">
                      <a-icon
                        type="check-circle"
                        theme="filled"
                        class="icon-downloaded"
                        title="已下载"
                      />
                    </template>
                    <template v-else>
                      <a-icon
                        type="clock-circle"
                        class="icon-waitting"
                        v-if="queueIds.includes(row.id) && !row.downloadPercent"
                      />
                      <a-progress
                        type="circle"
                        :width="20"
                        :percent="row.downloadPercent"
                        v-else-if="queueIds.includes(row.id) && row.downloadPercent > 0"
                      />
                      <z-icon type="download" @click.native="download(row)" v-else />
                    </template>
                  </div>
                  <div
                    v-for="col in currentColumns"
                    :key="col.key"
                    class="col-item"
                    :class="{'col-duration' : col.key === 'duration'}"
                    :style="col.width ? `width: ${col.width};flex: 0 0 ${col.width}` : ''"
                  >
                    <div class="ellipsis">
                      <slot
                        :row="row"
                        :column="col"
                        :ke="col.key"
                        :index="rowIndex"
                        :name="col.slot"
                        v-if="'slot' in col"
                      >
                        <default-component :row="row" :col="col" />
                      </slot>
                      <component
                        :is="componentNames[col.key] || 'DefaultComponent'"
                        :row="row"
                        :col="col"
                        v-else
                      >
                      </component>
                    </div>
                  </div>
                  <div class="col-lyric" v-if="row.lyrics">
                    <slot name="lyric" :row="row"></slot>
                  </div>
                </div>
                <a-menu slot="overlay">
                  <a-menu-item key="0">
                    <div @click="play(rowIndex)">
                      <a-icon type="play-circle" />
                      <span>播放</span>
                    </div>
                  </a-menu-item>
                  <a-menu-item key="2">
                    <div @click="nextPlay(row)">
                      <z-icon type="next-play" />
                      <span>下一首播放</span>
                    </div>
                  </a-menu-item>
                  <a-sub-menu key="1">
                    <template slot="title">
                      <a-icon type="folder-add" />
                      <span>收藏到歌单</span>
                    </template>
                    <a-menu-item key="1-1">
                      <div @click="showModal(row)">
                        <a-icon type="plus-circle" />
                        <span>新建歌单</span>
                      </div>
                    </a-menu-item>
                    <a-menu-item v-for="playlist in createdList" :key="playlist.id">
                      <div @click="collectToPlaylist(playlist, row)">
                        <z-icon type="yinleliebiaokuai" />
                        <span>{{ playlist.name }}</span>
                      </div>
                    </a-menu-item>
                  </a-sub-menu>
                </a-menu>
              </a-dropdown>
            </li>
          </ul>
        </div>
      </div>
    </transition>
    <div v-if="!songs.length" class="no-result">暂无歌曲</div>
    <drap-modal
      centered
      title="新建歌单"
      okText="创建"
      :width="300"
      :maskClosable="false"
      v-model="visible"
      @ok="createAndAddToPlaylist"
    >
      <playlist-create v-model="formData" />
    </drap-modal>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import cloneDeep from 'loadsh/cloneDeep'
import ZIcon from '@/components/ZIcon'
import Artists from '@/components/Common/artists'
import Playing from '@/components/Common/playing'
import Loading from '@/components/Common/loading'
import SongHeart from '@/components/Common/song-heart'

import Artist from './base/artist'
import Album from './base/album'
import Duration from './base/duration'
import SongName from './base/songName'
import DefaultComponent from './base/default'
import ContextMenu from './base/contextMenu'

import DrapModal from '@/components/DrapModal/index.vue'
import PlaylistCreate from '@/components/Playlist/Create.vue'

import { ipcRenderer } from 'electron'
import { addSongToList } from '@/api/user'
import throttle from 'lodash/throttle'

function sortSongs ({ songs, col, rule = 0 }) {
  const key = col.key
  let ret = songs.sort(col.sorter)
  return rule == 0 ? ret : songs.reverse()
}

export default {
  name: 'tracklist',
  props: {
    columns: {
      type: Array,
      default () {
        return [
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
            title: '时长',
            dataIndex: 'duration',
            key: 'duration',
            sorter: (a, b) => a.duration - b.duration
          }
        ]
      }
    },
    tracks: {
      type: Array,
      default () {
        return []
      }
    },
    isShowHead: {
      type: Boolean,
      default: true
    },
    isShowActions: {
      type: Boolean,
      default: true
    },
    isShowPlaying: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      songs: JSON.parse(JSON.stringify(this.tracks)),
      componentNames: {
        artist: 'Artist',
        album: 'Album',
        duration: 'Duration',
        name: 'SongName'
      },
      currentColumns: cloneDeep(this.columns),
      visible: false,
      formData: {
        name: '',
        privacy: false
      }
    }
  },
  components: {
    ZIcon,
    Playing,
    Artists,
    Artist,
    Album,
    Duration,
    SongName,
    ContextMenu,
    DefaultComponent,
    Loading,
    SongHeart,
    DrapModal,
    PlaylistCreate
  },
  computed: {
    ...mapState('Download', ['downloading', 'downloaded', 'queue']),
    ...mapGetters('Download', ['queueIds']),
    ...mapGetters('play', [
      'playing',
      'current_play_list',
      'current_song',
      'current_song_index',
      'source'
    ]),
    ...mapGetters('User', ['userId', 'likedsongIds', 'createdList'])
  },
  watch: {
    tracks (newTranck) {
      if (newTranck) {
        this.currentColumns = cloneDeep(this.columns)
        this.songs = JSON.parse(JSON.stringify(newTranck))
        this.cacheSongs = JSON.parse(JSON.stringify(newTranck))
      }
    }
  },
  activated () {
    this.$store.state.App.isOnliline && this._getUserLikelist(this.userId)
  },
  created () {
    ipcRenderer.on(
      'download-onProgress',
      throttle((event, data) => {
        let { id, progress } = data
        let song = this.songs.find(song => song.id === id)
        if (!song) return
        // this.$set(song, 'isWaitting', true)
        this.$set(song, 'downloadPercent', parseInt(progress))
      }, 1000, { trailing: true })
    )
  },
  methods: {
    ...mapActions('User', ['getUserLikedSongs', 'handleLikeSong']),
    sortSongs (col) {
      const songs = this.cacheSongs.slice()
      col.num = col.num || 0
      let rule = col.num % 3
      this.$set(col, 'rule', rule)
      if (rule === 2) {
        // 还原
        this.songs = this.cacheSongs.slice()
      } else {
        this.songs = sortSongs({ songs, col, rule })
      }
      col.num++
    },
    resetCurrentIndex (list, current_song) {
      let index = list.findIndex(item => {
        return item.id === current_song.id
      })
      this.$store.commit('play/SET_CURRENT_INDEX', index)
    },
    onRowdblclick (songs, rowIndex) {
      this.$emit('dblclick', songs, rowIndex)
    },
    play (rowIndex) {
      this.$store.dispatch('play/selectPlay', {
        tracks: this.songs,
        index: rowIndex
      })
    },
    nextPlay (song) {
      this.$store.dispatch('play/nextPlay', song)
    },
    async collectToPlaylist (playlist, song) {
      let options = {
        op: 'add',
        tracks: song.id,
        pid: playlist.id
      }
      let { code, trackIds } = await addSongToList(options)
      trackIds = JSON.parse(trackIds)
      if (code === 200) {
        this.$message.success('添加成功!')
        let likedsongIds = this.likedsongIds.slice()
        likedsongIds.unshift(...trackIds)
        this.$store.commit('User/SET_LIKEDSONG_IDS', likedsongIds)
      }
    },
    createAndAddToPlaylist () {
      if (this.formData.name === '') return
      this.$store
        .dispatch('User/createPlaylist', this.formData)
        .then(async playlist => {
          this.$message.success(`创建歌单 ${playlist.name} 成功!`)
          await this.collectToPlaylist(playlist, this.targetSong)
          setTimeout(() => {
            this.$message.success(
              `添加歌曲 ${this.targetSong.name} 到歌单 ${playlist.name} 成功!`
            )
            this.visible = false
          }, 300)
        })
    },
    showModal (row) {
      this.visible = true
      this.targetSong = row
    },
    _getUserLikelist (userId) {
      this.getUserLikedSongs()
    },
    _handleLikeSong (row, { songId, isLike }) {
      this.$set(row, 'songHeartDisable', true)
      this.handleLikeSong({ songId, isLike }).then(() => {
        this.$set(row, 'songHeartDisable', false)
      })
    },
    download (song) {
      // this.$set(song, 'isWaitting', true)
      this.$store.dispatch('Download/adddownloadQueue', [song])
    }
  }
}
</script>

<style lang='less' scoped>
.col-sorter {
  position: absolute;
  right: 0;
  top: 50%;
  width: 14px;
  height: 17px;
  margin-top: -8.5px;
  text-align: center;
  color: #bfbfbf;
  .col-sorter-up,
  .col-sorter-down {
    display: inline-block;
    font-size: 12px;
    font-size: 11px \9;
    transform: scale(0.91666667) rotate(0deg);
    line-height: 4px;
    height: 4px;
    transition: all 0.3s;
    display: block;
  }
  .col-sorter-down {
    margin-top: 4px;
  }
}
.no-result {
  margin: 15px 0;
  text-align: center;
}
.track-list {
  font-family: "Microsoft JhengHei", "\660E\9ED1", Arial, Helvetica;
  .col-item {
    flex: 2;
    padding: 0 5px;
  }
  .col-index {
    justify-content: flex-end;
    flex: 0 0 40px !important;
    font-size: 13px;
  }
  .col-lyric {
    flex: 0 0 100%;
  }
  .col-actions {
    flex: 0 0 60px !important;
  }
  .col-duration {
    flex: 0 0 80px !important;
  }
  .track-list-header {
    display: flex;
    line-height: 34px;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    .col-item {
      display: flex;
      justify-content: space-between;
      &:not(:last-child) {
        border-right: 1px solid #ddd;
      }
      &.col-has-sorter:hover {
        background: #eaeaea;
      }
    }
  }
  .track-list-body {
    .song-list {
      cursor: auto;
      user-select: none;
      background: #fafafa;
      li {
        color: #333;
        &.gray {
          color: rgba(0, 0, 0, 0.4);
        }
        &:nth-child(even) {
          background: #f3f5f7;
        }
        &:focus {
          background: #000;
        }
        &:hover {
          background: #eee;
        }
      }
      .song-item {
        display: flex;
        flex-wrap: wrap;
        line-height: 32px;
        font-size: 14px;
        .col-item {
          display: flex;
          align-items: center;
          padding: 0 5px;
          overflow: hidden;
          .ellipsis {
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
          &.col-actions {
            justify-content: space-evenly;
            font-size: 17px;
            /deep/ .ant-progress-circle .ant-progress-text {
              padding: 0;
            }
            /deep/ .ant-progress {
              .anticon {
                color: #52c41a;
              }
            }
            /deep/ .anticon {
              cursor: pointer;
              color: #999;
              &.icon-downloaded {
                color: #42a5f5;
                &:hover {
                  color: #42a5f5;
                }
              }
              &:hover {
                color: #111;
              }
            }
            .anticon-check {
              margin-left: -1px;
            }
            /deep/ .ant-progress-circle-trail {
              stroke: rgba(0, 0, 0, 0.1);
            }
            .ant-progress {
              vertical-align: top;
            }
          }
          a {
            color: #333;
          }
        }
      }
    }
  }
}
.col-item {
  &:hover .sort-icons {
    display: inline-block;
  }
}
.sort-icons {
  position: relative;
  color: #bfbfbf;
  display: none;
}
</style>
