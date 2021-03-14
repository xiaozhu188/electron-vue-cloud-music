let playlistRoutes = [
    {
        path: "/playlist",
        component: () =>
            import(
                /* webpackChunkName: "playlist" */ "@/views/Playlist/index.vue"
            ),
        name: "playlist",
        meta: {
            title: "歌单",
        },
    },
    {
        path: "/playlist-highquality",
        component: () =>
            import(
                /* webpackChunkName: "playlist-highquality" */ "@/views/Playlist/highquality.vue"
            ),
        name: "playlist-highquality",
        meta: {
            title: "精品歌单",
        },
    },
    {
        path: "/playlist/:id",
        component: () =>
            import(
                /* webpackChunkName: "playlist-id" */ "@/views/Playlist/_id.vue"
            ),
        name: "playlist-id",
        redirect: "/playlist/:id/tracks",
        children: [
            {
                path: "/playlist/:id/tracks",
                component: () =>
                    import(
                        /* webpackChunkName: "playlist-id-tracks" */ "@/views/Playlist/_id/tracks.vue"
                    ),
                name: "playlist-id-tracks",
            },
            {
                path: "/playlist/:id/comment",
                component: () =>
                    import(
                        /* webpackChunkName: "playlist-id-comment" */ "@/views/Playlist/_id/comment.vue"
                    ),
                name: "playlist-id-comment",
            },
            {
                path: "/playlist/:id/subscriber",
                component: () =>
                    import(
                        /* webpackChunkName: "playlist-id-subscriber" */ "@/views/Playlist/_id/subscriber.vue"
                    ),
                name: "playlist-id-subscriber",
            },
        ],
    },
];

export { playlistRoutes };
