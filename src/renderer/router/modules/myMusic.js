let myMusicRoutes = [
    {
        path: "/music_local",
        component: () =>
            import(
                /* webpackChunkName: "music_local" */ "@/views/LocalMusic/index.vue"
            ),
        name: "music_local",
        meta: {
            title: "本地音乐",
            icon: "yinle",
        },
    },
    {
        path: "/music_download",
        component: () =>
            import(
                /* webpackChunkName: "music_download" */ "@/views/Download/index.vue"
            ),
        name: "music_download",
        meta: {
            title: "下载管理",
            icon: "download",
        },
    },
    {
        path: "/music_cloud",
        component: () =>
            import(
                /* webpackChunkName: "music_cloud" */ "@/views/User/Cloud.vue"
            ),
        name: "music_cloud",
        meta: {
            title: "我的音乐云盘",
            icon: "cloud",
            auth: true,
        },
    },
    {
        path: "/music_collect",
        component: () =>
            import(
                /* webpackChunkName: "music_collect" */ "@/views/User/Collect/index.vue"
            ),
        name: "music_collect",
        meta: {
            title: "我的收藏",
            icon: "collect",
            auth: true,
        },
    },
];

let myMusicMap = [];
myMusicRoutes.concat().forEach((route) => {
    let map = {
        path: route.path,
        name: route.name,
        meta: route.meta,
    };
    myMusicMap.push(map);
});

export { myMusicRoutes, myMusicMap };
