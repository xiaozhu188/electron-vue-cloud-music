<!--
@name: Vue-Virtual-List
@author: <vuchan givingwu@gmail.com>
@refs:
  1. https://github.com/Akryum/vue-virtual-scroller
  2. https://github.com/musicq/vist/blob/master/src/VirtualList.tsx
  3. https://github.com/bvaughn/react-virtualized
-->
<template>
  <div class="virtual-list-container">
    <slot name="header"></slot>
    <div
      class="virtual-list-wrapper"
      ref="wrapper"
      :style="wrapperStyle"
      @scroll.passive="handleScroll"
    >
      <div ref="scroller" class="virtual-list-scroller" :style="scrollerStyle">
        <slot name="content" :items="pool">
          <VirtualListItem
            class="virtual-list-item"
            v-for="({ data, $top,idx }, index) in pool"
            :tag="itemTag"
            :key="index + 1"
            :item="data"
            :style="{ transform: `translateY(${$top}px)`}"
          >
            <slot :row="data" :rowIndex="idx" />
          </VirtualListItem>
        </slot>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script>
import PropTypes from 'vue-types'
import VirtualListItem from './ListItem'

const name = 'VirtualList'
const VirtualScroller = {
  name,
  components: { VirtualListItem },
  props: {
    dataSource: PropTypes.array.isRequired,
    itemHeight: PropTypes.integer.def(40),
    prerender: PropTypes.integer.def(1),
    store: PropTypes.object,
    itemTag: PropTypes.string.def('div'),
    expandable: PropTypes.bool.def(false),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).def(
      '100%'
    )
  },
  computed: {
    totalSize () {
      return this.dataSource.length
    },
    totalHeight () {
      return this.totalSize * this.itemHeight
    },
    maxIndex () {
      return this.totalSize - this.poolSize
    },
    poolSize () {
      return (
        this.prerender +
        Math.ceil(this.wrapperHeight / this.itemHeight)
      )
    },
    wrapper () {
      return this.$refs.wrapper
    },
    wrapperHeight () {
      return this.height || this.wrapper.clientHeight
    }
  },
  watch: {
    /* the total data length */
    dataSource: {
      handler (value) {
        this.$_isSameDataRef = value === this.dataSource
        this.$nextTick(() => {
          this.updatePool()
        })
      }
    }
  },
  data () {
    return {
      pool: [], // PoolModel
      startIndex: -1
    }
  },
  beforeCreate () {
    console.time('time-for-created')
  },
  created () {
    console.timeEnd('time-for-created')
    const { height, itemHeight, totalHeight } = this

    this.itemStyle = {
      width: '100%',
      height: itemHeight + 'px'
    }

    if (this.height) {
      this.wrapperStyle = {
        height: height + (typeof height === 'number' ? 'px' : '')
      }
    }

    this.scrollerStyle = {
      position: 'relative',
      width: 'auto',
      height: totalHeight + 'px',
      maxHeight: totalHeight + 'px',
      overflow: 'hidden'
    }
  },
  beforeMount () {
    console.time('time-for-mounted')
  },
  mounted () {
    console.timeEnd('time-for-mounted')
    this.$_ready = true
    this.$nextTick(this.updatePool)
  },
  beforeUpdate () {
    console.time('time-for-updated')
  },
  updated () {
    console.timeEnd('time-for-updated')
  },
  destroyed () {
    this.$_requestId && cancelAnimationFrame(this.$_requestId)
  },
  methods: {
    handleScroll () {
      this.$_digesting = true
      this.$_requestId = requestAnimationFrame(() => {
        this.$_digesting = false
        this.updatePool()
      })
    },

    updatePool () {
      if (this.$_digesting || !this.$_ready) return
      this.$_digesting = true

      const { wrapper, itemHeight, maxIndex, poolSize } = this
      const currentIndex = Math.floor(wrapper.scrollTop / itemHeight)
      const startIndex = Math.min(maxIndex, currentIndex)
      this.startIndex = startIndex
      /* 当前列表的索引发生实际变化时才进行切片触发更新 */
      const shouldUpdate = this.$_prevStartIndex !== startIndex

      if (!shouldUpdate) return

      /* 获取滚动方向和差值，优化滚动性能和复用DOM */
      const scrollGap = startIndex - this.$_prevStartIndex || 0
      const endIndex = startIndex + poolSize /*  - 1 */

      // update reactive property `pool`
      this.genePoolModel(startIndex, endIndex, scrollGap)

      // reset local flags
      this.$_prevStartIndex = startIndex
      this.$_digesting = false
      this.$_requestId && cancelAnimationFrame(this.$_requestId)
    },

    genePoolModel (startIndex, endIndex, direction) {
      const { dataSource, itemHeight, pool, $_isSameDataRef } = this

      if (!pool.length || !$_isSameDataRef) {
        // reset flag
        this.$_isSameDataRef = true

        return (this.pool = dataSource
          .slice(startIndex, endIndex)
          .map((item, idx) => ({
            idx,
            data: item,
            $top: startIndex * itemHeight,
            $pos: startIndex++
          })))
      }

      const newIndexes = new Array(endIndex - startIndex)
        .fill(startIndex)
        .map((i, d) => i + d)
      const diffIndexes = pool.reduce((acc, cur, idx) => {
        if (!newIndexes.includes(cur.$pos)) {
          acc[acc.length] = idx
        }

        return acc
      }, [])
      let newIndex =
        direction > 0
          ? endIndex - diffIndexes.length /* down */
          : startIndex /* up */

      diffIndexes.forEach(index => {
        const item = pool[index]

        item.data = dataSource[newIndex] /* update data by new index */
        item.$top = newIndex * itemHeight
        item.$pos = newIndex++
      })

      return dataSource
    }
  }
}

export default VirtualScroller
</script>

<style lang="css">
.virtual-list-wrapper {
  overflow: auto;
}

.virtual-list-scroller {
  position: relative;
  min-width: 100%;
  width: 100%;
}

.virtual-list-item {
  overflow: hidden;
  position: absolute;
  left: 0;
  width: 100%;
}
</style>
