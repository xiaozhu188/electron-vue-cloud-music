<template>
  <a-popover
    v-model="themeVisible"
    trigger="click"
    placement="bottom"
    :autoAdjustOverflow="true"
    overlayClassName="user-wrapper"
    :overlayStyle="{ width: '240px', top: '50px' }"
  >
    <template slot="content">
      <div class="colorBlock">
        <li
          class="color-item"
          v-for="(item, index) in colorList"
          :key="index"
          :style="'background-color: ' + item.color"
          @click="changeColor(item.color)"
        >
          <z-icon type="wangyiyunyinle1" class="z-icon"></z-icon>
          <div class="name">{{ item.key }}</div>
          <a-icon
            type="check-circle"
            class="a-icon"
            :style="'background-color: ' + item.color"
            v-if="primaryColor === item.color"
          />
        </li>
      </div>
    </template>
    <a-icon type="skin" class="icon" />
  </a-popover>
</template>

<script>
import { mapGetters } from 'vuex'
import ZIcon from '@/components/ZIcon'
import { colorList } from '@/config/config'
import config from '@/config/defaultSettings'
import ls from 'store'

export default {
  data () {
    return {
      themeVisible: false,
      colorList,
      defaultSettings: Object.assign({}, config)
    }
  },
  components: {
    ZIcon
  },
  computed: {
    ...mapGetters('App', [ 'primaryColor' ])
  },
  created () {
    console.log('__dirname', __dirname)
    let key = process.env.NODE_ENV === 'development'
      ? `${window.location.origin}/less/color.less`
      : Object.keys(localStorage).find(item => item.endsWith('color.less')) || `app://./less/color.less`
    // console.log(key)
    let style = ls.get(key)
    if ( style ) {
      let styleTag = document.createElement('style')
      styleTag.setAttribute('id', 'myTheme')
      styleTag.innerText = style
      document.head.appendChild(styleTag)
    } else {
      // 当主题色不是默认色时，才进行主题编译
      if ( this.primaryColor !== config.primaryColor ) {
        this.updateTheme(this.primaryColor)
      }
    }
  },
  methods: {
    changeColor (color) {
      this.defaultSettings.primaryColor = color
      if ( this.primaryColor !== color ) {
        this.$store.commit('App/CHANGE_COLOR', color)
        this.updateTheme(color)
      }
    },
    updateTheme (primaryColor) {
      if ( !primaryColor ) {
        return
      }
      let _this = this

      function buildIt () {
        if ( !window.less ) {
          return
        }
        setTimeout(() => {
          // 编译前删除之前保存的样式
          Object.keys(localStorage).forEach(item => {
            if ( item.endsWith('color.less') || item.endsWith('color.less:timestamp') || item.endsWith('color.less:vars') ) {
              localStorage.removeItem(item)
            }
          })
          window.less
            .modifyVars({
              '@primary-color': primaryColor
            })
            .then(() => {
              let myTheme = document.getElementById('myTheme')
              if ( myTheme ) {
                document.head.removeChild(myTheme)
              }
            })
            .catch((e) => {
              _this.$message.error('主题更新失败!')
            })
        }, 200)
      }

      if ( !this.lessNodesAppended ) {
        // insert less.js and color.less
        let lessStyleNode = document.createElement('link')
        let lessConfigNode = document.createElement('script')
        let lessScriptNode = document.createElement('script')
        lessStyleNode.setAttribute('rel', 'stylesheet/less')
        lessStyleNode.setAttribute('href', `less/color.less`)
        lessConfigNode.innerHTML = `
          window.less = {
            async: true,
            env: 'production',
            javascriptEnabled: true
          };
        `
        lessScriptNode.src = 'js/less.min.js'
        lessScriptNode.async = true
        lessScriptNode.onload = () => {
          buildIt()
          lessScriptNode.onload = null
        }

        let myTheme = document.getElementById('myTheme')
        if ( myTheme ) {
          document.head.insertBefore(lessStyleNode, myTheme)
          document.head.insertBefore(lessConfigNode, myTheme)
          document.head.insertBefore(lessScriptNode, myTheme)
        } else {
          document.head.appendChild(lessStyleNode)
          document.head.appendChild(lessConfigNode)
          document.head.appendChild(lessScriptNode)
        }

        this.lessNodesAppended = true
      } else {
        buildIt()
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .colorBlock {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .color-item {
      position: relative;
      width: 60px;
      height: 60px;
      cursor: pointer;
      margin-bottom: 10px;
      color: #fff;
      .name {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding-left: 4px;
        line-height: 20px;
        background: rgba(0, 0, 0, 0.2);
        font-size: 11px;
      }
      .a-icon {
        position: absolute;
        right: -6px;
        bottom: -6px;
        font-size: 22px;
        border-radius: 50%;
        color: #fff;
      }
      .z-icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px;
        opacity: 0.9;
      }
    }
  }
</style>
