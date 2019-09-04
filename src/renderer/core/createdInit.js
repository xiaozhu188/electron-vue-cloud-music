import store from '@/store'
import config from '@/config/defaultSettings'
import ls from 'store'

export default function Initializer () {
  store.commit('App/CHANGE_COLOR', ls.get('DEFAULT_COLOR', config.primaryColor))
}
