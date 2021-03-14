let userRoutes = [
    {
        path: "/user",
        component: () =>
            import(
                /* webpackChunkName: "user-detail" */ "@/views/User/index.vue"
            ),
        name: "user-detail",
        meta: {
            title: "个人信息",
            auth: true,
        },
    },
    {
        path: "/recomment_songs",
        component: () =>
            import(
                /* webpackChunkName: "recomment_songs" */ "@/views/Daily/index.vue"
            ),
        name: "recomment_songs",
        meta: {
            title: "每日推荐",
            auth: true,
        },
    },
    {
        path: "/user-event",
        component: () =>
            import(
                /* webpackChunkName: "user_event" */ "@/views/User/Events/UserEvent.vue"
            ),
        name: "user_event",
        meta: {
            title: "用户动态",
            auth: true,
        },
    },
    {
        path: "/follower",
        component: () =>
            import(
                /* webpackChunkName: "follower" */ "@/views/User/Follow/Follower.vue"
            ),
        name: "follower",
        meta: {
            title: "我的关注",
            auth: true,
        },
    },
    {
        path: "/followed",
        component: () =>
            import(
                /* webpackChunkName: "followed" */ "@/views/User/Follow/Followed.vue"
            ),
        name: "followed",
        meta: {
            title: "我的粉丝",
            auth: true,
        },
    },
];

export { userRoutes };
