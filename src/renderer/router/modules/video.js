let videoRoutes = [
  {
    path: '/video',
    component: () => import(/* webpackChunkName: "video" */ '@/views/Video/index.vue'),
    name: 'video',
    meta: {
      title: '视频', icon: 'shipin', auth: true
    }
  },
  {
    path: '/video/:id',
    component: () => import(/* webpackChunkName: "video-detail" */ '@/views/Video/_id/index.vue'),
    name: 'video-detail'
  },
  {
    path: '/mv/:id',
    component: () => import(/* webpackChunkName: "mv-detail" */ '@/views/Video/_id/mv.vue'),
    name: 'mv-detail'
  }
]

export {
  videoRoutes
}
