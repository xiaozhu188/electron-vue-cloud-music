<template>
  <div class="infinite-error">
    请求数据失败
    <a href="javascript:;" @click="$attrs.trigger">重试</a>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
  .infinite-error {
    margin: 15px 0;
    text-align: center;
  }
</style>
