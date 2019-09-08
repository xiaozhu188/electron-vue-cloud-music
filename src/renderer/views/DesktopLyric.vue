<template>
  <div class="desktop-lyric">
    <div class="playing-lyric" ref="lrc">
        {{current_lyric ? current_lyric : '听见好时光'}}
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DesktopLyric',
  computed: {
    ...mapGetters('play', ['current_lyric'])
  }
}
</script>

<style lang='less' scoped>
.desktop-lyric {
  .playing-lyric {
    font-size: 40px;
    color: #fff;
    text-shadow: 1px 1px 5px @primary-color, 1px -1px 3px @primary-color;
    text-align: center;
    font-family: "Microsoft JhengHei", "明黑", Arial, Helvetica;
    line-height: 60px;
    text-indent: 2px;
    white-space: nowrap;
    -webkit-app-region: drag;
  }
  .control-wrapper {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    .control-box {
      -webkit-app-region: no-drag;
      .icon {
        color: #fff;
        font-size: 18px;
        &:hover {
          cursor: pointer;
          text-shadow: 1px 1px 5px @primary-color, 1px -1px 3px @primary-color;
        }
      }
    }
  }
}
</style>
