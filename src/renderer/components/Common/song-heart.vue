<template>
  <span :class="{'disable' : disable}">
    <a-icon
      type="heart"
      theme="filled"
      style="color:#c62f2f"
      @click.native.stop="handleClick(false)"
      v-if="isLiked"
    />
    <a-icon type="heart" theme="outlined" @click.native.stop="handleClick(true)" v-else/>
  </span>
</template>

<script>

export default {
  props: {
    isLiked: {
      type: Boolean,
      default: false
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick (isLike) {
      if (this.disable) return
      this.$emit('heartClick', isLike)
    }
  }
}
</script>

<style scoped>
.disable {
  opacity: .5;
}
</style>
