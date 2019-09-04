<script>
import PropTypes from 'vue-types'

export default {
  name: 'VirtualListItem',
  props: {
    item: PropTypes.object.isRequired,
    tag: PropTypes.string.def('div')
  },
  render (h) {
    return h(
      this.tag,
      typeof this.$slots.default === 'function'
        ? this.$slots.default(this.item)
        : this.$slots.default
    )
  }
}
</script>
