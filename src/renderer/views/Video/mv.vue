<template>
  <div>
    <home-layout :topMenus="topMenus">
      <tags useHoverHighlight :tags="area" @change="onAreaChange" />
      <tags useHoverHighlight :tags="mvType" @change="onTypeChange" />
      <tags useHoverHighlight :tags="mvOrder" @change="onOrderChange" />
      <ul class="mvs">
        <li v-for="(mv, index) in mvs" :key="`${mv.id}_${index}`">
          <mv-item :mv="mv" />
        </li>
      </ul>
      <infinite-loading :identifier="infiniteId" @infinite="loadmore" />
    </home-layout>
  </div>
</template>

<script>
import HomeLayout from '@/layouts/HomeLayout'
import mvItem from '@/components/Common/mv-item'
import tags from '@/components/Common/tags'
import { getAllMV } from '@/api/mv'
import { normalMV } from '@/utils/video'

let area = {
  '地区': [
    {
      id: 1,
      name: '全部'
    },
    {
      id: 2,
      name: '内地'
    },
    {
      id: 3,
      name: '港台'
    },
    {
      id: 4,
      name: '欧美'
    },
    {
      id: 5,
      name: '韩国'
    },
    {
      id: 6,
      name: '日本'
    }
  ]
}
let mvType = {
  '类型': [
    {
      id: 1,
      name: '全部'
    },
    {
      id: 2,
      name: '官方版'
    },
    {
      id: 3,
      name: '原声'
    },
    {
      id: 4,
      name: '现场版'
    },
    {
      id: 5,
      name: '网易出品'
    }
  ]
}
let mvOrder = {
  '排序': [
    {
      id: 1,
      name: '上升最快'
    },
    {
      id: 2,
      name: '最热'
    },
    {
      id: 3,
      name: '最新'
    }
  ]
}
export default {
  name: 'mv',
  data () {
    return {
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
      mvs: [],
      options: {
        area: '全部',
        type: '全部',
        order: '上升最快',
        limit: 24,
        offset: 0
      },
      area,
      mvType,
      mvOrder,
      infiniteId: +new Date()
    }
  },
  components: {
    HomeLayout,
    mvItem,
    tags
  },
  methods: {
    async loadmore ($state) {
      try {
        let res = await getAllMV(this.options)
        $state.loaded()
        if ( res.data.length || res.hasMore ) {
          let mvs = res.data.map(mv => {
            return normalMV(mv)
          })
          this.mvs = this.mvs.concat(mvs)
          this.options.offset += this.options.limit
        } else {
          $state.complete()
        }
      } catch ( error ) {
        $state.error()
      }
    },
    onAreaChange (tag) {
      this.options.offset = 0
      this.options.area = tag.name
      this.mvs = []
      this.infiniteId += 1
    },
    onTypeChange (tag) {
      this.options.offset = 0
      this.options.type = tag.name
      this.mvs = []
      this.infiniteId += 1
    },
    onOrderChange (tag) {
      this.options.offset = 0
      this.options.order = tag.name
      this.mvs = []
      this.infiniteId += 1
    }
  }
}
</script>

<style lang="less" scoped>
  @import "./../../styles/mixins";

  .mvs {
    .grid-layout(15px, 220px);
    padding: 15px 0;
  }
</style>
