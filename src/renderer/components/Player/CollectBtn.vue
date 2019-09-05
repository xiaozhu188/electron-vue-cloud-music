<template>
  <div>
    <slot>
      <a-button
        icon="folder-add"
        :disabled="!!current_song.folder"
        @click="collect_playlist_visible = true"
      >收藏</a-button>
    </slot>
    <drap-modal centered title="新建歌单" v-model="create_playlist_visible">
      <playlist-create v-model="formData" />
      <div style="margin-top: 25px" slot="footer">
        <a-button type="primary" :disabled="formData.name === ''" @click="createAndAddToPlaylist">创建</a-button>
        <a-button @click="create_playlist_visible = false">取消</a-button>
      </div>
    </drap-modal>
    <drap-modal
      centered
      title="收藏到歌单"
      :footer="null"
      v-model="collect_playlist_visible"
      wrapClassName="collect-playlist-modal"
      :width="320"
      :bodyStyle="{padding:'15px'}"
    >
      <ul class="list">
        <li @click="create_playlist_visible = true" class="item">
          <div class="avatar">
            <a-icon type="plus" />
          </div>
          <div class="info">
            <div class="name">新建歌单</div>
          </div>
        </li>
        <li
          class="item"
          v-for="playlist in createdList"
          :key="playlist.id"
          @click="collectToPlaylist(playlist, current_song)"
        >
          <img v-lazy="`${playlist.coverImgUrl}?param=40y40`" class="avatar" />
          <div class="info">
            <div class="name">{{ playlist.name }}</div>
            <div class="trackCount">{{ playlist.trackCount }}首音乐</div>
          </div>
        </li>
      </ul>
    </drap-modal>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import DrapModal from '@/components/DrapModal/index.vue'
import PlaylistCreate from '@/components/Playlist/Create.vue'
import { addSongToList } from '@/api/user'
export default {
  data () {
    return {
      create_playlist_visible: false, // 新建歌单modal
      collect_playlist_visible: false, // 收藏到歌单modal
      formData: {
        name: '',
        privacy: false
      }
    }
  },
  computed: {
    ...mapGetters('play', [
      'current_song',
      'playing'
    ]),
    ...mapGetters('User', [
      'userId',
      'createdList',
      'likedsongIds'
    ])
  },
  components: {
    DrapModal, PlaylistCreate
  },
  methods: {
    // 收藏到歌单
    async collectToPlaylist (playlist, song) {
      let options = {
        op: 'add', tracks: song.id, pid: playlist.id
      }
      try {
        let { code, trackIds } = await addSongToList(options)

        trackIds = JSON.parse(trackIds)
        if (code === 200) {
          let likedsongIds = this.likedsongIds.slice()
          likedsongIds.unshift(...trackIds)
          this.$store.commit('User/SET_LIKEDSONG_IDS', likedsongIds)
          this.$message.success(`收藏到歌单 ${playlist.name} 成功!`)
          this.collect_playlist_visible = false
        }
      } catch (error) {
        this.$message.error(`收藏失败!`)
      }
    },
    // 新建并收藏到歌单
    createAndAddToPlaylist () {
      if (this.formData.name === '') return
      this.$store.dispatch('User/createPlaylist', this.formData).then(async (playlist) => {
        this.$message.success(`创建歌单 ${playlist.name} 成功!`)
        this.create_playlist_visible = false
        await this.collectToPlaylist(playlist, this.current_song)
        setTimeout(() => {
          this.$message.success(`添加歌曲 ${this.current_song.name} 到歌单 ${playlist.name} 成功!`)
          this.collect_playlist_visible = false
        }, 300)
      })
    }
  }
}
</script>

<style lang="less" scoped></style>
