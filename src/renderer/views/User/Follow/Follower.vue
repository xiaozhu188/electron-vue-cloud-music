<template>
  <div class="follow">
    <header class="follow-header">
      <span>我的关注</span>
    </header>
    <main class="follow-main">
      <a-row type="flex" :gutter="16">
        <a-col :xl="8" :md="12" v-for="follower in followers" :key="follower.userId">
          <router-link class="follower-item" :to="`/user?id=${follower.userId}`">
            <div class="avatar">
              <img v-lazy="`${follower.avatarUrl}?param=60y60`" />
            </div>

            <div class="info">
              <router-link
                :to="`/user?id=${follower.userId}`"
                class="nickname"
              >by {{ follower.nickname }}</router-link>
              <div class="signature">{{ follower.signature }}</div>
              <div class="extra">
                <span>歌单：{{ follower.playlistCount }}</span>
                <span>粉丝：{{ follower.followeds }}</span>
              </div>
            </div>
          </router-link>
        </a-col>
      </a-row>
    </main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { user_follower } from '@/api/user'
export default {
  data () {
    return {
      followers: [],
      limit: 30,
      offset: 0
    }
  },
  computed: {
    ...mapGetters('User', ['userId'])
  },
  created () {
    this.getData()
  },
  methods: {
    getData () {
      let { limit, offset, userId } = this
      let options = {
        limit,
        offset,
        uid: userId
      }
      user_follower(options).then(res => {
        console.log(res)
        this.followers = res.follow
      })
    }
  }
}
</script>

<style lang="less" scoped>
.follow {
  .follow-header {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    font-size: 17px;
    color: #555;
    margin: 0 20px;
    border-bottom: 1px solid #eae9e9;
  }
  .follow-main {
    padding: 15px;
    .follower-item {
      display: flex;
      padding: 15px;
      border-bottom: 1px solid #eee;
      color: #333;
      font-size: 13px;
      &:hover {
        background: #eee;
      }
      .avatar {
        position: relative;
        width: 60px;
        height: 60px;
        flex: 0 0 60px;
        img {
          display: block;
          width: 100%;
          border-radius: 50%;
        }
      }
      .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        overflow: hidden;
        padding-left: 15px;
        .nickname,.signature {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
