<template>
  <section class="desc">
    <dl>
      <dt>简介</dt>
      <dd>{{briefDesc}}</dd>
    </dl>
    <dl v-for="(item, index) in introduction" :key="index">
      <dt>{{item.ti}}</dt>
      <dd>{{item.txt}}</dd>
    </dl>
    <dl v-for="(item, index) in topicData" :key="index">
      <dt>{{item.mainTitle}}</dt>
      <dd v-for="(con, index) in content" :key="index" v-html="con.content"></dd>
    </dl>
  </section>
</template>

<script>
import { getArtistDesc } from '@/api/artist'
export default {
  name: 'artist_id_desc',
  data () {
    return {
      introduction: [],
      briefDesc: '',
      topicData: [],
      loading: false
    }
  },
  activated () {
    this._getArtistDesc()
  },
  methods: {
    async _getArtistDesc () {
      this.loading = true
      let { id } = this.$route.params
      let { introduction, briefDesc, topicData } = await getArtistDesc({ id })
      this.introduction = introduction
      this.briefDesc = briefDesc
      this.topicData = topicData
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>
.desc {
  padding: 20px;
  dl {
    margin-bottom: 20px;
  }
  dd {
    line-height: 1.4;
    color: #777;
  }
}
</style>
