<template>
  <div class="offline">
    <z-icon type="lixian" class="icon" />
    <div class="text">请检查网络连接</div>
  </div>
</template>

<script>
import ZIcon from '@/components/ZIcon'
export default {
  data () {
    return {}
  },
  components: {
    ZIcon
  }
}
</script>

<style lang="less" scoped>
.offline {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .icon {
    font-size: 200px;
    color: #999;
  }
  .text {
    margin-top: 10px;
  }
}
</style>
