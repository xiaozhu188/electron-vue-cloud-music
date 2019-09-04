import Vue from 'vue'
import Vuex from 'vuex'
import persistStatePlugin from './plugins/keep-state'
import modules from './modules'
Vue.use(Vuex)
const myPlugin = persistStatePlugin(['User', 'play', 'Localsong', 'Setting', 'Update'])

let store = new Vuex.Store({
  modules,
  plugins: [myPlugin]
})
export default store
