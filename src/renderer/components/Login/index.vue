<template>
  <a-modal
    v-model="showLogin"
    :footer="null"
    :closable="false"
    :width="320"
    wrapClassName="login"
    centered
    :maskStyle="{backgroundColor: 'rgba(0, 0, 0, 0.1)'}"
  >
    <a-form id="login" :form="form" @submit="handleSubmit">
      <a-form-item>
        <a-input
          v-decorator="['phone',{rules: [{ required: true, pattern: /^1[3|4|5|7|8][0-9]{9}$/, message: '格式错误!' }]}]"
          placeholder="用户名"
        >
          <a-icon slot="prefix" type="user" style="color: rgba(0,0,0,.25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          v-decorator="['password',{rules: [{ required: true, message: '密码不能为空!' }]}]"
          type="password"
          placeholder="密码"
        >
          <a-icon slot="prefix" type="lock" style="color: rgba(0,0,0,.25)" />
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" class="login-form-button" :loading="loading">登录</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { mapState } from 'vuex'
import { login_cellphone, user_detail } from '@/api/user'
import eventBus from '@/utils/eventBus'
import { setTimeout } from 'timers'
export default {
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState('App', ['redirect']),
    showLogin: {
      get () {
        return this.$store.state.User.showLogin
      },
      set (value) {
        this.$store.commit('User/SET_SHOW_LOGIN', value)
      }
    }
  },
  watch: {
    showLogin (newVal) {
      if (newVal) {
        this.loading = false
      }
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this)
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.loading = true
      this.form.validateFields(async (err, values) => {
        if (!err) {
          try {
            let { code, account } = await login_cellphone(values)
            if (code === 200) {
              const { id } = account
              localStorage.setItem('userId', id)
              this.$store.commit('User/SET_SHOW_LOGIN', false)
              const detail = await user_detail(id)
              this.$store.commit('User/SET_USER_INFO', {
                userId: id,
                account,
                ...detail
              })
              setTimeout(() => {
                if (this.$route.name === 'home') {
                  eventBus.$emit('refresh')
                } else {
                  let redirect = this.redirect || '/home'
                  this.$router.push({ path: redirect })
                }
                this.loading = false
              }, 100)
            } else {
              this.loading = false
            }
          } catch (error) {
            this.loading = false
          }
        }
      })
    }
  }
}
</script>
<style>
.ant-modal-wrap.login {
  z-index: 100000;
}
.login .ant-modal-content {
  min-height: 400px;
  background: #f8f8f8 url("./../../assets/images/loginBg.jpg") top
    center/contain no-repeat!important;
}

#login {
  margin-top: 180px;
}

#login .login-form-button {
  width: 100%;
}
</style>
