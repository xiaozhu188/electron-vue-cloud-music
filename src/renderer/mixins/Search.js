export default {
  data () {
    return {
      spinning: true
    }
  },
  props: {
    result: {
      type: Object,
      default () {
        return null
      }
    }
  },
  watch: {
    result (newVal) {
      if (newVal) {
        this.normalData()
      }
    }
  },
  mounted () {
    this.normalData()
  }
}
