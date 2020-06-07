<template>
  <ul :class="[{'bordered':bordered},'song-list']">
    <li
      class="song-item"
      v-for="(song, index) in tracks"
      :key="song.id"
      @click="onClick(tracks,index)"
    >
      <div class="item-index">{{index > 8 ? index + 1 : '0' + (index + 1)}}</div>
      <div class="item-avatar">
        <img v-lazy="song.avatar" class="avatar">
        <a-icon type="play-circle" class="icon"/>
      </div>
      <div class="info">
        <div class="name">
          <span>{{song.name}}</span>
          <small class="alias" v-if="song.alia && song.alia.length">{{song.alia[0]}}</small>
          <a-icon type="youtube" class="icon-mv" v-if="song.mvid && showMore"/>
        </div>
        <div v-if="!showMore">
          <span @click.stop="play(song.mvid)" title="查看MV" style="margin-right: 3px;" v-if="song.mvid">
            <a-icon type="youtube" class="icon-mv" />
          </span>
          <artists :artists="song.artist" @click.native.stop />
        </div>
      </div>
      <template v-if="showMore">
        <div class="extra-item artist">
          <artists :artists="song.artist"/>
        </div>
        <div class="extra-item album">{{song.album.name}}</div>
        <div class="extra-item duration">{{song.duration}}</div>
      </template>
    </li>
  </ul>
</template>

<script>
import videoPlayer from '@/mixins/videoPlayer'
import Artists from '@/components/Common/artists'

export default {
  name: 'song-item',
  mixins: [videoPlayer],
  props: {
    bordered: { type: Boolean, default: false },
    showMore: { type: Boolean, default: false },
    tracks: {
      type: Array,
      default () {
        return []
      }
    }
  },
  components: {
    Artists
  },
  methods: {
    onClick (song, index) {
      this.$emit('onclick', song, index)
    }
  }
}
</script>

<style lang="less" scoped>
.song-list {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: inherit;
  &.bordered {
    border: 1px solid #eee;
  }
  .song-item {
    width: 50%;
    height: 20%;
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    background-color: #eee;
    &:nth-child(n + 6) {
      border-left: 1px solid #eee;
    }
    &:nth-child(even) {
      background-color: #f3f5f7;
    }
    &:hover {
      background-color: #ddd;
    }
    .icon-mv {
      color: @primary-color;
      font-size: 15px;
      cursor: pointer;
    }
    .item-index {
      width: 25px;
      flex: 0 0 25px;
    }
    .item-avatar {
      position: relative;
      width: 44px;
      height: 44px;
      flex: 0 0 44px;
      .avatar {
        width: 100%;
        height: 100%;
      }
      .icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: rgba(255, 255, 255, 0.5);
        font-size: 24px;
      }
    }
    .info {
      flex: 1;
      overflow: hidden;
      padding-left: 10px;
      color: #000;
      font-size: 13px;
      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      small {
        color: #999;
      }
    }
    .extra-item {
      flex: 1;
      padding: 0 5px;
      &.duration {
        flex: 0 0 50px;
        width: 50px;
      }
      &.artist {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
