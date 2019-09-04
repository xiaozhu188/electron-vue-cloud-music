import Vue from 'vue'
import InfiniteLoading from 'vue-infinite-loading'
import Loading from '@/components/Common/playing'
import InfiniteNoResults from '@/components/Common/infiniteNoResults'
import InfiniteNoMore from '@/components/Common/infiniteNoMore'
import InfiniteError from '@/components/Common/infiniteError'

// Vue.component('infinite-loading', InfiniteLoading);
Vue.use(InfiniteLoading, {
  slots: {
    spinner: Loading,
    noResults: InfiniteNoResults,
    noMore: InfiniteNoMore,
    error: InfiniteError
  }
})
