<template>
  <div class="create-playlist-form">
    <div class="input-item" >
      <a-input placeholder="请输入新歌单标题" :value="formData.name" @change="onNameChange" />
    </div>
    <div class="input-item">
      <a-checkbox :value="formData.privacy" @change="onPrivacyChange">设置为隐私歌单</a-checkbox>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default () {
        return {
          name: '',
          privacy: false
        }
      }
    }
  },
  data () {
    return {
      formData: {
        ...this.value
      }
    }
  },
  methods: {
    onNameChange (e) {
      this.formData.name = e.target.value
      this.$emit('input', this.formData)
    },
    onPrivacyChange (e) {
      this.formData.privacy = e.target.checked
      this.$emit('input', this.formData)
    }
  }
}
</script>

<style lang="less" scoped>
.input-item {
  margin-bottom: 8px;
  font-size: 12px;
}
</style>
