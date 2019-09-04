let artistRoutes = [
  {
    path: '/artist',
    component: () => import(/* webpackChunkName: "artist" */ '@/views/Artist/index.vue'),
    name: 'artist',
    meta: {
      title: '歌手'
    }
  },
  {
    path: '/artist-top',
    component: () => import(/* webpackChunkName: "artist-top" */ '@/views/Artist/top.vue'),
    name: 'artist-top',
    meta: {
      title: '歌手排行榜'
    }
  },
  {
    path: '/artist/:id',
    component: () => import(/* webpackChunkName: "artist-id" */ '@/views/Artist/_id.vue'),
    name: 'artist-id',
    redirect: '/artist/:id/songs',
    children: [
      {
        path: '/artist/:id/songs',
        component: () => import(/* webpackChunkName: "artist-id-songs" */ '@/views/Artist/_id/songs.vue'),
        name: 'artist-id-songs'
      },
      {
        path: '/artist/:id/album',
        component: () => import(/* webpackChunkName: "artist-id-album" */ '@/views/Artist/_id/album.vue'),
        name: 'artist-id-album'
      },
      {
        path: '/artist/:id/mv',
        component: () => import(/* webpackChunkName: "artist-id-mv" */ '@/views/Artist/_id/mv.vue'),
        name: 'artist-id-mv'
      },
      {
        path: '/artist/:id/desc',
        component: () => import(/* webpackChunkName: "artist-id-desc" */ '@/views/Artist/_id/desc.vue'),
        name: 'artist-id-desc'
      },
      {
        path: '/artist/:id/simi',
        component: () => import(/* webpackChunkName: "artist-id-simi" */ '@/views/Artist/_id/simi.vue'),
        name: 'artist-id-simi'
      }
    ]
  }
]

export {
  artistRoutes
}
