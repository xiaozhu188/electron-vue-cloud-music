<template>
  <div class="page-video">
    <home-layout :topMenus="topMenus">
      <a-popover title="添加标签" trigger="click" placement="bottomLeft" overlayClassName="user-wrapper"
                 :overlayStyle="{ width: '530px', top: '50px' }" v-if="cates.length">
        <template slot="content">
          <div class="cate-area">
            <span class="cates">
              <span
                class="cate"
                :class="{'current' : cate.id == groupId}"
                v-for="cate in cates"
                :key="cate.id"
                @click="selectCate(cate)"
              >{{cate.name}}</span>
            </span>
          </div>
        </template>
        <a-button size="small" style="font-size: 12px;margin:12px 0;">
          {{currentCatename}}
          <a-icon type="down" style="font-size: 10px" />
        </a-button>
      </a-popover>

      <div style="display: flex;" v-if="cates.length">
        <span style="marginRight:3px;flex: 0 0 42px;">标签 : </span>
        <a-breadcrumb>
          <a-breadcrumb-item v-for="cate in top10cates" :key="cate.id">
            <a class="tag" @click="selectCate(cate)">{{cate.name}}</a>
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>

      <ul class="videos" v-if="videos.length">
        <li
          v-for="(video, index) in videos"
          class="video"
          :key="`${video.id}_${index}`"
        >
          <router-link :to="`/video/${video.id}`">
            <div class="media-wrap">
              <img v-lazy="video.avatar" class="avatar">
            </div>
            <div class="title">{{video.name}}</div>
          </router-link>
        </li>
      </ul>
      <p style="text-align:center;marginTop:15px" v-else>暂无推荐视频</p>
      <infinite-loading forceUseInfiniteWrapper=".ant-layout-content" :identifier="infiniteId" @infinite="loadmore"
                        v-if="userId" />
    </home-layout>
  </div>
</template>

<script>
import HomeLayout from '@/layouts/HomeLayout'
import videoItem from '@/components/Common/video-item'
import { getVideo, getVideoCates } from '@/api/video'
import { normalVideo } from '@/utils/video'
import { mapGetters } from 'vuex'

export default {
  name: 'videos',
  data () {
    return {
      videos: [],
      topMenus: [
        {
          title: '视频',
          href: '/video'
        },
        {
          title: 'MV',
          href: '/mv'
        }
      ],
      cateVisible: false,
      cates: [],
      groupId: 5100,
      infiniteId: +new Date(),
      selected: false
    }
  },
  computed: {
    ...mapGetters('User', [ 'userId' ]),
    top10cates () {
      return this.cates.slice(0, 10)
    },
    currentCatename () {
      return (this.cates.length && this.cates.find(cate => cate.id == this.groupId).name) || ''
    }
  },
  components: { HomeLayout, videoItem },
  activated () {
    this._getVideoCates()
    this.videos = []
    this.infiniteId += 1
  },
  beforeRouteLeave (to, from, next) {
    this.selected = false
    next()
  },
  methods: {
    async loadmore ($state) {
      try {
        let groupId = this.selected ? this.groupId : this.$route.query.groupId || this.groupId
        let res = await getVideo(groupId)
        $state.loaded()
        if ( res.datas.length || res.hasmore ) {
          res.datas.forEach(item => {
            this.videos.push(normalVideo(item.data))
          })
        } else {
          $state.complete()
        }
      } catch ( error ) {
        $state.error()
      }
    },
    async _getVideoCates () {
      let { data } = await getVideoCates()
      this.cates = data
    },
    selectCate (cate) {
      this.selected = true
      this.groupId = cate.id
      this.videos = []
      this.infiniteId += 1
    }
  }
}
</script>

<style lang="less" scoped>
  @import "./../../styles/mixins";

  .page-video {
    min-height: 100vh;
    .videos {
      .grid-layout(15px, 220px);
      padding: 15px 0;
      .video {
        .media-wrap {
          position: relative;
          padding-top: 56%;
          overflow: hidden;
          .avatar {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            background-size: contain;
            border: 1px solid #ddd;
          }
        }
        .title {
          font-size: 13px;
          color: #333;
        }
      }
    }
  }

  .cates {
    display: flex;
    flex-wrap: wrap;
    margin-top: 12px;
    .cate {
      display: inline-block;
      width: 20%;
      border: 1px solid #f3f5f7;
      line-height: 33px;
      text-align: center;
      font-size: 12px;
      cursor: pointer;
      &.current {
        background: @primary-color;
        color: #fff;
        border-color: @primary-color;
      }
    }
  }
</style>
<style>
  .user-wrapper .ant-popover-inner-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .user-wrapper .ant-popover-title {
    padding: 15px;
  }
</style>
