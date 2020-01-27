<template>
  <home-layout>
    <div class="page-dj">
      <div class="banners">
        <slider ref="slider" :height="width*0.251" :list="banners" @sliderClick="onSliderClick" />
      </div>
      <div class="cates">
        <ul class="list">
          <router-link
            tag="li"
            :to="`/dj-recommend?id=${item.id}`"
            class="item"
            v-for="item in categories"
            :key="item.id"
          >
            <div class="icon">
              <img :src="item.picMacUrl" class="img" />
            </div>
            <div class="name">{{item.name}}</div>
          </router-link>
        </ul>
      </div>
      <div class="channel">
        <h5 class="title">
          <span>推荐电台</span>
        </h5>
        <ul class="list">
          <router-link
            tag="li"
            :to="'/dj/'+item.id"
            class="item"
            v-for="(item,index) in djList"
            :key="index"
          >
            <div class="icon">
              <img class="avatar" v-lazy="`${item.picUrl}?param=180y180`" :key="item.picUrl" />
              <span class="icon-play"></span>
            </div>
            <div class="name">
              <div class="text">{{item.name}}-{{item.id}}</div>
              <div class="desc">{{item.rcmdtext}}</div>
            </div>
          </router-link>
        </ul>
      </div>

      <template v-if="programs">
        <div class="channel" v-for="(program, index) in programs" :key="index">
          <h5 class="title">
            <span>{{ titles[index].name }}</span>
            <router-link :to="`/dj-recommend?id=${titles[index].id}`" class="more">更多
              <a-icon type="right" />
            </router-link>
          </h5>
          <ul class="list">
            <router-link
              tag="li"
              :to="'/dj/'+item.id"
              class="item"
              v-for="(item,index) in program.djRadios.slice(0, 5)"
              :key="index"
            >
              <div class="icon">
                <img class="avatar" v-lazy="`${item.picUrl}?param=180y180`" :key="item.picUrl" />
                <span class="icon-play"></span>
              </div>
              <div class="name">
                <div class="text">{{item.name}}</div>
                <div class="desc">{{item.rcmdtext}}</div>
              </div>
            </router-link>
          </ul>
        </div>
      </template>
    </div>
  </home-layout>
</template>

<script>
import Slider from '@/components/Slider'
import HomeLayout from '@/layouts/HomeLayout'
import {
  getDjBanner,
  getDjCatelist,
  getDjRecommend,
  getDjCatelistRecommend,
  getDjPerfered,
  getProgramRecommend,
  getDjByCate
} from '@/api/dj'

export default {
  data () {
    return {
      width: 1000,
      banners: [],
      categories: [],
      recommends: [],
      djList: [],
      programs: [],
      titles: []
    }
  },
  components: {
    HomeLayout,
    Slider
  },
  deactivated () {
    this.$refs.slider.pause()
    window.removeEventListener('resize', this.handleResize)
  },
  mounted () {
    this.$nextTick(() => {
      var dom = this.$refs.slider.$el.parentNode
      this.width = dom.clientWidth || 1000
    })
    window.addEventListener('resize', this.handleResize)
  },
  created () {
    this._getDjBanner()
    this._getDjRecommend()
    this._getDjCate()
  },
  methods: {
    handleResize () {
      this.$nextTick(() => {
        var dom = this.$refs.slider.$el.parentNode
        this.width = dom.clientWidth
      })
    },
    _getDjCate () {
      let promises = []
      getDjCatelist().then(res => {
        this.categories = res.categories
        let cates = this.categories.slice(0, 5)
        for ( let i = 0; i < cates.length; i++ ) {
          this.titles.push({
            id: cates[ i ].id,
            name: cates[ i ].name
          })
          promises.push(getDjByCate({ type: cates[ i ].id }))
        }
        Promise.all(promises).then(res => {
          this.programs = Object.freeze(res)
        })
      })
    },
    _getDjByCate (type) {
      getDjByCate({ type }).then(res => {
        this.djList = res.djRadios
        console.log(this.djList)
      })
    },
    async _getDjBanner () {
      let { data } = await getDjBanner()
      this.banners = data.map(item => {
        return {
          src: item.pic,
          titleColor: '#c62f2f',
          typeTitle: item.typeTitle,
          url: item.url
        }
      })
    },
    async _getDjCatelist () {
      let { categories } = await getDjCatelist()
      this.categories = categories
    },
    async _getDjRecommend () {
      let { djRadios } = await getDjRecommend()
      // let { data } = await getDjCatelistRecommend()
      // await getDjPerfered()
      // await getProgramRecommend()
      this.djList = djRadios.slice(0, 5)
    },
    onSliderClick (i, item) {
      if ( item.url ) {
        this.$electron.remote.shell.openExternal(item.url)
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .page-dj {
    padding-top: 20px;
  }

  .cates {
    .list {
      overflow: hidden;
      .item {
        display: inline-block;
        width: 10%;
        margin: 20px 0 0;
        text-align: center;
        overflow: hidden;
        border-radius: 6px;
        &:hover {
          background-color: #f3f5f9;
          cursor: pointer;
          color: @primary-color;
          .img {
            margin-left: -48px;
          }
        }
        .icon {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 48px;
          overflow: hidden;
          display: inline-block;
          .img {
            position: absolute;
            left: 0;
            top: 0;
            width: 96px;
            transition: all 0.2s;
          }
        }
        .name {
          font-size: 12px;
          line-height: 20px;
        }
      }
    }
  }

  .channel {
    margin-top: 20px;
    .title {
      display: flex;
      justify-content: space-between;
      line-height: 40px;
      font-size: 18px;
      border-bottom: 1px solid rgba(47, 47, 47, 0.1);
      .more {
        float: right;
        color: #666;
        font-size: 13px;
      }
    }
    .list {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .item {
        position: relative;
        width: 19%;
        margin-bottom: 10px;
        overflow: hidden;
        cursor: pointer;
        .icon {
          position: relative;
          .icon-play {
            position: absolute;
            right: 10px;
            bottom: 10px;
            padding: 5px;
            border: 1px solid #fff;
            border-radius: 50%;
            font-size: 12px;
            color: #fff;
            opacity: 0.85;
          }
          .avatar {
            width: 100%;
            display: block;
          }
        }
        .name {
          flex: 1;
          line-height: 22px;
          .text {
            margin: 4px 0;
            color: #111;
          }
          .singer,
          .desc {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
