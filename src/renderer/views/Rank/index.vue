<template>
  <home-layout>
    <div class="rank">
      <a-row type="flex" :gutter="16" class="rank-row" v-if="!loading">
        <a-col :xl="4" :lg="6" class="rank-col" v-for="item in cates" :key="item.idx">
          <router-link class="rank-item" :to="`/rank/${item.idx}?id=${item.idx}`">
            <div class="avatar">
              <img v-lazy="`${item.picUrl}?param=160y160`">
            </div>
            <div class="name">{{item.title}}</div>
          </router-link>
        </a-col>
      </a-row>
      <loading v-else/>
    </div>
  </home-layout>
</template>

<script>
import HomeLayout from '@/layouts/HomeLayout'
import Loading from '@/components/Common/loading'
import { getToplist } from '@/api/rank'
export default {
  name: 'rank',
  data () {
    return {
      loading: false,
      list: [],
      cates: [
        {
          title: '云音乐飙升榜',
          picUrl: 'http://p1.music.126.net/DrRIg6CrgDfVLEph9SNh7w==/18696095720518497.jpg',
          idx: 3
        },
        {
          title: '云音乐新歌榜',
          picUrl: 'http://p1.music.126.net/N2HO5xfYEqyQ8q6oxCw8IQ==/18713687906568048.jpg',
          idx: 0
        },
        {
          title: '网易原创歌曲榜',
          picUrl: 'http://p1.music.126.net/sBzD11nforcuh1jdLSgX7g==/18740076185638788.jpg',
          idx: 2
        },
        {
          title: '云音乐热歌榜',
          picUrl: 'http://p1.music.126.net/GhhuF6Ep5Tq9IEvLsyCN7w==/18708190348409091.jpg',
          idx: 1
        },
        {
          title: '云音乐电音榜',
          picUrl: 'http://p1.music.126.net/4mh2HWH-bd5sRufQb-61bg==/3302932937414659.jpg',
          idx: 4
        },
        {
          title: 'Beatport全球电子舞曲榜',
          picUrl: 'http://p1.music.126.net/A61n94BjWAb-ql4xpwpYcg==/18613632348448741.jpg',
          idx: 21
        },
        {
          title: '云音乐ACG音乐榜',
          picUrl: 'http://p1.music.126.net/vttjtRjL75Q4DEnjRsO8-A==/18752170813539664.jpg',
          idx: 22
        },
        {
          title: '日本Oricon周榜',
          picUrl: 'http://p1.music.126.net/Rgqbqsf4b3gNOzZKxOMxuw==/19029247741938160.jpg',
          idx: 10
        },
        {
          title: '云音乐古典音乐榜',
          picUrl: 'http://p1.music.126.net/BzSxoj6O1LQPlFceDn-LKw==/18681802069355169.jpg',
          idx: 17
        },
        {
          title: 'UK排行榜周榜',
          picUrl: 'http://p1.music.126.net/VQOMRRix9_omZbg4t-pVpw==/18930291695438269.jpg',
          idx: 5
        },
        {
          title: '美国Billboard周榜',
          picUrl: 'http://p1.music.126.net/EBRqPmY8k8qyVHyF8AyjdQ==/18641120139148117.jpg',
          idx: 6
        },
        {
          title: '法国 NRJ Vos Hits 周榜',
          picUrl: 'http://p1.music.126.net/6O0ZEnO-I_RADBylVypprg==/109951162873641556.jpg',
          idx: 19
        },
        {
          title: 'iTunes榜',
          picUrl: 'http://p1.music.126.net/83pU_bx5Cz0NlcTq-P3R3g==/18588343581028558.jpg',
          idx: 8
        },
        {
          title: 'Hit FM Top榜',
          picUrl: 'http://p1.music.126.net/54vZEZ-fCudWZm6GH7I55w==/19187577416338508.jpg',
          idx: 9
        },
        {
          title: '云音乐韩语榜',
          picUrl: 'http://p1.music.126.net/vs-cMh49e6qPEorHuhU07A==/18737877162497499.jpg',
          idx: 11
        },
        {
          title: 'KTV唛榜',
          picUrl: 'http://p1.music.126.net/H4Y7jxd_zwygcAmPMfwJnQ==/19174383276805159.jpg',
          idx: 7
        },
        {
          title: '台湾Hito排行榜',
          picUrl: 'http://p1.music.126.net/wqi4TF4ILiTUUL5T7zhwsQ==/18646617697286899.jpg',
          idx: 20
        },
        {
          title: '中国TOP排行榜（港台榜）',
          picUrl: 'http://p1.music.126.net/JPh-zekmt0sW2Z3TZMsGzA==/18967675090783713.jpg',
          idx: 14
        },
        {
          title: '中国TOP排行榜（内地榜）',
          picUrl: 'http://p1.music.126.net/2klOtThpDQ0CMhOy5AOzSg==/18878614648932971.jpg',
          idx: 15
        },
        {
          title: '香港电台中文歌曲龙虎榜',
          picUrl: 'http://p1.music.126.net/YQsr07nkdkOyZrlAkf0SHA==/18976471183805915.jpg',
          idx: 16
        },
        {
          title: '中国嘻哈榜',
          picUrl: 'http://p1.music.126.net/ed1DGuS6MOlmNaSkWt32Lw==/19237055439739419.jpg',
          idx: 18
        }
      ]
    }
  },
  components: {
    HomeLayout,
    Loading
  },
  activated () {
    // this._getToplist()
  },
  methods: {
    async _getToplist () {
      this.loading = true
      let { list } = await getToplist()
      this.list = list
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>
@keyframes firstLine {
  0%{transform: translateZ(0) rotateX(-10deg);}
  100%{transform: translateZ(0) rotateX(0);}
}
@keyframes secLine {
  0%{transform: translateZ(-25px) rotateX(-30deg);}
  100%{transform: translateZ(0) rotateX(0);}
}
@keyframes thrLine {
  0%{transform: translateZ(-90px) rotateX(-40deg);}
  100%{transform: translateZ(0) rotateX(0);}
}
@keyframes forthLine {
  0%{transform: translateZ(-200px) rotateX(-50deg);}
  100%{transform: translateZ(0) rotateX(0);}
}
.rank {
  padding: 16px 0;
  .rank-row {
    perspective: 400px;
    .rank-col {
      transform-origin: top center;
      transition: transform .5s cubic-bezier(0.15, 1, 0.3, 1.1);
      &:nth-child(n + 7) {
        animation: firstLine .5s cubic-bezier(0.15, 1, 0.3, 1.1);
        animation-delay: .3s;
      }
      &:nth-child(n + 13) {
        animation: secLine .5s cubic-bezier(0.15, 1, 0.3, 1.1);
        animation-delay: .3s;
      }
      &:nth-child(n + 19) {
        animation: thrLine .5s cubic-bezier(0.15, 1, 0.3, 1.1);
        animation-delay: .3s;
      }
      &:nth-child(n + 25) {
        animation: forthLine .5s cubic-bezier(0.15, 1, 0.3, 1.1);
        animation-delay: .3s;
      }
    }
  }
  .rank-item {
    display: block;
    margin-bottom: 32px;
  }
  .avatar {
    overflow: hidden;
    cursor: pointer;
    background: #ddd;
    img {
      display: block;
      width: 100%;
      height: 100%;
      background: #ddd;
    }
  }
  .name {
    line-height: 25px;
    font-size: 13px;
    color: #333;
    text-align: center;
  }
}
</style>
