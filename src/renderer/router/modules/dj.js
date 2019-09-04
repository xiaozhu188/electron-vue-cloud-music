let djRoutes = [
  {
    path: '/dj',
    component: () => import(/* webpackChunkName: "dj" */ '@/views/Dj/index.vue'),
    name: 'dj',
    meta: {
      title: '主播电台'
    }
  },
  {
    path: '/dj-recommend',
    component: () => import(/* webpackChunkName: "dj-recommend" */ '@/views/Dj/recommend.vue'),
    name: 'dj-recommend',
    meta: {
      title: '推荐电台'
    }
  },
  {
    path: '/dj/:id',
    component: () => import(/* webpackChunkName: "dj-id" */ '@/views/Dj/_id.vue'),
    name: 'dj-id',
    redirect: '/dj/:id/programs',
    children: [
      {
        path: '/dj/:id/programs',
        component: () => import(/* webpackChunkName: "dj-id-programs" */ '@/views/Dj/_id/programs.vue'),
        name: 'dj-id-programs'
      },
      {
        path: '/dj/:id/sublist',
        component: () => import(/* webpackChunkName: "dj-id-sublist" */ '@/views/Dj/_id/sublist.vue'),
        name: 'dj-id-sublist'
      }
    ]
  }
]

export {
  djRoutes
}
