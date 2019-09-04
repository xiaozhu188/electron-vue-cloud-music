<template>
  <div class="loading-wrapper">
    <slot>
      <playing />
    </slot>
    <div v-if="$slots && $slots.text">
      <slot name="text"></slot>
    </div>
    <div v-else>{{ text }}</div>
  </div>
</template>

<script>
import Playing from '@/components/Common/playing'
export default {
  name: 'loading',
  components: {
    Playing
  },
  props: {
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-wrapper {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
